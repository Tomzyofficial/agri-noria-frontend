"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import useSWR from "swr";
import { ErrorUi } from "@/components/ui/Error";
import { fetcher } from "@/utils/otherUtils";
import { CampaignTable } from "./CampaignTable";

function VendorAdsManagerInner({
   basePath,
   createPath = `${basePath}/create`,
   eyebrow = "Promotions",
   title = "Ads & campaigns",
   description = "Create Paystack-backed placements for your marketplace listings. Ownership is verified server-side.",
   emptyCopy,
}) {
   const searchParams = useSearchParams();
   const [busyId, setBusyId] = useState(null);
   const [banner, setBanner] = useState(null);
   const { error, isLoading, mutate, data } = useSWR("/api/proxy/vendor/ads/campaigns", fetcher);

   useEffect(() => {
      const ref = searchParams.get("reference") || searchParams.get("trxref");
      if (!ref) return;
      (async () => {
         setBanner("Verifying payment...");
         const res = await fetch(`/api/proxy/vendor/ads/verify-payment?reference=${ref}`);
         const data = await res.json().catch(() => null);
         if (!res.ok) {
            setBanner(data?.error || "Payment verification failed");
            return;
         }
         setBanner("Payment confirmed. Your campaign is active when dates allow.");
         await mutate();
      })();
   }, [mutate, searchParams]);

   const onPause = async (id) => {
      if (!confirm("Do you want to pause this campaign?")) return;
      try {
         setBusyId(id);
         const res = await fetch(`/api/proxy/vendor/ads/campaigns/${id}/pause`, { method: "PATCH" });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Failed to pause campaign.");
         await mutate();
      } catch (error) {
         toast.error(error.message);
      } finally {
         setBusyId(null);
      }
   };

   const onActivate = async (id) => {
      if (!confirm("Do you want to activate this campaign?")) return;
      try {
         setBusyId(id);
         const res = await fetch(`/api/proxy/vendor/ads/campaigns/${id}/activate`, { method: "PATCH" });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || "Error occurred while activating");
         await mutate();
      } catch (error) {
         toast.error(error.message);
      } finally {
         setBusyId(null);
      }
   };

   const onDelete = async (id) => {
      if (!confirm("Delete this campaign? This cannot be undone for eligible statuses.")) return;
      try {
         setBusyId(id);
         const res = await fetch(`/api/proxy/vendor/ads/campaigns/${id}`, { method: "DELETE" });
         if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
         }
         toast.success("Campaign deleted successfully.");
         await mutate();
      } catch (error) {
         toast.error(error.message);
      } finally {
         setBusyId(null);
      }
   };

   return (
      <div className="space-y-8">
         <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
               <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">{eyebrow}</p>
               <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
               <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
            <Link href={createPath} className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
               New campaign
            </Link>
         </header>

         {banner ? <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100">{banner}</div> : null}

         {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">Loading campaigns...</div>
         ) : error ? (
            <ErrorUi />
         ) : (
            <CampaignTable campaigns={data?.campaigns} busyId={busyId} onPause={onPause} onActivate={onActivate} onDelete={onDelete} href={basePath} emptyCopy={emptyCopy} />
         )}
      </div>
   );
}

export function VendorAdsManager(props) {
   return (
      <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">Loading...</div>}>
         <VendorAdsManagerInner {...props} />
      </Suspense>
   );
}
