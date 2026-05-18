import { ProductInfo } from "@/app/products/[id]/components/ProductInfo";
import { ProductInformation } from "@/app/products/[id]/components/ProductInformation";
import { DeliveryInfo } from "@/app/products/[id]/components/DeliveryInfo";
import { SellerCard } from "@/app/products/[id]/components/SellerCard";
import NotFound from "@/app/not-found";

export function ProductDetail({ product, summary }) {
   if (!product) {
      return <NotFound />;
   }

   return (
      <section className="m-4 md:m-10 mb-10 flex flex-col lg:flex-row gap-4">
         {/* Left side - Product Image and Info */}
         <div className="w-full lg:w-[70%]">
            <ProductInfo product={product} summary={summary} />
            <ProductInformation product={product} />
         </div>
         {/* Right side - Delivery Info and Seller Card */}
         <div className="w-full lg:w-[30%]">
            <DeliveryInfo />
            <SellerCard product={product} />
         </div>
      </section>
   );
}
