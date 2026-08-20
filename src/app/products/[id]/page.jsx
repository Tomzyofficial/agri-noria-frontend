import { ProductDetail } from "@/app/products/[id]/components/productDetailsPage";
import { Footer } from "@/components/ui/Footer";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc, verifyBuyerSession } from "@/actions/session.js";

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

async function getPage(id) {
   let data;
   try {
      const cookieHeader = await cookieStoreFnc();
      const res = await fetch(apiUrl(`/api/marketplace/${id}`), {
         cache: "no-store",
         headers: { Cookie: cookieHeader },
      });
      if (!res.ok) {
         throw new Error("Failed to fetch product");
      }
      data = await res.json();
   } catch (err) {
      console.error("Error fetching product:", err);
   }

   const product = data || null;
   return product;
}

export default async function Page({ params }) {
   const { id } = await params;
   const session = await verifyBuyerSession();
   const buyerId = session?.buyerId;

   const product = await getPage(id);

   const reviews = await fetchReviews(id, 1, 10);
   const eligible = await eligibleToReview(id);

   return (
      <>
         <ProductDetail product={product} eligible={eligible} reviews={reviews} buyerId={buyerId} />
         <Footer />
      </>
   );
}
