"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, User, MapPin, Phone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function FarmersRegistryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/proxy/pipeline/farmers");
        const json = await res.json();
        if (json.success) setData(json.data || []);
      } catch (error) {
        console.error("Failed to load farmers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    `${item.fname} ${item.lname}`.toLowerCase().includes(search.toLowerCase()) ||
    item.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Farmer Registry</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Agricultural Identities</p>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Enrolled Farmers</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name or phone..." 
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
                    <th className="px-6 py-4 font-bold rounded-l-lg">Farmer Name</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold">State/LGA</th>
                    <th className="px-6 py-4 font-bold">Farm Size</th>
                    <th className="px-6 py-4 font-bold">Programme</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredData.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No farmers found.</td></tr>
                  ) : (
                    filteredData.map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {farmer.fname?.[0]}{farmer.lname?.[0]}
                          </div>
                          {farmer.fname} {farmer.lname}
                        </td>
                        <td className="px-6 py-4 text-gray-600"><span className="flex items-center gap-2"><Phone className="w-3 h-3"/> {farmer.phone || "N/A"}</span></td>
                        <td className="px-6 py-4 text-gray-600"><span className="flex items-center gap-2"><MapPin className="w-3 h-3"/> {farmer.state || "N/A"}</span></td>
                        <td className="px-6 py-4 text-gray-600">{farmer.farm_size_hectares ? `${farmer.farm_size_hectares} Ha` : "N/A"}</td>
                        <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-lg">{farmer.program_name || "N/A"}</span></td>
                        <td className="px-6 py-4 text-gray-500">{new Date(farmer.created_at).toLocaleDateString()}</td>
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
