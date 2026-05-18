import { FaHandsHoldingCircle } from "react-icons/fa6";
import { LiaShuttleVanSolid } from "react-icons/lia";
// import { LocationSelector } from "@/components/LocationSelector";
export function DeliveryInfo() {
   return (
      <div className="rounded-md bg-(--white-fff) dark:bg-(--card-dark) text-(--foreground) h-screen p-3 space-y-4">
         <p className="text-[14px]">
            The BEST products, delivered faster. Now PAY on DELIVERY, Cash or Bank Transfer Anywhere, Zero Wahala!
         </p>
         {/* <div className="space-y-4 text-lg border-t border-gray-100 dark:border-gray-700">
            <p>Choose your location</p>
            <div>
               <LocationSelector className="flex flex-col gap-4" />
            </div>
         </div> */}
         {/* Pickup and Delivery */}
         <div className="space-y-4 py-3">
            <div className="flex gap-2">
               <FaHandsHoldingCircle className="min-w-5 min-h-5 mt-1" />
               <div className="text-sm">
                  <p className="text-[16px]">Pickup Station</p>
                  <p>Delivery fees &#x20A6;{new Intl.NumberFormat().format(1500)}</p>
                  <p>We take into consideration your premium satisfaction, we deliver to your doorstep.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <LiaShuttleVanSolid className="min-w-5 min-h-5 mt-1" />
               <div className="text-sm">
                  <p className="text-[16px]">Delivery</p>
                  <p>Delivery fees &#x20A6;{new Intl.NumberFormat().format(1500)}</p>
                  <p>We take into consideration your premium satisfaction, we deliver to your doorstep.</p>
               </div>
            </div>
         </div>
      </div>
   );
}
