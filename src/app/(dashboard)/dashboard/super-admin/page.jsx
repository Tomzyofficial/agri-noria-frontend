"use client";
import { 
  FaUsersCog, FaServer, FaShieldAlt, FaChartPie, FaTractor, 
  FaWallet, FaHandshake, FaClock
} from "react-icons/fa";
import { FaSeedling } from "react-icons/fa6";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, RefreshCw, ChevronRight, TrendingUp } from "lucide-react";

export default function SuperAdminOverviewPage() {
   const [stats, setStats] = useState({
      totalVendors: 0,
      totalBuyers: 0,
      totalPendingCount: 0,
      roleCounts: [],
      financeWalletBalance: 0,
      escrowHeld: 0,
      totalAgreements: 0,
   });
   const [loading, setLoading] = useState(true);

   const fetchStats = useCallback(async () => {
      try {
         setLoading(true);
         const [usersRes, statsRes] = await Promise.all([
            fetch("/api/proxy/admin/users?limit=1"),
            fetch("/api/proxy/admin/dashboard/stats"),
         ]);

         let vendorCount = 0;
         let buyerCount = 0;
         let pendingCount = 0;
         let roleData = [];

         if (usersRes.ok) {
            const usersJson = await usersRes.json();
            if (usersJson.success && usersJson.data) {
               vendorCount = usersJson.data.totalVendors || 0;
               buyerCount = usersJson.data.totalBuyers || 0;
               pendingCount = usersJson.data.totalPendingCount || 0;
               roleData = usersJson.data.roleCounts || [];
            }
         }

         let walletBalance = 0;
         let escrow = 0;
         let agreements = 0;

         if (statsRes.ok) {
            const statsJson = await statsRes.json();
            if (statsJson.success && statsJson.data) {
               walletBalance = statsJson.data.finance_wallet_balance || statsJson.data.total_balance || 0;
               escrow = statsJson.data.escrow_held || 0;
               agreements = statsJson.data.total_agreements || 0;
            }
         }

         setStats({
            totalVendors: vendorCount,
            totalBuyers: buyerCount,
            totalPendingCount: pendingCount,
            roleCounts: roleData,
            financeWalletBalance: walletBalance,
            escrowHeld: escrow,
            totalAgreements: agreements,
         });
      } catch (err) {
         console.error("Failed to fetch live stats:", err);
         toast.error("Failed to load live platform stats");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchStats();
   }, [fetchStats]);

   const totalUsers = stats.totalVendors + stats.totalBuyers;

   const formatNaira = (amount) => {
      return new Intl.NumberFormat("en-NG", {
         style: "currency",
         currency: "NGN",
         minimumFractionDigits: 2,
      }).format(amount || 0);
   };

   return (
      <div className="max-w-7xl mx-auto space-y-7 text-left pb-12">
         {/* Top Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm">
            <div className="space-y-1">
               <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                     <FaSeedling className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                     Platform Administration Overview
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Live Stats
                  </span>
               </div>
               <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  Real-time telemetry, participant distribution, liquidity overview, and ecosystem health.
               </p>
            </div>

            <button
               onClick={() => fetchStats()}
               disabled={loading}
               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 hover:bg-slate-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-60"
               title="Refresh live stats"
            >
               <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
               <span>{loading ? "Fetching..." : "Refresh Live Stats"}</span>
            </button>
         </div>

         {/* Prominent Live Loading Banner */}
         {loading && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs animate-pulse">
               <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
               <span>Fetching live ecosystem statistics, wallet balances & participant metrics from database...</span>
            </div>
         )}

         {/* Primary Live KPI Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Vendors */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:border-emerald-300">
               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Total Vendors</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalVendors}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Producers & Partners</p>
               </div>
               <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shadow-xs">
                  <FaUsersCog className="w-6 h-6" />
               </div>
            </div>

            {/* Pending Approvals */}
            <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between transition-all ${
               stats.totalPendingCount > 0 
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:border-amber-400" 
                  : "bg-white dark:bg-gray-950 border-slate-200/80 dark:border-gray-800 hover:border-amber-300"
            }`}>
               <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                        Pending Approvals
                     </p>
                     {stats.totalPendingCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                     )}
                  </div>
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{stats.totalPendingCount}</p>
                  <Link 
                     href="/dashboard/super-admin/users?tab=pending"
                     className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-bold hover:underline"
                  >
                     <span>Review in User Management</span>
                     <ChevronRight className="w-3 h-3" />
                  </Link>
               </div>
               <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900 flex items-center justify-center shadow-xs">
                  <FaTractor className="w-6 h-6" />
               </div>
            </div>

            {/* Total Buyers */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:border-teal-300">
               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Total Buyers</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalBuyers}</p>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">Active Procurement Accounts</p>
               </div>
               <div className="w-13 h-13 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900 flex items-center justify-center shadow-xs">
                  <FaChartPie className="w-6 h-6" />
               </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center justify-between transition-all hover:border-emerald-300">
               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">System Status</p>
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                     <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">Online</p>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Core Node & DB Synchronized</p>
               </div>
               <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shadow-xs">
                  <FaShieldAlt className="w-6 h-6" />
               </div>
            </div>
         </div>

         {/* Action Banner: Pending Verification Alert */}
         {stats.totalPendingCount > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 sm:p-7 rounded-3xl border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-500/20">
                     <FaClock className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Action Required: {stats.totalPendingCount} Onboarding Submissions Pending Review</span>
                     </h3>
                     <p className="text-xs text-slate-600 dark:text-gray-300 font-medium mt-0.5">
                        Approval, document verification, and official Farm ID generation must be processed in the User Management desk.
                     </p>
                  </div>
               </div>

               <Link
                  href="/dashboard/super-admin/users?tab=pending"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
               >
                  <span>Open User Management & Process Approvals</span>
                  <ChevronRight className="w-4 h-4" />
               </Link>
            </div>
         )}

         {/* Financial & Liquidity High-Level Indicators */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Treasury Balance</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                     <FaWallet className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {formatNaira(stats.financeWalletBalance)}
               </p>
               <p className="text-[11px] text-slate-400 font-medium">Available balance across industrial finance accounts</p>
            </div>

            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Funds in Escrow Guarantee</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                     <FaClock className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {formatNaira(stats.escrowHeld)}
               </p>
               <p className="text-[11px] text-slate-400 font-medium">Secured for active fulfillment & commodity agreements</p>
            </div>

            <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Industrial Agreements</span>
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                     <FaHandshake className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stats.totalAgreements} Contracts
               </p>
               <p className="text-[11px] text-slate-400 font-medium">Multi-stakeholder off-taker & supply pipelines</p>
            </div>
         </div>

         {/* Participant Distribution by Operational Role (Live Analytics) */}
         <div className="bg-white dark:bg-gray-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-900 pb-4">
               <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <TrendingUp className="text-emerald-600 w-4 h-4" />
                     <span>Participant Distribution & Ecosystem Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                     Live stakeholder counts categorized by operational and institutional function across {totalUsers} total participants.
                  </p>
               </div>
               <Link
                  href="/dashboard/super-admin/users"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
               >
                  <span>Manage All in User Management</span>
                  <ChevronRight className="w-3.5 h-3.5" />
               </Link>
            </div>

            {/* Distribution Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
               {stats.roleCounts.map((r, i) => {
                  const percentage = stats.totalVendors > 0 ? Math.round((r.count / stats.totalVendors) * 100) : 0;
                  return (
                     <div
                        key={i}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-gray-800/80 bg-slate-50/50 dark:bg-gray-900/40 space-y-2 hover:border-emerald-200 transition-colors"
                     >
                        <div className="flex items-center justify-between text-xs">
                           <span className="font-bold capitalize text-gray-900 dark:text-white">{r.role}</span>
                           <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              {r.count} ({percentage}%)
                           </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
                           <div
                              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 3)}%` }}
                           />
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Administrative Desk Shortcuts */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link
               href="/dashboard/super-admin/users"
               className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-slate-200/80 dark:border-gray-800 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group"
            >
               <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                     <FaUsersCog className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
               </div>
               <h4 className="text-sm font-black text-gray-900 dark:text-white">User Management & Approvals</h4>
               <p className="text-xs text-slate-500 mt-1">Inspect farmer onboarding submissions, land titles, GPS coordinates, and approve or reject accounts.</p>
            </Link>

            <Link
               href="/dashboard/super-admin/wallet"
               className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-slate-200/80 dark:border-gray-800 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group"
            >
               <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                     <FaWallet className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
               </div>
               <h4 className="text-sm font-black text-gray-900 dark:text-white">Platform Wallet & Escrow</h4>
               <p className="text-xs text-slate-500 mt-1">Monitor multi-warehouse escrow deposits, industrial settlements, and entity wallet balances.</p>
            </Link>

            <Link
               href="/dashboard/super-admin/analytics"
               className="p-6 rounded-3xl bg-white dark:bg-gray-950 border border-slate-200/80 dark:border-gray-800 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group"
            >
               <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                     <FaServer className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
               </div>
               <h4 className="text-sm font-black text-gray-900 dark:text-white">System Analytics & Growth</h4>
               <p className="text-xs text-slate-500 mt-1">Review historical onboarding velocities, monthly growth trajectories, and network audit trails.</p>
            </Link>
         </div>
      </div>
   );
}
