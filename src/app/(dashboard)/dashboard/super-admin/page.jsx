"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaUsersCog, FaServer, FaShieldAlt, FaChartPie, FaSearch, FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function SuperAdminDashboard() {
   const [users, setUsers] = useState([]);
   const [buyers, setBuyers] = useState([]);
   const [roleCounts, setRoleCounts] = useState([]);
   const [totalVendors, setTotalVendors] = useState(0);
   const [totalBuyers, setTotalBuyers] = useState(0);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [activeTab, setActiveTab] = useState("vendors");
   const [selectedRole, setSelectedRole] = useState(null);

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const res = await fetch("/api/proxy/admin/users");
            if (res.ok) {
               const json = await res.json();
               if (json.success) {
                  setUsers(json.data.vendors || []);
                  setBuyers(json.data.buyers || []);
                  setRoleCounts(json.data.roleCounts || []);
                  setTotalVendors(json.data.totalVendors || 0);
                  setTotalBuyers(json.data.totalBuyers || 0);
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

   const filteredVendors = users.filter((u) => {
      const matchesSearch =
         u.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.account_type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !selectedRole || u.account_type?.toLowerCase() === selectedRole.toLowerCase();

      return matchesSearch && matchesRole;
   });

   const filteredBuyers = buyers.filter(
      (b) =>
         b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.email?.toLowerCase().includes(searchTerm.toLowerCase())
   );

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
      if (r === "super admin" || r === "admin") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      if (r === "government" || r === "bank" || r === "ngo" || r === "dfi" || r === "insurance firm" || r === "commodity board") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      if (r === "farmer") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      if (r === "program director" || r === "regional manager" || r === "cluster supervisor") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      if (r === "field officer" || r === "agronomist" || r === "inspector" || r === "enumerator") return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
   };

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold text-(--foreground)">Super Admin Panel</h1>
            <p className="text-gray-500 mt-1">System overview, user management, and platform analytics.</p>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-red-500 text-white rounded-full"><FaUsersCog size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Vendors</p>
                     <p className="text-2xl font-bold text-(--foreground)">{loading ? "..." : totalVendors.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-indigo-500 text-white rounded-full"><FaChartPie size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Buyers</p>
                     <p className="text-2xl font-bold text-(--foreground)">{loading ? "..." : totalBuyers.toLocaleString()}</p>
                  </div>
               </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-none shadow-sm">
               <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-gray-600 text-white rounded-full"><FaServer size={24} /></div>
                  <div>
                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Unique Roles</p>
                     <p className="text-2xl font-bold text-(--foreground)">{loading ? "..." : roleCounts.length}</p>
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

         {/* Role Breakdown */}
         <Card>
            <CardHeader>
               <CardTitle>Roles Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-3">
                  {loading ? (
                     <p className="text-gray-400">Loading...</p>
                  ) : roleCounts.length === 0 ? (
                     <p className="text-gray-400">No roles found</p>
                  ) : (
                     <>
                        <button
                           onClick={() => setSelectedRole(null)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedRole ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                        >
                           All Users
                        </button>
                        {roleCounts.map((r, i) => (
                           <button
                              key={i}
                              onClick={() => setSelectedRole(selectedRole === r.account_type ? null : r.account_type)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${getRoleBadgeColor(r.account_type)} ${selectedRole === r.account_type ? "ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-current scale-105" : "opacity-70 hover:opacity-100"}`}
                           >
                              <span className="capitalize">{r.account_type}</span>
                              <span className="font-bold">({r.count})</span>
                           </button>
                        ))}
                     </>
                  )}
               </div>
            </CardContent>
         </Card>

         {/* User Management Table */}
         <Card>
            <CardHeader>
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative">
                     <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-(--foreground) text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     />
                  </div>
               </div>
               {/* Tabs */}
               <div className="flex gap-2 mt-4">
                  <button
                     onClick={() => setActiveTab("vendors")}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === "vendors" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                  >
                     Vendors ({totalVendors})
                  </button>
                  <button
                     onClick={() => setActiveTab("buyers")}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === "buyers" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                  >
                     Buyers ({totalBuyers})
                  </button>
               </div>
            </CardHeader>
            <CardContent>
               {loading ? (
                  <div className="flex items-center justify-center py-12">
                     <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
               ) : activeTab === "vendors" ? (
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Joined</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredVendors.length === 0 ? (
                              <tr>
                                 <td colSpan={7} className="text-center py-8 text-gray-400">No users found</td>
                              </tr>
                           ) : (
                              filteredVendors.map((user) => (
                                 <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="py-3 px-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                             {user.fname?.[0]}{user.lname?.[0]}
                                          </div>
                                          <span className="font-medium text-(--foreground)">{user.fname} {user.lname}</span>
                                       </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.phone || "—"}</td>
                                    <td className="py-3 px-4">
                                       <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getRoleBadgeColor(user.account_type)}`}>
                                          {user.account_type}
                                       </span>
                                    </td>
                                    <td className="py-3 px-4">
                                       <div className="flex flex-col gap-1">
                                          <span className={`px-3 py-1 text-xs rounded-full font-medium w-fit ${user.is_verified ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                                             {user.is_verified ? "Verified" : "Pending"}
                                          </span>
                                          {user.is_suspended && (
                                             <span className="px-3 py-1 text-xs rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 w-fit">
                                                Suspended
                                             </span>
                                          )}
                                       </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">
                                       {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                       <button
                                          onClick={() => handleToggleSuspension(user.id, user.is_suspended)}
                                          className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${user.is_suspended ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"}`}
                                       >
                                          {user.is_suspended ? "Activate" : "Suspend"}
                                       </button>
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
                           <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Auth Provider</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Joined</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredBuyers.length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="text-center py-8 text-gray-400">No buyers found</td>
                              </tr>
                           ) : (
                              filteredBuyers.map((buyer) => (
                                 <tr key={buyer.buyer_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="py-3 px-4 font-medium text-(--foreground)">{buyer.name || "—"}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{buyer.email}</td>
                                    <td className="py-3 px-4">
                                       <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                          {buyer.auth_provider}
                                       </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs">
                                       {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
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
