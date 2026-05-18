import { Star } from "lucide-react";

export const StarRating = ({ rating, size = 4 }) => {
   const fullStars = Math.floor(rating);
   const hasHalfStar = rating % 1 >= 0.5;
   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

   return (
      <div className="flex items-center">
         {fullStars > 0 &&
            [...Array(fullStars)].map((_, i) => (
               <Star key={`full-${i}`} className={`w-${size} h-${size} text-yellow-400 fill-current`} />
            ))}
         {hasHalfStar && (
            <div className="relative">
               <Star className={`w-${size} h-${size} text-gray-300 fill-current`} />
               <div className="absolute left-0 top-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className={`w-${size} h-${size} text-yellow-400 fill-current`} />
               </div>
            </div>
         )}
         {fullStars > 0 &&
            [...Array(emptyStars)].map((_, i) => (
               <Star key={`empty-${i}`} className={`w-${size} h-${size} text-gray-300`} />
            ))}
      </div>
   );
};
