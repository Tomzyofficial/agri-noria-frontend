import { StarRating } from "./StarRating";
import { Card, CardContent } from "@/components/ui/Card";

export const ReviewItem = ({ review }) => (
   <Card className="mb-4">
      <CardContent className="p-4">
         <div className="">
            <div className="flex flex-col ">
               <StarRating rating={review.rating} size={4} />
               {review.feedback && <p className="mt-3 text-gray-700 text-start">{review.feedback}</p>}
            </div>
            <div className="flex items-center mt-3 flex gap-2">
               <span className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                     year: "numeric",
                     month: "long",
                     day: "numeric",
                  })}
               </span>
               <h4 className="font-medium">by {review.buyer?.name || review.buyer_name || "Anonymous"}</h4>
            </div>
         </div>
      </CardContent>
   </Card>
);
