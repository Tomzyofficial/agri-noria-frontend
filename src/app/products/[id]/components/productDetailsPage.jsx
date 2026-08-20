import { ProductInfo } from "@/app/products/[id]/components/ProductInfo";
import { ProductInformation } from "@/app/products/[id]/components/ProductInformation";
// import { SellerCard } from "@/app/products/[id]/components/SellerCard";
import { notFound } from "next/navigation";
import ReviewsPage from "../../opinions/[id]/components/ReviewsPage";

export function ProductDetail({ product, eligible, reviews, buyerId }) {
   if (!product) {
      notFound();
   }

   return (
      <>
         <section className="m-4 md:m-10 mb-10 flex flex-col lg:flex-row gap-4">
            {/* Left side - Product Image and Info */}
            <div className="w-full lg:w-[70%]">
               <ProductInfo product={product} summary={reviews.summary} />
               <ProductInformation product={product} />
            </div>
            {/* Right side - Delivery Info and Seller Card */}
            {/* <div className="w-full lg:w-[30%]">
               <SellerCard product={product} />
            </div> */}
         </section>
         <section>
            <ReviewsPage arrowBack={false} productReviews={reviews} productId={product.id} buyerId={buyerId} eligible={eligible} />
         </section>
      </>
   );
}
