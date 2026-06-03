"use client";

/**
 * Homepage block: loads HOMEPAGE_FEATURED hydrated campaigns from the API.
 * @module components/ads/HomepageSponsoredSection
 */

import { useEffect, useState } from "react";
import { fetchActiveAdsPublic } from "@/not-in-useyet-lib/adsApi";
import { SponsoredProductCard } from "./SponsoredProductCard";
import { FeaturedVendorCard } from "./FeaturedVendorCard";
import { PromotedTrainingCard } from "./PromotedTrainingCard";

export function HomepageSponsoredSection({ countryCode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { res, body } = await fetchActiveAdsPublic({
        placement: "HOMEPAGE_FEATURED",
        country: countryCode || undefined,
      });
      if (cancelled) return;
      if (!res.ok) {
        setError(body?.error || "Could not load sponsored section");
        setItems([]);
      } else {
        setItems(body.items || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">
        {error}
      </section>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Featured on Agri-Connect
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sponsored picks tailored to your region.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ campaign, creative }) => {
          const cid = campaign?.id;
          if (campaign.targetType === "PRODUCT" && creative) {
            return (
              <SponsoredProductCard
                key={cid}
                listing={creative}
                campaignId={cid}
                currency={creative.currency ? `${creative.currency} ` : ""}
                href={`/products/${creative.id}`}
              />
            );
          }
          if (campaign.targetType === "VENDOR" && creative) {
            return (
              <FeaturedVendorCard
                key={cid}
                vendor={creative}
                campaignId={cid}
                href={`/products`}
              />
            );
          }
          if (campaign.targetType === "TRAINING" && creative) {
            return (
              <PromotedTrainingCard
                key={cid}
                training={creative}
                campaignId={cid}
                href={`/dashboard/training/live/${creative.id}`}
              />
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}
