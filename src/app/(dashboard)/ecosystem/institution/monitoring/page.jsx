"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, Activity } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Programme Monitoring</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Track Interventions & Yield Metrics</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Monitoring Metrics</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search metrics..." className="pl-10 rounded-xl bg-gray-50 border-gray-200" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-l-lg">Metric Name</th>
                    <th className="px-6 py-4 font-bold">Value</th>
                    <th className="px-6 py-4 font-bold">Date Recorded</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No monitoring data found.</td></tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          {item.metric_name}
                        </td>
                        <td className="px-6 py-4 font-bold">{item.metric_value}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(item.date_recorded).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-lg">Verified</span></td>
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
