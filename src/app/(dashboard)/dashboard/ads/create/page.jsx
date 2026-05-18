"use client";

/**
 * Create ad campaign — collects placement/target/budget and opens Paystack checkout.
 * @module app/(dashboard)/dashboard/ads/create/page
 */

import Link from "next/link";
import { useState } from "react";
import { createCampaign } from "@/lib/adsApi";
import { VENDOR_ADS_BASE } from "@/lib/adsRoutes";

const TARGET_TYPES = ["PRODUCT", "VENDOR", "TRAINING"];
const PLACEMENTS = [
   "SPONSORED_PRODUCT",
   "FEATURED_VENDOR",
   "PROMOTED_TRAINING",
   "SEARCH_BOOST",
   "HOMEPAGE_FEATURED",
];

export default function DashboardAdsCreatePage() {
   const [targetType, setTargetType] = useState("PRODUCT");
   const [targetId, setTargetId] = useState("");
   const [placement, setPlacement] = useState("SPONSORED_PRODUCT");
   const [budget, setBudget] = useState("");
   const [startAt, setStartAt] = useState("");
   const [endAt, setEndAt] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);

   const onSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      const payload = {
         targetType,
         targetId: targetId.trim(),
         placement,
         budget: Number(budget),
         startAt: new Date(startAt).toISOString(),
         endAt: new Date(endAt).toISOString(),
      };
      const { res, body } = await createCampaign(payload);
      setSubmitting(false);
      if (!res.ok) {
         const msg =
            typeof body?.error === "string"
               ? body.error
               : body?.error?.fieldErrors
                 ? JSON.stringify(body.error.fieldErrors)
                 : "Could not create campaign";
         setError(msg);
         return;
      }
      const url = body.checkout?.authorization_url;
      if (url) {
         window.location.href = url;
         return;
      }
      setError("Checkout URL missing from server response.");
   };

   return (
      <div className="mx-auto max-w-xl space-y-8">
         <div>
            <Link
               href={VENDOR_ADS_BASE}
               className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
               ← Back to campaigns
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Create campaign</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
               Budget is charged in full via Paystack. Use the UUID of your listing, training, or your vendor id for
               featured vendor placements.
            </p>
         </div>

         <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
         >
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Placement</label>
               <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
               >
                  {PLACEMENTS.map((p) => (
                     <option key={p} value={p}>
                        {p}
                     </option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Target type</label>
               <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
               >
                  {TARGET_TYPES.map((t) => (
                     <option key={t} value={t}>
                        {t}
                     </option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Target ID (UUID)
               </label>
               <input
                  required
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  placeholder="e.g. listing UUID"
               />
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Budget (NGN)</label>
               <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
               />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Start</label>
                  <input
                     required
                     type="datetime-local"
                     value={startAt}
                     onChange={(e) => setStartAt(e.target.value)}
                     className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">End</label>
                  <input
                     required
                     type="datetime-local"
                     value={endAt}
                     onChange={(e) => setEndAt(e.target.value)}
                     className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
               </div>
            </div>

            {error ? (
               <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">
                  {error}
               </div>
            ) : null}

            <button
               type="submit"
               disabled={submitting}
               className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
               {submitting ? "Creating…" : "Continue to Paystack"}
            </button>
         </form>
      </div>
   );
}
