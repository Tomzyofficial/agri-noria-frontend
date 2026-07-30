"use client";

import { useState } from "react";
import { ProductCartActions } from "./ProductCartActions";
import RequestQuoteForm from "./RequestQuoteForm";

export default function PurchaseModeTabs({ listing }) {
   const [mode, setMode] = useState("buy");

   return (
      <div className="flex flex-col gap-3">
         <div className="flex border border-[#E2E4E3]" role="tablist" aria-label="Purchase or rental options">
            <TabButton active={mode === "buy"} onClick={() => setMode("buy")}>
               Buy
            </TabButton>
            <TabButton active={mode === "rent"} onClick={() => setMode("rent")}>
               Rent
            </TabButton>
         </div>

         {mode === "buy" ? <ProductCartActions listing={listing} /> : <RequestQuoteForm listing={listing} />}
      </div>
   );
}

function TabButton({ active, onClick, children }) {
   return (
      <button
         type="button"
         role="tab"
         aria-selected={active}
         onClick={onClick}
         className={`flex-1 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A] ${active ? "bg-[#14171A] text-white" : "bg-white text-[#5B6066] hover:bg-[#F7F7F5]"}`}
      >
         {children}
      </button>
   );
}
