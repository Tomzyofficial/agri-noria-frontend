"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "@/app/products/opinions/[id]/components/StarRating";
import { RatingBar } from "@/app/products/opinions/[id]/components/RatingBar";
import { ReviewItem } from "./RatingItem";
import { MessageSquareMore } from "lucide-react";
import useSWR from "swr";

const getReviewKey = (review, index) => {
   if (review.id) return `review-${review.id}`;
   if (review.created_at) return `review-${review.created_at}`;
   return `review-${index}`;
};

export default function ProductReviewsPage({ productId, buyerId }) {
   const router = useRouter();
   const [page, setPage] = useState(1);
   const pageSize = 2;

   const fetcher = async (url) => {
      const res = await fetch(url, {
         method: "GET",
      });
      if (!res.ok) {
         return new Error("Failed to fetch reviews data");
      }
      const data = await res.json();

      return data;
   };

   const { data, isLoading, error } = useSWR(
      `/api/proxy/marketplace/${productId}/reviews?page=${page}&pageSize=${pageSize}`,
      fetcher,
   );

   const reviews = data?.reviews ?? [];
   const summary = data?.summary ?? { total: 0, average: 0, breakdown: {} };

   if (isLoading) {
      return (
         <div className="container mx-auto p-4">
            <div className="animate-pulse space-y-4">
               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
               <div className="h-4 bg-gray-200 rounded w-1/2"></div>
               <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div className="md:col-span-1 space-y-4">
                     <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                     {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="container mx-auto p-4">
            <p className="text-red-500">Failed to load reviews. Please try again later.</p>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <Button
            className="flex cursor-pointer gap items-center mb-6 p-0 hover:bg-transparent"
            onClick={() => router.back()}
         >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to product
         </Button>

         <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Feedback on Product Reviews</h1>
            <p className="text-gray-600">Read what other customers think about this product</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8">
            {/* Left sidebar - Rating summary */}
            <div className="md:col-span-1">
               <Card className="sticky top-4">
                  <CardContent className="p-6">
                     <div className="flex flex-col items-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-1">{summary?.average || "0.0"}</div>
                        <div className="mb-2">
                           <StarRating rating={summary?.average || "0"} size={6} />
                        </div>
                        <p className="text-sm text-gray-500">
                           Based on {summary?.total} review{summary.total !== 1 ? "s" : ""}
                        </p>
                     </div>

                     <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                           <RatingBar
                              key={rating}
                              rating={rating}
                              count={summary?.breakdown[rating] || 0}
                              total={summary?.total}
                           />
                        ))}
                     </div>

                     <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="font-medium mb-3">Leave a review</h3>
                        <ReviewForm productId={productId} buyerId={buyerId} />
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Main content - Reviews */}
            <div className="md:col-span-2">
               {reviews.length === 0 ? (
                  <Card>
                     <CardContent className="p-8 text-center">
                        <div className="w-12 mx-auto mb-2">
                           <MessageSquareMore className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to review this product!</p>
                     </CardContent>
                  </Card>
               ) : (
                  <div className="space-y-4">
                     {reviews.map((review, index) => (
                        <ReviewItem key={getReviewKey(review, index)} review={review} />
                     ))}

                     {/* Pagination */}
                     {summary.total > pageSize && (
                        <div className="flex justify-between items-center mt-6">
                           <Button
                              className="cursor-pointer"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page === 1}
                           >
                              Previous
                           </Button>
                           <span className="text-sm text-gray-600">
                              Page {page} of {Math.ceil(summary.total / pageSize)}
                           </span>
                           <Button
                              className="cursor-pointer"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={page * pageSize >= summary.total}
                           >
                              Next
                           </Button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
