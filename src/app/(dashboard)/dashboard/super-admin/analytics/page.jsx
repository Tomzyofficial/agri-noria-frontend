"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Users, ShoppingCart, Server, Activity, Wallet } from "lucide-react";
import {
   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const ROLE_COLORS = [
   "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
   "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#14b8a6",
   "#a855f7", "#64748b",
];

export default function SystemAnalyticsPage() {
   const [analytics, setAnalytics] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchAnalytics = async () => {
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
         }
      };
      fetchAnalytics();
   }, []);

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-3">
               <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
               <p className="text-gray-500 text-sm">Loading analytics...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-3 max-w-md">
               <Activity className="w-12 h-12 text-red-400 mx-auto" />
               <h3 className="font-semibold text-lg">Failed to load analytics</h3>
               <p className="text-gray-500 text-sm">{error}</p>
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
               >
                  Retry
               </button>
            </div>
         </div>
      );
   }

   const statCards = [
      {
         title: "Total Users",
         value: (analytics?.totalUsers || 0).toLocaleString(),
         sub: `${analytics?.totalVendors || 0} vendors · ${analytics?.totalBuyers || 0} buyers`,
         icon: <Users className="w-5 h-5" />,
         gradient: "from-blue-500 to-blue-600",
         bg: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
         title: "Total Agreements",
         value: (analytics?.totalTransactions || 0).toLocaleString(),
         sub: "All buyer agreements on platform",
         icon: <ShoppingCart className="w-5 h-5" />,
         gradient: "from-violet-500 to-purple-600",
         bg: "bg-violet-50 dark:bg-violet-900/20",
      },
      {
         title: "Escrow Held",
         value: `₦${(analytics?.escrowHeld || 0).toLocaleString()}`,
         sub: "Active escrow funds",
         icon: <Wallet className="w-5 h-5" />,
         gradient: "from-emerald-500 to-green-600",
         bg: "bg-emerald-50 dark:bg-emerald-900/20",
      },
      {
         title: "System Health",
         value: `${analytics?.systemHealth || 100}%`,
         sub: "All services operational",
         icon: <Server className="w-5 h-5" />,
         gradient: "from-orange-500 to-amber-500",
         bg: "bg-orange-50 dark:bg-orange-900/20",
      },
   ];

   const monthlyGrowth = analytics?.monthlyGrowth || [];
   const roleDistribution = analytics?.roleDistribution || [];
   const totalForPercent = roleDistribution.reduce((s, r) => s + r.count, 0) || 1;

   return (
      <div className="space-y-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold text-(--foreground)">System Analytics</h1>
            <p className="text-gray-500 mt-1">
               Real-time platform metrics across {analytics?.totalUsers || 0} registered users.
            </p>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => (
               <Card key={idx} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                     <div className={`h-1.5 w-full bg-gradient-to-r ${stat.gradient}`} />
                     <div className="p-5 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                           <p className="text-sm text-gray-500 font-medium truncate">{stat.title}</p>
                           <p className="text-2xl font-bold mt-1 text-(--foreground)">{stat.value}</p>
                           <p className="text-xs text-gray-400 mt-1 truncate">{stat.sub}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                           <div className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                              {stat.icon}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Monthly Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card className="shadow-sm border-none">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-blue-500" />
                     User Growth — Last 12 Months
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {monthlyGrowth.length === 0 ? (
                     <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                        No growth data available yet
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                           <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                           <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                           <Tooltip
                              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                              formatter={(val) => [val, "New Users"]}
                           />
                           <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#3b82f6"
                              strokeWidth={2.5}
                              dot={{ fill: "#3b82f6", r: 4 }}
                              activeDot={{ r: 6 }}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  )}
               </CardContent>
            </Card>

            {/* Agreements per Month */}
            <Card className="shadow-sm border-none">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     <ShoppingCart className="w-4 h-4 text-violet-500" />
                     Agreements — Last 12 Months
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {monthlyGrowth.length === 0 ? (
                     <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                        No agreement data available yet
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                           <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                           <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                           <Tooltip
                              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                              formatter={(val) => [val, "Agreements"]}
                           />
                           <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Role Distribution */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="shadow-sm border-none">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     <Users className="w-4 h-4 text-emerald-500" />
                     User Distribution by Role
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  {roleDistribution.length === 0 ? (
                     <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                        No role data available
                     </div>
                  ) : (
                     <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                           <Pie
                              data={roleDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              dataKey="count"
                              nameKey="name"
                              paddingAngle={3}
                           >
                              {roleDistribution.map((_, i) => (
                                 <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip
                              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                              formatter={(val, name) => [`${val} users`, name]}
                           />
                           <Legend
                              formatter={(val) => <span className="text-xs capitalize">{val}</span>}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  )}
               </CardContent>
            </Card>

            {/* Progress bars */}
            <Card className="shadow-sm border-none">
               <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Role Breakdown</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  {roleDistribution.length === 0 ? (
                     <p className="text-gray-400 text-sm py-8 text-center">No data available</p>
                  ) : (
                     roleDistribution.map((role, idx) => {
                        const pct = ((role.count / totalForPercent) * 100).toFixed(1);
                        return (
                           <div key={idx}>
                              <div className="flex items-center justify-between mb-1">
                                 <span className="text-sm font-medium capitalize">{role.name}</span>
                                 <span className="text-xs text-gray-500">{role.count} users ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                                 <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                       width: `${pct}%`,
                                       backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length],
                                    }}
                                 />
                              </div>
                           </div>
                        );
                     })
                  )}
               </CardContent>
            </Card>
         </div>

         {/* System Status */}
         <Card className="shadow-sm border-none">
            <CardHeader className="pb-2">
               <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-500" />
                  System Status
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                     { label: "Database", status: "Operational" },
                     { label: "API Server", status: "Operational" },
                     { label: "File Storage", status: "Operational" },
                     { label: "Email Service", status: "Operational" },
                  ].map((svc, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 animate-pulse" />
                        <div>
                           <p className="text-xs font-semibold">{svc.label}</p>
                           <p className="text-xs text-green-600 dark:text-green-400">{svc.status}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
