import { formatLabel } from "@/utils/otherUtils";

export default function DroneListingHeader({ listing }) {
   return (
      <div className="flex flex-col gap-1 border-b border-[#E2E4E3] pb-4">
         <span className="font-mono text-[11px] tracking-[0.12em] text-[#5B6066]">{formatLabel(listing.category)}</span>
         <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#14171A] sm:text-4xl">{formatLabel(listing.listing_name)}</h1>
         <p className="text-sm text-[#5B6066]">
            {formatLabel(listing.manufacturer)} {formatLabel(listing.model)} · {formatLabel(listing.location)}
         </p>
      </div>
   );
}
