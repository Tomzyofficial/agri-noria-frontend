const SPEC_ROWS = [
   { key: "manufacturer", label: "Manufacturer" },
   { key: "model", label: "Model" },
   { key: "category", label: "Category" },
   { key: "max_payload", label: "Max payload" },
   { key: "operating_range", label: "Operating range" },
   { key: "camera_type", label: "Camera" },
   { key: "flight_time", label: "Flight time" },
   { key: "location", label: "Location" },
];

/**
 * DroneSpecTable
 *
 * Renders only the spec rows that have a value, so sale-only or
 * rent-only listings never show blank rows.
 */
export default function DroneSpecTable({ listing }) {
   const rows = SPEC_ROWS.filter((row) => listing[row.key]);

   if (rows.length === 0) return null;

   return (
      <div className="border border-[#E2E4E3] bg-white rounded-md">
         <h2 className="border-b border-[#E2E4E3] px-4 py-3 font-mono text-[11px] font-semibold tracking-[0.12em] text-[#14171A]">DATA PLATE</h2>
         <dl>
            {rows.map((row, index) => (
               <div key={row.key} className={`flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm ${index % 2 === 1 ? "bg-[#F7F7F5]" : ""}`}>
                  <dt className="text-[#5B6066]">{row.label}</dt>
                  <dd className="font-mono text-[13px] text-[#14171A]">{listing[row.key]}</dd>
               </div>
            ))}
         </dl>
      </div>
   );
}
