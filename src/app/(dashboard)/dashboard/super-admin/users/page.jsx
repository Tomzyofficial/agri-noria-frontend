"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, MoreVertical, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UserManagementPage() {
   const [users, setUsers] = useState([]);
   const [filteredUsers, setFilteredUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedRole, setSelectedRole] = useState("");
   const [suspendedOnly, setSuspendedOnly] = useState(false);

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

      if (suspendedOnly) {
         filtered = filtered.filter((u) => u.is_suspended);
      }

      setFilteredUsers(filtered);
   }, [searchTerm, selectedRole, suspendedOnly, users]);

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

   const getRoleBadgeColor = (role) => {
      const r = role?.toLowerCase();
      if (r === "farmer") return "bg-green-100 text-green-700";
      if (r === "vendor" || r === "store") return "bg-blue-100 text-blue-700";
      if (r === "admin" || r === "super admin") return "bg-red-100 text-red-700";
      if (r === "government" || r === "bank" || r === "ngo") return "bg-purple-100 text-purple-700";
      return "bg-gray-100 text-gray-700";
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
            <p className="text-gray-500 mt-1">Manage system users, view details, and control access.</p>
         </div>

         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="flex items-end">
                     <Button
                        onClick={() => setSuspendedOnly(!suspendedOnly)}
                        variant={suspendedOnly ? "default" : "outline"}
                        className="w-full"
                     >
                        {suspendedOnly ? "Suspended Only" : "Show All"}
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
                           <th className="text-left py-3 px-4 font-semibold">Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredUsers.map((user) => (
                           <tr
                              key={user.id}
                              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                           >
                              <td className="py-3 px-4">
                                 {user.fname} {user.lname}
                              </td>
                              <td className="py-3 px-4">{user.email}</td>
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
                                 <Button
                                    onClick={() => handleToggleSuspension(user.id, user.is_suspended)}
                                    variant="ghost"
                                    size="sm"
                                    className={user.is_suspended ? "text-green-600" : "text-red-600"}
                                 >
                                    {user.is_suspended ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">No users found</div>}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
