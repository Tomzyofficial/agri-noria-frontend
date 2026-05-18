"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaGlobe, FaChartLine, FaShieldAlt, FaSatellite } from "react-icons/fa";

export default function IntelligenceMonitoringDashboard() {
   const [stats, setStats] = useState({
      verifiedFarms: 0,
      dataPoints: 0,
      riskAlerts: 0
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const res = await fetch("/api/proxy/pipeline/stats/intelligence");
            const data = await res.json();
            if (data.success) setStats(data.data);
         } catch (error) {
            console.error("Failed to fetch intelligence stats", error);
         } finally {
            setLoading(false);
         }
      };
      fetchStats();
   }, []);

   return (
      <div className="space-y-8 max-w-7xl mx-auto py-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence & <span className="text-purple-500">Monitoring</span></h1>
               <p className="text-gray-500 mt-2 font-medium">Real-time data analysis, satellite tracking, and field auditing.</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-2xl border border-purple-100 dark:border-purple-800">
               <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
               <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest">Surveillance Active</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Verified Farms" value={loading ? "..." : stats.verifiedFarms} icon={<FaShieldAlt />} color="text-purple-500" bg="bg-purple-50" />
            <StatCard title="Data Points" value={loading ? "..." : stats.dataPoints} icon={<FaChartLine />} color="text-cyan-500" bg="bg-cyan-50" />
            <StatCard title="Risk Alerts" value={loading ? "..." : stats.riskAlerts} icon={<FaSatellite />} color="text-emerald-500" bg="bg-emerald-50" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[40px] border-none shadow-xl bg-white dark:bg-gray-800 p-8">
               <CardHeader>
                  <CardTitle className="text-2xl font-bold">Global Surveillance Map</CardTitle>
               </CardHeader>
               <CardContent>
                  {stats.clusters && stats.clusters.length > 0 ? (
                     <div className="space-y-4 py-4">
                        {stats.clusters.map(cluster => (
                           <div key={cluster.id} className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-purple-200 dark:hover:border-purple-900/30 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                                    {cluster.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 dark:text-white tracking-tight">{cluster.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cluster.location_name}</p>
                                 </div>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cluster.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                 {cluster.status}
                              </span>
                           </div>
                        ))}
                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-[0.2em] mt-6">Live Satellite Feed Active</p>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="relative">
                           <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-5xl text-purple-600 animate-pulse">
                              <FaGlobe />
                           </div>
                           <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                              <FaSatellite className="text-xs text-purple-500 animate-bounce" />
                           </div>
                        </div>
                        <div>
                           <h3 className="text-xl font-bold">Initializing Satellite Uplink</h3>
                           <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                              Gathering multispectral imagery and sensor data from regional clusters. Analytics will refresh shortly.
                           </p>
                        </div>
                     </div>
                  )}
               </CardContent>
            </Card>

            <Card className="rounded-[40px] border-none shadow-xl bg-white dark:bg-gray-900 p-8">
               <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Risk Analysis Insights</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <RiskItem label="Climatic Volatility" value="Low" color="text-emerald-500" />
                  <RiskItem label="Input Misappropriation" value="Minimal" color="text-emerald-500" />
                  <RiskItem label="Market Price Fluctuation" value="Moderate" color="text-amber-500" />
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-3xl mt-8">
                     <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">AI Prediction</p>
                     <p className="text-sm font-medium mt-2 leading-relaxed">
                        Yield forecast for the current cluster is +12% above average. Harvest window expected in 45 days.
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

function RiskItem({ label, value, color }) {
   return (
      <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-4">
         <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</span>
         <span className={`text-sm font-black ${color}`}>{value}</span>
      </div>
   );
}

function StatCard({ title, value, icon, color, bg }) {
   return (
      <Card className="border-none shadow-lg rounded-3xl overflow-hidden transition-transform hover:scale-[1.02]">
         <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${bg} ${color} text-2xl`}>{icon}</div>
            <div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</p>
               <p className="text-2xl font-black">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}
