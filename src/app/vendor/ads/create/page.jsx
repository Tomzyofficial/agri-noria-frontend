"use client";

/** @module app/vendor/ads/create/page */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VENDOR_ADS_BASE } from "@/lib/adsRoutes";

export default function LegacyVendorAdsCreateRedirect() {
   const router = useRouter();
   useEffect(() => {
      router.replace(`${VENDOR_ADS_BASE}/create`);
   }, [router]);
   return <p className="p-6 text-center text-sm text-slate-500">Redirecting…</p>;
}
