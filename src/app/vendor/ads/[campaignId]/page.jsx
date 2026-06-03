"use client";

/** @module app/vendor/ads/[campaignId]/page */
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VENDOR_ADS_BASE } from "@/not-in-useyet-lib/adsRoutes";

export default function LegacyVendorAdsCampaignRedirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.campaignId;
  useEffect(() => {
    if (id) router.replace(`${VENDOR_ADS_BASE}/${id}`);
  }, [id, router]);
  return <p className="p-6 text-center text-sm text-slate-500">Redirecting…</p>;
}
