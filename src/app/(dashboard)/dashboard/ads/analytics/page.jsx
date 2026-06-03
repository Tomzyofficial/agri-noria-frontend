"use client";

/**
 * Vendor ads analytics overview.
 * @module app/(dashboard)/dashboard/ads/analytics/page
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignAnalyticsCard } from "@/components/ads/CampaignAnalyticsCard";
import { fetchVendorAdsSummary } from "@/not-in-useyet-lib/adsApi";
import { VENDOR_ADS_BASE } from "@/not-in-useyet-lib/adsRoutes";

export default function DashboardAdsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { res, body } = await fetchVendorAdsSummary();
      if (!res.ok) {
        setError(
          typeof body?.error === "string"
            ? body.error
            : "Failed to load analytics",
        );
        setData(null);
      } else {
        setData(body);
        setError(null);
      }
      setLoading(false);
    })();
  }, []);

  const s = data?.summary;
  const r = data?.rollup;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href={VENDOR_ADS_BASE}
            className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            ← Campaigns
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Ads analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Aggregate counters on your campaigns plus optional raw event rollup.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CampaignAnalyticsCard
            title="Active campaigns"
            value={s?.activeCampaigns ?? 0}
          />
          <CampaignAnalyticsCard
            title="Total campaigns"
            value={s?.totalCampaigns ?? 0}
          />
          <CampaignAnalyticsCard
            title="Impressions (stored)"
            value={s?.impressions ?? 0}
            hint="Rolling counters on campaign rows"
          />
          <CampaignAnalyticsCard
            title="CTR (stored)"
            value={`${s?.ctrPercent ?? 0}%`}
            hint="Clicks ÷ impressions on counters"
          />
          <CampaignAnalyticsCard
            title="Impressions (events)"
            value={r?.impressions ?? 0}
          />
          <CampaignAnalyticsCard
            title="Clicks (events)"
            value={r?.clicks ?? 0}
          />
          <CampaignAnalyticsCard
            title="CTR (events)"
            value={`${r?.ctrPercent ?? 0}%`}
          />
        </div>
      )}
    </div>
  );
}
