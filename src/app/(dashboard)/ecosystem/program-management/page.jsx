"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaSeedling, FaTasks, FaWallet, FaMapMarkedAlt } from "react-icons/fa";
import { useProgramData } from "./useProgramData";

export default function ProgramManagementOverview() {
   const { loading, clusters, stats, clusterWallet, pendingInputs } = useProgramData();

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Dashboard...</div>;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Overview</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time status of your agricultural ecosystem</p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
               label="Active Clusters"
               value={stats.activeClusters || clusters.length}
               icon={<FaMapMarkedAlt />}
               bg="from-orange-50 to-orange-100 dark:from-orange-900/40"
               color="bg-orange-500"
            />
            <StatCard
               label="Total Farmers"
               value={stats.activeFarmers || 0}
               icon={<FaSeedling />}
               bg="from-green-50 to-green-100 dark:from-green-900/40"
               color="bg-green-500"
            />
            <StatCard
               label="Pending Inputs"
               value={stats.pendingInputRequests || pendingInputs.length}
               icon={<FaTasks />}
               bg="from-blue-50 to-blue-100 dark:from-blue-900/40"
               color="bg-blue-500"
            />
            <StatCard
               label="Wallet Balance"
               value={`₦${clusterWallet ? parseFloat(clusterWallet.balance).toLocaleString() : "0"}`}
               icon={<FaWallet />}
               bg="from-indigo-50 to-indigo-100 dark:from-indigo-900/40"
               color="bg-indigo-500"
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
               <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle>Recent Activity</CardTitle>
               </CardHeader>
               <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FaTasks className="text-gray-200 text-3xl" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Activity tracking coming soon</p>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
               <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle>Distribution Status</CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-6">
                     <ProgressItem label="Seed Disbursement" value={65} color="bg-orange-500" />
                     <ProgressItem label="Fertilizer Allocation" value={42} color="bg-green-500" />
                     <ProgressItem label="Loan Repayments" value={12} color="bg-blue-500" />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

function StatCard({ label, value, icon, bg, color }) {
   return (
      <Card className={`bg-gradient-to-br ${bg} border-none shadow-sm overflow-hidden group`}>
         <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-4 ${color} text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg`}>
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

function ProgressItem({ label, value, color }) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-gray-500">{label}</span>
            <span className="text-amber-600">{value}%</span>
         </div>
         <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
         </div>
      </div>
   );
}
