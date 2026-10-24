"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { 
   Loader2, TrendingUp, Users, ShoppingCart, Server, 
   Activity, Wallet, RefreshCw, Search, X, PieChart as PieChartIcon 
} from "lucide-react";
import { FaSeedling } from "react-icons/fa";
import {
   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Curated ecosystem color map for distinct roles
const ROLE_COLOR_MAP = {
   farmer: "#059669",
   government: "#0d9488",
   logistics: "#0284c7",
   "cluster supervisor": "#6366f1",
   cooperative: "#8b5cf6",
   "field officer": "#d97706",
   storage: "#ea580c",
   bank: "#2563eb",
   aggregator: "#16a34a",
   "sales manager": "#db2777",
   "program director": "#9333ea",
   seller: "#4f46e5",
   insurance: "#0891b2",
   agronomist: "#84cc16",
   drone: "#3b82f6",
   inspector: "#f59e0b",
   processor: "#10b981",
   "off-taker": "#06b6d4",
   exporter: "#ec4899",
   enumerator: "#14b8a6",
   institution: "#6366f1",
   "super admin": "#475569",
   admin: "#64748b"
};

const PALETTE_FALLBACKS = [
   "#059669", "#0d9488", "#0284c7", "#6366f1", "#8b5cf6",
   "#d97706", "#ea580c", "#2563eb", "#16a34a", "#db2777",
   "#0891b2", "#84cc16", "#f59e0b", "#64748b"
];

function getRoleColor(name, index) {
   if (!name) return "#94a3b8";
   const key = name.toLowerCase().trim();
   if (key.includes("other")) return "#94a3b8";
   if (ROLE_COLOR_MAP[key]) return ROLE_COLOR_MAP[key];
   return PALETTE_FALLBACKS[index % PALETTE_FALLBACKS.length];
}

export default function SystemAnalyticsPage() {
   const [analytics, setAnalytics] = useState(null);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState(null);

   // Role distribution interactive controls
   const [chartSlices, setChartSlices] = useState(6); // 6 or 10
   const [roleSearch, setRoleSearch] = useState("");
   const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'top10' | 'major'
   const [hoveredRole, setHoveredRole] = useState(null);

   const fetchAnalytics = async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
         const res = await fetch("/api/proxy/admin/analytics");
         const json = await res.json();
         if (json.success && json.data) {
            setAnalytics(json.data);
         } else {
            setError(json.error || "Failed to load analytics");
         }
      } catch (err) {
         console.error("Failed to fetch analytics:", err);
         setError("Network error — could not load analytics");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   useEffect(() => {
      fetchAnalytics();
   }, []);

   const monthlyGrowth = analytics?.monthlyGrowth || [];
   const roleDistribution = analytics?.roleDistribution || [];
   const totalForPercent = roleDistribution.reduce((s, r) => s + (parseInt(r.count) || 0), 0) || 1;

   // Sorted roles from highest count to lowest
   const sortedRoles = useMemo(() => {
      return [...roleDistribution].sort((a, b) => (parseInt(b.count) || 0) - (parseInt(a.count) || 0));
   }, [roleDistribution]);

   // Grouped data for Donut Chart (Top N + Others)
   const donutData = useMemo(() => {
      if (sortedRoles.length === 0) return [];
      const top = sortedRoles.slice(0, chartSlices);
      const others = sortedRoles.slice(chartSlices);
      const othersCount = others.reduce((acc, r) => acc + (parseInt(r.count) || 0), 0);

      const items = top.map((r, i) => {
         const count = parseInt(r.count) || 0;
         return {
            name: r.name,
            count,
            pct: ((count / totalForPercent) * 100).toFixed(1),
            color: getRoleColor(r.name, i),
            isOther: false,
         };
      });

      if (othersCount > 0) {
         items.push({
            name: `Other Roles (${others.length})`,
            count: othersCount,
            pct: ((othersCount / totalForPercent) * 100).toFixed(1),
            color: "#94a3b8",
            isOther: true,
         });
      }
      return items;
   }, [sortedRoles, chartSlices, totalForPercent]);

   // Filtered roles for the breakdown list
   const filteredRoles = useMemo(() => {
      let list = sortedRoles;
      if (roleFilter === "top10") {
         list = list.slice(0, 10);
      } else if (roleFilter === "major") {
         list = list.filter(r => (parseInt(r.count) || 0) >= 5);
      }

      if (roleSearch.trim()) {
         const q = roleSearch.toLowerCase().trim();
         list = list.filter(r => r.name.toLowerCase().includes(q));
      }
      return list;
   }, [sortedRoles, roleFilter, roleSearch]);

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
               <FaSeedling className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
               <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
               <span>Loading System Analytics...</span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium">
               Aggregating platform metrics, escrow status, and user growth...
            </p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
               <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-500">
                  <Activity className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Unable to Load Analytics</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{error}</p>
               </div>
               <button
                  onClick={() => fetchAnalytics(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
               >
                  <RefreshCw className="w-4 h-4" />
                  Retry Sync
               </button>
            </div>
         </div>
      );
   }

   const statCards = [
      {
         title: "Total Registered Users",
         value: (analytics?.totalUsers || 0).toLocaleString(),
         sub: `${analytics?.totalVendors || 0} vendors · ${analytics?.totalBuyers || 0} buyers`,
         icon: <Users className="w-5 h-5 text-emerald-600" />,
         gradient: "from-emerald-500 to-teal-600",
         bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
      },
      {
         title: "Total Procurement Deals",
         value: (analytics?.totalTransactions || 0).toLocaleString(),
         sub: "Active & completed buyer agreements",
         icon: <ShoppingCart className="w-5 h-5 text-teal-600" />,
         gradient: "from-teal-500 to-emerald-600",
         bg: "bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/40",
      },
      {
         title: "Escrow Held in Vault",
         value: `₦${(analytics?.escrowHeld || 0).toLocaleString()}`,
         sub: "Secured transactions in escrow",
         icon: <Wallet className="w-5 h-5 text-emerald-700" />,
         gradient: "from-emerald-600 to-emerald-800",
         bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
      },
      {
         title: "System Health & Uptime",
         value: `${analytics?.systemHealth || 100}%`,
         sub: "All platform services operational",
         icon: <Server className="w-5 h-5 text-emerald-600" />,
         gradient: "from-emerald-500 to-teal-700",
         bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
      },
   ];

   const CustomDonutTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
         const data = payload[0].payload;
         return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-left pointer-events-none">
               <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 capitalize">{data.name}</p>
               </div>
               <div className="flex items-center justify-between gap-5 text-xs text-slate-500">
                  <span>Count:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{data.count.toLocaleString()} members</span>
               </div>
               <div className="flex items-center justify-between gap-5 text-xs text-slate-500 mt-0.5">
                  <span>Platform Share:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.pct}%</span>
               </div>
            </div>
         );
      }
      return null;
   };

   return (
      <div className="space-y-6">
         {/* Live fetching banner */}
         {refreshing && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs animate-fadeIn">
               <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="font-medium">Refreshing system analytics in the background...</span>
               </div>
               <span className="text-[11px] opacity-75">Live connection active</span>
            </div>
         )}

         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                     <FaSeedling className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">System Analytics</h1>
               </div>
               <p className="text-slate-500 text-sm mt-1">
                  Real-time platform metrics across {analytics?.totalUsers || 0} registered ecosystem members.
               </p>
            </div>
            <button
               onClick={() => fetchAnalytics(true)}
               disabled={refreshing}
               className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50 self-start sm:self-auto shadow-sm"
            >
               <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
               {refreshing ? "Refreshing..." : "Refresh Stats"}
            </button>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => (
               <Card key={idx} className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                  <CardContent className="p-0">
                     <div className={`h-1.5 w-full bg-gradient-to-r ${stat.gradient}`} />
                     <div className="p-5 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 text-left">
                           <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{stat.title}</p>
                           <p className="text-2xl font-bold mt-1.5 text-slate-900 dark:text-slate-100">{stat.value}</p>
                           <p className="text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                           {stat.icon}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Monthly Growth Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
               <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 text-left">
                     <TrendingUp className="w-4 h-4 text-emerald-600" />
                     User Growth — Last 12 Months
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-4">
                  {monthlyGrowth.length === 0 ? (
                     <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                        No user growth data available yet
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                           <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                           <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                           <Tooltip
                              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                              formatter={(val) => [val, "New Members"]}
                           />
                           <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#059669"
                              strokeWidth={2.5}
                              dot={{ fill: "#059669", r: 4 }}
                              activeDot={{ r: 6 }}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  )}
               </CardContent>
            </Card>

            {/* Agreements per Month */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
               <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 text-left">
                     <ShoppingCart className="w-4 h-4 text-teal-600" />
                     Procurement Deals — Last 12 Months
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-4">
                  {monthlyGrowth.length === 0 ? (
                     <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                        No procurement deal data available yet
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                           <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                           <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                           <Tooltip
                              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                              formatter={(val) => [val, "Agreements"]}
                           />
                           <Bar dataKey="transactions" fill="#0d9488" radius={[6, 6, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Modernized Role Distribution Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left Card: Donut Chart with Centered Metric & Clean Responsive Legend */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between min-h-[560px]">
               <div>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                     <div className="flex items-center justify-between gap-3">
                        <div className="text-left">
                           <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                              <PieChartIcon className="w-4 h-4 text-emerald-600" />
                              User Distribution by Ecosystem Role
                           </CardTitle>
                           <p className="text-xs text-slate-500 mt-0.5">
                              Key role representation across the agricultural ecosystem
                           </p>
                        </div>
                        {/* Segment granularity pill */}
                        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                           <button
                              onClick={() => setChartSlices(6)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                                 chartSlices === 6
                                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                           >
                              Top 6
                           </button>
                           <button
                              onClick={() => setChartSlices(10)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                                 chartSlices === 10
                                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                              }`}
                           >
                              Top 10
                           </button>
                        </div>
                     </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                     {donutData.length === 0 ? (
                        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                           No role distribution data available
                        </div>
                     ) : (
                        <div className="relative flex items-center justify-center">
                           <ResponsiveContainer width="100%" height={230}>
                              <PieChart>
                                 <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={98}
                                    dataKey="count"
                                    nameKey="name"
                                    paddingAngle={3}
                                    cornerRadius={4}
                                    onMouseEnter={(_, idx) => setHoveredRole(donutData[idx]?.name)}
                                    onMouseLeave={() => setHoveredRole(null)}
                                 >
                                    {donutData.map((entry, index) => (
                                       <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                          stroke={hoveredRole === entry.name ? "#ffffff" : "transparent"}
                                          strokeWidth={2}
                                          className="cursor-pointer transition-all duration-200"
                                       />
                                    ))}
                                 </Pie>
                                 <Tooltip content={<CustomDonutTooltip />} />
                              </PieChart>
                           </ResponsiveContainer>

                           {/* Centered Donut KPI */}
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                 {totalForPercent.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                                 Total Users
                              </span>
                           </div>
                        </div>
                     )}

                     {/* Clean responsive Legend Grid */}
                     <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/60 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
                        {donutData.map((item, idx) => {
                           const isHovered = hoveredRole === item.name;
                           return (
                              <div
                                 key={idx}
                                 onMouseEnter={() => setHoveredRole(item.name)}
                                 onMouseLeave={() => setHoveredRole(null)}
                                 className={`flex items-center justify-between p-2 rounded-xl transition border text-left cursor-pointer ${
                                    isHovered
                                       ? "bg-slate-100/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-xs"
                                       : "bg-slate-50/70 dark:bg-slate-800/30 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                 }`}
                              >
                                 <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <span
                                       className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                       style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize truncate">
                                       {item.name}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                       {item.pct}%
                                    </span>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </CardContent>
               </div>

               {/* Left Card Footer Banner */}
               <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-lg">
                  <div className="flex items-center gap-2 truncate">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                     <span className="truncate">
                        Dominant: <strong className="text-slate-800 dark:text-slate-200 capitalize">{sortedRoles[0]?.name || "None"}</strong> ({donutData[0]?.pct || 0}%)
                     </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                     {sortedRoles.length} roles registered
                  </span>
               </div>
            </Card>

            {/* Right Card: Role Composition Breakdown with Search & Scroll */}
            <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between min-h-[560px]">
               <div>
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-left">
                           <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <Users className="w-4 h-4 text-emerald-600" />
                              Role Composition Breakdown
                           </CardTitle>
                           <p className="text-xs text-slate-500 mt-0.5">
                              Census and distribution across all {sortedRoles.length} active roles
                           </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto shrink-0">
                           {sortedRoles.length} Tracked Roles
                        </span>
                     </div>

                     {/* Search bar & quick filters */}
                     <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                           <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input
                              type="text"
                              placeholder="Search role (e.g. Farmer, Logistics, Storage)..."
                              value={roleSearch}
                              onChange={(e) => setRoleSearch(e.target.value)}
                              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                           />
                           {roleSearch && (
                              <button
                                 onClick={() => setRoleSearch("")}
                                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                 <X className="w-3.5 h-3.5" />
                              </button>
                           )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                           {[
                              { id: "all", label: "All" },
                              { id: "top10", label: "Top 10" },
                              { id: "major", label: "≥ 5 Users" },
                           ].map((f) => (
                              <button
                                 key={f.id}
                                 onClick={() => setRoleFilter(f.id)}
                                 className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                                    roleFilter === f.id
                                       ? "bg-emerald-600 text-white shadow-xs"
                                       : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                 }`}
                              >
                                 {f.label}
                              </button>
                           ))}
                        </div>
                     </div>
                  </CardHeader>

                  <CardContent className="pt-3 pb-2">
                     {/* Scrollable list bounded to matching card height */}
                     <div className="h-[360px] overflow-y-auto pr-2 space-y-2.5 scrollbar-thin">
                        {filteredRoles.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10">
                              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                              <p className="font-semibold text-slate-600 dark:text-slate-300">No matching roles found</p>
                              <p className="text-slate-400 text-[11px] mt-0.5">Try searching with a different term</p>
                              {roleSearch && (
                                 <button
                                    onClick={() => setRoleSearch("")}
                                    className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200"
                                 >
                                    Clear search
                                 </button>
                              )}
                           </div>
                        ) : (
                           filteredRoles.map((role, idx) => {
                              const rank = sortedRoles.findIndex((r) => r.name === role.name) + 1;
                              const count = parseInt(role.count) || 0;
                              const pct = ((count / totalForPercent) * 100).toFixed(1);
                              const color = getRoleColor(role.name, rank - 1);

                              let rankBadgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                              if (rank === 1) rankBadgeClass = "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold";
                              else if (rank === 2) rankBadgeClass = "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 font-semibold";
                              else if (rank === 3) rankBadgeClass = "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200";

                              return (
                                 <div
                                    key={idx}
                                    className="p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition text-left"
                                 >
                                    <div className="flex items-center justify-between mb-1.5">
                                       <div className="flex items-center gap-2 min-w-0">
                                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] border shrink-0 ${rankBadgeClass}`}>
                                             {rank}
                                          </span>
                                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize truncate">
                                             {role.name}
                                          </span>
                                       </div>
                                       <div className="flex items-center gap-1.5 shrink-0 text-xs">
                                          <span className="font-bold text-slate-900 dark:text-slate-100">{count}</span>
                                          <span className="text-slate-400 text-[11px]">users</span>
                                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold tabular-nums">
                                             {pct}%
                                          </span>
                                       </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                       <div
                                          className="h-1.5 rounded-full transition-all duration-500"
                                          style={{
                                             width: `${Math.max(Number(pct), 1.5)}%`,
                                             backgroundColor: color,
                                          }}
                                       />
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </CardContent>
               </div>

               {/* Right Card Footer */}
               <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-lg">
                  <span>
                     Showing <strong>{filteredRoles.length}</strong> of {sortedRoles.length} roles
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Ranked by user volume</span>
               </div>
            </Card>
         </div>

         {/* System Infrastructure Status */}
         <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/60">
               <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 text-left">
                  <Server className="w-4 h-4 text-emerald-600" />
                  Infrastructure & Microservice Status
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                     { label: "Core Database (PostgreSQL)", status: "Operational", sub: "Pool active" },
                     { label: "API Gateway & Proxy", status: "Operational", sub: "Port 5000 connected" },
                     { label: "Escrow Ledger Vault", status: "Operational", sub: "Sync healthy" },
                     { label: "Background Queue & Mailer", status: "Operational", sub: "Workers ready" },
                  ].map((svc, i) => (
                     <div key={i} className="flex items-center gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl text-left">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                        <div className="min-w-0">
                           <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{svc.label}</p>
                           <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{svc.status}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
