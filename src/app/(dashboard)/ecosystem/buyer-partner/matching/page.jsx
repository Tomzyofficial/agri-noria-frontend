"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaHandshake, FaCheckCircle, FaSearch, FaFilter } from "react-icons/fa";
import { useBuyerData } from "../useBuyerData";

export default function MarketMatchingPage() {
   const { loading, buyerMatches } = useBuyerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Matches...</div>;

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Market Matching</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Connect buyer demand with cluster production</p>
            </div>
         </div>

         <div className="flex gap-4 p-6 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
            <div className="flex-grow relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
               <input type="text" placeholder="Search buyers, commodities, regions..." className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors">
               <FaFilter /> Filters
            </button>
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-2xl font-black flex items-center gap-4">
                  <FaHandshake className="text-indigo-600" /> Active Matches
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {buyerMatches.length > 0 ? (
                  <div className="space-y-6">
                     {buyerMatches.map((match, i) => (
                        <MatchRow key={i} match={match} />
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                     <FaHandshake className="text-5xl text-gray-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No active buyer matches found</p>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function MatchRow({ match }) {
   const statusColors = {
      confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
      completed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
   };

   return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 hover:shadow-xl transition-all group">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
               <FaHandshake size={28} />
            </div>
            <div>
               <h3 className="text-xl font-black">{match.buyer_name}</h3>
               <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">{match.buyer_type}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.commodity} • {match.quantity_tons} Tons</p>
               </div>
            </div>
         </div>

         <div className="flex flex-wrap lg:flex-nowrap items-center gap-8 w-full lg:w-auto">
            <div className="text-right">
               <p className="text-2xl font-black tracking-tighter">₦{parseFloat(match.offer_price || 0).toLocaleString()}/Ton</p>
               <div className="flex items-center justify-end gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${match.traceability_verified ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <p className="text-[9px] font-black uppercase text-gray-400">Traceability {match.traceability_verified ? "Verified" : "Pending"}</p>
               </div>
            </div>
            <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shrink-0 ${statusColors[match.contract_status] || 'bg-gray-100 text-gray-500'}`}>
               {match.contract_status}
            </span>
         </div>
      </div>
   );
}
