"use client";

/**
 * Featured vendor tile (HOMEPAGE_FEATURED / FEATURED_VENDOR).
 * @module components/ads/FeaturedVendorCard
 */

import { useEffect, useRef } from "react";
import { SponsoredBadge } from "./SponsoredBadge";
import { trackImpression } from "@/not-in-useyet-lib/adsApi";

export function FeaturedVendorCard({
  vendor,
  campaignId,
  href = "#",
  track = true,
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!track || !campaignId || tracked.current) return;
    tracked.current = true;
    trackImpression(campaignId).catch(() => {});
  }, [track, campaignId]);

  const name = vendor
    ? `${vendor.fname || ""} ${vendor.lname || ""}`.trim()
    : "Vendor";

  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {vendor?.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.profile_image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </p>
          <SponsoredBadge />
        </div>
        {vendor?.is_verified ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Verified vendor
          </p>
        ) : null}
      </div>
    </a>
  );
}
