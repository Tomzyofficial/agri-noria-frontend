"use client";
import { useState, useEffect } from "react";
import {
   Search, Building2, Phone, Calendar, Trophy,
   User, X, FileText, ShoppingBag, ShieldCheck, RefreshCw, Loader2
} from "lucide-react";
import { FaSeedling } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "react-toastify";

// ─── Empty State Component ────────────────────────────────────────────────────
function TabEmptyState({ icon: Icon, title, description, badgeText, onResetSearch, isSearching }) {
   return (
      <div className="bg-white dark:bg-gray-950 rounded-3xl border border-slate-200/80 dark:border-gray-800 p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs space-y-4">
         <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center mx-auto shadow-sm">
            <Icon className="w-8 h-8" />
         </div>
         <div className="space-y-1.5">
            {badgeText && (
               <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 mb-1">
                  {badgeText}
               </span>
            )}
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto font-medium">
               {description}
            </p>
         </div>
         {isSearching && onResetSearch && (
            <button
               onClick={onResetSearch}
               className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors cursor-pointer"
            >
               Clear Search Query
            </button>
         )}
      </div>
   );
}

// ─── Buyer Detail Modal ───────────────────────────────────────────────────────
function BuyerModal({ buyer, onClose }) {
   if (!buyer) return null;
   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
         onClick={onClose}
      >
         <div
            className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
         >
            <button
               onClick={onClose}
               className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
               <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex items-center gap-4 mb-5">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-black">
                  {buyer.buyer_name?.charAt(0) || buyer.buyer_email?.charAt(0) || "B"}
               </div>
               <div>
                  <h3 className="font-black text-base text-gray-900 dark:text-white">{buyer.buyer_name || "Procurement Buyer"}</h3>
                  <p className="text-xs text-slate-500 font-medium">{buyer.buyer_email}</p>
               </div>
            </div>

            <div className="space-y-2.5 text-xs">
               <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 dark:text-gray-300 font-semibold">{buyer.buyer_phone || "No phone provided"}</span>
               </div>
               <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-700 dark:text-gray-300 font-medium">
                     Registered {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </span>
               </div>
               {buyer.buyer_type === "aggregator" && (
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                     <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                     <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                        Linked via Aggregator {buyer.aggregator_fname} {buyer.aggregator_lname}
                     </span>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

// ─── Aggregator Card (expandable) ─────────────────────────────────────────────
function AggregatorCard({ aggregator, buyers, searchTerm }) {
   const [expanded, setExpanded] = useState(false);
   const [selectedBuyer, setSelectedBuyer] = useState(null);

   const filteredBuyers = buyers.filter(
      (b) =>
         b.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const hasMatch = filteredBuyers.length > 0;
   if (searchTerm && !hasMatch) return null;

   const totalBuyers = parseInt(aggregator.total_buyers) || 0;
   const completedSales = parseInt(aggregator.completed_sales) || 0;

   return (
      <>
         {selectedBuyer && <BuyerModal buyer={selectedBuyer} onClose={() => setSelectedBuyer(null)} />}

         <div className="rounded-3xl border border-slate-200/80 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-300">
            {/* Aggregator Header Card */}
            <div
               className="p-5 cursor-pointer group"
               onClick={() => setExpanded((prev) => !prev)}
            >
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-lg shrink-0">
                     {aggregator.fname?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-gray-900 dark:text-white truncate">
                           {aggregator.fname} {aggregator.lname}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                           Aggregator
                        </span>
                     </div>
                     <p className="text-xs text-slate-500 font-medium truncate">{aggregator.email}</p>
                     <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-semibold">
                        <span>{totalBuyers} Buyers Onboarded</span>
                        <span>•</span>
                        <span>{completedSales} Completed Contracts</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Expandable Buyers List */}
            {expanded && (
               <div className="p-4 bg-slate-50/60 dark:bg-gray-900/40 border-t border-slate-100 dark:border-gray-900 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Onboarded Off-Takers</p>
                  {filteredBuyers.length === 0 ? (
                     <p className="text-xs text-slate-400 italic px-2">No individual buyers linked yet.</p>
                  ) : (
                     filteredBuyers.map((b) => (
                        <div
                           key={b.id}
                           onClick={() => setSelectedBuyer(b)}
                           className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-slate-100 dark:border-gray-800 hover:border-emerald-300 cursor-pointer transition-colors text-xs"
                        >
                           <span className="font-bold text-gray-900 dark:text-white">{b.buyer_name || b.buyer_email}</span>
                           <span className="text-slate-400 text-[11px]">View Profile →</span>
                        </div>
                     ))
                  )}
               </div>
            )}
         </div>
      </>
   );
}

// ─── Direct Buyer Card ────────────────────────────────────────────────────────
function DirectBuyerCard({ buyer }) {
   const [selected, setSelected] = useState(false);

   return (
      <>
         {selected && <BuyerModal buyer={buyer} onClose={() => setSelected(false)} />}
         <div
            onClick={() => setSelected(true)}
            className="flex items-center gap-3.5 p-5 bg-white dark:bg-gray-950 rounded-3xl border border-slate-200/80 dark:border-gray-800 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
         >
            <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
               {buyer.buyer_name?.charAt(0) || buyer.buyer_email?.charAt(0) || "D"}
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {buyer.buyer_name || "Direct Procurement Buyer"}
               </p>
               <p className="text-[11px] text-slate-500 font-medium truncate">{buyer.buyer_email}</p>
               {buyer.buyer_phone && <p className="text-[10px] text-slate-400">{buyer.buyer_phone}</p>}
            </div>
            <div className="text-right shrink-0 space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 block">
                  Direct Buyer
               </span>
               <p className="text-[10px] text-slate-400 font-medium">
                  {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
               </p>
            </div>
         </div>
      </>
   );
}

// ─── Agreement Card Component ───────────────────────────────────────────────
function AgreementCard({ ag }) {
   return (
      <Card className={`rounded-3xl border shadow-xs bg-white dark:bg-gray-950 overflow-hidden text-left border-l-4 ${ag.is_pre_harvest ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
         <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start gap-2">
               <div>
                  <h3 className="font-black text-sm text-gray-900 dark:text-white">{ag.buyer_name || "Procurement Buyer"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                     {ag.product_details?.commodity || "Agricultural Produce"} Contract
                  </p>
               </div>
               <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  ag.is_pre_harvest 
                     ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                     : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
               }`}>
                  {ag.is_pre_harvest ? 'Pre-Harvest' : 'Post-Harvest'}
               </span>
            </div>

            <div className="space-y-2 text-xs">
               <div className="flex justify-between border-b border-slate-100 dark:border-gray-900 pb-1.5">
                  <span className="text-slate-400">Financing Volume</span>
                  <span className="font-black text-gray-900 dark:text-white">₦{parseFloat(ag.financing_amount || 0).toLocaleString()}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 dark:border-gray-900 pb-1.5">
                  <span className="text-slate-400">Brokering Aggregator</span>
                  <span className="font-bold text-emerald-600">{ag.aggregator_name || 'Agri-Noria Core'}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-slate-400">Execution Status</span>
                  <span className="font-bold uppercase text-amber-600">{ag.status || "Pending"}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
               {ag.agreement_pdf_url ? (
                  <button onClick={() => window.open(ag.agreement_pdf_url)} className="text-[11px] font-bold py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer">
                     View PDF
                  </button>
               ) : (
                  <button disabled className="text-[11px] font-medium py-2 bg-slate-50 text-slate-400 rounded-xl cursor-not-allowed">
                     Draft PDF
                  </button>
               )}
               <button 
                  onClick={() => {
                     if (ag.secure_token) {
                        navigator.clipboard.writeText(`${window.location.origin}/review-agreement/${ag.secure_token}`);
                        toast.success("Procurement agreement review link copied!");
                     } else {
                        toast.info("No public review token attached to this agreement.");
                     }
                  }}
                  className="text-[11px] font-bold py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl transition-colors cursor-pointer"
               >
                  Copy Review Link
               </button>
            </div>
         </CardContent>
      </Card>
   );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EcosystemBuyersPage() {
   const [aggregators, setAggregators] = useState([]);
   const [allBuyers, setAllBuyers] = useState([]);
   const [agreements, setAgreements] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [activeTab, setActiveTab] = useState("agreements");

   const fetchData = async () => {
      try {
         setLoading(true);
         const [aggRes, buyerRes, agreementRes] = await Promise.all([
            fetch("/api/proxy/admin/aggregator-stats"),
            fetch("/api/proxy/admin/aggregator-buyers"),
            fetch("/api/proxy/admin/all-agreements")
         ]);

         if (aggRes.ok) {
            const aggJson = await aggRes.json();
            if (aggJson.success) setAggregators(aggJson.data || []);
         }
         if (buyerRes.ok) {
            const buyerJson = await buyerRes.json();
            if (buyerJson.success) setAllBuyers(buyerJson.data || []);
         }
         if (agreementRes.ok) {
            const agreementJson = await agreementRes.json();
            if (agreementJson.success) setAgreements(agreementJson.data || []);
         }
      } catch (error) {
         console.error("Error fetching ecosystem data:", error);
         toast.error("Failed to refresh ecosystem procurement data");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const filteredAgreements = agreements.filter(ag => 
      ag.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.aggregator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.product_details?.commodity?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const directBuyers = allBuyers.filter(b => b.buyer_type === 'direct');
   const filteredDirectBuyers = directBuyers.filter(b =>
      b.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const postHarvestCount = agreements.filter(a => !a.is_pre_harvest).length;
   const preHarvestCount = agreements.filter(a => a.is_pre_harvest).length;

   return (
      <div className="max-w-7xl mx-auto space-y-7 text-left pb-12">
         {/* Top Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm">
            <div className="space-y-1">
               <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                     <ShoppingBag className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                     Ecosystem Procurement & Off-Takers
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Trade Desk
                  </span>
               </div>
               <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  Monitor buyer agreements, aggregator networks, off-taker agreements, and direct marketplace procurement.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                     placeholder="Search buyer, aggregator or commodity..."
                     className="w-full h-11 pl-10 pr-4 text-xs border border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 hover:bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-300 transition cursor-pointer disabled:opacity-50 shrink-0"
                  title="Refresh Procurement Data"
               >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
               </button>
            </div>
         </div>

         {/* Prominent Live Loading Banner */}
         {loading && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs animate-pulse">
               <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
               <span>Fetching live procurement agreements, aggregator networks & off-taker records...</span>
            </div>
         )}

         {/* Segmented Navigation Tabs with Counts */}
         <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 dark:bg-gray-900 rounded-2xl w-fit">
            {[
               { id: "agreements", label: "Procurement Agreements", count: agreements.length, icon: <Calendar className="w-3.5 h-3.5" /> },
               { id: "aggregators", label: "Aggregator Network", count: aggregators.length, icon: <Building2 className="w-3.5 h-3.5" /> },
               { id: "direct", label: "Direct Buyers", count: directBuyers.length, icon: <User className="w-3.5 h-3.5" /> }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                     activeTab === tab.id 
                        ? "bg-white dark:bg-gray-800 shadow-sm text-emerald-700 dark:text-emerald-300" 
                        : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
               >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                     activeTab === tab.id ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200/70 dark:bg-gray-800 text-slate-500"
                  }`}>
                     {tab.count}
                  </span>
               </button>
            ))}
         </div>

         {/* Tab Content Area */}
         {loading ? (
            <div className="py-24 text-center space-y-3">
               <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
               <p className="text-xs text-slate-500 font-medium">Loading ecosystem procurement telemetry...</p>
            </div>
         ) : activeTab === "agreements" ? (
            <div className="space-y-8">
               {agreements.length === 0 ? (
                  <TabEmptyState
                     icon={FileText}
                     title="No Procurement Agreements Created Yet"
                     description="Procurement agreements represent formal contracts between aggregators and commercial buyers (off-takers) for agricultural produce like maize, soya, or cassava. When agreements are issued and signed, they will appear here with financing and escrow details."
                     badgeText="Contracts Empty State"
                  />
               ) : (
                  <>
                     {/* Harvest Ready Section */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
                           <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                              Post-Harvest Agreements ({postHarvestCount})
                           </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                           {filteredAgreements.filter(a => !a.is_pre_harvest).map(ag => (
                              <AgreementCard key={ag.id} ag={ag} />
                           ))}
                        </div>
                        {filteredAgreements.filter(a => !a.is_pre_harvest).length === 0 && (
                           <p className="text-xs text-slate-400 italic bg-white dark:bg-gray-950 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
                              No active post-harvest fulfillment agreements currently registered.
                           </p>
                        )}
                     </section>

                     {/* Pre-Harvest Section */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="h-2.5 w-2.5 bg-amber-500 rounded-full"></span>
                           <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                              Pre-Harvest (Forward Contracts) ({preHarvestCount})
                           </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                           {filteredAgreements.filter(a => a.is_pre_harvest).map(ag => (
                              <AgreementCard key={ag.id} ag={ag} />
                           ))}
                        </div>
                        {filteredAgreements.filter(a => a.is_pre_harvest).length === 0 && (
                           <p className="text-xs text-slate-400 italic bg-white dark:bg-gray-950 p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
                              No active forward/pre-harvest financing agreements currently registered.
                           </p>
                        )}
                     </section>
                  </>
               )}
            </div>
         ) : activeTab === "aggregators" ? (
            <div>
               {aggregators.length === 0 ? (
                  <TabEmptyState
                     icon={Building2}
                     title="No Aggregator Networks Active"
                     description="Aggregators organize and coordinate local smallholder farmer clusters, bridging primary harvest output with bulk industrial off-takers. Once aggregators register and link regional buyers, their network performance, completed agreements, and volume will be tracked here."
                     badgeText="Network Empty State"
                  />
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {aggregators.map(agg => (
                        <AggregatorCard key={agg.aggregator_id} aggregator={agg} buyers={allBuyers.filter(b => b.aggregator_id === agg.aggregator_id)} searchTerm={searchTerm} />
                     ))}
                  </div>
               )}
            </div>
         ) : (
            <div>
               {directBuyers.length === 0 ? (
                  <TabEmptyState
                     icon={User}
                     title="No Direct Marketplace Buyers Registered"
                     description="Direct buyers procure agricultural produce directly through open marketplace channels without an intermediary aggregator. When direct procurement accounts are created, their procurement histories and contact profiles will be listed here."
                     badgeText="Direct Buyers Empty State"
                  />
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredDirectBuyers.map(buyer => (
                        <DirectBuyerCard key={buyer.id} buyer={buyer} />
                     ))}
                     {filteredDirectBuyers.length === 0 && (
                        <div className="col-span-full">
                           <TabEmptyState
                              icon={Search}
                              title="No Direct Buyers Matching Search"
                              description={`No direct buyers matched your query "${searchTerm}".`}
                              onResetSearch={() => setSearchTerm("")}
                              isSearching={true}
                           />
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
