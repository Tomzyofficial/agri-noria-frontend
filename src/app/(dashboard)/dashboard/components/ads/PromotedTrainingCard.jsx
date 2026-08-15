"use client";

/**
 * Promoted training session card.
 * @module components/ads/PromotedTrainingCard
 */

import { useEffect, useRef } from "react";
import { SponsoredBadge } from "./SponsoredBadge";
import { trackImpression } from "@/not-in-useyet-lib/adsApi";

export function PromotedTrainingCard({
  training,
  campaignId,
  href = "#",
  track = true,
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!track || !campaignId || tracked.current) return;
    tracked.current = true;
    trackImpression(campaignId).catch(() => {});
  }, [track, campaignId]);

  const when = training?.scheduled_at
    ? new Date(training.scheduled_at).toLocaleString()
    : "";

  return (
    <a
      href={href}
      className="flex gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {training?.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={training.thumbnail}
            alt={training.title || "Training"}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <SponsoredBadge />
        </div>
        <p className="line-clamp-2 font-semibold text-slate-900 dark:text-slate-50">
          {training?.title}
        </p>
        {when ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {when}
          </p>
        ) : null}
      </div>
    </a>
  );
}
