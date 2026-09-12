"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { trackAdClick, useViewableAdImpression } from "./adTracking";

const ROTATION_INTERVAL_MS = 5000;

export function BannerProductCard({ listing = [], rotationInterval = ROTATION_INTERVAL_MS }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const cardRef = useRef(null);
   const activeItem = listing[activeIndex];

   // Rotate through listings. No-op (and no timer) if there's 0 or 1 items.
   useEffect(() => {
      if (listing.length <= 1) return;
      const timer = setInterval(() => {
         setActiveIndex((prev) => (prev + 1) % listing.length);
      }, rotationInterval);
      return () => clearInterval(timer);
   }, [listing.length, rotationInterval]);

   // If the listing array itself changes (new campaign data loaded), restart rotation.
   useEffect(() => {
      setActiveIndex(0);
   }, [listing]);

   useViewableAdImpression(cardRef, activeItem?.campaign_id);

   const handleClick = async () => {
      trackAdClick(activeItem?.campaign_id).catch((err) => console.error("Failed to track click:", err));
   };

   if (!activeItem) return null;

   return (
      <div className="relative">
         <Link ref={cardRef} href={activeItem.href || `/products/${activeItem.listing_id || activeItem.id}`} onClick={handleClick} className="group block rounded-md border border-slate-200/80 bg-white shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-900 transition">
            <div className="w-full bg-slate-100 dark:bg-slate-800">{activeItem.image?.length > 0 && <Image src={activeItem.image[0]} alt={activeItem.listing_name || "Product"} className="object-cover shrink-0 rounded-t-md aspect-3/2 w-full h-48" width={300} height={200} />}</div>
            <div className="flex flex-1 flex-col gap-1 p-4">
               <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-50">{activeItem.listing_name}</p>
               <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{formatPrice(activeItem.price, activeItem.country_code, activeItem.currency)}</p>
            </div>
         </Link>

         {listing.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
               {listing.map((item, i) => (
                  <button key={item.campaign_id} type="button" onClick={() => setActiveIndex(i)} aria-label={`Show item ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-emerald-600" : "w-1.5 bg-slate-300 dark:bg-slate-600"}`} />
               ))}
            </div>
         )}
      </div>
   );
}
