"use client";

import { X, Store, Truck, Package, MapPin, Phone, Mail, User } from "lucide-react";
import { formatLabel } from "@/utils/otherUtils";
import { getStatusBadgeClass } from "./OrderStatusUtils";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";

export function OrderDetailModal({ selectedOrder, open, onClose }) {
   if (!open || !selectedOrder) return null;

   // metadata can come back as a JSON string or an already-parsed object
   const metadata = typeof selectedOrder.metadata === "string" ? JSON.parse(selectedOrder.metadata) : selectedOrder.metadata || {};

   console.log(metadata);

   const buyerInfo = metadata.buyer_info || {};
   const sellerBreakdown = metadata.seller_breakdown || []; // array of { seller_*, items: [...] }
   const logisticsInfo = metadata.logistics_provider || {};
   const amountBreakdown = metadata.amount_breakdown || {};

   const country_code = selectedOrder?.country_code;
   const currency = selectedOrder?.currency;

   // flat list of every line item across all sellers, useful for the totals table
   const allItems = sellerBreakdown.flatMap((seller) =>
      (seller.items || []).map((item) => ({
         ...item,
         seller_id: seller.seller_id,
         seller_name: [seller.seller_fname, seller.seller_lname].filter(Boolean).join(" "),
      }))
   );

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
         <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-(--card-dark)">
               <h2 className="text-lg font-semibold">Order selectedOrders</h2>
               <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                  <X className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6 space-y-6">
               {/* Order id + status */}
               <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{selectedOrder.id}</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(selectedOrder.status)}`}>{formatLabel(selectedOrder.status)}</span>
               </div>

               {/* Buyer */}
               <section className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                     <User className="w-4 h-4" />
                     Buyer
                  </h3>
                  <p className="text-sm">
                     <span className="text-gray-500">Name: </span>
                     {[buyerInfo.fname, buyerInfo.lname].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                     <Phone className="w-3.5 h-3.5 text-gray-400" />
                     {buyerInfo.phone || "—"}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                     <Mail className="w-3.5 h-3.5 text-gray-400" />
                     {buyerInfo.email || selectedOrder.buyer_email || "—"}
                  </p>
               </section>

               {/* One card per seller, since an order can span multiple vendors */}
               {sellerBreakdown.map((seller) => {
                  const sellerName = [seller.seller_fname, seller.seller_lname].filter(Boolean).join(" ") || "—";
                  return (
                     <section key={seller.seller_id} className="rounded-lg border overflow-hidden">
                        <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-800/40 border-b">
                           <h3 className="font-semibold flex items-center gap-2">
                              <Store className="w-4 h-4" />
                              {sellerName}
                           </h3>
                           <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                 <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                 {seller.listing_location}
                              </span>
                           </div>
                        </div>

                        <table className="min-w-full text-sm">
                           <thead className="bg-gray-50 dark:bg-gray-800/60 text-left text-gray-500">
                              <tr>
                                 <th className="px-3 py-2 font-medium">Product</th>
                                 <th className="px-3 py-2 font-medium">Qty</th>
                                 <th className="px-3 py-2 font-medium">Unit price</th>
                                 <th className="px-3 py-2 font-medium">Line total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y">
                              <tr>
                                 <td className="px-3 py-3">
                                    <div className="flex items-center gap-3">
                                       {seller.product_image && <Image src={seller.product_image} alt={seller.listing_name || "Product image"} width={40} height={40} className="rounded object-cover w-10 h-10 shrink-0" />}
                                       <span>{seller.listing_name || "—"}</span>
                                    </div>
                                 </td>
                                 <td className="px-3 py-3">{seller.quantity}</td>
                                 <td className="px-3 py-3">{formatPrice(seller.price, seller.country_code, seller.currency)}</td>
                                 <td className="px-3 py-3">{formatPrice(seller.price * seller.quantity, seller.country_code, seller.currency)}</td>
                              </tr>
                           </tbody>
                        </table>
                     </section>
                  );
               })}

               {sellerBreakdown.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No seller/item information found for this order.</p>}

               {/* Logistics */}
               <section className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                     <Truck className="w-4 h-4" />
                     Logistics partner
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <p className="text-sm">
                           <span className="text-gray-500">Driver: </span>
                           {selectedOrder.assigned_driver_name || "—"}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                           <Phone className="w-3.5 h-3.5 text-gray-400" />
                           {selectedOrder.assigned_driver_phone || "—"}
                        </p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm">
                           <span className="text-gray-500">Vehicle: </span>
                           {logisticsInfo.vehicle_title || logisticsInfo.vehicle_type || "—"}
                        </p>
                        <p className="text-sm">
                           <span className="text-gray-500">Rate: </span>
                           {logisticsInfo.rate_amount ? formatPrice(Number(logisticsInfo.rate_amount), country_code, currency) : "—"}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                           <MapPin className="w-3.5 h-3.5 text-gray-400" />
                           {logisticsInfo.base_location || "—"}
                        </p>
                     </div>
                  </div>
               </section>

               {/* Totals */}
               <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t">
                  <span>Subtotal: {formatPrice(amountBreakdown.subtotal || 0, country_code, currency)}</span>
                  {amountBreakdown.discount > 0 && <span>Discount: −{formatPrice(amountBreakdown.discount, country_code, currency)}</span>}
                  <span>Delivery fee: {formatPrice(amountBreakdown.delivery_fee || 0, country_code, currency)}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Total: {formatPrice(amountBreakdown.total_amount || selectedOrder.total_amount || 0, country_code, currency)}</span>
               </div>
            </div>
         </div>
      </div>
   );
}
