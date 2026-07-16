"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/reports");
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
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Institutional Reports</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Impact & ESG Analytics</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Generated Reports</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search reports..." className="pl-10 rounded-xl bg-gray-50 border-gray-200" />
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
                    <th className="px-6 py-4 font-bold rounded-l-lg">Report Type</th>
                    <th className="px-6 py-4 font-bold">Total Farmers</th>
                    <th className="px-6 py-4 font-bold">Financing</th>
                    <th className="px-6 py-4 font-bold">Generated At</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No reports generated yet.</td></tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FileText className="w-4 h-4"/></div>
                          <span className="capitalize">{item.report_type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold">{item.total_farmers || 0}</td>
                        <td className="px-6 py-4 text-gray-600">₦{parseFloat(item.total_financing || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <button className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                              <Download className="w-4 h-4"/> Download
                           </button>
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
