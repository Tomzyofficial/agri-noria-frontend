import { formatPrice } from "@/utils/formatPrice";

export function BalanceCard({ label, currency, countryCode, amount, helper, accent, action }) {
   return (
      <div className="card rounded-2xl p-5 flex flex-col justify-between gap-4">
         <div className="perforated pb-3">
            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--ink-muted)" }}>
               {label}
            </p>
         </div>
         <div>
            <p className="font-display text-3xl leading-none" style={{ color: accent || "var(--ink)" }}>
               {formatPrice(amount, countryCode, currency)}
            </p>
            {helper && (
               <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
                  {helper}
               </p>
            )}
         </div>
         {action}
      </div>
   );
}
