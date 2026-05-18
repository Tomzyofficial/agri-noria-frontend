import { Star } from "lucide-react";

export const RatingBar = ({ count, total, rating }) => {
   const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

   return (
      <div className="flex items-center gap-2 w-full">
         <div className="flex items-center w-20">
            <span className="text-sm w-4">{rating}</span>
            <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
         </div>
         <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
         </div>
         <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
      </div>
   );
};
