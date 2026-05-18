"use client";
import { useContext, createContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { getCartFromCookie, setCartCookie } from "@/actions/session";

// Get the cart item from secure cookie
async function getCart() {
   return await getCartFromCookie();
}

// Set the cart item in secure cookie
async function saveCart(cart) {
   await setCartCookie(cart);
}

// Get the cart count by item quantity
function getCartCount(cart) {
   return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

// Create context
const CartContext = createContext();

// Initialize the cart provider to be shared across pages and import inside root layout
export function CartProvider({ buyerId, children }) {
   const [cart, setCart] = useState([]);
   const [cartCount, setCartCount] = useState(0);
   const [loading, setLoading] = useState(true);

   // Load cart from secure cookie on mount
   useEffect(() => {
      const loadCart = async () => {
         try {
            setLoading(true);
            const storedCart = await getCart();
            setCart(storedCart);
            setCartCount(getCartCount(storedCart));
         } catch {
            setCart([]);
            setCartCount(null);
         } finally {
            setLoading(false);
         }
      };
      loadCart();
   }, []);

   // Handle storage events especially when cart cookie changes
   useEffect(() => {
      const handleStorageChange = (e) => {
         if (e.key === "cart-session") {
            const loadCartData = async () => {
               const cartData = await getCart();
               setCart(cartData);
               setCartCount(getCartCount(cartData));
            };
            loadCartData();
         }
      };

      // Add event listeners for cart cookie
      window.addEventListener("storage", handleStorageChange);

      // Clean up
      return () => {
         window.removeEventListener("storage", handleStorageChange);
      };
   }, []);

   // Load cart from database when user is authenticated
   useEffect(() => {
      if (buyerId) {
         loadCartFromDatabase();
      }
   }, [buyerId]);

   const loadCartFromDatabase = useCallback(async () => {
      if (!buyerId) return;

      try {
         const response = await fetch("/api/proxy/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId }),
         });

         const data = await response.json();
         if (data.success && data.cart) {
            setCart(data.cart);
            setCartCount(getCartCount(data.cart));
            // Update cookie with database cart
            await saveCart(data.cart);
         } else {
            console.log("No cart found in database");
         }
      } catch {
         setCart([]);
         setCartCount(0);
      }
   }, [buyerId]);

   // Save cart to secure cookie and update count on mount and whenever cart changes
   useEffect(() => {
      const saveCartAsync = async () => {
         await saveCart(cart);
      };
      saveCartAsync();
      setCartCount(getCartCount(cart));
   }, [cart]);

   // 🕓 Schedule sync to DB (debounced)
   // Use a ref to keep the latest cart value for syncing
   const syncTimerRef = useRef(null);

   function scheduleSync() {
      // Clear any existing timer
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

      // Schedule sync (debounced)
      syncTimerRef.current = setTimeout(() => {
         syncCartToServer();
      }, 60);
   }

   // 🛠️ Sync logic -- always get the latest cart value
   const syncCartToServer = useCallback(async () => {
      // Retrieve the most recent cart and buyerId in the callback
      if (!buyerId) return;
      // It's possible for cart to be stale in closure. Always read latest.
      const latestCart = await getCart();
      if (latestCart.length === 0) return;
      try {
         const res = await fetch("/api/proxy/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId }),
         });
         const data = await res.json();
         if (data.success && data.cart) {
            setCart(data.cart);
            setCartCount(getCartCount(data.cart));
            await saveCart(data.cart);
         }
      } catch {
         setCart([]);
         setCartCount(0);
      }
   }, [buyerId]);

   // Sync individual cart operations to server for authenticated users
   const syncOperationToServer = useCallback(
      async (operation, item) => {
         if (!buyerId) return;

         try {
            await fetch("/api/proxy/cart/operations", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ buyerId, operation, item }),
            });
         } catch {}
      },
      [buyerId],
   );

   // Add item to cart:
   const addToCart = (item) => {
      setCart((prevCart) => {
         return [...prevCart, { ...item, quantity: 1 }];
      });

      // Sync to server for authenticated users
      if (buyerId) {
         syncOperationToServer("add", { ...item, quantity: 1 });
      } else {
         // If buyer isn't authenticated, schedule sync to next tick, after state update/commit
         scheduleSync();
      }
      toast.success("Product added successfully");
   };

   // Remove item from cart
   const removeItem = (item) => {
      setCart((prevCart) => prevCart.filter((n) => n.listing_id !== item.listing_id));

      // Sync to server for authenticated users
      if (buyerId) {
         syncOperationToServer("remove", item);
      } else {
         scheduleSync();
      }
      toast.success("Product removed successfully");
   };

   // Increase quantity
   const increaseQuantity = (item) => {
      setCart((prevCart) => {
         const updatedCart = prevCart.map((n) =>
            n.listing_id === item.listing_id ? { ...n, quantity: (n.quantity || 1) + 1 } : n,
         );
         const updatedItem = updatedCart.find((n) => n.listing_id === item.listing_id);

         // Sync to server for authenticated users
         if (buyerId && updatedItem) {
            syncOperationToServer("update_quantity", updatedItem);
         } else {
            scheduleSync();
         }

         return updatedCart;
      });
      toast.success("Item quantity updated successfully");
   };

   // Decrease quantity
   const decreaseQuantity = (item) => {
      setCart((prevCart) => {
         const existing = prevCart.find((n) => n.listing_id === item.listing_id);
         if (!existing) return prevCart;

         if (existing.quantity > 1) {
            // decrease normally
            const updatedCart = prevCart.map((n) =>
               n.listing_id === item.listing_id ? { ...n, quantity: n.quantity - 1 } : n,
            );
            const updatedItem = updatedCart.find((n) => n.listing_id === item.listing_id);

            // Sync to server for authenticated users
            if (buyerId && updatedItem) {
               syncOperationToServer("update_quantity", updatedItem);
            } else {
               scheduleSync();
            }

            return updatedCart;
         } else {
            // If quantity is 1, remove the item
            // Sync to server for authenticated users
            if (buyerId) {
               syncOperationToServer("remove", item);
            } else {
               scheduleSync();
            }
            return prevCart.filter((n) => n.listing_id !== item.listing_id);
         }
      });
      toast.success("Item quantity updated successfully");
   };

   // Merge cart from server (called after login)
   const mergeCartFromServer = useCallback(async (buyerId) => {
      if (!buyerId) return;

      try {
         // Call the cart merge API (it will get cart from cookie automatically)
         const response = await fetch("/api/proxy/cart/cart-merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId }),
         });

         const data = await response.json();

         if (data.success && data.mergedCart) {
            // Update the cart state with merged cart
            setCart(data.mergedCart);
         }
      } catch (error) {
         return "Failed to merge cart";
      }
   }, []);

   // Expose cart, cartCount, loading, and all actions
   return (
      <CartContext.Provider
         value={{
            cart,
            setCart,
            cartCount,
            loading,
            addToCart,
            removeItem,
            increaseQuantity,
            decreaseQuantity,
            mergeCartFromServer,
         }}
      >
         {children}
      </CartContext.Provider>
   );
}

export function useCartContext() {
   const context = useContext(CartContext);
   if (context === undefined) {
      throw new Error("useCart must be used within a CartProvider");
   }
   return context;
}
