"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "next/navigation";

export function ReviewForm({ productId, buyerId }) {
   const [rating, setRating] = useState(0);
   const [feedback, setFeedback] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState(null);
   const router = useRouter();

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!buyerId) {
         setError("You must be logged in to submit a review.");
         return;
      }

      if (!rating) return;

      setIsSubmitting(true);
      setError(null);

      try {
         const res = await fetch(`/api/proxy/marketplace/${productId}/reviews`, {
            headers: {
               "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ buyerId, rating, feedback }),
         });

         const data = await res.json();

         if (!res.ok) {
            setError(data.error || "Failed to submit review.");
            return;
         }

         router.refresh();
         setRating(0);
         setFeedback("");
      } catch (err) {
         setError(err.message || "Something went wrong while submitting the review.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-4">
         <div className="flex items-center space-x-1">
            <p>Your rating:</p>
            {[1, 2, 3, 4, 5].map((star) => (
               <Button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-xl ${rating >= star ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                  disabled={isSubmitting}
               >
                  ★
               </Button>
            ))}
         </div>

         <div>
            <Textarea
               value={feedback}
               onChange={(e) => setFeedback(e.target.value)}
               placeholder="Share your thoughts about this product..."
               className={`${isSubmitting ? "cursor-not-allowed opacity-50" : ""} min-h-[100px] text-sm`}
               disabled={isSubmitting}
               style={{ resize: "none" }}
            />
            {error && <p className="text-red-500 text-sm text-start">{error}</p>}
         </div>

         <Button
            type="submit"
            disabled={!rating || isSubmitting}
            className={`${
               isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } text-[14px] bg-[var(--greenish-color)] hover:bg-[var(--dark-green-color)] hover:scale-105 transition ease-in-out text-white px-2 mb-4 rounded`}
         >
            {isSubmitting ? "Submitting..." : "Submit Review"}
         </Button>
      </form>
   );
}
