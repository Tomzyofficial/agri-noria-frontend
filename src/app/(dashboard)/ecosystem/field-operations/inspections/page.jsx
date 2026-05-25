"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, MapPin, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InspectionsPage() {
   const [inspections, setInspections] = useState([]);
   const [filteredInspections, setFilteredInspections] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");

   const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "PENDING_REVIEW"];

   useEffect(() => {
      const fetchInspections = async () => {
         try {
            const res = await fetch("/api/proxy/field-operations/inspections");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data && json.data.length > 0) {
                  setInspections(json.data);
                  setFilteredInspections(json.data);
                  setLoading(false);
                  return;
               }
            }
         } catch (err) {
            console.error("Failed to fetch live inspections:", err);
         }

         // Fallback to Mock data
         const mockInspections = [
            {
               id: "INSP-001",
               farmerName: "John Kipchoge",
               farmLocation: "Uasin Gishu County",
               cropType: "Maize",
               areaSize: "5.2 Ha",
               status: "COMPLETED",
               date: new Date().toISOString(),
               result: "PASS",
            },
            {
               id: "INSP-002",
               farmerName: "Mary Wambui",
               farmLocation: "Nandi County",
               cropType: "Wheat",
               areaSize: "3.5 Ha",
               status: "SCHEDULED",
               date: new Date(Date.now() + 86400000).toISOString(),
            },
            {
               id: "INSP-003",
               farmerName: "David Okonkwo",
               farmLocation: "Kano North",
               cropType: "Rice",
               areaSize: "12.0 Ha",
               status: "IN_PROGRESS",
               date: new Date().toISOString(),
            },
            {
               id: "INSP-004",
               farmerName: "Grace Aminu",
               farmLocation: "Kaduna West",
               cropType: "Ginger",
               areaSize: "2.8 Ha",
               status: "PENDING_REVIEW",
               date: new Date(Date.now() - 172800000).toISOString(),
               result: "PASS",
            },
            {
               id: "INSP-005",
               farmerName: "Ibrahim Yusuf",
               farmLocation: "Jigawa Central",
               cropType: "Sesame",
               areaSize: "8.5 Ha",
               status: "SCHEDULED",
               date: new Date(Date.now() + 259200000).toISOString(),
            },
            {
               id: "INSP-006",
               farmerName: "Chioma Adeleke",
               farmLocation: "Ogun State",
               cropType: "Cassava",
               areaSize: "4.0 Ha",
               status: "COMPLETED",
               date: new Date(Date.now() - 432000000).toISOString(),
               result: "FAIL",
            },
         ];
         setInspections(mockInspections);
         setFilteredInspections(mockInspections);
         setLoading(false);
      };
      fetchInspections();
   }, []);

   useEffect(() => {
      let filtered = inspections;

      if (searchTerm) {
         filtered = filtered.filter(
            (insp) =>
               insp.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               insp.farmLocation?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (statusFilter) {
         filtered = filtered.filter((insp) => insp.status === statusFilter);
      }

      setFilteredInspections(filtered);
   }, [searchTerm, statusFilter, inspections]);

   const getStatusIcon = (status) => {
      switch (status) {
         case "COMPLETED":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
         case "IN_PROGRESS":
            return <Clock className="w-4 h-4 text-orange-500" />;
         case "SCHEDULED":
            return <Clock className="w-4 h-4 text-blue-500" />;
         default:
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case "COMPLETED":
            return "bg-green-100 text-green-700";
         case "IN_PROGRESS":
            return "bg-orange-100 text-orange-700";
         case "SCHEDULED":
            return "bg-blue-100 text-blue-700";
         default:
            return "bg-yellow-100 text-yellow-700";
      }
   };

   const getResultColor = (result) => {
      switch (result) {
         case "PASS":
            return "bg-green-100 text-green-700";
         case "FAIL":
            return "bg-red-100 text-red-700";
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
            <h1 className="text-3xl font-bold text-(--foreground)">Farm Inspections</h1>
            <p className="text-gray-500 mt-1">Manage and track all farm inspection activities.</p>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Total Inspections</p>
                  <p className="text-2xl font-bold mt-2">{inspections.length}</p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                     {inspections.filter((i) => i.status === "COMPLETED").length}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold mt-2 text-blue-600">
                     {inspections.filter((i) => i.status === "SCHEDULED").length}
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
                        placeholder="Farmer name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-2">Status</label>
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     >
                        <option value="">All Statuses</option>
                        {statuses.map((status) => (
                           <option key={status} value={status}>
                              {status.replace(/_/g, " ")}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Inspections Table */}
         <Card>
            <CardHeader>
               <CardTitle>Inspections ({filteredInspections.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">Inspection ID</th>
                           <th className="text-left py-3 px-4 font-semibold">Farmer</th>
                           <th className="text-left py-3 px-4 font-semibold">Location</th>
                           <th className="text-left py-3 px-4 font-semibold">Crop</th>
                           <th className="text-left py-3 px-4 font-semibold">Size</th>
                           <th className="text-left py-3 px-4 font-semibold">Date</th>
                           <th className="text-left py-3 px-4 font-semibold">Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Result</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredInspections.map((insp) => (
                           <tr
                              key={insp.id}
                              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                           >
                              <td className="py-3 px-4 font-medium">{insp.id}</td>
                              <td className="py-3 px-4">{insp.farmerName}</td>
                              <td className="py-3 px-4 text-sm flex items-center gap-1">
                                 <MapPin className="w-4 h-4" /> {insp.farmLocation}
                              </td>
                              <td className="py-3 px-4">{insp.cropType}</td>
                              <td className="py-3 px-4">{insp.areaSize}</td>
                              <td className="py-3 px-4 text-sm">{new Date(insp.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                 <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(insp.status)}`}
                                 >
                                    {getStatusIcon(insp.status)}
                                    {insp.status.replace(/_/g, " ")}
                                 </span>
                              </td>
                              <td className="py-3 px-4">
                                 {insp.result && (
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(insp.result)}`}
                                    >
                                       {insp.result}
                                    </span>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredInspections.length === 0 && (
                     <div className="text-center py-8 text-gray-500">No inspections found</div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
