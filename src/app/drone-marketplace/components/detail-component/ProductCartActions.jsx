"use client";

// import { useState } from "react";

// export default function AddToCartPanel({ listing }) {
//    const [quantity, setQuantity] = useState(1);
//    const [status, setStatus] = useState("idle"); // idle | loading | success | error
//    const [errorMessage, setErrorMessage] = useState("");

//    const maxQuantity = Number(listing.quantity) || 0;
//    const price = Number(listing.sale_price);

//    async function handleAddToCart(event) {
//       event.preventDefault();
//       setStatus("loading");
//       setErrorMessage("");

//       try {
//          const response = await fetch("/api/proxy/cart", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                inventoryId: listing.id,
//                quantity,
//             }),
//          });

//          if (!response.ok) {
//             const body = await response.json().catch(() => null);
//             throw new Error(body?.message || "Couldn't add this item to your cart.");
//          }

//          setStatus("success");
//       } catch (error) {
//          setStatus("error");
//          setErrorMessage(error.message);
//       }
//    }

//    if (maxQuantity === 0) {
//       return (
//          <div className="border border-[#E2E4E3] bg-white p-5">
//             <p className="font-mono text-sm text-[#B3432B]">This drone is currently out of stock.</p>
//          </div>
//       );
//    }

//    return (
//       <form onSubmit={handleAddToCart} className="flex flex-col gap-4 border border-[#E2E4E3] bg-white p-5">
//          <div className="flex items-baseline justify-between">
//             <span className="font-mono text-[11px] tracking-[0.12em] text-[#5B6066]">SALE PRICE</span>
//             <span className="text-2xl font-semibold text-[#14171A]">
//                {price.toLocaleString(undefined, {
//                   style: "currency",
//                   currency: "USD",
//                })}
//             </span>
//          </div>

//          {listing.condition && (
//             <div className="flex items-center gap-2 text-sm text-[#5B6066]">
//                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3B7D6B]" />
//                Condition: <span className="capitalize text-[#14171A]">{listing.condition}</span>
//             </div>
//          )}

//          <div className="flex items-center gap-3">
//             <label htmlFor="cart-quantity" className="text-sm text-[#5B6066]">
//                Quantity
//             </label>
//             <input id="cart-quantity" type="number" min={1} max={maxQuantity} value={quantity} onChange={(event) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(event.target.value))))} className="w-20 border border-[#E2E4E3] px-2 py-1 text-sm focus:border-[#E8A33D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D]" />
//             <span className="text-xs text-[#5B6066]">{maxQuantity} available</span>
//          </div>

//          <button type="submit" disabled={status === "loading"} className="bg-[#E8A33D] px-4 py-2.5 text-sm font-semibold text-[#14171A] transition hover:bg-[#d6912f] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A]">
//             {status === "loading" ? "Adding to cart…" : "Add to cart"}
//          </button>

//          <div role="status" aria-live="polite" className="text-sm">
//             {status === "success" && <span className="text-[#3B7D6B]">Added to your cart.</span>}
//             {status === "error" && <span className="text-[#B3432B]">{errorMessage}</span>}
//          </div>
//       </form>
//    );
// }

"use client";
import { useCartContext } from "@/hooks/useCartContext";
import { Button } from "@/components/ui/Button";
import { MdAddShoppingCart } from "react-icons/md";
import { Plus, Minus } from "lucide-react";
import { CiTrash } from "react-icons/ci";
import { formatPrice } from "@/utils/formatPrice";

export function ProductCartActions({ listing }) {
   const { cart, addToCart, removeItem, increaseQuantity, decreaseQuantity, loading } = useCartContext();
   const image = listing.product_image[0];

   const itemForCart = {
      listing_id: listing?.listing_id,
      product_image: image,
      listing_name: listing.listing_name,
      description: listing.description,
      price: listing.price,
      quantity: listing.available_quantity || 0,
      currency: listing.currency,
      country_code: listing.country_code,
      country_name: listing.country_name,
      state_name: listing.state_name,
      min_quantity: listing.min_quantity ?? null,
      discount: listing.discount ?? null,
   };

   const cartItem = cart?.find((n) => n.listing_id === itemForCart.listing_id);
   const itemInCart = !!cartItem;
   const itemQuantity = cartItem?.quantity || 0;

   if (loading) {
      return (
         <div className="bg-white shadow-md rounded-md p-4">
            <div className="flex gap-4 items-center">
               <p className="w-1/2 h-5 animate-pulse bg-gray-300" />
               <p className="w-1/2 h-5 animate-pulse bg-gray-300" />
            </div>
            <div className="w-full p-5 mt-10 rounded cursor-pointer relative bg-gray-300 animate-pulse flex items-center " />
         </div>
      );
   }

   return (
      <div className="bg-white shadow-md rounded-md p-4">
         {listing.price && (
            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">Price:</span>
               <span className="text-lg font-bold">{formatPrice(listing.price, listing.country_code, listing.currency)}</span>
            </div>
         )}
         {itemInCart ? (
            <div className="flex justify-between items-center mt-10">
               <div className="flex items-center gap-4">
                  <Button onClick={() => decreaseQuantity(itemForCart)} className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)">
                     <Minus />
                  </Button>
                  <span className="text-lg">{itemQuantity}</span>
                  <Button onClick={() => increaseQuantity(itemForCart)} className="bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) text-(--white-fff) shadow-md p-1 flex items-center rounded-md dark:bg-(--dark-green-color)">
                     <Plus />
                  </Button>
               </div>

               <Button className="text-red-400 dark:text-red-300 hover:bg-red-300 hover:text-red-700 rounded transition px-2 flex items-center gap-2 transition-background cursor-pointer" onClick={() => removeItem(itemForCart)}>
                  <span>
                     <CiTrash />
                  </span>
                  Remove
               </Button>
            </div>
         ) : (
            <Button onClick={() => addToCart(itemForCart)} id="addToCart" className="w-full p-2 mt-10 rounded cursor-pointer relative bg-(--greenish-color) hover:bg-(--dark-green-color) dark:bg-(--dark-green-color) text-(--white-fff) flex items-center">
               <span className="absolute left-4">
                  <MdAddShoppingCart className="w-5 h-5" />
               </span>
               <span className="mx-auto">Add to Cart</span>
            </Button>
         )}
      </div>
   );
}
