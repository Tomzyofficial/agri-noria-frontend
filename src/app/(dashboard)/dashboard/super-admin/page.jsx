"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  FaUsersCog, FaServer, FaShieldAlt, FaChartPie, FaSearch, 
  FaCheckCircle, FaTimes, FaTractor, FaEye, FaBan, FaImage,
  FaMapMarkerAlt, FaExternalLinkAlt, FaFileContract, FaIdCard
} from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2, Maximize2, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export default function SuperAdminDashboard() {
   const [users, setUsers] = useState([]);
   const [buyers, setBuyers] = useState([]);
   const [roleCounts, setRoleCounts] = useState([]);
   const [totalVendors, setTotalVendors] = useState(0);
   const [totalBuyers, setTotalBuyers] = useState(0);
   const [loading, setLoading] = useState(true);
   
   // Filters & Pagination State
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(10);
   const [searchTerm, setSearchTerm] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [activeTab, setActiveTab] = useState("vendors"); // 'vendors', 'buyers', 'pending'
   const [selectedRole, setSelectedRole] = useState(null);
   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
   const [totalPendingCount, setTotalPendingCount] = useState(0);
   const [rolePendingCount, setRolePendingCount] = useState(0);

   // Action States
   const [approvingId, setApprovingId] = useState(null);
   const [rejectingId, setRejectingId] = useState(null);
   const [selectedFarmerModal, setSelectedFarmerModal] = useState(null);
   const [enlargedImage, setEnlargedImage] = useState(null); // { url, title }

   // Debounce search input by 350ms
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(searchTerm);
         setPage(1);
      }, 350);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   // Fetch paginated and filtered users from backend
   const fetchUsers = useCallback(async () => {
      try {
         setLoading(true);
         const queryParams = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            search: debouncedSearch.trim(),
            role: selectedRole || "",
            tab: activeTab === "pending" ? "pending" : "all",
         });

         const res = await fetch(`/api/proxy/admin/users?${queryParams.toString()}`);
         if (res.ok) {
            const json = await res.json();
            if (json.success) {
               setUsers(json.data.vendors || []);
               setBuyers(json.data.buyers || []);
               setRoleCounts(json.data.roleCounts || []);
               setTotalVendors(json.data.totalVendors || 0);
               setTotalBuyers(json.data.totalBuyers || 0);
               setPagination(json.data.pagination || { total: 0, page, limit, totalPages: 1 });
               setTotalPendingCount(json.data.totalPendingCount || 0);
               setRolePendingCount(json.data.rolePendingCount || 0);
            }
         }
      } catch (err) {
         console.error("Failed to fetch users:", err);
         toast.error("Failed to fetch users");
      } finally {
         setLoading(false);
      }
   }, [page, limit, debouncedSearch, selectedRole, activeTab]);

   useEffect(() => {
      fetchUsers();
   }, [fetchUsers]);

   const handleToggleSuspension = async (userId, currentStatus) => {
      if (!confirm(`Are you sure you want to ${currentStatus ? "activate" : "suspend"} this account?`)) return;

      try {
         const res = await fetch("/api/proxy/admin/users/toggle-suspension", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, suspended: !currentStatus }),
         });

         if (res.ok) {
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_suspended: !currentStatus } : u)));
            toast.success(`User ${!currentStatus ? "suspended" : "activated"} successfully`);
         } else {
            const err = await res.json();
            toast.error(err.error || "Failed to update status");
         }
      } catch (err) {
         console.error("Error toggling suspension:", err);
         toast.error("An error occurred");
      }
   };

   // Verify & Approve user (Generates Farm ID for Farmers)
   const handleApproveUser = async (userId, userRole) => {
      try {
         setApprovingId(userId);
         const res = await fetch(`/api/proxy/admin/users/${userId}/approval`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
         });

         const json = await res.json();
         if (res.ok && json.success) {
            const updated = json.data;
            setUsers((prev) =>
               prev.map((u) =>
                  u.id === userId
                     ? {
                          ...u,
                          is_verified: true,
                          approval_status: "approved",
                          onboarding_status: "verified",
                          farm_id: updated.farm_id || u.farm_id,
                       }
                     : u
               )
            );

            // Update pending counters
            setTotalPendingCount((prev) => Math.max(0, prev - 1));
            setRolePendingCount((prev) => Math.max(0, prev - 1));

            const farmIdMsg = updated.farm_id ? ` Assigned Farm ID: ${updated.farm_id}` : "";
            toast.success(`${userRole === 'farmer' ? 'Farmer' : 'User'} approved & verified!${farmIdMsg}`);

            if (selectedFarmerModal?.id === userId) {
               setSelectedFarmerModal((prev) => ({
                  ...prev,
                  is_verified: true,
                  approval_status: "approved",
                  onboarding_status: "verified",
                  farm_id: updated.farm_id || prev.farm_id,
               }));
            }
         } else {
            toast.error(json.error || "Failed to approve user");
         }
      } catch (err) {
         console.error("Error approving user:", err);
         toast.error("Failed to approve user");
      } finally {
         setApprovingId(null);
      }
   };

   // Reject user verification
   const handleRejectUser = async (userId, userRole) => {
      if (!confirm(`Are you sure you want to reject verification for this ${userRole === 'farmer' ? 'farmer' : 'user'}?`)) return;

      try {
         setRejectingId(userId);
         const res = await fetch(`/api/proxy/admin/users/${userId}/approval`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "rejected" }),
         });

         const json = await res.json();
         if (res.ok && json.success) {
            setUsers((prev) =>
               prev.map((u) =>
                  u.id === userId
                     ? {
                          ...u,
                          is_verified: false,
                          approval_status: "rejected",
                          onboarding_status: "rejected",
                       }
                     : u
               )
            );

            toast.info(`${userRole === 'farmer' ? 'Farmer' : 'User'} verification was rejected.`);

            if (selectedFarmerModal?.id === userId) {
               setSelectedFarmerModal((prev) => ({
                  ...prev,
                  is_verified: false,
                  approval_status: "rejected",
                  onboarding_status: "rejected",
               }));
            }
         } else {
            toast.error(json.error || "Failed to reject user");
         }
      } catch (err) {
         console.error("Error rejecting user:", err);
         toast.error("Failed to process rejection");
      } finally {
         setRejectingId(null);
      }
   };

   // Helper: count submitted images
   const getFarmerImageCount = (u) => {
      let count = 0;
      if (u.farm_entrance_photo_url || u.farm_image_url) count++;
      if (u.farm_interior_photo_url) count++;
      if (u.crop_photo_url) count++;
      if (u.land_title_url || u.lease_agreement_url) count++;
      if (u.id_front_url) count++;
      if (u.live_selfie_url) count++;
      return count;
   };

   const filteredBuyers = buyers.filter((b) => {
      return (
         b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.auth_provider?.toLowerCase().includes(searchTerm.toLowerCase())
      );
   });

   const getRoleBadgeColor = (role) => {
      switch (role?.toLowerCase()) {
         case "farmer":
            return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
         case "aggregator":
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
         case "sales manager":
         case "sales":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
         case "input provider":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
         case "cooperative":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
         case "super admin":
         case "admin":
            return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
         default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      }
   };

   // Contextual Pending Count: If a role is selected (e.g. Farmer), display that role's pending count.
   // If All Users is selected, display total pending count across all roles.
   const displayPendingBadge = selectedRole ? rolePendingCount : totalPendingCount;

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         {/* Top Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-(--foreground)">Platform Administration</h1>
               <p className="text-sm text-gray-500 mt-1">
                  Ecosystem Governance, Multi-Warehouse Operations, Farmer Verification & Global Asset Controls
               </p>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-blue-500 text-white rounded-full"><FaUsersCog size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Vendors</p>
                     <p className="text-2xl font-bold text-(--foreground)">{totalVendors}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-amber-500 text-white rounded-full"><FaTractor size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Pending Approvals {selectedRole && <span className="capitalize">({selectedRole})</span>}
                     </p>
                     <p className="text-2xl font-bold text-(--foreground)">
                        {displayPendingBadge}
                     </p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-purple-500 text-white rounded-full"><FaChartPie size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Buyers</p>
                     <p className="text-2xl font-bold text-(--foreground)">{totalBuyers}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-green-500 text-white rounded-full"><FaShieldAlt size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-green-700 dark:text-green-300">System Status</p>
                     <p className="text-2xl font-bold text-(--foreground)">Online</p>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Role Breakdown Filter Pills */}
         <Card>
            <CardHeader>
               <CardTitle>Filter by Role</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-2.5">
                  <button
                     onClick={() => {
                        setSelectedRole(null);
                        setPage(1);
                     }}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        !selectedRole 
                           ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 bg-blue-600 text-white shadow-xs" 
                           : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                     }`}
                  >
                     All Users
                  </button>
                  {roleCounts.map((r, i) => (
                     <button
                        key={i}
                        onClick={() => {
                           setSelectedRole(selectedRole === r.role ? null : r.role);
                           setPage(1);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${getRoleBadgeColor(r.role)} ${
                           selectedRole === r.role 
                              ? "ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-current scale-105 font-bold shadow-xs" 
                              : "opacity-80 hover:opacity-100"
                        }`}
                     >
                        <span className="capitalize">{r.role}</span>
                        <span className="font-bold opacity-80">({r.count})</span>
                     </button>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* User Management & Farmer Verification Table */}
         <Card>
            <CardHeader>
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <CardTitle>Ecosystem Verification & User Management</CardTitle>
                     <p className="text-xs text-gray-500 mt-1">Review onboarding submissions, inspect farm photos & documents, and approve or reject verification.</p>
                  </div>
                  <div className="relative">
                     <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search name, email, role, Farm ID, or farm name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-(--foreground) text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
               </div>

               {/* Navigation Tabs */}
               <div className="flex flex-wrap items-center justify-between gap-2 mt-4 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex flex-wrap gap-2">
                     <button
                        onClick={() => {
                           setActiveTab("vendors");
                           setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                           activeTab === "vendors" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        }`}
                     >
                        All Vendors ({selectedRole ? pagination.total : totalVendors})
                     </button>
                     <button
                        onClick={() => {
                           setActiveTab("pending");
                           setPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                           activeTab === "pending" ? "bg-yellow-500 text-white shadow-xs" : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100"
                        }`}
                     >
                        <span>Pending Verification</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 font-bold">
                           {displayPendingBadge}
                        </span>
                     </button>
                     <button
                        onClick={() => {
                           setActiveTab("buyers");
                           setPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                           activeTab === "buyers" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        }`}
                     >
                        Buyers ({totalBuyers})
                     </button>
                  </div>

                  {/* Rows Per Page Selector */}
                  {activeTab !== "buyers" && (
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Show:</span>
                        <select
                           value={limit}
                           onChange={(e) => {
                              setLimit(Number(e.target.value));
                              setPage(1);
                           }}
                           className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-(--foreground) font-medium"
                        >
                           <option value={10}>10 rows</option>
                           <option value={20}>20 rows</option>
                           <option value={50}>50 rows</option>
                        </select>
                     </div>
                  )}
               </div>
            </CardHeader>

            <CardContent>
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                     <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                     <span className="text-xs text-gray-500">Loading records...</span>
                  </div>
               ) : activeTab === "buyers" ? (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                              <th className="text-center py-3 px-3 font-semibold w-12">S/N</th>
                              <th className="text-left py-3 px-4 font-semibold">Name</th>
                              <th className="text-left py-3 px-4 font-semibold">Email</th>
                              <th className="text-left py-3 px-4 font-semibold">Auth Provider</th>
                              <th className="text-left py-3 px-4 font-semibold">Joined</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredBuyers.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="text-center py-12 text-gray-400">No buyers found</td>
                              </tr>
                           ) : (
                              filteredBuyers.map((buyer, idx) => (
                                 <tr key={buyer.buyer_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="py-3 px-3 text-center font-mono text-xs font-semibold text-gray-400">{idx + 1}</td>
                                    <td className="py-3 px-4 font-medium text-(--foreground)">{buyer.name || "—"}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{buyer.email}</td>
                                    <td className="py-3 px-4">
                                       <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                          {buyer.auth_provider}
                                       </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">
                                       {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString() : "—"}
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                              <th className="text-center py-3 px-3 font-semibold w-14">S/N</th>
                              <th className="text-left py-3 px-4 font-semibold">User / Farmer</th>
                              <th className="text-left py-3 px-4 font-semibold">Role</th>
                              <th className="text-left py-3 px-4 font-semibold">Farm & Evidence</th>
                              <th className="text-left py-3 px-4 font-semibold">Verification & Farm ID</th>
                              <th className="text-left py-3 px-4 font-semibold">Joined</th>
                              <th className="text-right py-3 px-4 font-semibold">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.length === 0 ? (
                              <tr>
                                 <td colSpan={7} className="text-center py-16 text-gray-400">
                                    {activeTab === "pending" 
                                       ? `No pending verifications found for ${selectedRole || 'any role'} 🎉` 
                                       : "No records found matching your filter criteria"}
                                 </td>
                              </tr>
                           ) : (
                              users.map((user, idx) => {
                                 const isPending = !user.is_verified || user.approval_status === "pending_approval" || user.onboarding_status === "unverified";
                                 const isRejected = user.approval_status === "rejected";
                                 const isFarmer = user.role?.toLowerCase() === "farmer";
                                 const imageCount = getFarmerImageCount(user);
                                 const primaryPhoto = user.farm_entrance_photo_url || user.farm_image_url || user.farm_interior_photo_url || user.live_selfie_url;
                                 const serialNumber = (page - 1) * limit + idx + 1;

                                 return (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                       {/* S/N SERIAL NUMBER */}
                                       <td className="py-3 px-3 text-center font-mono text-xs font-bold text-gray-500">
                                          {serialNumber}
                                       </td>

                                       {/* User Identity */}
                                       <td className="py-3 px-4">
                                          <div className="flex items-center gap-3">
                                             {primaryPhoto ? (
                                                <button
                                                   onClick={() => setEnlargedImage({ url: primaryPhoto, title: `${user.fname} ${user.lname} - Farm Photo` })}
                                                   className="relative group w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer"
                                                   title="Click to enlarge"
                                                >
                                                   <img src={primaryPhoto} alt="Farm" className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                                   <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                                                   </div>
                                                </button>
                                             ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                                                   {isFarmer ? <FaTractor className="w-4 h-4 text-emerald-600" /> : <FaUsersCog className="w-4 h-4 text-blue-500" />}
                                                </div>
                                             )}
                                             <div>
                                                <div className="font-semibold text-(--foreground) flex items-center gap-1.5">
                                                   <span>{user.fname} {user.lname}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                                {user.phone && <div className="text-[11px] text-gray-400">{user.phone}</div>}
                                             </div>
                                          </div>
                                       </td>

                                       {/* Role Badge */}
                                       <td className="py-3 px-4">
                                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                                             {user.role}
                                          </span>
                                       </td>

                                       {/* Farm & Photo Evidence Summary */}
                                       <td className="py-3 px-4">
                                          {isFarmer ? (
                                             <div className="space-y-1">
                                                <div className="text-xs font-medium text-(--foreground) flex items-center gap-1">
                                                   <FaTractor className="text-emerald-600 w-3 h-3" />
                                                   <span>{user.farm_name || "Main Farm"}</span>
                                                   {user.farm_size_hectares && (
                                                      <span className="text-[11px] text-gray-500 font-normal">({user.farm_size_hectares} ha)</span>
                                                   )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   {imageCount > 0 ? (
                                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                         <FaImage className="w-2.5 h-2.5" />
                                                         <span>{imageCount} Photo{imageCount > 1 ? "s" : ""} / Docs</span>
                                                      </span>
                                                   ) : (
                                                      <span className="text-[11px] text-gray-400 italic">No photos submitted</span>
                                                   )}
                                                   {user.commodity && (
                                                      <span className="text-[11px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                         {user.commodity}
                                                      </span>
                                                   )}
                                                </div>
                                             </div>
                                          ) : (
                                             <span className="text-xs text-gray-400">—</span>
                                          )}
                                       </td>

                                       {/* Verification Status & Farm ID */}
                                       <td className="py-3 px-4">
                                          <div className="flex flex-col gap-1 items-start">
                                             {user.is_verified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                   <FaCheckCircle className="w-3 h-3" /> Verified
                                                </span>
                                             ) : isRejected ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                   <FaBan className="w-3 h-3" /> Rejected
                                                </span>
                                             ) : (user.onboarding_level > 0 || imageCount > 0 || user.onboarding_status === 'unverified') ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                   Pending Review
                                                </span>
                                             ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                   Onboarding Incomplete
                                                </span>
                                             )}

                                             {/* Farm ID Badge */}
                                             {user.farm_id ? (
                                                <span className="font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                                   ID: {user.farm_id}
                                                </span>
                                             ) : isFarmer && (
                                                <span className="text-[10px] text-gray-400">
                                                   {user.is_verified ? "ID Generated" : (user.onboarding_level > 0 || imageCount > 0) ? "ID Pending approval" : "Awaiting onboarding"}
                                                </span>
                                             )}

                                             {user.is_suspended && (
                                                <span className="px-2 py-0.5 text-[10px] rounded font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                                   Suspended
                                                </span>
                                             )}
                                          </div>
                                       </td>

                                       {/* Joined */}
                                       <td className="py-3 px-4 text-gray-500 text-xs">
                                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                       </td>

                                       {/* Action Buttons */}
                                       <td className="py-3 px-4 text-right">
                                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                             {/* 1. APPROVE BUTTON */}
                                             {isPending && (
                                                <button
                                                   onClick={() => handleApproveUser(user.id, user.role?.toLowerCase())}
                                                   disabled={approvingId === user.id || rejectingId === user.id}
                                                   title="Approve user and generate official Farm ID"
                                                   className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                   {approvingId === user.id ? (
                                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                   ) : (
                                                      <FaCheckCircle className="w-3.5 h-3.5" />
                                                   )}
                                                   <span>Approve</span>
                                                </button>
                                             )}

                                             {/* 2. REJECT BUTTON */}
                                             {isPending && (
                                                <button
                                                   onClick={() => handleRejectUser(user.id, user.role?.toLowerCase())}
                                                   disabled={approvingId === user.id || rejectingId === user.id}
                                                   title="Reject onboarding verification"
                                                   className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                   {rejectingId === user.id ? (
                                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                   ) : (
                                                      <FaBan className="w-3.5 h-3.5" />
                                                   )}
                                                   <span>Reject</span>
                                                </button>
                                             )}

                                             {/* 3. INSPECT ONBOARDING DETAILS & PHOTOS */}
                                             <button
                                                onClick={() => setSelectedFarmerModal(user)}
                                                title="View full onboarding details and photos"
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                                             >
                                                <FaEye className="w-3 h-3" />
                                                <span>Details & Photos</span>
                                             </button>

                                             {/* 4. SUSPEND / ACTIVATE */}
                                             <button
                                                onClick={() => handleToggleSuspension(user.id, user.is_suspended)}
                                                className={`px-2 py-1.5 text-xs rounded-lg font-medium transition cursor-pointer ${user.is_suspended ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"}`}
                                             >
                                                {user.is_suspended ? "Activate" : "Suspend"}
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })
                           )}
                        </tbody>
                     </table>
                  </div>
               )}

               {/* BACKEND PAGINATION CONTROLS */}
               {activeTab !== "buyers" && pagination.total > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                     <div className="flex items-center gap-2">
                        <span>
                           Showing <strong className="text-(--foreground)">{(page - 1) * limit + 1}</strong> to{" "}
                           <strong className="text-(--foreground)">{Math.min(page * limit, pagination.total)}</strong> of{" "}
                           <strong className="text-(--foreground)">{pagination.total}</strong> records
                           {selectedRole && <span className="ml-1 text-emerald-600 font-semibold capitalize">({selectedRole})</span>}
                        </span>
                     </div>

                     <div className="flex items-center gap-1.5">
                        <button
                           onClick={() => setPage(1)}
                           disabled={page === 1 || loading}
                           className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                           title="First Page"
                        >
                           « First
                        </button>
                        <button
                           onClick={() => setPage((p) => Math.max(1, p - 1))}
                           disabled={page === 1 || loading}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                        >
                           <ChevronLeft className="w-3.5 h-3.5" />
                           <span>Prev</span>
                        </button>

                        {/* Numbered Page Buttons */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                           let pNum = i + 1;
                           if (pagination.totalPages > 5) {
                              if (page > 3 && page < pagination.totalPages - 1) {
                                 pNum = page - 2 + i;
                              } else if (page >= pagination.totalPages - 1) {
                                 pNum = pagination.totalPages - 4 + i;
                              }
                           }
                           return (
                              <button
                                 key={pNum}
                                 onClick={() => setPage(pNum)}
                                 className={`w-8 h-8 rounded-lg font-semibold transition cursor-pointer text-xs ${
                                    page === pNum
                                       ? "bg-blue-600 text-white shadow-xs"
                                       : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-(--foreground)"
                                 }`}
                              >
                                 {pNum}
                              </button>
                           );
                        })}

                        <button
                           onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                           disabled={page >= pagination.totalPages || loading}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                        >
                           <span>Next</span>
                           <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                           onClick={() => setPage(pagination.totalPages)}
                           disabled={page >= pagination.totalPages || loading}
                           className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                           title="Last Page"
                        >
                           Last »
                        </button>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

         {/* ======================================================= */}
         {/* ONBOARDING INSPECTION, PHOTO EVIDENCE & DECISION MODAL */}
         {/* ======================================================= */}
         {selectedFarmerModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                           <FaTractor className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h2 className="text-lg font-bold text-(--foreground)">
                                 Onboarding & Farm Evidence Review
                              </h2>
                              <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold capitalize ${getRoleBadgeColor(selectedFarmerModal.role)}`}>
                                 {selectedFarmerModal.role}
                              </span>
                           </div>
                           <p className="text-xs text-gray-500">
                              Verify farmer identity, agricultural land evidence, and photos to approve or reject.
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSelectedFarmerModal(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                     >
                        <FaTimes className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Scrollable Body Content */}
                  <div className="p-6 overflow-y-auto space-y-6 flex-1">
                     
                     {/* 1. Status Banner */}
                     <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-medium ${
                        selectedFarmerModal.is_verified 
                           ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                           : selectedFarmerModal.approval_status === "rejected"
                           ? "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                           : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                     }`}>
                        <div className="flex items-center gap-2">
                           {selectedFarmerModal.is_verified ? (
                              <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                           ) : selectedFarmerModal.approval_status === "rejected" ? (
                              <FaBan className="w-4 h-4 text-red-600 shrink-0" />
                           ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
                           )}
                           <span>
                              Verification Status: <strong className="capitalize">{selectedFarmerModal.is_verified ? "Approved & Verified" : selectedFarmerModal.approval_status === "rejected" ? "Rejected" : "Pending Review"}</strong>
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           {selectedFarmerModal.farm_id ? (
                              <span className="font-mono font-bold bg-white dark:bg-gray-800 px-2.5 py-1 rounded shadow-xs border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                                 Official Farm ID: {selectedFarmerModal.farm_id}
                              </span>
                           ) : (
                              <span className="text-amber-700 dark:text-amber-300 italic">
                                 Farm ID will be generated upon approval (Format: NG-XXX)
                              </span>
                           )}
                        </div>
                     </div>

                     {/* 2. Farmer & Farm Overview Details */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Farmer Name</p>
                           <p className="font-semibold text-(--foreground) mt-0.5">{selectedFarmerModal.fname} {selectedFarmerModal.lname}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Email Address</p>
                           <p className="font-medium text-(--foreground) mt-0.5 break-all text-xs">{selectedFarmerModal.email}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Phone</p>
                           <p className="font-medium text-(--foreground) mt-0.5">{selectedFarmerModal.phone || "—"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Cooperative</p>
                           <p className="font-medium text-(--foreground) mt-0.5">{selectedFarmerModal.cooperative || "Independent"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Farm Name</p>
                           <p className="font-medium text-(--foreground) mt-0.5">{selectedFarmerModal.farm_name || "Main Farm"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Primary Commodity</p>
                           <p className="font-medium text-(--foreground) mt-0.5">{selectedFarmerModal.commodity || "General Crops"}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Farm Size</p>
                           <p className="font-semibold text-(--foreground) mt-0.5">
                              {selectedFarmerModal.farm_size_hectares ? `${selectedFarmerModal.farm_size_hectares} Hectares` : "Not specified"}
                           </p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                           <p className="text-xs text-gray-500">Location / GPS</p>
                           {selectedFarmerModal.latitude && selectedFarmerModal.longitude ? (
                              <a
                                 href={`https://www.google.com/maps?q=${selectedFarmerModal.latitude},${selectedFarmerModal.longitude}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5 font-medium"
                              >
                                 <FaMapMarkerAlt className="w-3 h-3 text-red-500" />
                                 <span>{Number(selectedFarmerModal.latitude).toFixed(4)}, {Number(selectedFarmerModal.longitude).toFixed(4)}</span>
                                 <FaExternalLinkAlt className="w-2.5 h-2.5" />
                              </a>
                           ) : (
                              <p className="font-medium text-(--foreground) mt-0.5 text-xs">{selectedFarmerModal.location_address || "No GPS recorded"}</p>
                           )}
                        </div>
                     </div>

                     {/* 3. Farm Images & Evidence Gallery */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                           <h3 className="text-sm font-bold text-(--foreground) flex items-center gap-2">
                              <FaImage className="text-emerald-600" />
                              <span>Farm Photographs & Land Evidence</span>
                           </h3>
                           <span className="text-xs text-gray-500">
                              Click any photograph to view high-resolution inspection
                           </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {/* Farm Entrance Photo */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 flex flex-col">
                              <div className="p-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                 <span className="text-xs font-semibold text-(--foreground)">Farm Entrance</span>
                                 {selectedFarmerModal.farm_entrance_photo_url || selectedFarmerModal.farm_image_url ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Uploaded</span>
                                 ) : (
                                    <span className="text-[10px] text-gray-400">Missing</span>
                                 )}
                              </div>
                              <div className="h-44 flex items-center justify-center relative group bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.farm_entrance_photo_url || selectedFarmerModal.farm_image_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({
                                          url: selectedFarmerModal.farm_entrance_photo_url || selectedFarmerModal.farm_image_url,
                                          title: `Farm Entrance Photo - ${selectedFarmerModal.farm_name || selectedFarmerModal.fname}`
                                       })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img
                                          src={selectedFarmerModal.farm_entrance_photo_url || selectedFarmerModal.farm_image_url}
                                          alt="Farm Entrance"
                                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                       />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <div className="bg-white/90 dark:bg-gray-900/90 text-(--foreground) px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow">
                                             <Maximize2 className="w-3.5 h-3.5" />
                                             <span>Inspect Photo</span>
                                          </div>
                                       </div>
                                    </button>
                                 ) : (
                                    <div className="text-center p-4 text-gray-400">
                                       <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                       <p className="text-xs">No entrance photo uploaded</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Farm Interior Photo */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 flex flex-col">
                              <div className="p-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                 <span className="text-xs font-semibold text-(--foreground)">Farm Interior</span>
                                 {selectedFarmerModal.farm_interior_photo_url ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Uploaded</span>
                                 ) : (
                                    <span className="text-[10px] text-gray-400">Missing</span>
                                 )}
                              </div>
                              <div className="h-44 flex items-center justify-center relative group bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.farm_interior_photo_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({
                                          url: selectedFarmerModal.farm_interior_photo_url,
                                          title: `Farm Interior Photo - ${selectedFarmerModal.farm_name || selectedFarmerModal.fname}`
                                       })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img
                                          src={selectedFarmerModal.farm_interior_photo_url}
                                          alt="Farm Interior"
                                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                       />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <div className="bg-white/90 dark:bg-gray-900/90 text-(--foreground) px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow">
                                             <Maximize2 className="w-3.5 h-3.5" />
                                             <span>Inspect Photo</span>
                                          </div>
                                       </div>
                                    </button>
                                 ) : (
                                    <div className="text-center p-4 text-gray-400">
                                       <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                       <p className="text-xs">No interior photo uploaded</p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Crop / Cultivation Photo */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 flex flex-col">
                              <div className="p-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                 <span className="text-xs font-semibold text-(--foreground)">Crop / Produce Photo</span>
                                 {selectedFarmerModal.crop_photo_url ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Uploaded</span>
                                 ) : (
                                    <span className="text-[10px] text-gray-400">Missing</span>
                                 )}
                              </div>
                              <div className="h-44 flex items-center justify-center relative group bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.crop_photo_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({
                                          url: selectedFarmerModal.crop_photo_url,
                                          title: `Crop / Harvest Photo - ${selectedFarmerModal.commodity || selectedFarmerModal.fname}`
                                       })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img
                                          src={selectedFarmerModal.crop_photo_url}
                                          alt="Crop / Produce"
                                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                       />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                          <div className="bg-white/90 dark:bg-gray-900/90 text-(--foreground) px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow">
                                             <Maximize2 className="w-3.5 h-3.5" />
                                             <span>Inspect Photo</span>
                                          </div>
                                       </div>
                                    </button>
                                 ) : (
                                    <div className="text-center p-4 text-gray-400">
                                       <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                       <p className="text-xs">No crop photo uploaded</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* 4. Legal Documents & Land Evidence */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                           <h3 className="text-sm font-bold text-(--foreground) flex items-center gap-2">
                              <FaFileContract className="text-blue-600" />
                              <span>Land Title, Lease & Legal Verification</span>
                           </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {/* Land Title Document */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
                              <div>
                                 <p className="text-xs font-semibold text-(--foreground)">Land Title / C of O / Lease Agreement</p>
                                 <p className="text-[11px] text-gray-500 mt-0.5">
                                    {selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url ? "Document submitted during onboarding" : "No land title submitted"}
                                 </p>
                              </div>
                              {selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url ? (
                                 <button
                                    type="button"
                                    onClick={() => setEnlargedImage({
                                       url: selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url,
                                       title: `Land Title Document - ${selectedFarmerModal.farm_name || selectedFarmerModal.fname}`
                                    })}
                                    className="px-3 py-1.5 text-xs rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1 cursor-pointer"
                                 >
                                    <FaEye className="w-3 h-3" />
                                    <span>Inspect Doc</span>
                                 </button>
                              ) : (
                                 <span className="text-xs text-gray-400 italic">None</span>
                              )}
                           </div>

                           {/* Community Attestation / Boundary File */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
                              <div>
                                 <p className="text-xs font-semibold text-(--foreground)">Boundary Polygon / GeoJSON Map</p>
                                 <p className="text-[11px] text-gray-500 mt-0.5">
                                    {selectedFarmerModal.boundary_file_url ? "Boundary shapefile/KML uploaded" : "No boundary shapefile uploaded"}
                                 </p>
                              </div>
                              {selectedFarmerModal.boundary_file_url ? (
                                 <a
                                    href={selectedFarmerModal.boundary_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 text-xs rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-(--foreground) transition flex items-center gap-1"
                                 >
                                    <FaExternalLinkAlt className="w-3 h-3" />
                                    <span>Download</span>
                                 </a>
                              ) : (
                                 <span className="text-xs text-gray-400 italic">None</span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* 5. Farmer Identity KYC Verification */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                           <h3 className="text-sm font-bold text-(--foreground) flex items-center gap-2">
                              <FaIdCard className="text-purple-600" />
                              <span>Identity Verification (KYC)</span>
                           </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           {/* Live Selfie */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-center">Live Selfie</div>
                              <div className="h-28 flex items-center justify-center bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.live_selfie_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({ url: selectedFarmerModal.live_selfie_url, title: `Farmer Live Selfie - ${selectedFarmerModal.fname}` })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img src={selectedFarmerModal.live_selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                    </button>
                                 ) : (
                                    <span className="text-xs text-gray-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* ID Front */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-center">ID Card Front</div>
                              <div className="h-28 flex items-center justify-center bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.id_front_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({ url: selectedFarmerModal.id_front_url, title: `ID Front - ${selectedFarmerModal.fname}` })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img src={selectedFarmerModal.id_front_url} alt="ID Front" className="w-full h-full object-cover" />
                                    </button>
                                 ) : (
                                    <span className="text-xs text-gray-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* ID Back */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-center">ID Card Back</div>
                              <div className="h-28 flex items-center justify-center bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.id_back_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({ url: selectedFarmerModal.id_back_url, title: `ID Back - ${selectedFarmerModal.fname}` })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img src={selectedFarmerModal.id_back_url} alt="ID Back" className="w-full h-full object-cover" />
                                    </button>
                                 ) : (
                                    <span className="text-xs text-gray-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* Trade License */}
                           <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 text-[11px] font-medium text-center">Operator License</div>
                              <div className="h-28 flex items-center justify-center bg-black/5 dark:bg-black/20">
                                 {selectedFarmerModal.license_url ? (
                                    <button
                                       type="button"
                                       onClick={() => setEnlargedImage({ url: selectedFarmerModal.license_url, title: `License - ${selectedFarmerModal.fname}` })}
                                       className="w-full h-full block cursor-pointer"
                                    >
                                       <img src={selectedFarmerModal.license_url} alt="License" className="w-full h-full object-cover" />
                                    </button>
                                 ) : (
                                    <span className="text-xs text-gray-400 italic">None</span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Modal Footer / Decision Bar (APPROVE OR REJECT) */}
                  <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
                     <button
                        onClick={() => setSelectedFarmerModal(null)}
                        className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                     >
                        Close
                     </button>

                     <div className="flex items-center gap-2">
                        {/* REJECT BUTTON */}
                        {selectedFarmerModal.approval_status !== "rejected" && (
                           <button
                              onClick={() => handleRejectUser(selectedFarmerModal.id, selectedFarmerModal.role?.toLowerCase())}
                              disabled={approvingId === selectedFarmerModal.id || rejectingId === selectedFarmerModal.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                           >
                              {rejectingId === selectedFarmerModal.id ? (
                                 <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Rejecting...</span>
                                 </>
                              ) : (
                                 <>
                                    <FaBan className="w-3.5 h-3.5" />
                                    <span>Reject Verification</span>
                                 </>
                              )}
                           </button>
                        )}

                        {/* APPROVE BUTTON */}
                        {!selectedFarmerModal.is_verified && (
                           <button
                              onClick={() => handleApproveUser(selectedFarmerModal.id, selectedFarmerModal.role?.toLowerCase())}
                              disabled={approvingId === selectedFarmerModal.id || rejectingId === selectedFarmerModal.id}
                              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all cursor-pointer disabled:opacity-50"
                           >
                              {approvingId === selectedFarmerModal.id ? (
                                 <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Approving & Assigning ID...</span>
                                 </>
                              ) : (
                                 <>
                                    <FaCheckCircle className="w-3.5 h-3.5" />
                                    <span>Approve & Generate Farm ID</span>
                                 </>
                              )}
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* ======================================================= */}
         {/* HIGH RESOLUTION LIGHTBOX MODAL FOR DETAILED INSPECTION  */}
         {/* ======================================================= */}
         {enlargedImage && (
            <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
               {/* Lightbox Toolbar */}
               <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-white">
                  <div className="flex items-center gap-2">
                     <FaImage className="text-emerald-400" />
                     <span className="font-medium text-sm">{enlargedImage.title || "Evidence Inspection"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <a
                        href={enlargedImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                     >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        <span>Open Original</span>
                     </a>
                     <button
                        onClick={() => setEnlargedImage(null)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                     >
                        <FaTimes className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               {/* Full Image Display */}
               <div className="max-w-5xl max-h-[82vh] w-full flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black">
                  <img
                     src={enlargedImage.url}
                     alt={enlargedImage.title || "Enlarged Evidence"}
                     className="max-h-[80vh] max-w-full object-contain rounded-lg"
                  />
               </div>
            </div>
         )}
      </div>
   );
}
