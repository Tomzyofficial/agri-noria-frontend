export function CardDetailsSkeleton() {
   return (
      <div className="">
         <h2 className="text-xl font-bold mb-4">Card Details</h2>
         <div className="w-lg max-w-full">
            {/* Card Display Skeleton */}
            <div className="mb-6 relative w-full">
               <div className="mb-6 relative w-full">
                  {/* Card Skeleton */}
                  <div className="relative w-full h-56 rounded-2xl bg-slate-200 dark:bg-slate-700 p-6 shadow-2xl animate-pulse">
                     {/* Background Pattern Skeleton */}
                     <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-25 h-25 bg-slate-300 dark:bg-slate-600 rounded-full -mr-7 -mt-8" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-slate-300 dark:bg-slate-600 rounded-full -ml-2 -mb-5" />
                     </div>

                     {/* Card Content Skeleton */}
                     <div className="relative h-full flex flex-col justify-between">
                        {/* Top Section */}
                        <div className="flex justify-between items-start">
                           <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
                           <div className="w-12 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
                        </div>

                        {/* Card Number Skeleton */}
                        <div className="mb-4">
                           <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex justify-between items-end">
                           <div>
                              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-20 mb-2"></div>
                              <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
                           </div>
                           <div>
                              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-2"></div>
                              <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Buttons Skeleton */}
               <div className="flex justify-between gap-4 w-[100%]">
                  <div className="w-[50%] h-12 bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl animate-pulse"></div>
                  <div className="w-[50%] h-12 bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl animate-pulse"></div>
               </div>
            </div>
         </div>
      </div>
   );
}
