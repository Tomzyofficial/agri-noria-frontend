"use client";
import Link from "next/link";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

const TARGET_TYPES = ["PRODUCT", "VENDOR", "TRAINING"];
const PLACEMENTS = ["SPONSORED_PRODUCT", "FEATURED_VENDOR", "PROMOTED_TRAINING", "SEARCH_BOOST", "HOMEPAGE_FEATURED"];

export default function DashboardAdsCreatePage() {
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);

   const [formData, setFormData] = useState({
      targetType: "PRODUCT",
      targetId: "",
      placement: "SPONSORED_PRODUCT",
      startAt: "",
      endAt: "",
   });

   const PLACEMENT_RATES = {
      SPONSORED_PRODUCT: 500, // NGN per day
      FEATURED_VENDOR: 1500,
      PROMOTED_TRAINING: 800,
      SEARCH_BOOST: 1000,
      HOMEPAGE_FEATURED: 2000,
   };

   function calcDays(startAt, endAt) {
      if (!startAt || !endAt) return 0;
      const ms = new Date(endAt) - new Date(startAt);
      return Math.max(0, Math.ceil(ms / 86400000));
   }

   const days = calcDays(formData.startAt, formData.endAt);
   const estimatedBudget = days * PLACEMENT_RATES[formData.placement];

   const updateField = (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
         const res = await fetch("/api/proxy/vendor/ads/campaigns/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         const data = await res.json();
         if (!res.ok) {
            const msg = typeof data?.error === "string" ? data.error : data?.error ? data.error : "Could not create campaign";
            setError(msg);
            return;
         }

         const url = data.checkout?.authorization_url;
         if (!url) {
            setError("Checkout URL missing from server response.");
            return;
         }
         window.location.href = url;
      } catch (err) {
         setError(err?.message || "Network error while creating campaign");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="mx-auto max-w-xl space-y-8">
         <div>
            <Link href="/marketplace/store/ads" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
               ← Back to campaigns
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Create campaign</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Budget is charged in full via Paystack. Use the UUID of your listing, training, or your vendor id for featured vendor placements.</p>
         </div>

         <form onSubmit={onSubmit} noValidate aria-busy={submitting} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {typeof error === "string" ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">{error}</div> : null}
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Placement</label>
               <select value={formData.placement} onChange={updateField("placement")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950">
                  {PLACEMENTS.map((p) => (
                     <option key={p} value={p}>
                        {p}
                     </option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Target type</label>
               <select value={formData.targetType} onChange={updateField("targetType")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950">
                  {TARGET_TYPES.map((t) => (
                     <option key={t} value={t}>
                        {t}
                     </option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Target ID (UUID)</label>
               <input required value={formData.targetId} onChange={updateField("targetId")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" placeholder="e.g. listing UUID" />
               {error?.targetId && <p className="text-rose-900 dark:text-rose-100">{error.targetId}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Start</label>
                  <input required type="datetime-local" value={formData.startAt} onChange={updateField("startAt")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" />
                  {error?.startAt && <p className="text-rose-900 dark:text-rose-100">{error.startAt}</p>}
               </div>
               <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">End</label>
                  <input required type="datetime-local" value={formData.endAt} onChange={updateField("endAt")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" />
                  {error?.endAt && <p className="text-rose-900 dark:text-rose-100">{error.endAt}</p>}
               </div>
               <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Budget (NGN)</label>
                  <div className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800">{days > 0 ? `₦${estimatedBudget.toLocaleString()}` : "Select start and end dates"}</div>
                  <p className="mt-1 text-xs text-slate-500">
                     {PLACEMENT_RATES[formData.placement]?.toLocaleString()}/day × {days} day{days !== 1 ? "s" : ""}
                  </p>
               </div>
            </div>

            <button type="submit" disabled={submitting} className="text-center cursor-pointer w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
               {submitting ? (
                  <span className="flex justify-center items-center gap-2">
                     <FaSpinner className="animate-spin" />
                     Please wait...
                  </span>
               ) : (
                  "Continue to Paystack"
               )}
            </button>
         </form>
      </div>
   );
}
