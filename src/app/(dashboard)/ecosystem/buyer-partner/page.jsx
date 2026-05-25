"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaShoppingCart, FaTruck, FaBoxOpen, FaHandshake } from "react-icons/fa";
import { useBuyerData } from "./useBuyerData";

export default function BuyerOverview() {
   const { loading, buyerMatches, stats, logistics, confirmedMatches, totalTons } = useBuyerData();

   if (loading) return (
      <div className="flex items-center justify-center py-32">
         <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
   );

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Buyer Dashboard</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage ecosystem orders, track logistics, and coordinate with clusters.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Active Offers" value={buyerMatches.length} icon={<FaShoppingCart size={24} />} color="indigo" />
            <StatCard label="Total Produce" value={`${totalTons.toLocaleString()} Tons`} icon={<FaBoxOpen size={24} />} color="fuchsia" />
            <StatCard label="Shipments" value={logistics.length} icon={<FaTruck size={24} />} color="cyan" />
            <StatCard label="Confirmed" value={confirmedMatches} icon={<FaHandshake size={24} />} color="rose" />
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            <CardHeader className="p-10 pb-4">
               <CardTitle className="text-xl font-black">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
               <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div>
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Settled Sales</p>
                     <p className="text-5xl font-black text-(--foreground) tracking-tighter">
                        ₦{(stats.totalSalesValue || 0).toLocaleString()}
                     </p>
                     <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Across all settled transactions via Paystack escrow</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 px-8 py-4 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                     <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-1">Ecosystem Commission</p>
                     <p className="text-xl font-black">₦{((stats.totalSalesValue || 0) * 0.05).toLocaleString()}</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl">
               <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center">
                  <CardTitle className="text-lg font-black">Recent Matches</CardTitle>
                  <a href="/dashboard/buyer-partner/matching" className="text-xs font-black text-indigo-600 uppercase hover:underline">View All</a>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-4">
                     {buyerMatches.slice(0, 3).map((match, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <div>
                              <p className="font-black text-sm">{match.buyer_name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{match.commodity} • {match.quantity_tons} Tons</p>
                           </div>
                           <span className="text-xs font-black text-indigo-600">₦{parseFloat(match.offer_price || 0).toLocaleString()}</span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl">
               <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center">
                  <CardTitle className="text-lg font-black">Logistics Status</CardTitle>
                  <a href="/dashboard/buyer-partner/logistics" className="text-xs font-black text-indigo-600 uppercase hover:underline">Manage</a>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-4">
                     {logistics.slice(0, 3).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                                 <FaTruck size={14} />
                              </div>
                              <div>
                                 <p className="font-black text-sm truncate max-w-[120px]">{entry.warehouse_name || "Warehouse"}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{entry.status}</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-black uppercase px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full">{entry.weight_tons} T</span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

function StatCard({ label, value, icon, color }) {
   const colors = {
      indigo: "bg-indigo-500 shadow-indigo-500/20",
      fuchsia: "bg-fuchsia-500 shadow-fuchsia-500/20",
      cyan: "bg-cyan-500 shadow-cyan-500/20",
      rose: "bg-rose-500 shadow-rose-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
         <CardContent className="p-6 flex items-center gap-6">
            <div className={`p-4 ${colors[color]} text-white rounded-3xl shadow-lg`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
               <p className="text-2xl font-black text-(--foreground) tracking-tighter">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}
