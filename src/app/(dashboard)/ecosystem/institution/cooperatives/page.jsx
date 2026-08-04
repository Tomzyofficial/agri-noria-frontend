"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, MapPin, Phone, Users, Building, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function CooperativesDirectoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/cooperatives");
        const json = await res.json();
        if (json.success) setData(json.data || []);
      } catch (error) {
        console.error("Failed to load cooperatives:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    `${item.fname} ${item.lname} ${item.company_name || ""}`.toLowerCase().includes(search.toLowerCase()) ||
    item.phone?.includes(search) ||
    item.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -top-10 right-10 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl -z-10" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Cooperatives Directory
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 text-blue-600 dark:text-blue-400">
              Verified Ecosystem Cooperatives & Associations
            </p>
          </div>
          
          <div className="relative group max-w-sm w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Input 
                placeholder="Search cooperative by name or phone..." 
                className="pl-11 h-12 rounded-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-blue-500/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 bg-white/60 dark:bg-gray-950/40 backdrop-blur-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10">
        <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Registered Ecosystem Cooperatives 
            <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-black text-xs shadow-xs">
              {filteredData.length} Total Users
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing cooperative records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-transparent">
                  <tr>
                    <th className="px-8 py-5">Cooperative Identity</th>
                    <th className="px-6 py-5">Representative</th>
                    <th className="px-6 py-5">Contact & Email</th>
                    <th className="px-6 py-5">State / Jurisdiction</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No cooperatives found</h3>
                        <p className="text-gray-500 mt-1">No cooperative users registered in the ecosystem match your query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((coop, idx) => (
                      <tr 
                        key={idx} 
                        className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-950 group-hover:scale-105 transition-transform duration-200">
                              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {coop.company_name || `${coop.fname} ${coop.lname}`}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled {new Date(coop.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {coop.fname} {coop.lname}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Representative</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium text-xs">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {coop.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {coop.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/50 dark:border-emerald-500/20">
                            <MapPin className="w-3 h-3" />
                            {coop.state || "National"}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Active Cooperative
                          </span>
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
