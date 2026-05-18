"use client";

import { Button } from "@/components/ui/Button";
import { Wifi, Edit2, Ban } from "lucide-react";
import { CardDetailsSkeleton } from "@/app/(dashboard)/dashboard/components/Billing/CardDetailsSkeleton";
import EditCardModal from "@/app/(dashboard)/dashboard/components/Billing/CardEditModal";
import { VscDebugRestart } from "react-icons/vsc";

export function CardDetails({
   subscriptionData,
   subscriptionLoading,
   subscriptionError,
   handleCancel,
   handleUpdateCard,
   setIsOpen,
   isOpen,
   loading,
}) {
   if (subscriptionLoading) {
      return <CardDetailsSkeleton />;
   }

   if (subscriptionError) {
      return (
         <div className="mt-20">
            <p className="text-red-500">Failed to load subscription details.</p>
         </div>
      );
   }
   return (
      <div>
         {subscriptionData && (
            <>
               <EditCardModal
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  subscriptionData={subscriptionData}
                  handleUpdateCard={handleUpdateCard}
                  loading={loading}
               />
               <h2 className="text-xl font-bold mb-4">Card Details</h2>
               <div className="w-lg max-w-full">
                  <div className="mb-6 relative w-full">
                     <div
                        className={`relative w-full h-56 rounded-2xl bg-gradient-to-br from-(--primary) via-(--primary)-700 to-indigo-900 p-6 shadow-2xl`}
                     >
                        <div className="absolute inset-0 opacity-10">
                           <div className="absolute top-0 right-0 w-25 h-25 bg-background  rounded-full -mr-7 -mt-8" />
                           <div className="absolute bottom-0 left-0 w-20 h-20 bg-background rounded-full -ml-2 -mb-5" />
                        </div>
                        <div className="relative h-full flex flex-col justify-between">
                           <div className="flex justify-between">
                              <Wifi className="w-8 h-8 text-white transform rotate-90" />
                              <span className="text-white font-bold text-2xl">{subscriptionData.card_type}</span>
                           </div>
                           <div className="text-white text-xl md:text-2xl tracking-wider font-mono mb-4">
                              {subscriptionData.last4.padStart(16, "*")}
                           </div>
                           <div className="flex justify-between items-end">
                              <div>
                                 <div className="text-gray-300 text-xs mb-1">Card Holder</div>
                                 <div className="text-white font-semibold tracking-wider">
                                    {subscriptionData.card_account_name}
                                 </div>
                              </div>
                              <div>
                                 <div className="text-gray-300 text-xs mb-1">Expires</div>
                                 <div className="text-white font-semibold tracking-wider">
                                    {subscriptionData.card_expires_month}/
                                    {subscriptionData.card_expires_year?.toString().slice(-2)}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-between gap-4 w-[100%]">
                     {
                        subscriptionData.status === "active" && (
                           <Button
                              onClick={handleCancel}
                              className="cursor-pointer w-[50%] bg-red-200 border-2 border-red-300 hover:bg-red-300 text-red-400 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                           >
                              <span>
                                 <Ban />
                              </span>
                              Cancel Subscription
                           </Button>
                        )
                        /*  : (
                        <Button
                           onClick={handleReactivate}
                           className="cursor-pointer w-[50%] bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-500 hover:text-(--white-fff) transition-all flex items-center justify-center gap-2"
                        >
                           <span>
                              <VscDebugRestart />
                           </span>
                           Reactivate
                        </Button>
                     ) */
                     }
                     <Button
                        onClick={() => setIsOpen(true)}
                        className="cursor-pointer w-[50%] bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-500 hover:text-(--white-fff) transition-all flex items-center justify-center gap-2"
                     >
                        <span>
                           <Edit2 />
                        </span>
                        Edit Card
                     </Button>
                  </div>
               </div>{" "}
            </>
         )}
      </div>
   );
}
