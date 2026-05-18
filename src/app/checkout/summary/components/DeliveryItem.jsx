import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";

export function Delivery({ cart }) {
   const firstItem = cart?.[0];
   const countryCode = firstItem?.country_code;
   const currency = firstItem?.currency;
   return (
      <div className="bg-(--white-fff) dark:bg-(--card-dark) rounded-md shadow-sm p-6">
         <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
               <Check className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-(--foreground)">3. DELIVERY DETAILS</h2>
         </div>

         <div className="flex gap-3 p-4 border-2 border-[#FF9900] rounded bg-[#FFF8F0] mb-5">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF9900] flex items-center justify-center flex-shrink-0 mt-0.5">
               <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]"></div>
            </div>
            <div className="flex-1">
               <div className="font-semibold text-[14px] text-(--foreground) mb-1">
                  Delivery (from {formatPrice(1100, countryCode, currency)})
               </div>
               <div className="text-gray-600 text-[13px]">Delivery between 5 to 14 days.</div>
            </div>
         </div>

         {/* Shipment Details */}
         <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
               <div className="text-gray-600 text-[13px]">{`Shipment 1/1`}</div>
               <div className="text-gray-600 text-[13px]">Fulfilled by Green Oria Holdings</div>
            </div>

            <div className="border border-gray-300 rounded p-4 relative">
               <div className="font-semibold text-[14px] text-(--foreground) mb-2">Your cart</div>
               {cart && cart.length > 0 ? (
                  <div>
                     {cart.map((item) => (
                        <div key={item.listing_id} className="flex gap-3 items-center mb-2">
                           <div className="relative w-[60px] h-[60px] border border-gray-300 rounded flex-shrink-0">
                              <div className="absolute top-0 left-0 bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-br">
                                 x{item.quantity}
                              </div>
                              <Image
                                 src={item.product_image}
                                 width={100}
                                 height={100}
                                 alt={item.listing_name}
                                 className="w-full h-full object-cover rounded"
                              />
                           </div>
                           <div className="flex-1">
                              <div className="text-[13px] text-(--foreground) mb-1">{item.listing_name}</div>
                              {item.quantity >= item.min_quantity && (
                                 <div className="text-[13px] text-gray-600">
                                    &minus;{" "}
                                    {formatPrice(
                                       item.price * item.quantity * (item.discount / 100),
                                       countryCode,
                                       currency,
                                    )}
                                 </div>
                              )}
                              <div className="text-[14px] font-semibold text-(--foreground)">
                                 {formatPrice(item.price, countryCode, currency)}
                              </div>
                           </div>
                        </div>
                     ))}
                     <div className="absolute bottom-2 right-2">
                        <Link
                           href="/cart"
                           className="text-(--greenish-color) hover:bg-(--dark-green-color) hover:text-(--white-fff) py-1 px-2 rounded "
                        >
                           Modify cart
                        </Link>
                     </div>
                  </div>
               ) : (
                  <div className="text-sm text-gray-400">No items in cart.</div>
               )}
            </div>
         </div>
      </div>
   );
}
