"use client";

/**
 * Legacy URL: forwards Paystack return query string to the dashboard ads route.
 * @module app/vendor/ads/page
 */

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VENDOR_ADS_BASE } from "@/lib/adsRoutes";

function RedirectInner() {
   const router = useRouter();
   const sp = useSearchParams();
   useEffect(() => {
      const q = sp.toString();
      router.replace(`${VENDOR_ADS_BASE}${q ? `?${q}` : ""}`);
   }, [router, sp]);
   return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
         Redirecting to ads dashboard…
      </p>
   );
}

export default function LegacyVendorAdsIndexRedirect() {
   return (
      <Suspense fallback={<p className="p-6 text-center text-sm text-slate-500">Redirecting…</p>}>
         <RedirectInner />
      </Suspense>
   );
}
