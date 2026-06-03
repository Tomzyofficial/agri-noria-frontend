"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, MapPin, CheckCircle, AlertCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function InspectionsPage() {
   const [inspections, setInspections] = useState([]);
   const [filteredInspections, setFilteredInspections] = useState([]);
   const [farmers, setFarmers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");

   const [showForm, setShowForm] = useState(false);
   const [formData, setFormData] = useState({
      farmer_id: "",
      status: "verified",
      notes: ""
   });
   const [submitting, setSubmitting] = useState(false);

   const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "PENDING_REVIEW", "verified", "failed", "pending"];

   const fetchInspections = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/inspections");
         if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
               setInspections(json.data);
               setFilteredInspections(json.data);
            }
         }
      } catch (err) {
         console.error("Failed to fetch live inspections:", err);
      }
   };

   const fetchFarmers = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/farmers");
         if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
               setFarmers(json.data);
            }
         }
      } catch (err) {
         console.error("Failed to fetch farmers:", err);
      }
   }

   useEffect(() => {
      Promise.all([fetchInspections(), fetchFarmers()]).finally(() => {
         setLoading(false);
      });
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

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const res = await fetch("/api/proxy/field-operations/inspections", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
         });
         if (res.ok) {
            toast.success("Inspection recorded successfully");
            setShowForm(false);
            fetchInspections(); // Refresh data
            setFormData({ farmer_id: "", status: "verified", notes: "" });
         } else {
            toast.error("Failed to record inspection");
         }
      } catch (err) {
         console.error(err);
         toast.error("An error occurred");
      } finally {
         setSubmitting(false);
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case "COMPLETED":
         case "verified":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
         case "IN_PROGRESS":
         case "pending":
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
         case "verified":
            return "bg-green-100 text-green-700";
         case "IN_PROGRESS":
         case "pending":
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
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">Farm Inspections</h1>
               <p className="text-gray-500 mt-1 text-lg">Manage and track all farm inspection activities</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-xl px-6 py-6 font-medium text-lg">
               <Plus className="w-5 h-5" /> Record Inspection
            </Button>
         </div>

         {showForm && (
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-black/5 dark:ring-white/10">
               <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Record New Inspection</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Farmer / Farm</label>
                           <select
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm"
                              value={formData.farmer_id}
                              onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
                              required
                           >
                              <option value="">Select Farmer</option>
                              {farmers.map(f => (
                                 <option key={f.farmer_id} value={f.farmer_id}>{f.name}</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                           <select
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm"
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              required
                           >
                              <option value="verified">Verified (Pass)</option>
                              <option value="failed">Failed</option>
                              <option value="pending">Pending</option>
                           </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                           <textarea
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm resize-none"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              rows={4}
                              placeholder="Add inspection notes here..."
                           />
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-6">
                           Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="rounded-xl px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                           {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                           Save Inspection
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>
         )}

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
                  <p className="text-gray-500 text-sm">Completed / Verified</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                     {inspections.filter((i) => i.status === "COMPLETED" || i.status === "verified").length}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold mt-2 text-orange-600">
                     {inspections.filter((i) => i.status === "IN_PROGRESS" || i.status === "pending").length}
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
                              <td className="py-3 px-4 font-medium">{insp.id.substring(0, 8)}...</td>
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
