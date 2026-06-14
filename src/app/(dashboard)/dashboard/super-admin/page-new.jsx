"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
   FaUsersCog,
   FaServer,
   FaShieldAlt,
   FaChartPie,
   FaSearch,
   FaEye,
   FaEyeSlash,
   FaWallet,
   FaFileContract,
   FaDollarSign,
   FaExchangeAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";

export default function SuperAdminDashboard() {
   const [users, setUsers] = useState([]);
   const [buyers, setBuyers] = useState([]);
   const [roleCounts, setRoleCounts] = useState([]);
   const [totalVendors, setTotalVendors] = useState(0);
   const [totalBuyers, setTotalBuyers] = useState(0);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [activeTab, setActiveTab] = useState("dashboard");
   const [selectedRole, setSelectedRole] = useState(null);

   // Dashboard data
   const [dashStats, setDashStats] = useState(null);
   const [agreements, setAgreements] = useState([]);
   const [escrow, setEscrow] = useState([]);
   const [financeWallets, setFinanceWallets] = useState([]);
   const [transactions, setTransactions] = useState([]);

   useEffect(() => {
      const fetchAllData = async () => {
         try {
            const [usersRes, dashRes, agreementsRes, escrowRes, walletsRes, transRes] = await Promise.all([
               fetch("/api/proxy/admin/users"),
               fetch("/api/proxy/admin/dashboard/stats"),
               fetch("/api/proxy/admin/agreements"),
               fetch("/api/proxy/admin/escrow-payments"),
               fetch("/api/proxy/admin/finance-wallets"),
               fetch("/api/proxy/admin/wallet-transactions?limit=50"),
            ]);

            const usersData = await usersRes.json();
            if (usersData.success) {
               setUsers(usersData.data.vendors || []);
               setBuyers(usersData.data.buyers || []);
               setRoleCounts(usersData.data.roleCounts || []);
               setTotalVendors(usersData.data.totalVendors || 0);
               setTotalBuyers(usersData.data.totalBuyers || 0);
            }

            if (dashRes.ok) {
               const dashData = await dashRes.json();
               setDashStats(dashData.data);
            }

            if (agreementsRes.ok) {
               const agreementsData = await agreementsRes.json();
               setAgreements(agreementsData.data || []);
            }

            if (escrowRes.ok) {
               const escrowData = await escrowRes.json();
               setEscrow(escrowData.data || []);
            }

            if (walletsRes.ok) {
               const walletsData = await walletsRes.json();
               setFinanceWallets(walletsData.data || []);
            }

            if (transRes.ok) {
               const transData = await transRes.json();
               setTransactions(transData.data || []);
            }
         } catch (err) {
            console.error("Failed to fetch data:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchAllData();
   }, []);

   const filteredVendors = users.filter((u) => {
      const matchesSearch =
         u.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.role?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !selectedRole || u.role?.toLowerCase() === selectedRole.toLowerCase();
      return matchesSearch && matchesRole;
   });

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
      if (r === "finance") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      if (["government", "bank", "ngo", "dfi", "insurance firm", "commodity board"].includes(r))
         return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      if (r === "farmer") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      if (["program director", "regional manager", "cluster supervisor", "aggregator"].includes(r))
         return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
   };

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold text-(--foreground)">Super Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Complete system overview, user management, and financial tracking.</p>
         </div>

         {/* Tab Navigation */}
         <div className="flex gap-2 overflow-x-auto pb-2">
            {[
               { id: "dashboard", label: "Dashboard", icon: "📊" },
               { id: "users", label: "Users", icon: "👥" },
               { id: "agreements", label: "Agreements", icon: "📄" },
               { id: "escrow", label: "Escrow", icon: "💰" },
               { id: "finance", label: "Finance", icon: "🏦" },
               { id: "transactions", label: "Transactions", icon: "💳" },
            ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}
               >
                  {tab.icon} {tab.label}
               </button>
            ))}
         </div>

         {/* DASHBOARD TAB */}
         {activeTab === "dashboard" && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-none shadow-sm">
                     <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-red-500 text-white rounded-full">
                           <FaUsersCog size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Vendors</p>
                           <p className="text-2xl font-bold">{loading ? "..." : totalVendors.toLocaleString()}</p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 border-none shadow-sm">
                     <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-indigo-500 text-white rounded-full">
                           <FaChartPie size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Buyers</p>
                           <p className="text-2xl font-bold">{loading ? "..." : totalBuyers.toLocaleString()}</p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-none shadow-sm">
                     <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-green-500 text-white rounded-full">
                           <FaFileContract size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-green-700 dark:text-green-300">Agreements</p>
                           <p className="text-2xl font-bold">{loading ? "..." : dashStats?.agreements?.count || 0}</p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 border-none shadow-sm">
                     <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-yellow-500 text-white rounded-full">
                           <FaWallet size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Escrow Held</p>
                           <p className="text-2xl font-bold">
                              ₦{loading ? "..." : (dashStats?.escrow?.totalAmount || 0).toLocaleString()}
                           </p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 border-none shadow-sm">
                     <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-purple-500 text-white rounded-full">
                           <FaDollarSign size={24} />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Finance Balance</p>
                           <p className="text-2xl font-bold">
                              ₦{loading ? "..." : (dashStats?.overview?.finance_wallet_balance || 0).toLocaleString()}
                           </p>
                        </div>
                     </CardContent>
                  </Card>
               </div>

               {dashStats?.agreements?.statusBreakdown && (
                  <Card>
                     <CardHeader>
                        <CardTitle>Agreement Status Breakdown</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           {dashStats.agreements.statusBreakdown.map((status, i) => (
                              <div key={i} className="flex items-center justify-between">
                                 <span className="capitalize font-medium">{status.status}</span>
                                 <div className="flex items-center gap-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                       <div
                                          className="bg-blue-600 h-2 rounded-full"
                                          style={{
                                             width: `${Math.min((status.count / dashStats.agreements.count) * 100, 100)}%`,
                                          }}
                                       ></div>
                                    </div>
                                    <span className="font-bold w-12 text-right">{status.count}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               )}
            </>
         )}

         {/* USERS TAB */}
         {activeTab === "users" && (
            <Card>
               <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <CardTitle>User Management ({filteredVendors.length})</CardTitle>
                     <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                           type="text"
                           placeholder="Search..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm w-full sm:w-80"
                        />
                     </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                     <button
                        onClick={() => setSelectedRole(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedRole ? "ring-2 ring-blue-500 bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                     >
                        All Users
                     </button>
                     {roleCounts.map((r, i) => (
                        <button
                           key={i}
                           onClick={() => setSelectedRole(selectedRole === r.role ? null : r.role)}
                           className={`px-4 py-2 rounded-full text-sm font-medium ${getRoleBadgeColor(r.role)}`}
                        >
                           {r.role} ({r.count})
                        </button>
                     ))}
                  </div>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left p-3 font-bold">Name</th>
                              <th className="text-left p-3 font-bold">Email</th>
                              <th className="text-left p-3 font-bold">Role</th>
                              <th className="text-left p-3 font-bold">Status</th>
                              <th className="text-center p-3 font-bold">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredVendors.map((u) => (
                              <tr key={u.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                 <td className="p-3">
                                    {u.fname} {u.lname}
                                 </td>
                                 <td className="p-3 text-xs">{u.email}</td>
                                 <td className="p-3">
                                    <span
                                       className={`px-2 py-1 rounded text-xs font-bold ${getRoleBadgeColor(u.role)}`}
                                    >
                                       {u.role}
                                    </span>
                                 </td>
                                 <td className="p-3">
                                    <span
                                       className={`px-2 py-1 rounded text-xs font-bold ${u.is_suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                                    >
                                       {u.is_suspended ? "Suspended" : "Active"}
                                    </span>
                                 </td>
                                 <td className="p-3 text-center">
                                    <button
                                       onClick={() => handleToggleSuspension(u.id, u.is_suspended)}
                                       className="hover:font-bold"
                                    >
                                       {u.is_suspended ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* AGREEMENTS TAB */}
         {activeTab === "agreements" && (
            <Card>
               <CardHeader>
                  <CardTitle>All Agreements ({agreements.length})</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left p-3 font-bold">Aggregator</th>
                              <th className="text-left p-3 font-bold">Buyer</th>
                              <th className="text-left p-3 font-bold">Amount</th>
                              <th className="text-left p-3 font-bold">Status</th>
                              <th className="text-left p-3 font-bold">Payment</th>
                           </tr>
                        </thead>
                        <tbody>
                           {agreements.slice(0, 20).map((a) => (
                              <tr key={a.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">
                                    {a.aggregator_fname} {a.aggregator_lname}
                                 </td>
                                 <td className="p-3">{a.buyer_name}</td>
                                 <td className="p-3 font-bold">₦{parseFloat(a.financing_amount).toLocaleString()}</td>
                                 <td className="p-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                       {a.status}
                                    </span>
                                 </td>
                                 <td className="p-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                       {a.payment_status}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* ESCROW TAB */}
         {activeTab === "escrow" && (
            <Card>
               <CardHeader>
                  <CardTitle>Escrow Payments ({escrow.length})</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                     <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Held</p>
                        <p className="text-2xl font-bold text-yellow-600">
                           ₦
                           {escrow
                              .filter((e) => e.status === "held")
                              .reduce((s, e) => s + parseFloat(e.amount || 0), 0)
                              .toLocaleString()}
                        </p>
                     </div>
                     <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Released</p>
                        <p className="text-2xl font-bold text-green-600">
                           ₦
                           {escrow
                              .filter((e) => e.status === "released")
                              .reduce((s, e) => s + parseFloat(e.amount || 0), 0)
                              .toLocaleString()}
                        </p>
                     </div>
                     <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-blue-600">
                           ₦{escrow.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left p-3 font-bold">Buyer</th>
                              <th className="text-left p-3 font-bold">Amount</th>
                              <th className="text-left p-3 font-bold">Status</th>
                              <th className="text-left p-3 font-bold">Created</th>
                           </tr>
                        </thead>
                        <tbody>
                           {escrow.slice(0, 20).map((e) => (
                              <tr key={e.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">{e.buyer_name}</td>
                                 <td className="p-3 font-bold">₦{parseFloat(e.amount).toLocaleString()}</td>
                                 <td className="p-3">
                                    <span
                                       className={`px-2 py-1 rounded text-xs font-bold ${e.status === "held" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                                    >
                                       {e.status}
                                    </span>
                                 </td>
                                 <td className="p-3 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* FINANCE TAB */}
         {activeTab === "finance" && (
            <Card>
               <CardHeader>
                  <CardTitle>Finance Wallets ({financeWallets.length})</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                     <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Balance</p>
                        <p className="text-2xl font-bold text-purple-600">
                           ₦{financeWallets.reduce((s, w) => s + parseFloat(w.balance || 0), 0).toLocaleString()}
                        </p>
                     </div>
                     <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Held in Escrow</p>
                        <p className="text-2xl font-bold text-orange-600">
                           ₦{financeWallets.reduce((s, w) => s + parseFloat(w.held_in_escrow || 0), 0).toLocaleString()}
                        </p>
                     </div>
                     <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Distributed</p>
                        <p className="text-2xl font-bold text-green-600">
                           ₦{financeWallets.reduce((s, w) => s + parseFloat(w.distributed || 0), 0).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left p-3 font-bold">Finance Officer</th>
                              <th className="text-left p-3 font-bold">Balance</th>
                              <th className="text-left p-3 font-bold">Escrow</th>
                              <th className="text-left p-3 font-bold">Distributed</th>
                           </tr>
                        </thead>
                        <tbody>
                           {financeWallets.map((w) => (
                              <tr key={w.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">
                                    {w.fname} {w.lname}
                                 </td>
                                 <td className="p-3 font-bold">₦{parseFloat(w.balance).toLocaleString()}</td>
                                 <td className="p-3">₦{parseFloat(w.held_in_escrow).toLocaleString()}</td>
                                 <td className="p-3">₦{parseFloat(w.distributed).toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* TRANSACTIONS TAB */}
         {activeTab === "transactions" && (
            <Card>
               <CardHeader>
                  <CardTitle>Wallet Transactions (Recent {transactions.length})</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b">
                              <th className="text-left p-3 font-bold">Type</th>
                              <th className="text-left p-3 font-bold">Amount</th>
                              <th className="text-left p-3 font-bold">Description</th>
                              <th className="text-left p-3 font-bold">Status</th>
                              <th className="text-left p-3 font-bold">Date</th>
                           </tr>
                        </thead>
                        <tbody>
                           {transactions.slice(0, 30).map((t) => (
                              <tr key={t.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                                       {t.type}
                                    </span>
                                 </td>
                                 <td className="p-3 font-bold">₦{parseFloat(t.amount).toLocaleString()}</td>
                                 <td className="p-3 text-xs">{t.description}</td>
                                 <td className="p-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                       {t.status}
                                    </span>
                                 </td>
                                 <td className="p-3 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   );
}
