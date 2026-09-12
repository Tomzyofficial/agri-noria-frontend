import { Star } from "lucide-react";

export function Ratings({ ratingsLoading, ratingsError, ratings }) {
   return (
      <section className="bg-(--white-fff) dark:bg-(--card-dark)  p-4 rounded-xl shadow-lg">
         <h2 className="text-lg font-semibold mb-6 border-b border-gray-200 dark:border-gray-500 pb-4">
            Ratings & Reviews
         </h2>
         <div className="mt-6">
            {ratingsLoading ? (
               <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
               </div>
            ) : ratingsError ? (
               <p className="text-red-500">Error fetching ratings</p>
            ) : ratings?.total > 0 ? (
               <>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="text-4xl font-bold">{ratings.average}</div>
                     <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div>
                           Based on {ratings?.total} review{ratings?.total !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center mt-1">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                 key={star}
                                 className={`w-5 h-5 ${
                                    star <= Math.round(ratings?.average) ? "text-yellow-400" : "text-gray-300"
                                 }`}
                              />
                           ))}
                           {/*    <svg
                              key={star}
                              className={`w-5 h-5 ${
                                 star <= Math.round(ratings?.average) ? "text-yellow-400" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                           >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.//783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg> */}
                        </div>
                     </div>
                  </div>
                  {/* Rating Breakdown */}
                  <div className="space-y-2 px-4">
                     {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratings.breakdown[star] || 0;
                        const percentage = ratings.total > 0 ? Math.round((count / ratings.total) * 100) : 0;

                        return (
                           <div key={star} className="flex items-center">
                              <span className="flex items-center gap-1 text-sm font-medium">
                                 {star} <Star className="w-3 h-3" />
                              </span>
                              <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                                 <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                 />
                              </div>
                              <span className="w-8 text-sm flex items-center gap-1">
                                 <span>{percentage}%</span>({count})
                              </span>
                           </div>
                        );
                     })}
                  </div>
               </>
            ) : (
               <p className="text-gray-600 dark:text-gray-300">No reviews yet</p>
            )}
         </div>
         {/* <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                           const pct = getPercent(star);
                           return (
                              <div key={star} className="flex items-center gap-3">
                                 <div className="w-10 text-right text-sm font-medium">{star}★</div>
                                 <div className="flex-1">
                                    <div className="w-full h-3 bg-(--primary)/20 dark:bg-(--primary)/20 rounded-full overflow-hidden">
                                       <div className="h-full bg-(--primary) dark:bg-(--primary)/30 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                 </div>
                                 <div className="w-20 text-right text-sm text-gray-700">{pct}%</div>
                              </div>
                           );
                        })}
                     </div> */}
      </section>
   );
}
