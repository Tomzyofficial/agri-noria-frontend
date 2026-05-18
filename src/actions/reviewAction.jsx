"use server";

import { apiUrl } from "@/_lib/api";

export async function getProductReviews(productId, page = 1) {
   try {
      const data = await fetch(apiUrl(`/api/marketplace/product-details/${productId}/reviews?page=${page}`), {
         next: { revalidate: 60 },
      });
      return data;
   } catch (error) {
      return { reviews: [], summary: null, totalPages: 0 };
   }
}
