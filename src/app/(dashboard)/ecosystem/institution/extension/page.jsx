"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, BookOpen, UserCheck, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function ExtensionPage() {
  const [data, setData] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/extension");
        const json = await res.json();
        if (json.success) {
          const list = Array.isArray(json.data)
            ? json.data
            : json.data?.schedules || json.data?.logs || [];
          setData(list);
          if (Array.isArray(json.officers)) {
            setOfficers(json.officers);
          } else if (Array.isArray(json.data?.officers)) {
            setOfficers(json.data.officers);
          }
        }
      } catch (error) {
        console.error("Failed to load extension data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLogs = data.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.topic?.toLowerCase().includes(term) ||
      item.community?.toLowerCase().includes(term) ||
      item.officer_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Extension Services</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Farmer Training & Outreach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Trainings Logged</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{data.length}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extension Officers</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{officers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Farmers Reached</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {data.reduce((acc, curr) => acc + (parseInt(curr.farmers_reached, 10) || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Extension & Outreach Logs</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topic or community..."
              className="pl-10 rounded-xl bg-gray-50 border-gray-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-l-lg">Training Topic</th>
                    <th className="px-6 py-4 font-bold">Community / Cluster</th>
                    <th className="px-6 py-4 font-bold">Extension Officer</th>
                    <th className="px-6 py-4 font-bold">Farmers Reached</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Date Conducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No extension services logged.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="capitalize">{item.topic}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.community}</td>
                        <td className="px-6 py-4 text-gray-600">{item.officer_name || "Assigned Officer"}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{item.farmers_reached}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {item.date_conducted ? new Date(item.date_conducted).toLocaleDateString() : "N/A"}
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
