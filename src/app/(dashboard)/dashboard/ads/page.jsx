"use client";

/**
 * Vendor ads dashboard — lists campaigns and handles Paystack return verification.
 * @module app/(dashboard)/dashboard/ads/page
 */

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CampaignTable } from "@/components/ads/CampaignTable";
import {
  activateCampaign,
  deleteCampaign,
  fetchVendorCampaigns,
  pauseCampaign,
  verifyCampaignPayment,
} from "@/not-in-useyet-lib/adsApi";
import { VENDOR_ADS_BASE } from "@/not-in-useyet-lib/adsRoutes";

function VendorAdsDashboardInner() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [banner, setBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { res, body } = await fetchVendorCampaigns();
    if (!res.ok) {
      setError(
        typeof body?.error === "string"
          ? body.error
          : "Failed to load campaigns",
      );
      setCampaigns([]);
    } else {
      setCampaigns(body.campaigns || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("trxref");
    if (!ref) return;
    (async () => {
      setBanner("Verifying payment…");
      const { res, body } = await verifyCampaignPayment(ref);
      if (!res.ok) {
        setBanner(body?.error || "Payment verification failed");
        return;
      }
      setBanner("Payment confirmed. Your campaign is active when dates allow.");
      await load();
    })();
  }, [searchParams, load]);

  const onPause = async (id) => {
    setBusyId(id);
    const { res } = await pauseCampaign(id);
    setBusyId(null);
    if (res.ok) await load();
  };

  const onActivate = async (id) => {
    setBusyId(id);
    const { res } = await activateCampaign(id);
    setBusyId(null);
    if (res.ok) await load();
  };

  const onDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this campaign? This cannot be undone for eligible statuses.",
      )
    )
      return;
    setBusyId(id);
    const { res } = await deleteCampaign(id);
    setBusyId(null);
    if (res.ok) await load();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Promotions
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Ads & campaigns
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
            Create Paystack-backed placements for products, your vendor profile,
            and trainings. Ownership is verified server-side.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`${VENDOR_ADS_BASE}/create`}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            New campaign
          </Link>
          <Link
            href={`${VENDOR_ADS_BASE}/analytics`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Analytics
          </Link>
        </div>
      </header>

      {banner ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100">
          {banner}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Loading campaigns…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-50">
          {error}
          <p className="mt-2 text-xs text-rose-800/80 dark:text-rose-200/80">
            Sign in as a vendor with a valid session cookie, and ensure
            NEXT_PUBLIC_BACKEND_URL points to your API.
          </p>
        </div>
      ) : (
        <CampaignTable
          campaigns={campaigns}
          busyId={busyId}
          onPause={onPause}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

export default function DashboardAdsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Loading…
        </div>
      }
    >
      <VendorAdsDashboardInner />
    </Suspense>
  );
}
