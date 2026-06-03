"use client";

/**
 * Single campaign detail for vendors.
 * @module app/(dashboard)/dashboard/ads/[campaignId]/page
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchVendorCampaign } from "@/not-in-useyet-lib/adsApi";
import { VENDOR_ADS_BASE } from "@/not-in-useyet-lib/adsRoutes";

export default function DashboardCampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.campaignId;
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) return;
    (async () => {
      setLoading(true);
      const { res, body } = await fetchVendorCampaign(String(campaignId));
      if (!res.ok) {
        setError(typeof body?.error === "string" ? body.error : "Not found");
        setRow(null);
      } else {
        setRow(body.campaign);
        setError(null);
      }
      setLoading(false);
    })();
  }, [campaignId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading campaign…</p>;
  }
  if (error || !row) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-50">
        {error || "Not found"}
        <div className="mt-3">
          <Link
            href={VENDOR_ADS_BASE}
            className="font-medium text-emerald-700 underline dark:text-emerald-400"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={VENDOR_ADS_BASE}
        className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        ← All campaigns
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold">Campaign {row.id}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-slate-500">Status</dt>
            <dd className="font-medium">{row.status}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Placement</dt>
            <dd className="font-medium">{row.placement}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Target</dt>
            <dd className="font-medium">
              {row.target_type} / {row.target_id}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Budget / Paid</dt>
            <dd className="font-medium">
              {Number(row.budget).toLocaleString()} /{" "}
              {Number(row.amount_paid).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">
              Impressions / Clicks
            </dt>
            <dd className="font-medium">
              {row.impressions_count} / {row.clicks_count} (CTR{" "}
              {row.ctrPercent ?? 0}%)
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-500">Schedule</dt>
            <dd className="font-medium text-xs leading-relaxed">
              {new Date(row.start_at).toLocaleString()} →{" "}
              {new Date(row.end_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
