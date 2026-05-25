"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function VerificationsPage() {
   const [verifications, setVerifications] = useState([]);
   const [filteredVerifications, setFilteredVerifications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");

   const statuses = ["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"];

   useEffect(() => {
      const fetchVerifications = async () => {
         try {
            const res = await fetch("/api/proxy/field-operations/verifications");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data && json.data.length > 0) {
                  setVerifications(json.data);
                  setFilteredVerifications(json.data);
                  setLoading(false);
                  return;
               }
            }
         } catch (err) {
            console.error("Failed to fetch live verifications:", err);
         }

         // Fallback to Mock data
         const mockVerifications = [
            {
               id: "VER-001",
               farmerName: "Abubakar Sadiq",
               clusterName: "Kano North Cluster",
               submissionDate: new Date(Date.now() - 86400000).toISOString(),
               status: "UNDER_REVIEW",
               documents: 4,
               notes: "Land title deed verification pending",
            },
            {
               id: "VER-002",
               farmerName: "Fatima Zahra",
               clusterName: "Kaduna East Cluster",
               submissionDate: new Date(Date.now() - 172800000).toISOString(),
               status: "PENDING",
               documents: 3,
               notes: "Identity verification required",
            },
            {
               id: "VER-003",
               farmerName: "Samuel Nwosu",
               clusterName: "Ogun Rice Cluster",
               submissionDate: new Date(Date.now() - 259200000).toISOString(),
               status: "APPROVED",
               documents: 6,
               notes: "All criteria met",
            },
            {
               id: "VER-004",
               farmerName: "Amina Yusuf",
               clusterName: "Jigawa Central",
               submissionDate: new Date(Date.now() - 432000000).toISOString(),
               status: "REJECTED",
               documents: 2,
               notes: "Incomplete farm map coordinates",
            },
            {
               id: "VER-005",
               farmerName: "Olumide Bakare",
               clusterName: "Oyo Maize Cluster",
               submissionDate: new Date(Date.now() - 604800000).toISOString(),
               status: "UNDER_REVIEW",
               documents: 5,
               notes: "Confirming bank details",
            },
            {
               id: "VER-006",
               farmerName: "Zainab Usman",
               clusterName: "Plateau Ginger",
               submissionDate: new Date().toISOString(),
               status: "PENDING",
               documents: 4,
               notes: "New submission",
            },
         ];
         setVerifications(mockVerifications);
         setFilteredVerifications(mockVerifications);
         setLoading(false);
      };
      fetchVerifications();
   }, []);

   useEffect(() => {
      let filtered = verifications;

      if (searchTerm) {
         filtered = filtered.filter(
            (ver) =>
               ver.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               ver.clusterName?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (statusFilter) {
         filtered = filtered.filter((ver) => ver.status === statusFilter);
      }

      setFilteredVerifications(filtered);
   }, [searchTerm, statusFilter, verifications]);

   const handleApprove = async (id) => {
      try {
         const res = await fetch(`/api/proxy/field-operations/verifications/${id}/approve`, {
            method: "POST",
         });
         if (res.ok) {
            setVerifications(verifications.map((v) => (v.id === id ? { ...v, status: "APPROVED" } : v)));
            toast.success("Verification approved");
         }
      } catch (err) {
         console.error("Error approving verification:", err);
      }
   };

   const handleReject = async (id) => {
      try {
         const res = await fetch(`/api/proxy/field-operations/verifications/${id}/reject`, {
            method: "POST",
         });
         if (res.ok) {
            setVerifications(verifications.map((v) => (v.id === id ? { ...v, status: "REJECTED" } : v)));
            toast.success("Verification rejected");
         }
      } catch (err) {
         console.error("Error rejecting verification:", err);
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case "APPROVED":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
         case "REJECTED":
            return <AlertCircle className="w-4 h-4 text-red-500" />;
         default:
            return <Clock className="w-4 h-4 text-yellow-500" />;
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case "APPROVED":
            return "bg-green-100 text-green-700";
         case "REJECTED":
            return "bg-red-100 text-red-700";
         case "UNDER_REVIEW":
            return "bg-orange-100 text-orange-700";
         default:
            return "bg-yellow-100 text-yellow-700";
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
         </div>
      );
   }

   const pendingCount = verifications.filter((v) => v.status === "PENDING" || v.status === "UNDER_REVIEW").length;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold text-(--foreground)">Verification Queue</h1>
            <p className="text-gray-500 mt-1">Review and approve farmer verifications.</p>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold mt-2">{verifications.length}</p>
               </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
               <CardContent className="p-6">
                  <p className="text-yellow-700 text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold mt-2 text-yellow-700">{pendingCount}</p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Approved</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                     {verifications.filter((v) => v.status === "APPROVED").length}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-2xl font-bold mt-2 text-red-600">
                     {verifications.filter((v) => v.status === "REJECTED").length}
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
                        placeholder="Farmer name or cluster..."
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

         {/* Verifications Table */}
         <Card>
            <CardHeader>
               <CardTitle>Verification Submissions ({filteredVerifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">ID</th>
                           <th className="text-left py-3 px-4 font-semibold">Farmer</th>
                           <th className="text-left py-3 px-4 font-semibold">Cluster</th>
                           <th className="text-left py-3 px-4 font-semibold">Submitted</th>
                           <th className="text-left py-3 px-4 font-semibold">Documents</th>
                           <th className="text-left py-3 px-4 font-semibold">Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredVerifications.map((ver) => (
                           <tr
                              key={ver.id}
                              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                           >
                              <td className="py-3 px-4 font-medium">{ver.id}</td>
                              <td className="py-3 px-4">{ver.farmerName}</td>
                              <td className="py-3 px-4">{ver.clusterName}</td>
                              <td className="py-3 px-4 text-sm">{new Date(ver.submissionDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4">{ver.documents} docs</td>
                              <td className="py-3 px-4">
                                 <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(ver.status)}`}
                                 >
                                    {getStatusIcon(ver.status)}
                                    {ver.status.replace(/_/g, " ")}
                                 </span>
                              </td>
                              <td className="py-3 px-4">
                                 {ver.status === "PENDING" || ver.status === "UNDER_REVIEW" ? (
                                    <div className="flex gap-2">
                                       <Button
                                          onClick={() => handleApprove(ver.id)}
                                          size="sm"
                                          variant="ghost"
                                          className="text-green-600 hover:bg-green-50"
                                       >
                                          Approve
                                       </Button>
                                       <Button
                                          onClick={() => handleReject(ver.id)}
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600 hover:bg-red-50"
                                       >
                                          Reject
                                       </Button>
                                    </div>
                                 ) : (
                                    <span className="text-gray-500 text-sm">—</span>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredVerifications.length === 0 && (
                     <div className="text-center py-8 text-gray-500">No verifications found</div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
