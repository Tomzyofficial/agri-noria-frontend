"use client";
import { useState, useEffect } from "react";
import { X, Sprout, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function EcosystemPopup() {
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      // Check if user has already dismissed the popup
      const hasDismissed = localStorage.getItem("agriconnect_ecosystem_dismissed");
      
      if (!hasDismissed) {
         // Show popup after a short delay so it doesn't interrupt immediate actions
         const timer = setTimeout(() => {
            setIsVisible(true);
         }, 3000);
         return () => clearTimeout(timer);
      }
   }, []);

   const handleDismiss = () => {
      setIsVisible(false);
      localStorage.setItem("agriconnect_ecosystem_dismissed", "true");
   };

   if (!isVisible) return null;

   return (
      <div className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 fade-in duration-500">
         <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 shadow-2xl rounded-2xl overflow-hidden relative">
            {/* Header/Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 text-white relative">
               <button 
                  onClick={handleDismiss}
                  className="absolute top-2 right-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors cursor-pointer"
                  aria-label="Close"
               >
                  <X className="w-4 h-4" />
               </button>
               <h3 className="font-black text-lg flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-300" />
                  Join the Ecosystem
               </h3>
               <p className="text-blue-100 text-xs mt-1 font-medium">Unlock exclusive industrial benefits</p>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
               <div className="space-y-3">
                  <div className="flex gap-3">
                     <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg h-fit">
                        <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Direct Financing</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Get funded for your farming season through verified aggregators.</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                     <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit">
                        <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Guaranteed Offtake</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Instant sales of your produce via institutional agreements.</p>
                     </div>
                  </div>
               </div>

               <div className="pt-2 flex gap-2">
                  <Link href="/dashboard" className="flex-1" onClick={handleDismiss}>
                     <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 border-none">
                        Explore Mode
                     </Button>
                  </Link>
                  <Button 
                     onClick={handleDismiss} 
                     variant="outline" 
                     className="px-3 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"
                  >
                     Later
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}
