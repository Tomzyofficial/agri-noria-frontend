"use client";

/**
 * Vendor campaign list table with actions.
 * @module components/ads/CampaignTable
 */

import Link from "next/link";
import { VENDOR_ADS_BASE } from "@/lib/adsRoutes";

function statusPill(status) {
   const map = {
      ACTIVE: "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30 dark:text-emerald-200",
      PAUSED: "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:text-amber-100",
      PENDING_PAYMENT: "bg-sky-500/15 text-sky-900 ring-sky-500/30 dark:text-sky-100",
      DRAFT: "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-200",
      ENDED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      CANCELLED: "bg-rose-500/10 text-rose-800 ring-rose-500/25 dark:text-rose-100",
   };
   const cls = map[status] || map.DRAFT;
   return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>{status}</span>
   );
}

export function CampaignTable({ campaigns, busyId, onPause, onActivate, onDelete }) {
   if (!campaigns?.length) {
      return (
         <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            No campaigns yet. Create one to promote listings, your vendor profile, or trainings.
         </div>
      );
   }

   return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
         <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
               <tr>
                  <th className="px-4 py-3">Placement</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Impr.</th>
                  <th className="px-4 py-3">Clicks</th>
                  <th className="px-4 py-3">CTR</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                     <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.placement}</td>
                     <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {c.target_type} / {c.target_id}
                     </td>
                     <td className="px-4 py-3">{Number(c.budget).toLocaleString()}</td>
                     <td className="px-4 py-3">{Number(c.amount_paid).toLocaleString()}</td>
                     <td className="px-4 py-3">{c.impressions_count}</td>
                     <td className="px-4 py-3">{c.clicks_count}</td>
                     <td className="px-4 py-3">{c.ctrPercent ?? 0}%</td>
                     <td className="px-4 py-3">{statusPill(c.status)}</td>
                     <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                           <Link
                              href={`${VENDOR_ADS_BASE}/${c.id}`}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                           >
                              View
                           </Link>
                           {c.status === "ACTIVE" ? (
                              <button
                                 type="button"
                                 disabled={busyId === c.id}
                                 onClick={() => onPause?.(c.id)}
                                 className="rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                              >
                                 Pause
                              </button>
                           ) : null}
                           {c.status === "PAUSED" ? (
                              <button
                                 type="button"
                                 disabled={busyId === c.id}
                                 onClick={() => onActivate?.(c.id)}
                                 className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                 Activate
                              </button>
                           ) : null}
                           <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() => onDelete?.(c.id)}
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                           >
                              Delete
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
