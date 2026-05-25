"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
   const [reports, setReports] = useState([]);
   const [filteredReports, setFilteredReports] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [typeFilter, setTypeFilter] = useState("");

   const reportTypes = ["AGRONOMY", "SOIL_TEST", "PEST_REPORT", "YIELD_ASSESSMENT", "COMPLIANCE"];

   useEffect(() => {
      const fetchReports = async () => {
         try {
            const res = await fetch("/api/proxy/field-operations/reports");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data && json.data.length > 0) {
                  setReports(json.data);
                  setFilteredReports(json.data);
                  setLoading(false);
                  return;
               }
            }
         } catch (err) {
            console.error("Failed to fetch live reports:", err);
         }

         // Fallback to Mock data
         const mockReports = [
            {
               id: "RPT-001",
               title: "Soil Fertility Analysis - Sector A",
               type: "SOIL_TEST",
               farmerName: "Ibrahim Musa",
               date: new Date().toISOString(),
               findings: "Phosphorus deficiency detected; recommend NPK 15-15-15",
            },
            {
               id: "RPT-002",
               title: "Maize Growth Progress Report",
               type: "AGRONOMY",
               farmerName: "Grace Adebayo",
               date: new Date(Date.now() - 604800000).toISOString(),
               findings: "Crop height and leaf count within optimal range",
            },
            {
               id: "RPT-003",
               title: "Armyworm Infestation Alert",
               type: "PEST_REPORT",
               farmerName: "Samuel Nwosu",
               date: new Date(Date.now() - 172800000).toISOString(),
               findings: "Early stage infestation; immediate spraying required",
            },
            {
               id: "RPT-004",
               title: "Pre-Harvest Yield Assessment",
               type: "YIELD_ASSESSMENT",
               farmerName: "Fatima Yusuf",
               date: new Date(Date.now() - 1209600000).toISOString(),
               findings: "Estimated yield: 4.5 tons per hectare",
            },
            {
               id: "RPT-005",
               title: "Environmental Compliance Check",
               type: "COMPLIANCE",
               farmerName: "Bello Hassan",
               date: new Date().toISOString(),
               findings: "Proper waste disposal verified; no erosion issues",
            },
         ];
         setReports(mockReports);
         setFilteredReports(mockReports);
         setLoading(false);
      };
      fetchReports();
   }, []);

   useEffect(() => {
      let filtered = reports;

      if (searchTerm) {
         filtered = filtered.filter(
            (report) =>
               report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               report.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (typeFilter) {
         filtered = filtered.filter((report) => report.type === typeFilter);
      }

      setFilteredReports(filtered);
   }, [searchTerm, typeFilter, reports]);

   const getTypeColor = (type) => {
      switch (type) {
         case "SOIL_TEST":
            return "bg-brown-100 text-brown-700";
         case "AGRONOMY":
            return "bg-green-100 text-green-700";
         case "PEST_REPORT":
            return "bg-orange-100 text-orange-700";
         case "YIELD_ASSESSMENT":
            return "bg-blue-100 text-blue-700";
         case "COMPLIANCE":
            return "bg-purple-100 text-purple-700";
         default:
            return "bg-gray-100 text-gray-700";
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold text-(--foreground)">Agronomy Reports</h1>
            <p className="text-gray-500 mt-1">View and download field reports and assessments.</p>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-gray-500 text-sm">Total Reports</p>
                        <p className="text-2xl font-bold mt-2">{reports.length}</p>
                     </div>
                     <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">This Month</p>
                  <p className="text-2xl font-bold mt-2">
                     {reports.filter((r) => new Date(r.date).getMonth() === new Date().getMonth()).length}
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-2">Search</label>
                     <input
                        type="text"
                        placeholder="Report title or farmer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-2">Report Type</label>
                     <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     >
                        <option value="">All Types</option>
                        {reportTypes.map((type) => (
                           <option key={type} value={type}>
                              {type.replace(/_/g, " ")}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Reports Table */}
         <Card>
            <CardHeader>
               <CardTitle>Reports ({filteredReports.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">Report ID</th>
                           <th className="text-left py-3 px-4 font-semibold">Title</th>
                           <th className="text-left py-3 px-4 font-semibold">Farmer</th>
                           <th className="text-left py-3 px-4 font-semibold">Type</th>
                           <th className="text-left py-3 px-4 font-semibold">Date</th>
                           <th className="text-left py-3 px-4 font-semibold">Findings</th>
                           <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredReports.map((report) => (
                           <tr
                              key={report.id}
                              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                           >
                              <td className="py-3 px-4 font-medium">{report.id}</td>
                              <td className="py-3 px-4">{report.title}</td>
                              <td className="py-3 px-4">{report.farmerName}</td>
                              <td className="py-3 px-4">
                                 <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}
                                 >
                                    {report.type.replace(/_/g, " ")}
                                 </span>
                              </td>
                              <td className="py-3 px-4 text-sm">{new Date(report.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{report.findings}</td>
                              <td className="py-3 px-4">
                                 <Button size="sm" variant="ghost" className="text-blue-600">
                                    <Download className="w-4 h-4" />
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredReports.length === 0 && (
                     <div className="text-center py-8 text-gray-500">No reports found</div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
