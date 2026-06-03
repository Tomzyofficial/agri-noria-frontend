"use client";

/** @module app/vendor/ads/analytics/page */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VENDOR_ADS_BASE } from "@/not-in-useyet-lib/adsRoutes";

export default function LegacyVendorAdsAnalyticsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`${VENDOR_ADS_BASE}/analytics`);
  }, [router]);
  return <p className="p-6 text-center text-sm text-slate-500">Redirecting…</p>;
}
