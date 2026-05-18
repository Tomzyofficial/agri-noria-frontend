import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";

export function CheckoutSummary({ itemsCount, itemsTotal, discount, total, formData, cart }) {
   // Get currency and country from first cart item for formatting
   const firstItem = cart?.[0];
   const countryCode = firstItem?.country_code;
   const currency = firstItem?.currency;

   // Calculate discount - only apply if buyer meets minimum quantity requirements
   // const discount = cart
   //    ? cart.reduce((totalDiscount, item) => {
   //         const itemTotal = item.price * (item.quantity || 1);
   //         const meetsMinQuantity = item.quantity >= (item.min_quantity || 1);

   //         if (meetsMinQuantity && item.discount > 0) {
   //            // Apply discount to total item price (price × quantity) if buyer meets minimum quantity requirement
   //            const itemDiscount = itemTotal * (item.discount / 100);
   //            return totalDiscount + itemDiscount;
   //         }
   //         return totalDiscount;
   //      }, 0)
   //    : 0;

   const deliveryFee = 1100;
   return (
      <div className="lg:sticky lg:top-18 w-full lg:w-2/5 h-fit">
         <div className="bg-(--white-fff) dark:bg-(--card-dark) rounded-md shadow-sm p-6">
            <h3 className="font-semibold text-(--foreground) mb-5">Order summary</h3>

            <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
               <span className="text-gray-600">{`Item's total (${itemsCount})`}</span>
               <span className="text-(--foreground) font-medium">{formatPrice(itemsTotal, countryCode, currency)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
               <span className="text-gray-600">Delivery fees</span>
               <span className="text-(--foreground) font-medium">
                  {formatPrice(deliveryFee, countryCode, currency)}
               </span>
            </div>

            <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
               <span className="text-gray-600">Discount</span>
               <div>
                  <span className="text-(--foreground) font-medium pr-1">
                     {formatPrice(discount, countryCode, currency)}
                  </span>
                  {discount > 0 && <span className="text-(--foreground) font-medium">(Applied)</span>}
               </div>
            </div>

            <div className="flex justify-between pt-4 text-lg font-semibold">
               <span className="text-(--foreground)">Total</span>
               <span className="text-(--foreground)">{formatPrice(total, countryCode, currency)}</span>
            </div>

            {/* Confirm Button */}
            <Button
               disabled
               className={`${
                  formData.accepted
                     ? "bg-(--greenish-color) cursor-pointer hover:bg-(--dark-green-color) transition transition-background"
                     : "bg-[#C0C0C0] cursor-not-allowed"
               } w-full py-4 text-white rounded font-semibold text-[15px] mb-3`}
            >
               Confirm order
            </Button>

            <div className="text-center text-xs text-gray-500 mb-4">(Complete the steps in order to proceed)</div>

            <div className="text-center text-xs text-gray-600">
               By proceeding, you are automatically accepting the{" "}
               <Link href="#" className="text-blue-600 hover:underline">
                  Terms & Conditions
               </Link>
            </div>
         </div>
      </div>
   );
}
