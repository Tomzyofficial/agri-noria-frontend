import Image from "next/image";
import { ProductCartActions } from "@/app/products/[id]/components/ProductCartActionBtns";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { StarRating } from "@/app/products/opinions/[id]/components/StarRating";
import { ImageEnlargementModal } from "@/components/ui/ImageEnlargementModal";

export function ProductInfo({ product }) {
   const img = product?.image.map((img) => img);
   return (
      // <section className="flex gap-4 bg-white shadow-md rounded-md max-h-screen min-h-70">
      //    <div className="w-full lg:w-[40%]">
      //       <Image src={img[0]} alt={product?.listing_name} width={300} height={300} className="w-full lg:w-[15rem] h-[15rem] object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity" />
      //       <div>{img.length > 1 && <Image key={img} src={img} alt="others" width={200} height={200} />}</div>
      //       <div>
      //          <p>{product.listing_name}</p>
      //          <p>{product.listing_type}</p>
      //          <p>{product.sale_price}</p>
      //       </div>
      //    </div>
      //    <div>
      //       <p>seller side</p>
      //    </div>
      // </section>

      <div className="flex flex-col md:flex-row justify-between gap-4 lg:gap-8 bg-(--white-fff) dark:bg-(--card-dark) text-(--foreground) rounded-md p-6 max-h-screen min-h-70">
         <div className="w-full lg:w-[40%]">
            <Image onClick={() => setIsModalOpen(true)} className="w-full lg:w-[15rem] h-[15rem] object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity" src={product?.product_image} priority alt={`${product?.listing_name} Image`} width={300} height={300} />
         </div>

         {/* Image Modal. Preview in large screen when the image is clicked */}
         <ImageEnlargementModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} name={`${product?.listing_name} image`} src={product?.product_image} />

         <div className="w-full text-(--foreground)">
            <div className="divide-y divide-gray-100 dark:divide-gray-700 space-y-5">
               <h1 className="text-2xl font-bold">{product.listing_name ? product.listing_name.charAt(0).toUpperCase() + product.listing_name.slice(1) : ""}</h1>
               <p className="text-sm">{`Discount available: ${product.min_quantity && product.discount ? `Buy ${product.min_quantity} - get ${product?.discount}% off` : 0}`}</p>
               <p className="text-xl font-semibold">{formatPrice(product?.price, product?.country_code, product?.currency)}</p>
            </div>
            <div className="flex items-center gap-2 mt-3">
               <div>
                  <StarRating rating={summary?.average} />
               </div>
               <Link className="text-blue-800 font-medium text-md hover:underline" href={`/products/opinions/${product.listing_id}`}>
                  ({summary?.total} Verified reviews)
               </Link>
            </div>

            <ProductCartActions product={product} />
         </div>
      </div>
   );
}
