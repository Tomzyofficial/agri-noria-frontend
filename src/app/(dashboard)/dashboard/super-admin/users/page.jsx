"use client";
import dynamic from "next/dynamic";
import { 
  FaUsersCog, FaSearch, FaCheckCircle, FaTimes, FaTractor, 
  FaEye, FaBan, FaImage, FaMapMarkerAlt, FaExternalLinkAlt, 
  FaFileContract, FaIdCard, FaBuilding, FaFilter
} from "react-icons/fa";
import { FaSeedling } from "react-icons/fa6";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, Maximize2, ZoomIn, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, CheckSquare, Square, X, MapPin, FileText, Download, Copy, ExternalLink, Compass } from "lucide-react";
import { useNotifications } from "@/hooks/useNotificationContext";

const MapComponent = dynamic(() => import("@/app/(dashboard)/ecosystem/farmer/onboarding/MapComponent"), { ssr: false });

function UserManagementContent() {
   const searchParams = useSearchParams();
   const initialTab = searchParams.get("tab") === "pending" ? "pending" : "vendors";

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
   const [activeTab, setActiveTab] = useState(initialTab); // 'vendors', 'buyers', 'pending'
   const [selectedRole, setSelectedRole] = useState(null);
   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
   const [totalPendingCount, setTotalPendingCount] = useState(0);
   const [rolePendingCount, setRolePendingCount] = useState(0);

   // Action States
   const [approvingId, setApprovingId] = useState(null);
   const [rejectingId, setRejectingId] = useState(null);
   const [selectedFarmerModal, setSelectedFarmerModal] = useState(null);
   const [enlargedImage, setEnlargedImage] = useState(null); // { url, title }
   const [rejectionModalUser, setRejectionModalUser] = useState(null);
   const [rejectionReason, setRejectionReason] = useState("");
   const [rejectedSections, setRejectedSections] = useState([]);
   const [viewingPolygonModal, setViewingPolygonModal] = useState(null);
   const { lastEvent } = useNotifications();

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

   // Real-time auto-refresh when a user resubmits documents or updates status
   useEffect(() => {
      if (lastEvent?.type === "user_resubmitted" || lastEvent?.type === "new_notification") {
         fetchUsers();
      }
   }, [lastEvent, fetchUsers]);

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
            if (selectedFarmerModal?.id === userId) {
               setSelectedFarmerModal((prev) => (prev ? { ...prev, is_suspended: !currentStatus } : null));
            }
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
            const updated = json.data || {};
            setUsers((prev) =>
               prev.map((u) =>
                  u.id === userId
                     ? {
                          ...u,
                          is_verified: true,
                          approval_status: "approved",
                          onboarding_status: "verified",
                          is_resubmission: false,
                          farm_id: updated?.farm_id || u.farm_id,
                       }
                     : u
               )
            );

            // Update pending counters
            setTotalPendingCount((prev) => Math.max(0, prev - 1));
            setRolePendingCount((prev) => Math.max(0, prev - 1));

            const farmIdMsg = updated?.farm_id ? ` Assigned Farm ID: ${updated.farm_id}` : "";
            toast.success(`${userRole === 'farmer' ? 'Farmer' : 'User'} approved & verified!${farmIdMsg}`);

            if (selectedFarmerModal?.id === userId) {
               setSelectedFarmerModal((prev) =>
                  prev
                     ? {
                          ...prev,
                          is_verified: true,
                          approval_status: "approved",
                          onboarding_status: "verified",
                          is_resubmission: false,
                          farm_id: updated?.farm_id || prev?.farm_id || null,
                       }
                     : null
               );
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

   // Reject user verification with specific feedback and sections
   const handleConfirmReject = async (userId, userRole, reason, sections) => {
      try {
         setRejectingId(userId);
         const res = await fetch(`/api/proxy/admin/users/${userId}/approval`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               status: "rejected",
               rejection_reason: reason,
               rejected_sections: sections
            }),
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
                          is_resubmission: false,
                          rejection_reason: reason,
                          rejected_sections: sections,
                       }
                     : u
               )
            );

            toast.info(`${userRole === 'farmer' ? 'Farmer' : 'User'} rejected. Notification email and in-app instructions dispatched.`);
            setRejectionModalUser(null);

            if (selectedFarmerModal?.id === userId) {
               setSelectedFarmerModal((prev) =>
                  prev
                     ? {
                          ...prev,
                          is_verified: false,
                          approval_status: "rejected",
                          onboarding_status: "rejected",
                          is_resubmission: false,
                          rejection_reason: reason,
                          rejected_sections: sections,
                       }
                     : null
               );
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

   const displayPendingBadge = selectedRole ? rolePendingCount : totalPendingCount;

   return (
      <div className="max-w-7xl mx-auto space-y-7 text-left pb-12">
         {/* Top Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm">
            <div className="space-y-1">
               <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                     <FaUsersCog className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                     User Management & Approvals
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Verification Desk
                  </span>
               </div>
               <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  Review onboarding submissions, inspect farm photos & legal documents, manage roles, and approve or reject participants.
               </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
               <button
                  onClick={() => fetchUsers()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 hover:bg-slate-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-60"
                  title="Refresh live user records"
               >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
                  <span>{loading ? "Fetching..." : "Refresh Records"}</span>
               </button>
            </div>
         </div>

         {/* Prominent Live Loading Banner */}
         {loading && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs animate-pulse">
               <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
               <span>Fetching live user records & onboarding verification submissions from database...</span>
            </div>
         )}

         {/* Top KPI Summary Chips */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
               <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Registered Vendors</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{totalVendors}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  <FaSeedling className="w-5 h-5" />
               </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between ${
               displayPendingBadge > 0
                  ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
                  : "bg-white dark:bg-gray-950 border-slate-200/80 dark:border-gray-800"
            }`}>
               <div>
                  <div className="flex items-center gap-1.5">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                        Pending Approvals
                     </p>
                     {displayPendingBadge > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                     )}
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{displayPendingBadge}</p>
               </div>
               <button
                  type="button"
                  onClick={() => {
                     setActiveTab("pending");
                     setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
               >
                  View Queue
               </button>
            </div>

            <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between">
               <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Ecosystem Buyers</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{totalBuyers}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center font-bold text-sm">
                  <FaUsersCog className="w-5 h-5" />
               </div>
            </div>
         </div>

         {/* Role Breakdown Filter Container */}
         <div className="bg-white dark:bg-gray-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-gray-900 pb-3">
               <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <FaFilter className="text-emerald-600 w-3.5 h-3.5" />
                     <span>Filter Participants by Operational Role</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                     Quickly isolate specific stakeholder classes across institutional, farmer, logistics, and trading roles
                  </p>
               </div>
               {selectedRole && (
                  <button
                     onClick={() => {
                        setSelectedRole(null);
                        setPage(1);
                     }}
                     className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
                  >
                     Reset to All Roles ×
                  </button>
               )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
               <button
                  onClick={() => {
                     setSelectedRole(null);
                     setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                     !selectedRole 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105" 
                        : "bg-slate-100 hover:bg-emerald-50 dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-gray-800"
                  }`}
               >
                  <span>All Users</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${!selectedRole ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300"}`}>
                     {totalVendors}
                  </span>
               </button>

               {roleCounts.map((r, i) => {
                  const isSelected = selectedRole === r.role;
                  return (
                     <button
                        key={i}
                        onClick={() => {
                           setSelectedRole(isSelected ? null : r.role);
                           setPage(1);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                           isSelected
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105 font-bold"
                              : "bg-slate-100/80 hover:bg-emerald-50/70 dark:bg-gray-900/90 text-slate-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/70 dark:border-gray-800"
                        }`}
                     >
                        <span className="capitalize">{r.role}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                           isSelected 
                              ? "bg-white/25 text-white" 
                              : "bg-slate-200/70 dark:bg-gray-800 text-slate-600 dark:text-gray-400"
                        }`}>
                           {r.count}
                        </span>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Ecosystem Verification & User Management Table Container */}
         <div className="bg-white dark:bg-gray-950 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Header & Controls Area */}
            <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-gray-900 space-y-4">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                     <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Ecosystem Verification & User Management Table
                     </h2>
                     <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                        Inspect farmer onboarding submissions, land titles, GPS coordinates, and approve or reject accounts.
                     </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-80">
                     <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                     <input
                        type="text"
                        placeholder="Search name, email, role, or Farm ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-2xs"
                     />
                  </div>
               </div>

               {/* Navigation Tabs & Rows Selector */}
               <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-gray-900">
                  <div className="flex flex-wrap items-center gap-2">
                     <button
                        onClick={() => {
                           setActiveTab("vendors");
                           setPage(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                           activeTab === "vendors" 
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                              : "bg-slate-100 hover:bg-slate-200/70 dark:bg-gray-900 text-slate-600 dark:text-gray-400"
                        }`}
                     >
                        All Vendors ({selectedRole ? pagination.total : totalVendors})
                     </button>

                     <button
                        onClick={() => {
                           setActiveTab("pending");
                           setPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                           activeTab === "pending" 
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70"
                        }`}
                     >
                        <span>Pending Verification</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                           activeTab === "pending" ? "bg-white/25 text-white" : "bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200"
                        }`}>
                           {displayPendingBadge}
                        </span>
                     </button>

                     <button
                        onClick={() => {
                           setActiveTab("buyers");
                           setPage(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                           activeTab === "buyers" 
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                              : "bg-slate-100 hover:bg-slate-200/70 dark:bg-gray-900 text-slate-600 dark:text-gray-400"
                        }`}
                     >
                        Buyers ({totalBuyers})
                     </button>
                  </div>

                  {/* Rows Per Page Selector */}
                  {activeTab !== "buyers" && (
                     <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 font-medium">
                        <span>Show:</span>
                        <select
                           value={limit}
                           onChange={(e) => {
                              setLimit(Number(e.target.value));
                              setPage(1);
                           }}
                           className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-200 text-xs font-semibold outline-none cursor-pointer"
                        >
                           <option value={10}>10 rows</option>
                           <option value={20}>20 rows</option>
                           <option value={50}>50 rows</option>
                        </select>
                     </div>
                  )}
               </div>
            </div>

            {/* Table Content */}
            <div>
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                     <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                     <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                        Loading ecosystem participant records...
                     </span>
                  </div>
               ) : activeTab === "buyers" ? (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-xs">
                        <thead>
                           <tr className="bg-slate-50/80 dark:bg-gray-900/60 border-b border-slate-200/80 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                              <th className="py-3.5 px-4 text-center w-14">S/N</th>
                              <th className="py-3.5 px-4">Name</th>
                              <th className="py-3.5 px-4">Email</th>
                              <th className="py-3.5 px-4">Auth Provider</th>
                              <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Joined Date</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-900">
                           {filteredBuyers.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="text-center py-16 text-slate-400 font-medium">No buyers found</td>
                              </tr>
                           ) : (
                              filteredBuyers.map((buyer, idx) => (
                                 <tr key={buyer.buyer_id} className="hover:bg-slate-50/70 dark:hover:bg-gray-900/40 transition">
                                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{buyer.name || "—"}</td>
                                    <td className="py-4 px-4 text-slate-600 dark:text-gray-400 font-medium">{buyer.email}</td>
                                    <td className="py-4 px-4">
                                       <span className="px-2.5 py-1 text-[11px] rounded-lg font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 capitalize">
                                          {buyer.auth_provider}
                                       </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap min-w-[130px]">
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
                     <table className="w-full min-w-[1250px] text-left text-xs">
                        <thead>
                           <tr className="bg-slate-50/80 dark:bg-gray-900/60 border-b border-slate-200/80 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                              <th className="py-3.5 px-4 text-center w-14">S/N</th>
                              <th className="py-3.5 px-4 min-w-[220px]">User / Farmer</th>
                              <th className="py-3.5 px-4 min-w-[120px]">Role</th>
                              <th className="py-3.5 px-4 min-w-[180px]">Farm & Evidence</th>
                              <th className="py-3.5 px-4 min-w-[180px]">Verification & Farm ID</th>
                              <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Joined</th>
                              <th className="py-3.5 px-4 text-right min-w-[380px] whitespace-nowrap">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-900">
                           {users.length === 0 ? (
                              <tr>
                                 <td colSpan={7} className="text-center py-20 text-slate-400 font-medium">
                                    {activeTab === "pending" 
                                       ? `No pending verifications found for ${selectedRole || 'any role'} 🎉` 
                                       : "No records found matching your filter criteria"}
                                 </td>
                              </tr>
                           ) : (
                              users.map((user, idx) => {
                                 const isSuspended = Boolean(user.is_suspended);
                                 const isRejected = user.approval_status === "rejected";
                                 const isApproved = !isRejected && user.approval_status === "approved";
                                 const isPending = !isApproved && !isRejected && !isSuspended;
                                 const isFarmer = user.role?.toLowerCase() === "farmer";
                                 const imageCount = getFarmerImageCount(user);
                                 const primaryPhoto = user.farm_entrance_photo_url || user.farm_image_url || user.farm_interior_photo_url || user.live_selfie_url;
                                 const serialNumber = (page - 1) * limit + idx + 1;

                                 return (
                                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-900/40 transition-colors">
                                       {/* S/N */}
                                       <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">
                                          {serialNumber}
                                       </td>

                                       {/* User Identity */}
                                       <td className="py-4 px-4">
                                          <div className="flex items-center gap-3">
                                             {primaryPhoto ? (
                                                <button
                                                   onClick={() => setEnlargedImage({ url: primaryPhoto, title: `${user.fname} ${user.lname} - Farm Photo` })}
                                                   className="relative group w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 shrink-0 cursor-pointer shadow-xs"
                                                   title="Click to inspect photo"
                                                >
                                                   <img src={primaryPhoto} alt="Farm" className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                                                   </div>
                                                </button>
                                             ) : (
                                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 flex items-center justify-center text-slate-400 shrink-0">
                                                   {isFarmer ? <FaTractor className="w-4 h-4 text-emerald-600" /> : <FaUsersCog className="w-4 h-4 text-teal-600" />}
                                                </div>
                                             )}
                                             <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                   <span className="font-bold text-gray-900 dark:text-white">
                                                      {user.fname} {user.lname}
                                                   </span>
                                                   {user.is_resubmission && (
                                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
                                                         Revision
                                                      </span>
                                                   )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-medium">{user.email}</div>
                                                {user.phone && <div className="text-[10px] text-slate-400">{user.phone}</div>}
                                             </div>
                                          </div>
                                       </td>

                                       {/* Role Badge */}
                                       <td className="py-4 px-4">
                                          <span className="px-2.5 py-1 text-[11px] rounded-lg font-bold capitalize bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700">
                                             {user.role}
                                          </span>
                                       </td>

                                       {/* Farm & Photo Evidence Summary */}
                                       <td className="py-4 px-4">
                                          {isFarmer ? (
                                             <div className="space-y-1">
                                                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                   <FaTractor className="text-emerald-600 w-3 h-3 shrink-0" />
                                                   <span className="truncate">{user.farm_name || "Main Farm"}</span>
                                                   {user.farm_size_hectares && (
                                                      <span className="text-[10px] text-slate-400 font-normal shrink-0">({user.farm_size_hectares} ha)</span>
                                                   )}
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                   {imageCount > 0 ? (
                                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                                         <FaImage className="w-2.5 h-2.5" />
                                                         <span>{imageCount} Photo{imageCount > 1 ? "s" : ""}</span>
                                                      </span>
                                                   ) : (
                                                      <span className="text-[10px] text-slate-400 italic">No photos</span>
                                                   )}
                                                   {user.commodity && (
                                                      <span className="text-[10px] text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-medium">
                                                         {user.commodity}
                                                      </span>
                                                   )}
                                                   {user.boundary_polygon && user.boundary_polygon !== "[]" && user.boundary_polygon !== '""' && (
                                                      <button
                                                         type="button"
                                                         onClick={() => setViewingPolygonModal({
                                                            polygon: user.boundary_polygon,
                                                            farmName: user.farm_name || user.fname,
                                                            hectares: user.farm_size_hectares,
                                                            farmerName: `${user.fname || ''} ${user.lname || ''}`.trim(),
                                                            farmerEmail: user.email,
                                                            farmerPhone: user.phone,
                                                            farmId: user.farm_id,
                                                            commodity: user.commodity,
                                                            location: user.location_address || user.location,
                                                            latitude: user.latitude,
                                                            longitude: user.longitude,
                                                            boundaryFileUrl: user.boundary_file_url,
                                                            isVerified: user.is_verified,
                                                            approvalStatus: user.approval_status
                                                         })}
                                                         className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                                                         title="Inspect farm boundary polygon on satellite map"
                                                      >
                                                         <MapPin className="w-2.5 h-2.5" />
                                                         <span>Polygon</span>
                                                      </button>
                                                   )}
                                                </div>
                                             </div>
                                          ) : (
                                             <span className="text-xs text-slate-400">—</span>
                                          )}
                                       </td>

                                       {/* Verification Status & Farm ID */}
                                       <td className="py-4 px-4">
                                          <div className="flex flex-col gap-1 items-start">
                                             {/* Resubmission Badge - Priority Tag */}
                                             {user.is_resubmission && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs animate-pulse">
                                                   <RefreshCw className="w-2.5 h-2.5" />
                                                   Resubmitted Revision
                                                </span>
                                             )}

                                             {isApproved ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                   <FaCheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                                                </span>
                                             ) : isRejected ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                   <FaBan className="w-3 h-3 text-rose-600" /> Rejected
                                                </span>
                                             ) : (user.onboarding_level > 0 || imageCount > 0 || user.onboarding_status === 'unverified') ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                   Pending Review
                                                </span>
                                             ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] rounded-full font-semibold bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400">
                                                   Onboarding Incomplete
                                                </span>
                                             )}

                                             {/* Farm ID Badge */}
                                             {user.farm_id ? (
                                                <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                   ID: {user.farm_id}
                                                </span>
                                             ) : isFarmer && (
                                                <span className="text-[10px] text-slate-400">
                                                   {isApproved ? "ID Generated" : "ID Pending approval"}
                                                </span>
                                             )}

                                             {/* Suspended badge whenever account is suspended */}
                                             {isSuspended && (
                                                <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                   Suspended
                                                </span>
                                             )}
                                          </div>
                                       </td>

                                       {/* Joined */}
                                       <td className="py-4 px-4 text-slate-500 font-medium text-[11px] whitespace-nowrap min-w-[130px]">
                                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                       </td>

                                       {/* Action Buttons */}
                                       <td className="py-4 px-4 text-right whitespace-nowrap min-w-[380px]">
                                          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                             {/* 1. APPROVE BUTTON (Never shown if account is suspended) */}
                                             {isPending && !isSuspended && (
                                                <button
                                                   onClick={() => handleApproveUser(user.id, user.role?.toLowerCase())}
                                                   disabled={approvingId === user.id || rejectingId === user.id}
                                                   title="Approve user and generate official Farm ID"
                                                   className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                                >
                                                   {approvingId === user.id ? (
                                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                   ) : (
                                                      <FaCheckCircle className="w-3 h-3" />
                                                   )}
                                                   <span>Approve</span>
                                                </button>
                                             )}

                                             {/* 2. REJECT BUTTON (Never shown if account is suspended) */}
                                             {isPending && !isSuspended && (
                                                <button
                                                   onClick={() => {
                                                      setRejectionModalUser(user);
                                                      setRejectionReason(user.rejection_reason || "");
                                                      setRejectedSections(user.rejected_sections || []);
                                                   }}
                                                   disabled={approvingId === user.id || rejectingId === user.id}
                                                   title="Reject onboarding verification"
                                                   className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                                >
                                                   {rejectingId === user.id ? (
                                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                   ) : (
                                                      <FaBan className="w-3 h-3" />
                                                   )}
                                                   <span>Reject</span>
                                                </button>
                                             )}

                                             {/* 3. INSPECT ONBOARDING DETAILS & PHOTOS */}
                                             <button
                                                onClick={() => setSelectedFarmerModal(user)}
                                                title="View full onboarding details and photos"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition cursor-pointer shrink-0"
                                             >
                                                <FaEye className="w-3 h-3 text-slate-500 dark:text-gray-400" />
                                                <span>Details & Photos</span>
                                             </button>

                                             {/* 4. SUSPEND / ACTIVATE */}
                                             {(isApproved || isSuspended) && (
                                                <button
                                                   onClick={() => handleToggleSuspension(user.id, user.is_suspended)}
                                                   title={user.is_suspended ? "Activate account access" : "Suspend account access"}
                                                   className={`px-2.5 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer shrink-0 ${
                                                      user.is_suspended 
                                                         ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                                         : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:bg-gray-800 dark:text-gray-400 border border-slate-200/80 dark:border-gray-700"
                                                   }`}
                                                >
                                                   {user.is_suspended ? "Activate" : "Suspend"}
                                                </button>
                                             )}
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
            </div>

            {/* Pagination Controls */}
            {activeTab !== "buyers" && pagination.total > 0 && (
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100 dark:border-gray-900 text-xs text-slate-600 dark:text-gray-400">
                  <div>
                     <span>
                        Showing <strong className="text-gray-900 dark:text-white font-bold">{(page - 1) * limit + 1}</strong> to{" "}
                        <strong className="text-gray-900 dark:text-white font-bold">{Math.min(page * limit, pagination.total)}</strong> of{" "}
                        <strong className="text-gray-900 dark:text-white font-bold">{pagination.total}</strong> records
                        {selectedRole && <span className="ml-1 text-emerald-600 font-bold capitalize">({selectedRole})</span>}
                     </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                     <button
                        onClick={() => setPage(1)}
                        disabled={page === 1 || loading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                        title="First Page"
                     >
                        « First
                     </button>
                     <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
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
                              className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer text-xs ${
                                 page === pNum
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                    : "border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-200"
                              }`}
                           >
                              {pNum}
                           </button>
                        );
                     })}

                     <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                     >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                     </button>
                     <button
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={page >= pagination.totalPages || loading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition font-bold"
                        title="Last Page"
                     >
                        Last »
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* ======================================================= */}
         {/* ONBOARDING INSPECTION, PHOTO EVIDENCE & DECISION MODAL */}
         {/* ======================================================= */}
         {selectedFarmerModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 dark:border-gray-800 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                           <FaTractor className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                 Onboarding & Farm Evidence Review
                              </h2>
                              <span className="px-2.5 py-0.5 text-xs rounded-full font-bold capitalize bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200">
                                 {selectedFarmerModal.role}
                              </span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">
                              Verify farmer identity, agricultural land evidence, and photos to approve or reject.
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSelectedFarmerModal(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                     >
                        <FaTimes className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Scrollable Body Content */}
                  <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
                     
                     {/* 1. Status Banner */}
                     <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold ${
                        selectedFarmerModal.approval_status === "approved" 
                           ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                           : selectedFarmerModal.approval_status === "rejected"
                           ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                           : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                     }`}>
                        <div className="flex items-center gap-2">
                           {selectedFarmerModal.approval_status === "approved" ? (
                              <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                           ) : selectedFarmerModal.approval_status === "rejected" ? (
                              <FaBan className="w-4 h-4 text-rose-600 shrink-0" />
                           ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
                           )}
                           <span>
                              Verification Status: <strong className="capitalize">{selectedFarmerModal.approval_status === "approved" ? "Approved & Verified" : selectedFarmerModal.approval_status === "rejected" ? "Rejected" : "Pending Review"}</strong>
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           {selectedFarmerModal.role?.toLowerCase() === "farmer" ? (
                              selectedFarmerModal.farm_id ? (
                                 <span className="font-mono font-bold bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg shadow-xs border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300">
                                    Official Farm ID: {selectedFarmerModal.farm_id}
                                 </span>
                              ) : (
                                 <span className="text-amber-700 dark:text-amber-300 italic text-xs">
                                    Farm ID will be generated upon approval (Format: NG-XXX)
                                 </span>
                              )
                           ) : (
                              <span className="font-mono font-bold uppercase tracking-wider text-xs bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg shadow-xs border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                                 Role: {selectedFarmerModal.role}
                              </span>
                           )}
                        </div>
                     </div>

                     {/* Resubmission Revision Highlight Banner */}
                     {selectedFarmerModal.is_resubmission && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-xs space-y-2">
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                 <span className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0">
                                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                                 </span>
                                 <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                                    Resubmitted Application Under Review
                                 </h4>
                              </div>
                              {selectedFarmerModal.resubmitted_at && (
                                 <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-white/90 dark:bg-gray-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 shrink-0 self-start sm:self-auto">
                                    Resubmitted: {new Date(selectedFarmerModal.resubmitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                 </span>
                              )}
                           </div>
                           <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                              This participant previously had verification items rejected and has revised and resubmitted their onboarding details. Please examine their updated inputs and uploaded documents below.
                           </p>
                           {selectedFarmerModal.previous_rejection_reason && (
                              <div className="mt-2 p-3 rounded-xl bg-white/95 dark:bg-gray-900/90 border border-amber-300 dark:border-amber-700/80 text-xs">
                                 <span className="font-bold text-rose-700 dark:text-rose-400">Previous SuperAdmin Feedback: </span>
                                 <span className="italic text-slate-700 dark:text-gray-300">"{selectedFarmerModal.previous_rejection_reason}"</span>
                              </div>
                           )}
                        </div>
                     )}

                     {/* 2. User Overview */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</p>
                           <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedFarmerModal.fname} {selectedFarmerModal.lname}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                           <p className="font-semibold text-slate-700 dark:text-gray-300 mt-0.5 break-all text-xs">{selectedFarmerModal.email}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                           <p className="font-semibold text-slate-700 dark:text-gray-300 mt-0.5">{selectedFarmerModal.phone || "—"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Role</p>
                           <p className="font-bold text-emerald-600 mt-0.5 capitalize">{selectedFarmerModal.role || "Vendor"}</p>
                        </div>
                     </div>

                     {/* Adaptive Content: Farmer vs Other Roles */}
                     {selectedFarmerModal.role?.toLowerCase() === "farmer" ? (
                        <>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cooperative</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedFarmerModal.cooperative || "Independent"}</p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farm Name</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedFarmerModal.farm_name || "Main Farm"}</p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Commodity</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedFarmerModal.commodity || "General Crops"}</p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farm Size</p>
                                 <p className="font-bold text-emerald-600 mt-0.5">
                                    {selectedFarmerModal.farm_size_hectares ? `${selectedFarmerModal.farm_size_hectares} Hectares` : "Not specified"}
                                 </p>
                              </div>
                              <div className="col-span-2 sm:col-span-4 p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location / GPS Coordinates</p>
                                 {selectedFarmerModal.latitude && selectedFarmerModal.longitude ? (
                                    <a
                                       href={`https://www.google.com/maps?q=${selectedFarmerModal.latitude},${selectedFarmerModal.longitude}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline mt-1 font-bold"
                                    >
                                       <FaMapMarkerAlt className="w-3.5 h-3.5 text-rose-500" />
                                       <span>{Number(selectedFarmerModal.latitude).toFixed(4)}, {Number(selectedFarmerModal.longitude).toFixed(4)}</span>
                                       <FaExternalLinkAlt className="w-2.5 h-2.5" />
                                    </a>
                                 ) : (
                                    <p className="font-semibold text-slate-700 dark:text-gray-300 mt-0.5 text-xs">{selectedFarmerModal.location_address || "No GPS recorded"}</p>
                                 )}
                              </div>
                           </div>

                           {/* 3. Farm Images & Evidence Gallery */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-2">
                                 <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaImage className="text-emerald-600" />
                                    <span>Farm Photographs & Land Evidence</span>
                                 </h3>
                                 <span className="text-[11px] text-slate-400">Click photograph to inspect high-res</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                 {/* Farm Entrance */}
                                 <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40 flex flex-col">
                                    <div className="p-2.5 bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                                       <span className="text-xs font-bold text-gray-900 dark:text-white">Farm Entrance</span>
                                       {selectedFarmerModal.farm_entrance_photo_url || selectedFarmerModal.farm_image_url ? (
                                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                                       ) : (
                                          <span className="text-[10px] text-slate-400">Missing</span>
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
                                                <div className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                                                   <Maximize2 className="w-3.5 h-3.5" />
                                                   <span>Inspect Photo</span>
                                                </div>
                                             </div>
                                          </button>
                                       ) : (
                                          <div className="text-center p-4 text-slate-400">
                                             <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                             <p className="text-xs">No entrance photo uploaded</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 {/* Farm Interior */}
                                 <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40 flex flex-col">
                                    <div className="p-2.5 bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                                       <span className="text-xs font-bold text-gray-900 dark:text-white">Farm Interior</span>
                                       {selectedFarmerModal.farm_interior_photo_url ? (
                                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                                       ) : (
                                          <span className="text-[10px] text-slate-400">Missing</span>
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
                                                <div className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                                                   <Maximize2 className="w-3.5 h-3.5" />
                                                   <span>Inspect Photo</span>
                                                </div>
                                             </div>
                                          </button>
                                       ) : (
                                          <div className="text-center p-4 text-slate-400">
                                             <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                             <p className="text-xs">No interior photo uploaded</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 {/* Crop / Cultivation */}
                                 <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40 flex flex-col">
                                    <div className="p-2.5 bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                                       <span className="text-xs font-bold text-gray-900 dark:text-white">Crop Cultivation</span>
                                       {selectedFarmerModal.crop_photo_url ? (
                                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                                       ) : (
                                          <span className="text-[10px] text-slate-400">Missing</span>
                                       )}
                                    </div>
                                    <div className="h-44 flex items-center justify-center relative group bg-black/5 dark:bg-black/20">
                                       {selectedFarmerModal.crop_photo_url ? (
                                          <button
                                             type="button"
                                             onClick={() => setEnlargedImage({
                                                url: selectedFarmerModal.crop_photo_url,
                                                title: `Crop Photo - ${selectedFarmerModal.commodity || selectedFarmerModal.fname}`
                                             })}
                                             className="w-full h-full block cursor-pointer"
                                          >
                                             <img
                                                src={selectedFarmerModal.crop_photo_url}
                                                alt="Crop Photo"
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                             />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                <div className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
                                                   <Maximize2 className="w-3.5 h-3.5" />
                                                   <span>Inspect Photo</span>
                                                </div>
                                             </div>
                                          </button>
                                       ) : (
                                          <div className="text-center p-4 text-slate-400">
                                             <FaImage className="w-8 h-8 mx-auto opacity-30 mb-1" />
                                             <p className="text-xs">No crop photo uploaded</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* 4. Legal Documents */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-2">
                                 <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaFileContract className="text-emerald-600" />
                                    <span>Land Title & Boundary Evidence</span>
                                 </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {/* Land Title Card */}
                                 <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 bg-slate-50 dark:bg-gray-800/40 flex items-center justify-between gap-3">
                                    <div>
                                       <p className="text-xs font-bold text-gray-900 dark:text-white">Land Title / Lease Agreement</p>
                                       <p className="text-[11px] text-slate-500 mt-0.5">
                                          {selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url 
                                             ? (typeof (selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url) === 'string' && (selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url).toLowerCase().includes('.pdf')
                                                ? "PDF document submitted during onboarding"
                                                : "Document image uploaded by farmer")
                                             : "No land title submitted"}
                                       </p>
                                    </div>
                                    {selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url ? (
                                       typeof (selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url) === 'string' && (selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url).toLowerCase().includes('.pdf') ? (
                                          <a
                                             href={selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="px-3.5 py-1.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 shrink-0"
                                          >
                                             <FileText className="w-3.5 h-3.5" />
                                             <span>Inspect PDF</span>
                                          </a>
                                       ) : (
                                          <button
                                             type="button"
                                             onClick={() => setEnlargedImage({
                                                url: selectedFarmerModal.land_title_url || selectedFarmerModal.lease_agreement_url,
                                                title: `Land Title Document - ${selectedFarmerModal.farm_name || selectedFarmerModal.fname}`
                                             })}
                                             className="px-3.5 py-1.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                          >
                                             <FaEye className="w-3 h-3" />
                                             <span>Inspect Doc</span>
                                          </button>
                                       )
                                    ) : (
                                       <span className="text-xs text-slate-400 italic">None</span>
                                    )}
                                 </div>

                                 {/* Boundary Mapping Card */}
                                 <div className="border border-slate-200 dark:border-gray-800 rounded-2xl p-4 bg-slate-50 dark:bg-gray-800/40 flex items-center justify-between gap-3">
                                    <div>
                                       <p className="text-xs font-bold text-gray-900 dark:text-white">Boundary Polygon / GeoJSON Map</p>
                                       <p className="text-[11px] text-slate-500 mt-0.5">
                                          {selectedFarmerModal.boundary_polygon && selectedFarmerModal.boundary_polygon !== "[]" && selectedFarmerModal.boundary_polygon !== '""'
                                             ? "Interactive GPS polygon drawn on map"
                                             : selectedFarmerModal.boundary_file_url
                                                ? "Boundary shapefile/KML uploaded"
                                                : "No boundary polygon or shapefile captured"}
                                       </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                       {selectedFarmerModal.boundary_polygon && selectedFarmerModal.boundary_polygon !== "[]" && selectedFarmerModal.boundary_polygon !== '""' && (
                                          <button
                                             type="button"
                                             onClick={() => setViewingPolygonModal({
                                                polygon: selectedFarmerModal.boundary_polygon,
                                                farmName: selectedFarmerModal.farm_name || selectedFarmerModal.fname,
                                                hectares: selectedFarmerModal.farm_size_hectares,
                                                farmerName: `${selectedFarmerModal.fname || ''} ${selectedFarmerModal.lname || ''}`.trim(),
                                                farmerEmail: selectedFarmerModal.email,
                                                farmerPhone: selectedFarmerModal.phone,
                                                farmId: selectedFarmerModal.farm_id,
                                                commodity: selectedFarmerModal.commodity,
                                                location: selectedFarmerModal.location_address || selectedFarmerModal.location,
                                                latitude: selectedFarmerModal.latitude,
                                                longitude: selectedFarmerModal.longitude,
                                                boundaryFileUrl: selectedFarmerModal.boundary_file_url,
                                                isVerified: selectedFarmerModal.is_verified,
                                                approvalStatus: selectedFarmerModal.approval_status
                                             })}
                                             className="px-3.5 py-1.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                          >
                                             <MapPin className="w-3.5 h-3.5" />
                                             <span>Inspect Boundary Map</span>
                                          </button>
                                       )}

                                       {selectedFarmerModal.boundary_file_url && (
                                          <a
                                             href={selectedFarmerModal.boundary_file_url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="px-3 py-1.5 text-xs rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 text-slate-800 dark:text-white transition flex items-center gap-1.5"
                                          >
                                             <FaExternalLinkAlt className="w-3 h-3" />
                                             <span>File</span>
                                          </a>
                                       )}

                                       {!selectedFarmerModal.boundary_polygon && !selectedFarmerModal.boundary_file_url && (
                                          <span className="text-xs text-slate-400 italic">None</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-2">
                              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                                 <FaBuilding className="text-emerald-600" />
                                 <span>Enterprise & Facility Specifications</span>
                              </h3>
                           </div>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Name</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedFarmerModal.business_name || selectedFarmerModal.company_name || "—"}</p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depot / Base</p>
                                 <p className="font-semibold text-slate-700 dark:text-gray-300 mt-0.5 text-xs">{selectedFarmerModal.business_address || selectedFarmerModal.location || "—"}</p>
                              </div>
                              {selectedFarmerModal.total_capacity_mt ? (
                                 <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warehouse Capacity</p>
                                    <p className="font-bold text-emerald-600 mt-0.5">{selectedFarmerModal.total_capacity_mt} MT</p>
                                 </div>
                              ) : null}
                              {selectedFarmerModal.active_vehicles ? (
                                 <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Fleet Size</p>
                                    <p className="font-bold text-teal-600 mt-0.5">{selectedFarmerModal.active_vehicles} Vehicles</p>
                                 </div>
                              ) : null}
                           </div>
                        </div>
                     )}

                     {/* 5. KYC Evidence */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-2">
                           <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                              <FaIdCard className="text-emerald-600" />
                              <span>Identity Verification (KYC)</span>
                           </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           {/* Live Selfie */}
                           <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-slate-100 dark:bg-gray-800 text-[11px] font-bold text-center text-slate-600 dark:text-gray-400">Live Selfie</div>
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
                                    <span className="text-xs text-slate-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* ID Front */}
                           <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-slate-100 dark:bg-gray-800 text-[11px] font-bold text-center text-slate-600 dark:text-gray-400">ID Front</div>
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
                                    <span className="text-xs text-slate-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* ID Back */}
                           <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-slate-100 dark:bg-gray-800 text-[11px] font-bold text-center text-slate-600 dark:text-gray-400">ID Back</div>
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
                                    <span className="text-xs text-slate-400 italic">None</span>
                                 )}
                              </div>
                           </div>

                           {/* Trade License */}
                           <div className="border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-gray-800/40">
                              <div className="p-2 bg-slate-100 dark:bg-gray-800 text-[11px] font-bold text-center text-slate-600 dark:text-gray-400">Trade License</div>
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
                                    <span className="text-xs text-slate-400 italic">None</span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Modal Footer / Decision Bar */}
                  <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-gray-900/80 shrink-0">
                     <button
                        onClick={() => setSelectedFarmerModal(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 transition cursor-pointer"
                     >
                        Close
                     </button>

                     <div className="flex items-center gap-2">
                        {selectedFarmerModal.is_suspended ? (
                           <button
                              onClick={() => handleToggleSuspension(selectedFarmerModal.id, true)}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                           >
                              <FaCheckCircle className="w-3.5 h-3.5" />
                              <span>Activate Suspended Account</span>
                           </button>
                        ) : (
                           <>
                              {/* REJECT BUTTON */}
                              {selectedFarmerModal.approval_status !== "rejected" &&
                                 selectedFarmerModal.approval_status !== "approved" && (
                                    <button
                                       onClick={() => {
                                          setRejectionModalUser(selectedFarmerModal);
                                          setRejectionReason(selectedFarmerModal.rejection_reason || "");
                                          setRejectedSections(selectedFarmerModal.rejected_sections || []);
                                       }}
                                       disabled={approvingId === selectedFarmerModal.id || rejectingId === selectedFarmerModal.id}
                                       className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
                              {selectedFarmerModal.approval_status !== "approved" && (
                                 <button
                                    onClick={() => handleApproveUser(selectedFarmerModal.id, selectedFarmerModal.role?.toLowerCase())}
                                    disabled={approvingId === selectedFarmerModal.id || rejectingId === selectedFarmerModal.id}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                                 >
                                    {approvingId === selectedFarmerModal.id ? (
                                       <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Approving Account...</span>
                                       </>
                                    ) : (
                                       <>
                                          <FaCheckCircle className="w-3.5 h-3.5" />
                                          <span>{selectedFarmerModal.role?.toLowerCase() === "farmer" ? "Approve & Generate Farm ID" : "Approve Account & Unlock Operations"}</span>
                                       </>
                                    )}
                                 </button>
                              )}
                           </>
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
                     <span className="font-bold text-sm">{enlargedImage.title || "Evidence Inspection"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <a
                        href={enlargedImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                     >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        <span>Open Original</span>
                     </a>
                     <button
                        onClick={() => setEnlargedImage(null)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                     >
                        <FaTimes className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               {/* Full Image Display */}
               <div className="max-w-5xl max-h-[82vh] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img
                     src={enlargedImage.url}
                     alt={enlargedImage.title || "Enlarged Evidence"}
                     className="max-h-[80vh] max-w-full object-contain rounded-xl"
                  />
               </div>
            </div>
         )}

         {/* ======================================================= */}
         {/* GRANULAR ONBOARDING REJECTION & FEEDBACK MODAL          */}
         {/* ======================================================= */}
         {rejectionModalUser && (
            <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-rose-50/50 dark:bg-rose-950/20">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                           <FaBan className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-base font-black text-gray-900 dark:text-white">
                              Reject & Request Corrections
                           </h3>
                           <p className="text-xs text-slate-500 font-medium">
                              Select specifically which onboarding items need revision by {rejectionModalUser.fname} {rejectionModalUser.lname}.
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => setRejectionModalUser(null)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                     >
                        <FaTimes className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-140px)]">
                     {/* User summary card */}
                     <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div>
                           <p className="font-black text-gray-900 dark:text-white">{rejectionModalUser.fname} {rejectionModalUser.lname}</p>
                           <p className="text-slate-500 text-[11px] font-medium">{rejectionModalUser.email}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold capitalize bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 text-[10px]">
                           {rejectionModalUser.role}
                        </span>
                     </div>

                     {/* Checklist of sections */}
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                           1. Select Sections Requiring Revision <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                           When the user logs in, they will only be guided to fix and resubmit the items you select below:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                           {[
                              { id: "land_title", label: "Land Title / Proof of Tenure", desc: "Deed, C of O, or Lease Agreement" },
                              { id: "boundary", label: "Boundary Polygon Map", desc: "Perimeter coordinates on map" },
                              { id: "live_selfie", label: "Live Selfie Photo", desc: "Facial biometric capture" },
                              { id: "identity_docs", label: "Identity Documents", desc: "Government ID card (NIN/Voter)" },
                              { id: "farm_photos", label: "Physical Farm Photos", desc: "Entrance & field photos" },
                              { id: "farm_info", label: "Farm Location & Pin Drop", desc: "GPS coordinates & address" },
                              { id: "personal_info", label: "Personal Information", desc: "Bio details, phone, or name" },
                           ].map((item) => {
                              const isChecked = rejectedSections.includes(item.id);
                              return (
                                 <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                       setRejectedSections((prev) =>
                                          isChecked ? prev.filter((s) => s !== item.id) : [...prev, item.id]
                                       );
                                    }}
                                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                                       isChecked
                                          ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 shadow-xs"
                                          : "border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/40 text-slate-700 dark:text-gray-300"
                                    }`}
                                 >
                                    <div className="mt-0.5 shrink-0">
                                       {isChecked ? (
                                          <CheckSquare className="w-4 h-4 text-rose-600" />
                                       ) : (
                                          <Square className="w-4 h-4 text-slate-400" />
                                       )}
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold leading-tight">{item.label}</p>
                                       <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Feedback Presets */}
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                           2. Quick Feedback Suggestions
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                           {[
                              "Land title document is blurry, illegible or cut off.",
                              "Boundary polygon coordinates are incomplete.",
                              "Live selfie does not clearly match the government ID.",
                              "Uploaded ID document is expired or uncertified.",
                              "Farm photos do not clearly depict active cultivation.",
                           ].map((preset, idx) => (
                              <button
                                 key={idx}
                                 type="button"
                                 onClick={() => {
                                    setRejectionReason((prev) =>
                                       prev ? `${prev} ${preset}` : preset
                                    );
                                 }}
                                 className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium transition cursor-pointer text-left"
                              >
                                 + {preset}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Detailed Explanation / Instructions */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                           <span>3. Instructions to Farmer (Included in Email & In-App Alert) <span className="text-rose-500">*</span></span>
                           <span className="text-[10px] font-normal text-slate-400">Be clear on what to fix</span>
                        </label>
                        <textarea
                           rows={3}
                           value={rejectionReason}
                           onChange={(e) => setRejectionReason(e.target.value)}
                           placeholder="e.g. Please re-upload a clear scanned copy of your Certificate of Occupancy or Deed of Transfer, and re-draw your farm boundary points accurately."
                           className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                        />
                     </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-5 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-gray-900/80 shrink-0">
                     <button
                        type="button"
                        onClick={() => setRejectionModalUser(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 text-slate-700 dark:text-gray-200 transition cursor-pointer"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        disabled={rejectingId === rejectionModalUser.id || !rejectionReason.trim() || rejectedSections.length === 0}
                        onClick={() => handleConfirmReject(rejectionModalUser.id, rejectionModalUser.role?.toLowerCase(), rejectionReason, rejectedSections)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {rejectingId === rejectionModalUser.id ? (
                           <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching Notification...</span>
                           </>
                        ) : (
                           <>
                              <FaBan className="w-3.5 h-3.5" />
                              <span>Confirm Rejection & Send Notice</span>
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* ======================================================= */}
         {/* VIEW FARMLAND BOUNDARY POLYGON MODAL                     */}
         {/* ======================================================= */}
         {viewingPolygonModal && (() => {
            const parsedPoints = (() => {
               if (!viewingPolygonModal.polygon) return [];
               try {
                  const parsed = typeof viewingPolygonModal.polygon === 'string'
                     ? JSON.parse(viewingPolygonModal.polygon)
                     : viewingPolygonModal.polygon;
                  return Array.isArray(parsed) ? parsed : [];
               } catch {
                  return [];
               }
            })();

            const isClosedPolygon = parsedPoints.length >= 3;
            const isPolyline = parsedPoints.length === 2;

            const metrics = (() => {
               if (!isClosedPolygon) {
                  const declaredHa = parseFloat(viewingPolygonModal.hectares) || 0;
                  return {
                     calculatedHa: declaredHa.toFixed(2),
                     calculatedAcres: (declaredHa * 2.47105).toFixed(2),
                     perimeterKm: "—",
                     centroid: parsedPoints.length > 0 ? parsedPoints[0] : [9.0820, 8.6753],
                  };
               }
               try {
                  // Geodesic spherical polygon area, Haversine perimeter & centroid (zero external heavy turf dependency)
                  const R = 6378137; // Earth radius in meters
                  const toRad = (deg) => (deg * Math.PI) / 180;
                  const pts = parsedPoints.map((p) => [Number(p[0]), Number(p[1])]); // [lat, lng]
                  const closed = [...pts, pts[0]];

                  let areaSum = 0;
                  let perimMeters = 0;
                  let latSum = 0;
                  let lngSum = 0;

                  for (let i = 0; i < pts.length; i++) {
                     const [lat1, lng1] = closed[i];
                     const [lat2, lng2] = closed[i + 1];
                     latSum += lat1;
                     lngSum += lng1;

                     // Spherical excess area contribution
                     areaSum += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));

                     // Haversine segment distance
                     const dLat = toRad(lat2 - lat1);
                     const dLng = toRad(lng2 - lng1);
                     const a =
                        Math.sin(dLat / 2) ** 2 +
                        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
                     perimMeters += 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                  }

                  const sqm = Math.abs((areaSum * R * R) / 2.0);
                  const ha = (sqm / 10000).toFixed(2);
                  const ac = ((sqm / 10000) * 2.47105).toFixed(2);
                  const perim = (perimMeters / 1000).toFixed(2);
                  return {
                     calculatedHa: ha,
                     calculatedAcres: ac,
                     perimeterKm: perim,
                     centroid: [latSum / pts.length, lngSum / pts.length],
                  };
               } catch {
                  return {
                     calculatedHa: parseFloat(viewingPolygonModal.hectares || 0).toFixed(2),
                     calculatedAcres: ((parseFloat(viewingPolygonModal.hectares) || 0) * 2.47105).toFixed(2),
                     perimeterKm: "—",
                     centroid: parsedPoints[0] || [9.0820, 8.6753],
                  };
               }
            })();

            const handleExportGeoJSON = () => {
               if (!isClosedPolygon) {
                  toast.warn("Incomplete boundary: Needs at least 3 GPS vertices to export as GeoJSON");
                  return;
               }
               const turfPoints = parsedPoints.map(p => [Number(p[1]), Number(p[0])]);
               const geojson = {
                  type: "FeatureCollection",
                  features: [
                     {
                        type: "Feature",
                        properties: {
                           farm_name: viewingPolygonModal.farmName || "Main Farm",
                           farmer_name: viewingPolygonModal.farmerName || "",
                           farmer_email: viewingPolygonModal.farmerEmail || "",
                           farm_id: viewingPolygonModal.farmId || "",
                           commodity: viewingPolygonModal.commodity || "",
                           declared_hectares: viewingPolygonModal.hectares || null,
                           calculated_hectares: metrics.calculatedHa,
                           calculated_acres: metrics.calculatedAcres,
                           perimeter_km: metrics.perimeterKm,
                           exported_at: new Date().toISOString()
                        },
                        geometry: {
                           type: "Polygon",
                           coordinates: [[...turfPoints, turfPoints[0]]]
                        }
                     }
                  ]
               };
               const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
               const url = URL.createObjectURL(blob);
               const a = document.createElement("a");
               a.href = url;
               a.download = `boundary-${(viewingPolygonModal.farmId || viewingPolygonModal.farmName || "farm").toLowerCase().replace(/\s+/g, '-')}.geojson`;
               a.click();
               URL.revokeObjectURL(url);
               toast.success("GeoJSON boundary polygon exported successfully!");
            };

            const handleCopyCoords = () => {
               const text = `${Number(metrics.centroid[0]).toFixed(6)}, ${Number(metrics.centroid[1]).toFixed(6)}`;
               navigator.clipboard.writeText(text);
               toast.success(`GPS coordinates copied: ${text}`);
            };

            return (
               <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                     
                     {/* Modal Header */}
                     <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                              <MapPin className="w-5 h-5" />
                           </div>
                           <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                 <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
                                    Farm Boundary & Geospatial Inspection
                                 </h3>
                                 {viewingPolygonModal.farmId && (
                                    <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                       ID: {viewingPolygonModal.farmId}
                                    </span>
                                 )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                 <span>Farm: <strong className="text-slate-700 dark:text-slate-300">{viewingPolygonModal.farmName || "Main Farm"}</strong></span>
                                 {viewingPolygonModal.farmerName && (
                                    <span> · Farmer: <strong className="text-slate-700 dark:text-slate-300">{viewingPolygonModal.farmerName}</strong></span>
                                 )}
                                 {viewingPolygonModal.commodity && (
                                    <span> · Commodity: <strong className="text-emerald-700 dark:text-emerald-400">{viewingPolygonModal.commodity}</strong></span>
                                 )}
                              </p>
                           </div>
                        </div>
                        <button
                           onClick={() => setViewingPolygonModal(null)}
                           className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0 ml-2"
                        >
                           <FaTimes className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Modal Body / Map & Telemetry */}
                     <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                        
                        {/* 4 Telemetry Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                           {/* Card 1: Calculated Polygon Area */}
                           <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Calculated Area</p>
                              <p className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-1">{metrics.calculatedHa} Ha</p>
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">~{metrics.calculatedAcres} Acres</p>
                           </div>

                           {/* Card 2: Declared Size */}
                           <div className="p-3.5 bg-slate-50 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-800 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Declared Farm Size</p>
                              <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                                 {viewingPolygonModal.hectares ? `${viewingPolygonModal.hectares} Ha` : "Unspecified"}
                              </p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                 {viewingPolygonModal.hectares && isClosedPolygon
                                    ? Math.abs(parseFloat(viewingPolygonModal.hectares) - parseFloat(metrics.calculatedHa)) < 1
                                       ? "✅ Matches Polygon Area"
                                       : "⚠️ Variance vs Polygon"
                                    : "Farmer declaration"}
                              </p>
                           </div>

                           {/* Card 3: Perimeter & Geometry */}
                           <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">Perimeter & Points</p>
                              <p className="text-lg font-black text-teal-900 dark:text-teal-200 mt-1">
                                 {metrics.perimeterKm !== "—" ? `~${metrics.perimeterKm} km` : `${parsedPoints.length} Points`}
                              </p>
                              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                                 {isClosedPolygon ? `${parsedPoints.length} GPS Vertices (Closed)` : isPolyline ? "⚠️ Incomplete (2 Points)" : "No closed boundary"}
                              </p>
                           </div>

                           {/* Card 4: GPS Centroid */}
                           <div className="p-3.5 bg-slate-50 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-800 rounded-2xl flex flex-col justify-between">
                              <div>
                                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Centroid Coordinates</p>
                                 <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                                    {Number(metrics.centroid[0]).toFixed(4)}°, {Number(metrics.centroid[1]).toFixed(4)}°
                                 </p>
                              </div>
                              <button
                                 type="button"
                                 onClick={handleCopyCoords}
                                 className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer mt-1 self-start"
                              >
                                 <Copy className="w-3 h-3" />
                                 <span>Copy GPS</span>
                              </button>
                           </div>
                        </div>

                        {/* Map Container */}
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-800 shadow-xs">
                           <MapComponent
                              mode="boundary"
                              initialPolygon={viewingPolygonModal.polygon}
                              readOnly={true}
                           />
                        </div>

                        {/* Context strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50/80 dark:bg-gray-800/40 border border-slate-200/60 dark:border-gray-800 rounded-xl text-xs text-slate-600 dark:text-gray-300">
                           <div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">Location: </span>
                              <span>{viewingPolygonModal.location || "Coordinates plotted in Nigeria"}</span>
                           </div>
                           <div className="text-[11px] text-slate-500">
                              High-resolution satellite view enabled · Use layer switch for street overlay
                           </div>
                        </div>
                     </div>

                     {/* Modal Footer */}
                     <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-gray-900/80 shrink-0">
                        <div className="flex items-center gap-2">
                           <a
                              href={`https://www.google.com/maps?q=${metrics.centroid[0]},${metrics.centroid[1]}&t=k`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 transition cursor-pointer"
                           >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Open in Google Satellite</span>
                           </a>

                           {isClosedPolygon && (
                              <button
                                 type="button"
                                 onClick={handleExportGeoJSON}
                                 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                 <Download className="w-3.5 h-3.5" />
                                 <span>Export GeoJSON</span>
                              </button>
                           )}
                        </div>

                        <button
                           onClick={() => setViewingPolygonModal(null)}
                           className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition cursor-pointer"
                        >
                           Done
                        </button>
                     </div>
                  </div>
               </div>
            );
         })()}
      </div>
   );
}

export default function UserManagementPage() {
   return (
      <Suspense fallback={
         <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading User Management & Verification...</p>
         </div>
      }>
         <UserManagementContent />
      </Suspense>
   );
}
