import { formatLabel } from "@/utils/otherUtils";

export default function DroneListingHeader({ listing }) {
   return (
      <div className="flex flex-col gap-1 pb-4">
         <span className="font-mono text-[12px] tracking-[0.12em] text-[#5B6066] dark:text-foreground">{formatLabel(listing.category)}</span>
         <h1 className="text-3xl font-semibold tracking-tight text-[#14171A] dark:text-foreground sm:text-4xl">{formatLabel(listing.listing_name)}</h1>
         <p className="text-sm text-[#5B6066] dark:text-foreground">
            {formatLabel(listing.manufacturer)} {formatLabel(listing.model)} · {formatLabel(listing.location)}
         </p>
      </div>
   );
}
