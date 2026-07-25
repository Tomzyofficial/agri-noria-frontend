export default function DroneListingDescription({ listing }) {
   return (
      <div className="flex flex-col gap-2 bg-white p-2 rounded-md">
         <h2 className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#14171A]">DESCRIPTION</h2>
         <p className="whitespace-pre-line text-sm leading-relaxed text-[#3A3F44]">{listing.description}</p>
         {listing.provide_service && listing.service_type && (
            <p className="mt-2 text-sm text-[#5B6066]">
               Operator services available: <span className="text-[#14171A]">{listing.service_type}</span>
            </p>
         )}
      </div>
   );
}
