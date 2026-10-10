"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, MoreVertical, Eye, EyeOff, Trash2, CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UserManagementPage() {
   const [users, setUsers] = useState([]);
   const [filteredUsers, setFilteredUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedRole, setSelectedRole] = useState("");
   const [approvalFilter, setApprovalFilter] = useState("");
   const [suspendedOnly, setSuspendedOnly] = useState(false);
   const [actionLoading, setActionLoading] = useState(null);

   const roles = ["farmer", "vendor", "admin", "field officer", "government", "bank", "insurance firm", "ngo"];

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const res = await fetch("/api/proxy/admin/users");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  const allUsers = [...(json.data.vendors || []), ...(json.data.buyers || [])];
                  setUsers(allUsers);
                  setFilteredUsers(allUsers);
               }
            }
         } catch (err) {
            console.error("Failed to fetch users:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchUsers();
   }, []);

   useEffect(() => {
      let filtered = users;

      if (searchTerm) {
         filtered = filtered.filter(
            (u) =>
               u.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               u.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (selectedRole) {
         filtered = filtered.filter((u) => u.role?.toLowerCase() === selectedRole.toLowerCase());
      }

      if (approvalFilter) {
         filtered = filtered.filter((u) => {
            const status = u.approval_status || (u.is_verified ? "approved" : "pending_approval");
            return status.toLowerCase() === approvalFilter.toLowerCase();
         });
      }

      if (suspendedOnly) {
         filtered = filtered.filter((u) => u.is_suspended);
      }

      setFilteredUsers(filtered);
   }, [searchTerm, selectedRole, approvalFilter, suspendedOnly, users]);

   const handleToggleSuspension = async (userId, currentStatus) => {
      if (!confirm(`Are you sure you want to ${currentStatus ? "activate" : "suspend"} this account?`)) return;

      try {
         const res = await fetch("/api/proxy/admin/users/toggle-suspension", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, suspended: !currentStatus }),
         });

         if (res.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, is_suspended: !currentStatus } : u)));
         } else {
            const err = await res.json();
            alert(err.error || "Failed to update status");
         }
      } catch (err) {
         console.error("Error toggling suspension:", err);
         alert("An error occurred");
      }
   };

   const handleApprovalStatus = async (userId, status) => {
      if (!confirm(`Are you sure you want to mark this user as ${status}?`)) return;
      setActionLoading(userId);
      try {
         const res = await fetch(`/api/proxy/admin/users/${userId}/approval`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, status }),
         });

         if (res.ok) {
            const json = await res.json();
            setUsers((prev) =>
               prev.map((u) =>
                  u.id === userId
                     ? { ...u, approval_status: status, is_verified: status === "approved" }
                     : u
               )
            );
         } else {
            const err = await res.json();
            alert(err.error || "Failed to update approval status");
         }
      } catch (err) {
         console.error("Error updating approval status:", err);
         alert("An error occurred");
      } finally {
         setActionLoading(null);
      }
   };

   const getRoleBadgeColor = (role) => {
      const r = role?.toLowerCase();
      if (r === "farmer") return "bg-green-100 text-green-700";
      if (r === "vendor" || r === "store") return "bg-blue-100 text-blue-700";
      if (r === "admin" || r === "super admin") return "bg-red-100 text-red-700";
      if (r === "government" || r === "bank" || r === "ngo") return "bg-purple-100 text-purple-700";
      return "bg-gray-100 text-gray-700";
   };

   const getApprovalBadge = (user) => {
      const status = user.approval_status || (user.is_verified ? "approved" : "pending_approval");
      if (status === "approved") {
         return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
               <CheckCircle2 className="w-3 h-3" /> Approved
            </span>
         );
      }
      if (status === "rejected") {
         return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
               <XCircle className="w-3 h-3" /> Rejected
            </span>
         );
      }
      return (
         <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Pending Approval
         </span>
      );
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
            <h1 className="text-3xl font-bold text-(--foreground)">User Management</h1>
            <p className="text-gray-500 mt-1">Manage system users, approve farmer accounts, and control access permissions.</p>
         </div>

         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-2">Search by Name or Email</label>
                     <input
                        type="text"
                        placeholder="Enter name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">Filter by Role</label>
                     <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                           <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">Approval Status</label>
                     <select
                        value={approvalFilter}
                        onChange={(e) => setApprovalFilter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     >
                        <option value="">All Statuses</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                     </select>
                  </div>

                  <div className="flex items-end">
                     <Button
                        onClick={() => setSuspendedOnly(!suspendedOnly)}
                        variant={suspendedOnly ? "default" : "outline"}
                        className="w-full"
                     >
                        {suspendedOnly ? "Suspended Only" : "Show All Statuses"}
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Users Table */}
         <Card>
            <CardHeader>
               <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">Name</th>
                           <th className="text-left py-3 px-4 font-semibold">Email</th>
                           <th className="text-left py-3 px-4 font-semibold">Role</th>
                           <th className="text-left py-3 px-4 font-semibold">Account Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Approval Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredUsers.map((user) => {
                           const isApproved = (user.approval_status === "approved") || (user.is_verified && !user.approval_status);
                           const isPending = !isApproved && user.approval_status !== "rejected";

                           return (
                              <tr
                                 key={user.id}
                                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                              >
                                 <td className="py-3 px-4 font-medium">
                                    {user.fname} {user.lname}
                                 </td>
                                 <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                                 <td className="py-3 px-4">
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                    >
                                       {user.role}
                                    </span>
                                 </td>
                                 <td className="py-3 px-4">
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                                    >
                                       {user.is_suspended ? "Suspended" : "Active"}
                                    </span>
                                 </td>
                                 <td className="py-3 px-4">
                                    {getApprovalBadge(user)}
                                 </td>
                                 <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                       {isPending ? (
                                          <Button
                                             size="sm"
                                             onClick={() => handleApprovalStatus(user.id, "approved")}
                                             disabled={actionLoading === user.id}
                                             className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 flex items-center gap-1 shadow-xs"
                                          >
                                             {actionLoading === user.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                             ) : (
                                                <UserCheck className="w-3.5 h-3.5" />
                                             )}
                                             Approve
                                          </Button>
                                       ) : isApproved && user.role?.toLowerCase() === "farmer" ? (
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => handleApprovalStatus(user.id, "rejected")}
                                             disabled={actionLoading === user.id}
                                             className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs h-8 px-2"
                                          >
                                             Reject
                                          </Button>
                                       ) : null}

                                       <Button
                                          onClick={() => handleToggleSuspension(user.id, user.is_suspended)}
                                          variant="ghost"
                                          size="sm"
                                          title={user.is_suspended ? "Activate account" : "Suspend account"}
                                          className={user.is_suspended ? "text-green-600" : "text-red-600"}
                                       >
                                          {user.is_suspended ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                       </Button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">No users found</div>}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
