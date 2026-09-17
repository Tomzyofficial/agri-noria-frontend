"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, MapPin, Package, Truck, Warehouse, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

const statusConfig = {
  harvest_declared: { label: "Harvest Declared", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  pending: { label: "Pending Pickup", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  in_transit: { label: "In Transit", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  stored: { label: "In Storage", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  settled: { label: "Settled", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export default function TraceabilityPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/traceability");
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

  const filtered = data.filter((item) =>
    (item.batch_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.crop || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.origin || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Traceability Ledger</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Track Commodity Movement</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Batch Tracking</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search batch, crop, origin..."
              className="pl-10 rounded-xl bg-gray-50 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                    <th className="px-6 py-4 font-bold rounded-l-lg">Batch Number</th>
                    <th className="px-6 py-4 font-bold">Crop</th>
                    <th className="px-6 py-4 font-bold">Qty (MT)</th>
                    <th className="px-6 py-4 font-bold">Origin</th>
                    <th className="px-6 py-4 font-bold">Destination</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No traceability records found.</td></tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const st = statusConfig[(item.status || "").toLowerCase()] || statusConfig.pending;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-(--foreground)">{item.batch_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold">{item.crop || '—'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-bold">{item.quantity_mt ? Number(item.quantity_mt).toLocaleString() : '—'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/>{item.origin || '—'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.destination || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
                        </tr>
                      );
                    })
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
