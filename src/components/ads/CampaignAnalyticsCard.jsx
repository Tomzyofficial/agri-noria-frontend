"use client";

/**
 * Summary metrics for vendor ads dashboard.
 * @module components/ads/CampaignAnalyticsCard
 */

export function CampaignAnalyticsCard({ title, value, hint }) {
   return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
         <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
         <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
         {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      </div>
   );
}
