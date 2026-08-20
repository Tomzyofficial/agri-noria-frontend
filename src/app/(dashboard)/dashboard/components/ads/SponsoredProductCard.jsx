"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/utils/formatPrice";

export function SponsoredProductCard({ product, containerRef }) {
   const cardRef = useRef(null);
   const tracked = useRef(false);

   // Fires once, only when this specific card actually scrolls into view
   // within the horizontal row — not on mount, not for cards off-screen.
   useEffect(() => {
      if (!product.campaign_id || !cardRef.current) return;

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting && !tracked.current) {
               tracked.current = true;
               fetch("/api/proxy/public/track/impression", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ campaignId: product.campaign_id }),
               }).catch((err) => console.error("Failed to track impression:", err));
               observer.disconnect();
            }
         },
         { root: containerRef?.current || null, threshold: 0.6 }
      );

      observer.observe(cardRef.current);
      return () => observer.disconnect();
   }, [product?.campaign_id, containerRef]);

   const handleClick = () => {
      if (!product.campaign_id) return;
      fetch("/api/proxy/public/track/click", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ campaignId: product.campaign_id }),
      }).catch((err) => console.error("Failed to track click:", err));
   };

   return (
      <Link ref={cardRef} href={`/products/${product?.id}`} onClick={handleClick} className="snap-start shrink-0 w-40 md:w-48 rounded-md border border-slate-200/80 bg-white shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-900 transition">
         <div className="w-full bg-slate-100 dark:bg-slate-800">{product.image?.length > 0 && <Image src={product.image[0]} alt={product.listing_name || "Product"} className="object-cover shrink-0 rounded-t-md w-full h-32" width={300} height={200} />}</div>
         <div className="flex flex-col gap-1 p-3">
            <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{product.listing_name}</p>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{formatPrice(product.price, product.country_code, product.currency)}</p>
         </div>
      </Link>
   );
}
