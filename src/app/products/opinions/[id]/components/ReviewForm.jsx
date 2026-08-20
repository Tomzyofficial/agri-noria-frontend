"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/Label";

export function ReviewForm({ productId, buyerId, eligible }) {
   const [rating, setRating] = useState(0);
   const [feedback, setFeedback] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const router = useRouter();

   if (!eligible) {
      return;
   }

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         if (!buyerId) {
            throw new Error("You must be logged in to submit a review.");
         }

         if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
         }

         setIsSubmitting(true);
         const res = await fetch(`/api/proxy/marketplace/${productId}/review/create`, {
            headers: {
               "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ buyerId, rating, feedback }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || "Failed to submit review.");
         }

         router.refresh();
         setRating(0);
         setFeedback("");
         toast.success("Your review has been submitted");
      } catch (err) {
         toast.error(err.message || "Something went wrong while submitting the review.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-4">
         <h2>Leave a review</h2>
         <div className="flex items-center space-x-1">
            <p>Your rating:</p>
            {[1, 2, 3, 4, 5].map((star) => (
               <Button key={star} type="button" onClick={() => setRating(star)} className={`text-xl ${rating >= star ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`} disabled={isSubmitting}>
                  ★
               </Button>
            ))}
         </div>

         <div>
            <Label htmlFor="feedback">
               Message <span className="text-gray-400">(Optional)</span>
            </Label>
            <Textarea value={feedback} id="feedback" onChange={(e) => setFeedback(e.target.value)} placeholder="Share your thoughts about this product..." className={`${isSubmitting ? "cursor-not-allowed opacity-50" : ""} my-1 min-h-[100px] text-sm`} disabled={isSubmitting} style={{ resize: "none" }} />
         </div>

         <Button type="submit" disabled={!rating || isSubmitting} className="item-start disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-[14px] bg-[var(--greenish-color)] hover:bg-[var(--dark-green-color)] hover:scale-105 transition ease-in-out text-white px-2 mb-4 rounded">
            {isSubmitting ? "Submitting..." : "Submit Review"}
         </Button>
      </form>
   );
}
