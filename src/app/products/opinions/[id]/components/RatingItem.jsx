import { formatDate } from "@/utils/otherUtils";
import { StarRating } from "./StarRating";
import { Card, CardContent } from "@/components/ui/Card";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export const ReviewItem = ({ review }) => (
   <Card className="mb-4">
      <CardContent className="p-4">
         <div className="">
            <div className="flex justify-between items-center">
               <div className="flex flex-col ">
                  <StarRating rating={review.rating} size={4} />
                  {review.feedback && <p className="mt-3 text-gray-700 text-start">{review.feedback}</p>}
               </div>
               <p className="tracking-wide flex items-center gap-2">
                  <span>
                     <IoMdCheckmarkCircleOutline className="text-green-600" size={27} />
                  </span>
                  Verified Purchase
               </p>
            </div>
            <div className="flex items-center mt-3 flex gap-2">
               <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
               <h4 className="font-medium">by {review.buyer_name || "Anonymous"}</h4>
            </div>
         </div>
      </CardContent>
   </Card>
);
