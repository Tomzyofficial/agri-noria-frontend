import { apiUrl } from "@/_lib/api";
import ReviewsPage from "./components/ReviewsPage";
import { cookieStoreFnc, verifyBuyerSession } from "@/actions/session.js";

//export const dynamic = "force-dynamic";
//export const revalidate = 0;

const fetchReviews = async (productId, page, pageSize) => {
   const res = await fetch(apiUrl(`/api/marketplace/${productId}/reviews?page=${page}&pageSize=${pageSize}`));
   const data = await res.json();
   return data;
};

const eligibleToReview = async (productId) => {
   const cookieHeader = await cookieStoreFnc();
   const res = await fetch(apiUrl(`/api/marketplace/review/${productId}/eligible`), {
      headers: {
         cookie: cookieHeader,
      },
   });
   const data = await res.json();
   return data;
};

export default async function Page({ params }) {
   const resolvedParam = await params;
   const productId = resolvedParam.id;

   const session = await verifyBuyerSession();
   const buyerId = session?.buyerId;

   const reviews = await fetchReviews(productId, 1, 10);
   const eligible = await eligibleToReview(productId);

   return <ReviewsPage productReviews={reviews} productId={productId} buyerId={buyerId} eligible={eligible.eligible} />;
}
