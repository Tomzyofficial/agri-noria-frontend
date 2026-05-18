"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ProductCartActions } from "@/app/products/[id]/components/ProductCartActionBtns";
import { X } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { StarRating } from "@/app/products/opinions/[id]/components/StarRating";

export function ProductInfo({ product, summary }) {
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Prevent background scrolling when modal is open
   useEffect(() => {
      if (isModalOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }
      // Cleanup function to reset overflow when component unmounts
      return () => {
         document.body.style.overflow = "unset";
      };
   }, [isModalOpen]);

   return (
      <div className="flex flex-col md:flex-row justify-between gap-4 lg:gap-8 bg-(--white-fff) dark:bg-(--card-dark) text-(--foreground) rounded-md p-6 max-h-screen min-h-70">
         <div className="w-full lg:w-[40%]">
            <Image
               onClick={() => setIsModalOpen(true)}
               className="w-full lg:w-[15rem] h-[15rem] object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity"
               src={product?.product_image}
               priority
               alt={`${product?.listing_name} Image`}
               width={300}
               height={300}
            />
         </div>

         {/* Image Modal. Preview in large screen when the image is clicked */}
         {isModalOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4"
               onClick={() => setIsModalOpen(false)}
            >
               <div className="relative max-w-4xl w-full max-h-[60vh]" onClick={(e) => e.stopPropagation()}>
                  <Button
                     onClick={() => setIsModalOpen(false)}
                     className="absolute -top-15 right-0 text-white bg-slate-400 rounded-full p-3 hover:text-gray-300 text-2xl"
                     aria-label="Close modal"
                  >
                     <X />
                  </Button>
                  <div className="relative md:w-[60vw] w-full rounded">
                     <Image
                        src={product?.product_image}
                        alt={`${product?.listing_name} - Enlarged View`}
                        className="object-cover h-[50vh] w-full rounded"
                        width={800}
                        height={800}
                     />
                  </div>
               </div>
            </div>
         )}

         <div className="w-full text-(--foreground)">
            <div className="divide-y divide-gray-100 dark:divide-gray-700 space-y-5">
               <h1 className="text-2xl font-bold">
                  {product.listing_name
                     ? product.listing_name.charAt(0).toUpperCase() + product.listing_name.slice(1)
                     : ""}
               </h1>
               <p className="text-sm">{`Discount available: ${product.min_quantity && product.discount ? `Buy ${product.min_quantity} - get ${product?.discount}% off` : 0}`}</p>
               <p className="text-xl font-semibold">
                  {formatPrice(product?.price, product?.country_code, product?.currency)}
               </p>
            </div>
            <div className="flex items-center gap-2 mt-3">
               <div>
                  <StarRating rating={summary?.average} />
               </div>
               <Link
                  className="text-blue-800 font-medium text-md hover:underline"
                  href={`/products/opinions/${product.listing_id}`}
               >
                  ({summary?.total} Verified reviews)
               </Link>
            </div>

            <ProductCartActions product={product} />
         </div>
      </div>
   );
}
