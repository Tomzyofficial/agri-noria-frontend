export default function DroneStatusPlate({ listingType, quantity }) {
   const isAvailable = Number(quantity) > 0;

   const typeLabel =
      {
         sale: "FOR SALE",
         rent: "FOR RENT",
         both: "SALE / RENT",
      }[listingType] ?? "LISTING";

   const accentClass =
      {
         sale: "border-l-[#E8A33D] text-[#E8A33D]",
         rent: "border-l-[#2F5D8A] text-[#2F5D8A]",
         both: "border-l-[#8A5FE8] text-[#8A5FE8]",
      }[listingType] ?? "border-l-[#14171A] text-[#14171A]";

   return (
      <div className={`absolute left-3 top-3 z-1 flex flex-col gap-0.5 border-l-4 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm ${accentClass}`} role="status">
         <span className="font-mono text-[11px] font-semibold tracking-[0.12em]">{typeLabel}</span>
         <span className={`font-mono text-[10px] tracking-[0.08em] ${isAvailable ? "text-[#3B7D6B]" : "text-[#B3432B]"}`}>{isAvailable ? `${quantity} IN STOCK` : "OUT OF STOCK"}</span>
      </div>
   );
}
