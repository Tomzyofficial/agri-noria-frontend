"use client";

import { Check, Lock } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
   return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
         <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
            {/* LEFT SIDE — BILLING FORM */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
               <h2 className="text-2xl font-semibold text-gray-900">Billing Details</h2>
               <p className="text-sm text-gray-500 mt-1">Complete your billing information to finalize your purchase.</p>

               <form className="mt-8 space-y-6">
                  {/* Full Name */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Full Name</label>
                     <input
                        type="text"
                        className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                        placeholder="John Doe"
                     />
                  </div>

                  {/* Email */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Email Address</label>
                     <input
                        type="email"
                        className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                        placeholder="johndoe@email.com"
                     />
                  </div>

                  {/* Address */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                     <input
                        type="text"
                        className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                        placeholder="123 Market Road, Lagos"
                     />
                  </div>

                  {/* Payment info */}
                  <div className="pt-4 border-t border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>

                     <div className="mt-4 grid gap-4">
                        {/* Card Number */}
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Card Number</label>
                           <input
                              type="text"
                              className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                              placeholder="1234 5678 9012 3456"
                           />
                        </div>

                        {/* Expiry + CVV */}
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Expiry</label>
                              <input
                                 type="text"
                                 className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                                 placeholder="MM/YY"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">CVV</label>
                              <input
                                 type="password"
                                 className="mt-2 w-full rounded-xl border-gray-300 focus:ring-green-600 focus:border-green-600"
                                 placeholder="***"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold mt-6 flex items-center justify-center gap-2">
                     <Lock size={18} />
                     Pay Securely
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-3 flex justify-center items-center gap-1">
                     <Lock size={14} /> All transactions are secure and encrypted.
                  </p>
               </form>
            </div>

            {/* RIGHT SIDE — ORDER SUMMARY */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-fit sticky top-16">
               <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>

               <div className="mt-6 space-y-4">
                  {/* Example product */}
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="font-medium text-gray-800">Fresh Tomatoes (50kg)</p>
                        <p className="text-sm text-gray-500">Vendor: Greenleaf Farms</p>
                     </div>
                     <p className="font-semibold text-gray-900">₦12,500</p>
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-200" />

                  {/* Totals */}
                  <div className="space-y-1 text-gray-700">
                     <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>₦12,500</p>
                     </div>

                     <div className="flex justify-between">
                        <p>Logistics</p>
                        <p>₦2,000</p>
                     </div>

                     <div className="flex justify-between">
                        <p>Platform Fee</p>
                        <p>₦300</p>
                     </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                     <p>Total</p>
                     <p>₦14,800</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-green-700 text-sm">
                     <Check size={16} />
                     Certified Vendor Purchase
                  </div>

                  <Link href="/cart" className="block text-center mt-6 text-sm text-green-600 hover:text-green-700 underline">
                     Modify your cart
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}
