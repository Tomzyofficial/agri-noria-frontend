"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SponsoredBadge } from "./SponsoredBadge";
import { trackImpression } from "@/not-in-useyet-lib/adsApi";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";

export function SponsoredProductCard({ listing, campaignId, href = "#" }) {
   const tracked = useRef(false);

   useEffect(() => {
      if (!campaignId || tracked.current) return;
      tracked.current = true;
      (async () => {
         const res = await fetch("/api/proxy/public/track/impression", {
            method: "POST",
            body: JSON.stringify({ campaignId }),
            headers: {
               "Content-Type": "application/json",
            },
         });
         if (!res.ok) {
            console.error("failed to fetch", res.status);
            return;
         }
         console.log("impression tracked");
      })();
   }, [campaignId]);

   const handleClick = async () => {
      if (!campaignId) return;
      const res = await fetch("/api/proxy/public/track/click", {
         method: "POST",
         body: JSON.stringify({ campaignId }),
         headers: {
            "Content-Type": "application/json",
         },
      });

      if (!res.ok) {
         console.error("failed to fetch", res.status);
         return;
      }
      console.log("click tracked");
   };

   return (
      <div onClick={handleClick}>
         <Link href={href} className="group flex flex-col rounded-lg border border-slate-200/80 bg-white shadow-sm transition relative hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="w-full bg-slate-100 dark:bg-slate-800">
               {listing?.image && listing.image.length > 0 ? <Image src={listing.image[0]} alt={listing.listing_name || "Product"} className="h-full w-full object-cover aspect-[4/3] transition duration-300 group-hover:scale-[1.02]" width={300} height={200} /> : null}
               <div className="absolute left-2 top-2">
                  <SponsoredBadge />
               </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
               <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-50">{listing?.listing_name}</p>
               <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{formatPrice(listing?.price, listing.country_code, listing.currency)}</p>
            </div>
         </Link>
      </div>
   );
}
