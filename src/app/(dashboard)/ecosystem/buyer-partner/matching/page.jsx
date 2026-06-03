"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaSearch, FaFilter, FaShoppingCart, FaTimes, FaMinus, FaPlus, FaBoxOpen, FaWarehouse, FaLeaf } from "react-icons/fa";
import { useBuyerData } from "../useBuyerData";
import { toast } from "react-toastify";

// Produce emoji/icon mapping for visual appeal
const produceIcons = {
   'Rice': '🌾', 'Maize': '🌽', 'Wheat': '🌾', 'Cassava': '🥔',
   'Yam': '🍠', 'Tomato': '🍅', 'Pepper': '🌶️', 'Onion': '🧅',
   'Soybean': '🫘', 'Groundnut': '🥜', 'Cocoa': '🍫', 'Millet': '🌾',
   'Sorghum': '🌾', 'Cowpea': '🫘', 'Cotton': '🧶', 'Sesame': '🌱',
};

export default function MarketMatchingPage() {
   const { loading, buyerMatches, placeOrder } = useBuyerData();
   const [searchTerm, setSearchTerm] = useState("");
   const [cart, setCart] = useState([]);
   const [showCart, setShowCart] = useState(false);
   const [isOrdering, setIsOrdering] = useState(false);
   const [deliveryAddress, setDeliveryAddress] = useState("");

   // Filter produce based on search
   const filteredProduce = useMemo(() => {
      if (!searchTerm) return buyerMatches;
      const term = searchTerm.toLowerCase();
      return buyerMatches.filter(item =>
         item.commodity?.toLowerCase().includes(term) ||
         item.warehouse_name?.toLowerCase().includes(term)
      );
   }, [buyerMatches, searchTerm]);

   // Cart helpers
   const addToCart = (item, quantity) => {
      const qty = parseFloat(quantity);
      if (qty <= 0 || qty > parseFloat(item.quantity)) {
         toast.error("Invalid quantity");
         return;
      }
      const existingIndex = cart.findIndex(c => c.id === item.id);
      if (existingIndex >= 0) {
         const updated = [...cart];
         updated[existingIndex].selectedQty = qty;
         setCart(updated);
      } else {
         setCart([...cart, { ...item, selectedQty: qty }]);
      }
      toast.success(`${item.commodity} added to cart!`);
   };

   const removeFromCart = (itemId) => {
      setCart(cart.filter(c => c.id !== itemId));
   };

   const updateCartQty = (itemId, newQty) => {
      const updated = cart.map(c => {
         if (c.id === itemId) {
            const max = parseFloat(c.quantity);
            const clamped = Math.min(Math.max(0.1, newQty), max);
            return { ...c, selectedQty: clamped };
         }
         return c;
      });
      setCart(updated);
   };

   const cartTotal = useMemo(() => {
      return cart.reduce((sum, item) => {
         return sum + (item.selectedQty * parseFloat(item.price_per_unit || 0));
      }, 0);
   }, [cart]);

   const cartItemCount = cart.length;

   const handleCheckout = async () => {
      if (cart.length === 0) return toast.error("Your cart is empty");
      if (!deliveryAddress.trim()) return toast.error("Please enter a delivery address");

      setIsOrdering(true);
      try {
         // Map cart items to the exact field names the backend expects
         const orderItems = cart.map(item => ({
            product_id: item.id,
            product_name: item.commodity,
            quantity: item.selectedQty,
            price_per_unit: parseFloat(item.price_per_unit)
         }));
         await placeOrder(orderItems, cartTotal, deliveryAddress);
         setCart([]);
         setShowCart(false);
         setDeliveryAddress("");
      } finally {
         setIsOrdering(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
               <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
               <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Marketplace...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-8 relative">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">
                  Produce <span className="text-indigo-600">Marketplace</span>
               </h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Fresh from verified warehouses • Order what you need
               </p>
            </div>

            {/* Cart Button */}
            <button
               onClick={() => setShowCart(true)}
               className="relative bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
            >
               <FaShoppingCart size={16} />
               Cart
               {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-bounce">
                     {cartItemCount}
                  </span>
               )}
            </button>
         </div>

         {/* Search Bar */}
         <div className="flex gap-4 p-4 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
            <div className="flex-grow relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
               <input
                  type="text"
                  placeholder="Search produce... e.g. Rice, Maize, Tomato"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>
            <button className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors">
               <FaFilter /> Filters
            </button>
         </div>

         {/* Product Grid */}
         {filteredProduce.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredProduce.map((item, i) => (
                  <ProductCard key={item.id || i} item={item} onAddToCart={addToCart} cartItems={cart} />
               ))}
            </div>
         ) : (
            <div className="text-center py-24 bg-white dark:bg-gray-950 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-xl">
               <FaBoxOpen className="text-6xl text-gray-200 mx-auto mb-6" />
               <h3 className="text-xl font-black text-gray-300 uppercase tracking-widest">No Produce Available</h3>
               <p className="text-sm text-gray-400 mt-2">Check back soon — warehouses are restocking.</p>
            </div>
         )}

         {/* Cart Slide-Over Panel */}
         {showCart && (
            <div className="fixed inset-0 z-50 flex justify-end">
               {/* Backdrop */}
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />

               {/* Cart Panel */}
               <div className="relative w-full max-w-lg bg-white dark:bg-gray-950 shadow-2xl flex flex-col animate-in slide-in-from-right">
                  {/* Cart Header */}
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-black tracking-tight">Your Cart</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                           {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                        </p>
                     </div>
                     <button
                        onClick={() => setShowCart(false)}
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                     >
                        <FaTimes />
                     </button>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                     {cart.length === 0 ? (
                        <div className="text-center py-16">
                           <FaShoppingCart className="text-4xl text-gray-200 mx-auto mb-4" />
                           <p className="font-bold text-gray-400 text-sm">Your cart is empty</p>
                           <p className="text-xs text-gray-300 mt-1">Browse the marketplace and add produce.</p>
                        </div>
                     ) : (
                        cart.map((item) => (
                           <div key={item.id} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                              <div className="flex items-start justify-between gap-4">
                                 <div className="flex items-center gap-3">
                                    <span className="text-3xl">{produceIcons[item.commodity] || '🌿'}</span>
                                    <div>
                                       <h4 className="font-black text-sm">{item.commodity}</h4>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                          {item.warehouse_name}
                                       </p>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-xs"
                                 >
                                    <FaTimes />
                                 </button>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                 <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-1">
                                    <button
                                       onClick={() => updateCartQty(item.id, item.selectedQty - 1)}
                                       className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-indigo-600"
                                    >
                                       <FaMinus size={10} />
                                    </button>
                                    <input
                                       type="number"
                                       value={item.selectedQty}
                                       onChange={(e) => updateCartQty(item.id, parseFloat(e.target.value) || 0)}
                                       className="w-16 text-center text-sm font-bold border-none bg-transparent outline-none"
                                    />
                                    <button
                                       onClick={() => updateCartQty(item.id, item.selectedQty + 1)}
                                       className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-indigo-600"
                                    >
                                       <FaPlus size={10} />
                                    </button>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                       {item.selectedQty} × ₦{parseFloat(item.price_per_unit).toLocaleString()}
                                    </p>
                                    <p className="font-black text-base">
                                       ₦{(item.selectedQty * parseFloat(item.price_per_unit)).toLocaleString()}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                     <div className="border-t border-gray-100 dark:border-gray-800 p-6 space-y-4 bg-white dark:bg-gray-950">
                        {/* Delivery Address */}
                        <div>
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                              Delivery Address
                           </label>
                           <input
                              type="text"
                              placeholder="Enter delivery address..."
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 space-y-3">
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-400 font-bold">Subtotal ({cartItemCount} items)</span>
                              <span className="font-black">₦{cartTotal.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-gray-400 font-bold">Delivery Fee</span>
                              <span className="font-black text-emerald-600">FREE</span>
                           </div>
                           <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                              <span className="font-black text-lg">Total</span>
                              <span className="font-black text-lg text-indigo-600">₦{cartTotal.toLocaleString()}</span>
                           </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                           onClick={handleCheckout}
                           disabled={isOrdering || !deliveryAddress.trim()}
                           className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                              isOrdering || !deliveryAddress.trim()
                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                 : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'
                           }`}
                        >
                           {isOrdering ? 'Processing Order...' : `Place Order • ₦${cartTotal.toLocaleString()}`}
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

function ProductCard({ item, onAddToCart, cartItems }) {
   const [quantity, setQuantity] = useState(1);
   const maxQuantity = parseFloat(item.quantity || 0);
   const pricePerUnit = parseFloat(item.price_per_unit || 0);
   const lineTotal = quantity * pricePerUnit;
   const isInCart = cartItems.some(c => c.id === item.id);
   const emoji = produceIcons[item.commodity] || '🌿';

   return (
      <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
         {/* Product Header with Gradient */}
         <div className="h-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 flex items-center justify-center relative">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
            {isInCart && (
               <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  In Cart
               </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">In Stock</span>
            </div>
         </div>

         <CardContent className="p-6 space-y-5">
            {/* Product Info */}
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.commodity}</h3>
               <div className="flex items-center gap-2 mt-2">
                  <FaWarehouse className="text-gray-300 text-xs" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.warehouse_name || 'AgriNoria Hub'}</span>
               </div>
            </div>

            {/* Price & Stock */}
            <div className="flex items-end justify-between">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price per {item.measuring_scale}</p>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">₦{pricePerUnit.toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</p>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-300">{item.quantity} <span className="text-xs text-gray-400">{item.measuring_scale}</span></p>
               </div>
            </div>

            {/* Quantity Selector & Total */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-3">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Quantity</label>
                  <span className="text-[10px] font-bold text-gray-300">{item.measuring_scale}</span>
               </div>
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setQuantity(Math.max(0.1, quantity - 1))}
                     className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                  >
                     <FaMinus size={10} />
                  </button>
                  <input
                     type="number"
                     min="0.1"
                     max={maxQuantity}
                     step="0.1"
                     value={quantity}
                     onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                     className="flex-1 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                     onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                     className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                  >
                     <FaPlus size={10} />
                  </button>
               </div>

               {/* Line Total */}
               <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estimated Total</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">₦{lineTotal.toLocaleString()}</span>
               </div>
            </div>

            {/* Add to Cart Button */}
            <button
               onClick={() => onAddToCart(item, quantity)}
               disabled={quantity <= 0 || quantity > maxQuantity}
               className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 ${
                  quantity <= 0 || quantity > maxQuantity
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                     : isInCart
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
               }`}
            >
               <FaShoppingCart size={14} />
               {isInCart ? 'Update Cart' : 'Add to Cart'} • ₦{lineTotal.toLocaleString()}
            </button>
         </CardContent>
      </Card>
   );
}
