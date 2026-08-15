/**
 * Small “Sponsored” label for promoted marketplace tiles.
 * @module components/ads/SponsoredBadge
 */
export function SponsoredBadge({ className = "" }) {
   return (
      <span
         className={`inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200 ${className}`}
      >
         Sponsored
      </span>
   );
}
