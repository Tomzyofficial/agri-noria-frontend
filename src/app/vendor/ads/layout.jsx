/**
 * Legacy `/vendor/ads` tree — forwards to `(dashboard)/dashboard/ads`.
 * @module app/vendor/ads/layout
 */
export default function LegacyVendorAdsLayout({ children }) {
   return <div className="min-h-[40vh] bg-slate-50 p-6 dark:bg-slate-950">{children}</div>;
}
