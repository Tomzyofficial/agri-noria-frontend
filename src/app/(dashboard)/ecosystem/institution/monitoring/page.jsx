"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, Activity, ArrowRight, LineChart } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function MonitoringPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/monitoring");
        const json = await res.json();
        if (json.success) setData(json.data || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 dark:bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-40 h-40 bg-teal-500/20 dark:bg-teal-600/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Programme Monitoring
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 text-emerald-600 dark:text-emerald-400">
              Track Interventions & Yield Metrics
            </p>
          </div>
          
          <div className="relative group max-w-sm w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Input 
                placeholder="Search metrics..." 
                className="pl-11 h-12 rounded-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 bg-white/60 dark:bg-gray-950/40 backdrop-blur-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10">
        <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <LineChart className="w-5 h-5 text-emerald-500" />
            Monitoring Metrics <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">{data.length}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-gray-500 animate-pulse">Loading telemetry...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-transparent">
                  <tr>
                    <th className="px-8 py-5">Metric Name</th>
                    <th className="px-6 py-5">Value</th>
                    <th className="px-6 py-5">Date Recorded</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                          <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No monitoring data found</h3>
                        <p className="text-gray-500 mt-1">Check back later when telemetry is updated.</p>
                      </td>
                    </tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-950 group-hover:scale-110 transition-transform duration-300">
                              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.metric_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-gray-900 dark:text-white text-lg">
                            {item.metric_value}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {new Date(item.date_recorded).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                            Verified
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
