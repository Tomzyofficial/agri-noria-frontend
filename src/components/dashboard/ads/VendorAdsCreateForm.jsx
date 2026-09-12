"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { formatLabel } from "@/utils/otherUtils";
import { FaLongArrowAltLeft } from "react-icons/fa";

const DEFAULT_TARGET_TYPES = ["Product", "Storage_listing", "Logistics_service", "Farm_service", "Agricultural_training", "Agricultural_employment"];
const DEFAULT_PLACEMENTS = ["Sponsored_product", "Banner"];
const DEFAULT_SURFACES = ["Home", "Drone_marketplace", "Storage_marketplace", "Logistics_marketplace", "Farm_services", "Training", "Jobs"];

const PLACEMENT_RATES = {
   Sponsored_product: 500,
   Banner: 1500,
};

function calcDays(startAt, endAt) {
   if (!startAt || !endAt) return 0;
   const ms = new Date(endAt) - new Date(startAt);
   return Math.max(0, Math.ceil(ms / 86400000));
}

export function VendorAdsCreateForm({
   backHref,
   // defaultSurface = "Home",
   // defaultTargetType = "Product",
   // allowedSurfaces = DEFAULT_SURFACES,
   allowedSurface,
   // allowedTargetTypes = DEFAULT_TARGET_TYPES,
   allowedTargetType,
   lockedSurface = false,
   lockedTargetType = false,
   // targetOptions = [],
   // targetPlaceholder = "e.g. listing UUID",
}) {
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState(null);
   const [formData, setFormData] = useState({
      targetType: allowedTargetType,
      surfaces: allowedSurface,
      targetId: "",
      placement: "Sponsored_product",
      startAt: "",
      endAt: "",
   });

   const days = calcDays(formData.startAt, formData.endAt);
   const estimatedBudget = days * PLACEMENT_RATES[formData.placement];
   // const selectedTarget = useMemo(() => targetOptions.find((item) => item.id === formData.targetId), [formData.targetId, targetOptions]);

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
      <div className="mx-auto max-w-4xl space-y-8">
         <div>
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
               <span>
                  <FaLongArrowAltLeft />
               </span>
               Back to campaigns
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Create campaign</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Budget is charged in full via Paystack. Use the UUID of your listing for ad placements.</p>
         </div>

         <form onSubmit={onSubmit} noValidate aria-busy={submitting} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {typeof error === "string" ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">{error}</div> : null}
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Surface</label>
               {/* <select disabled={lockedSurface} value={formData.surfaces} onChange={updateField("surfaces")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-950 dark:disabled:bg-slate-800">
                  {allowedSurface.map((surface) => (
                     <option key={surface} value={surface}>
                        {formatLabel(surface)}
                     </option>
                  ))}
               </select> */}
               <input required disabled={true} readOnly value={formData.surfaces} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" />
               {error?.surfaces && <p className="text-rose-900 dark:text-rose-100">{error.surfaces}</p>}
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Placement</label>
               <select value={formData.placement} onChange={updateField("placement")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950">
                  {DEFAULT_PLACEMENTS.map((placement) => (
                     <option key={placement} value={placement}>
                        {formatLabel(placement)}
                     </option>
                  ))}
               </select>
               {error?.placement && <p className="text-rose-900 dark:text-rose-100">{error.placement}</p>}
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Target type</label>
               {/* <select disabled={lockedTargetType} value={formData.targetType} onChange={updateField("targetType")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-950 dark:disabled:bg-slate-800">
                  {allowedTargetType.map((targetType) => (
                     <option key={targetType} value={targetType}>
                        {formatLabel(targetType)}
                     </option>
                  ))}
               </select> */}
               <input required disabled={true} readOnly value={formData.targetType} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" />
               {error?.targetType && <p className="text-rose-900 dark:text-rose-100">{error.targetType}</p>}
            </div>
            <div>
               <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Target listing</label>
               <input required value={formData.targetId} onChange={updateField("targetId")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950" placeholder="Paste an active listing UUID" />
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
               <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Budget (NGN)</label>
                  <div className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800">{days > 0 ? `NGN ${estimatedBudget.toLocaleString()}` : "Select start and end dates"}</div>
                  <p className="mt-1 text-xs text-slate-500">
                     NGN {PLACEMENT_RATES[formData.placement]?.toLocaleString()}/day x {days} day{days !== 1 ? "s" : ""}
                  </p>
               </div>
            </div>

            <button type="submit" disabled={submitting || !formData.targetId} className="text-center cursor-pointer w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
               {submitting ? (
                  <span className="flex items-center justify-center gap-2">
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
