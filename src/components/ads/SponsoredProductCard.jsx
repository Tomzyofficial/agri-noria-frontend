"use client";

/**
 * Product card with optional sponsored impression tracking.
 * @module components/ads/SponsoredProductCard
 */

import { useEffect, useRef } from "react";
import { SponsoredBadge } from "./SponsoredBadge";
import { trackImpression } from "@/not-in-useyet-lib/adsApi";

export function SponsoredProductCard({
  listing,
  campaignId,
  currency = "",
  href = "#",
  track = true,
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!track || !campaignId || tracked.current) return;
    tracked.current = true;
    trackImpression(campaignId).catch(() => {});
  }, [track, campaignId]);

  return (
    <a
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {listing?.product_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.product_image}
            alt={listing.listing_name || "Product"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute left-2 top-2">
          <SponsoredBadge />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-50">
          {listing?.listing_name}
        </p>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {currency}
          {listing?.price}
        </p>
      </div>
    </a>
  );
}
