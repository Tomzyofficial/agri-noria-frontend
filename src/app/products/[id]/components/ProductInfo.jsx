"use client";
import { useState } from "react";
import Image from "next/image";
import { ProductCartActions } from "@/app/products/[id]/components/ProductCartActionBtns";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { StarRating } from "../../opinions/[id]/components/StarRating";

export function ProductInfo({ product, summary }) {
   const gallery = product.image.length > 0 ? product.image : null;
   const [activeIndex, setActiveIndex] = useState(0);
   const active = gallery[activeIndex];

   return (
      <div className="flex flex-col md:flex-row justify-between gap-4 lg:gap-8 bg-(--white-fff) dark:bg-(--card-dark) text-(--foreground) rounded-md p-6 h-fit">
         <div className="w-full ">
            <Image className="w-full aspect-square object-cover rounded-md" src={active} priority alt={`${product?.listing_name} Image`} width={300} height={300} />

            {gallery.length > 1 && (
               <div className="flex overflow-x-auto gap-2 py-2" role="tablist" aria-label={`${product?.listing_name} photos`}>
                  {gallery.map((img, index) => (
                     <button
                        key={index}
                        type="button"
                        role="tab"
                        aria-selected={index === activeIndex}
                        onClick={() => setActiveIndex(index)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A] ${index === activeIndex ? "border-[#14171A]" : "border-[#E2E4E3] opacity-70 hover:opacity-100"}`}
                     >
                        <Image src={img} alt={`${product?.listing_name} photo ${index + 1}`} fill sizes="64px" className="object-cover" />
                     </button>
                  ))}
               </div>
            )}
         </div>

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
