"use client";
import { useState, useEffect } from "react";
import {
   Users, Search, ArrowLeft, Building2, Mail, Phone,
   Calendar, ChevronRight, ChevronDown, Trophy, Star,
   User, TrendingUp, X
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { toast } from "react-toastify";

// ─── Buyer Detail Modal ───────────────────────────────────────────────────────
function BuyerModal({ buyer, onClose }) {
   if (!buyer) return null;
   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         onClick={onClose}
      >
         <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
         >
            <button
               onClick={onClose}
               className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
               <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-center gap-4 mb-5">
               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
                  {buyer.buyer_name?.charAt(0) || "U"}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-(--foreground)">{buyer.buyer_name || "Unknown"}</h3>
                  <p className="text-sm text-gray-500">{buyer.buyer_email}</p>
               </div>
            </div>

            <div className="space-y-3 text-sm">
               <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{buyer.buyer_phone || "No phone provided"}</span>
               </div>
               <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                     Registered {new Date(buyer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
               </div>
               {buyer.buyer_type === "aggregator" && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                     <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                     <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Registered by {buyer.aggregator_fname} {buyer.aggregator_lname}
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

   const scoreColor =
      completedSales >= 10
         ? "text-emerald-600 dark:text-emerald-400"
         : completedSales >= 5
         ? "text-amber-600 dark:text-amber-400"
         : "text-gray-500 dark:text-gray-400";

   return (
      <>
         {selectedBuyer && <BuyerModal buyer={selectedBuyer} onClose={() => setSelectedBuyer(null)} />}

         <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Aggregator Header Card */}
            <div
               className="p-5 cursor-pointer group"
               onClick={() => setExpanded((prev) => !prev)}
            >
               <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                     {aggregator.fname?.charAt(0) || "A"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-base text-(--foreground) truncate">
                           {aggregator.fname} {aggregator.lname}
                        </h3>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                           Aggregator
                        </span>
                     </div>

                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                           <Mail className="w-3 h-3" />
                           <span className="truncate max-w-[180px]">{aggregator.email}</span>
                        </div>
                        {aggregator.phone && (
                           <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              {aggregator.phone}
                           </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                           <Calendar className="w-3 h-3" />
                           Joined {new Date(aggregator.joined_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                        </div>
                     </div>
                  </div>

                  {/* Toggle Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors`}>
                     {expanded
                        ? <ChevronDown className="w-4 h-4 text-blue-500" />
                        : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                     }
                  </div>
               </div>

               {/* Stats Row */}
               <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                     <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-gray-500 font-medium">Buyers</span>
                     </div>
                     <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalBuyers}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                     <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-500 font-medium">Sales</span>
                     </div>
                     <p className={`text-xl font-bold ${scoreColor}`}>{completedSales}</p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                     <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs text-gray-500 font-medium">Score</span>
                     </div>
                     <p className={`text-xl font-bold ${scoreColor}`}>
                        {totalBuyers === 0 ? "—" : Math.round((completedSales / totalBuyers) * 10)}
                     </p>
                  </div>
               </div>
            </div>

            {/* Expanded Buyer List */}
            {expanded && (
               <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                  {filteredBuyers.length === 0 ? (
                     <div className="text-center py-8 text-gray-400 text-sm">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No buyers registered yet
                     </div>
                  ) : (
                     <>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                           Registered Buyers ({filteredBuyers.length})
                        </p>
                        {filteredBuyers.map((buyer) => (
                           <div
                              key={buyer.id}
                              onClick={() => setSelectedBuyer(buyer)}
                              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
                           >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                 {buyer.buyer_name?.charAt(0) || "B"}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-medium text-sm text-(--foreground) truncate">
                                    {buyer.buyer_name || "Unknown Buyer"}
                                 </p>
                                 <p className="text-xs text-gray-500 truncate">{buyer.buyer_email}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-xs text-gray-400">
                                    {new Date(buyer.created_at).toLocaleDateString("en-GB", {
                                       day: "numeric", month: "short"
                                    })}
                                 </p>
                                 <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors mt-0.5 ml-auto" />
                              </div>
                           </div>
                        ))}
                     </>
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
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-purple-100 dark:border-purple-900/30 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all group"
         >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-white font-bold shrink-0">
               {buyer.buyer_name?.charAt(0) || buyer.buyer_email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-semibold text-sm text-(--foreground) truncate">
                  {buyer.buyer_name || "Direct User"}
               </p>
               <p className="text-xs text-gray-500 truncate">{buyer.buyer_email}</p>
            </div>
            <div className="text-right shrink-0 space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 block">
                  Direct
               </span>
               <p className="text-xs text-gray-400">
                  {new Date(buyer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
               </p>
            </div>
         </div>
      </>
   );
}

// ─── Agreement Card Component ───────────────────────────────────────────────
function AgreementCard({ ag }) {
   return (
      <Card className={`rounded-2xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden border-l-4 ${ag.is_pre_harvest ? 'border-amber-500' : 'border-green-500'}`}>
         <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">{ag.buyer_name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ag.product_details?.commodity} Procurement</p>
               </div>
               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ag.is_pre_harvest ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {ag.is_pre_harvest ? 'Pre-Harvest' : 'Post-Harvest'}
               </span>
            </div>

            <div className="space-y-2 mb-4 text-xs">
               <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-1">
                  <span className="text-gray-400">Financing</span>
                  <span className="font-black">₦{parseFloat(ag.financing_amount || 0).toLocaleString()}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-1">
                  <span className="text-gray-400">Aggregator</span>
                  <span className="font-bold text-blue-600">{ag.aggregator_name || 'System'}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="font-bold uppercase text-amber-600">{ag.status}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => window.open(ag.agreement_pdf_url)} className="text-[10px] font-bold py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 transition-colors">View PDF</button>
               <button 
                  onClick={() => {
                     navigator.clipboard.writeText(`${window.location.origin}/review-agreement/${ag.secure_token}`);
                     toast.success("Link copied!");
                  }}
                  className="text-[10px] font-bold py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
               >Copy Link</button>
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

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [aggRes, buyerRes, agreementRes] = await Promise.all([
               fetch("/api/proxy/admin/aggregator-stats"),
               fetch("/api/proxy/admin/aggregator-buyers"),
               fetch("/api/proxy/admin/all-agreements") // Assuming this endpoint exists
            ]);

            const aggJson = await aggRes.json();
            const buyerJson = await buyerRes.json();
            const agreementJson = await agreementRes.json();

            if (aggJson.success) setAggregators(aggJson.data || []);
            if (buyerJson.success) setAllBuyers(buyerJson.data || []);
            if (agreementJson.success) setAgreements(agreementJson.data || []);
         } catch (error) {
            console.error("Error fetching ecosystem data:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const filteredAgreements = agreements.filter(ag => 
      ag.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.aggregator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.product_details?.commodity?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div>
               <h1 className="text-3xl font-black tracking-tight">Ecosystem Procurement</h1>
               <p className="text-gray-500 mt-1">Monitor and manage all buyer agreements across the platform.</p>
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <input
                  placeholder="Search buyer or commodity..."
                  className="w-full pl-10 pr-4 py-3 text-sm border-none bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
            {[
               { id: "agreements", label: "Procurement Agreements", icon: <Calendar className="w-4 h-4" /> },
               { id: "aggregators", label: "Aggregator Network", icon: <Building2 className="w-4 h-4" /> },
               { id: "direct", label: "Direct Buyers", icon: <User className="w-4 h-4" /> }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                     activeTab === tab.id ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
               >
                  {tab.icon} {tab.label}
               </button>
            ))}
         </div>

         {/* Content Area */}
         {loading ? (
            <div className="py-20 text-center animate-pulse">Loading ecosystem data...</div>
         ) : activeTab === "agreements" ? (
            <div className="space-y-10">
               {/* Harvest Ready Section */}
               <section>
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-green-600">
                     <span className="h-2 w-8 bg-green-600 rounded-full"></span>
                     Post-Harvest Agreements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredAgreements.filter(a => !a.is_pre_harvest).map(ag => (
                        <AgreementCard key={ag.id} ag={ag} />
                     ))}
                     {filteredAgreements.filter(a => !a.is_pre_harvest).length === 0 && (
                        <p className="text-gray-400 italic text-sm">No post-harvest agreements active.</p>
                     )}
                  </div>
               </section>

               {/* Pre-Harvest Section */}
               <section>
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-amber-600">
                     <span className="h-2 w-8 bg-amber-600 rounded-full"></span>
                     Pre-Harvest (Deferred) Agreements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredAgreements.filter(a => a.is_pre_harvest).map(ag => (
                        <AgreementCard key={ag.id} ag={ag} />
                     ))}
                     {filteredAgreements.filter(a => a.is_pre_harvest).length === 0 && (
                        <p className="text-gray-400 italic text-sm">No pre-harvest agreements active.</p>
                     )}
                  </div>
               </section>
            </div>
         ) : activeTab === "aggregators" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {aggregators.map(agg => (
                  <AggregatorCard key={agg.aggregator_id} aggregator={agg} buyers={allBuyers.filter(b => b.aggregator_id === agg.aggregator_id)} searchTerm={searchTerm} />
               ))}
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {allBuyers.filter(b => b.buyer_type === 'direct').map(buyer => (
                  <DirectBuyerCard key={buyer.id} buyer={buyer} />
               ))}
            </div>
         )}
      </div>
   );
}
