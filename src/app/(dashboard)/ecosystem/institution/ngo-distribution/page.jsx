"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, Truck } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function NgoDistributionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/ngo-distribution");
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
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Input Distribution</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage Aid & Logistics</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Distribution Logs</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search item type..." className="pl-10 rounded-xl bg-gray-50 border-gray-200" />
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
                    <th className="px-6 py-4 font-bold rounded-l-lg">Item Type</th>
                    <th className="px-6 py-4 font-bold">Quantity</th>
                    <th className="px-6 py-4 font-bold">Beneficiaries Reached</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Date Distributed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No distributions logged.</td></tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          <Truck className="w-4 h-4 text-indigo-500" />
                          <span className="capitalize">{item.item_type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold">{item.quantity}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{item.beneficiaries_count}</td>
                        <td className="px-6 py-4 text-gray-500">{item.distribution_date ? new Date(item.distribution_date).toLocaleDateString() : 'N/A'}</td>
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
