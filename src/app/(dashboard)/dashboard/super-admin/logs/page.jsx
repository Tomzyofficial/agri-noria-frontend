"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AuditLogsPage() {
   const [logs, setLogs] = useState([]);
   const [filteredLogs, setFilteredLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [actionFilter, setActionFilter] = useState("");
   const [startDate, setStartDate] = useState("");
   const [endDate, setEndDate] = useState("");

   const actions = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "SUSPEND", "ACTIVATE", "EXPORT"];

   useEffect(() => {
      const fetchLogs = async () => {
         try {
            const res = await fetch("/api/proxy/admin/audit-logs");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  setLogs(json.data);
                  setFilteredLogs(json.data);
               }
            }
         } catch (err) {
            console.error("Failed to fetch audit logs:", err);
            // Mock data for development
            const mockLogs = [
               {
                  id: 1,
                  userId: "user123",
                  userEmail: "admin@example.com",
                  action: "LOGIN",
                  resource: "System",
                  details: "User logged in",
                  ipAddress: "192.168.1.1",
                  timestamp: new Date().toISOString(),
               },
               {
                  id: 2,
                  userId: "user456",
                  userEmail: "farmer@example.com",
                  action: "CREATE",
                  resource: "Farm Profile",
                  details: "Created new farm profile",
                  ipAddress: "192.168.1.50",
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
               },
            ];
            setLogs(mockLogs);
            setFilteredLogs(mockLogs);
         } finally {
            setLoading(false);
         }
      };
      fetchLogs();
   }, []);

   useEffect(() => {
      let filtered = logs;

      if (searchTerm) {
         filtered = filtered.filter(
            (log) =>
               log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (actionFilter) {
         filtered = filtered.filter((log) => log.action === actionFilter);
      }

      if (startDate) {
         filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(startDate));
      }

      if (endDate) {
         filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(endDate));
      }

      setFilteredLogs(filtered);
   }, [searchTerm, actionFilter, startDate, endDate, logs]);

   const getActionColor = (action) => {
      switch (action.toUpperCase()) {
         case "LOGIN":
            return "bg-blue-100 text-blue-700";
         case "LOGOUT":
            return "bg-gray-100 text-gray-700";
         case "CREATE":
            return "bg-green-100 text-green-700";
         case "UPDATE":
            return "bg-yellow-100 text-yellow-700";
         case "DELETE":
            return "bg-red-100 text-red-700";
         case "SUSPEND":
            return "bg-orange-100 text-orange-700";
         case "ACTIVATE":
            return "bg-green-100 text-green-700";
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
            <h1 className="text-3xl font-bold text-(--foreground)">Audit Logs</h1>
            <p className="text-gray-500 mt-1">Track all system activities and user actions.</p>
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
                     <label className="block text-sm font-medium mb-2">Search</label>
                     <input
                        type="text"
                        placeholder="Email, IP, details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">Action</label>
                     <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     >
                        <option value="">All Actions</option>
                        {actions.map((action) => (
                           <option key={action} value={action}>
                              {action}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">Start Date</label>
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-2">End Date</label>
                     <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                     />
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Logs Table */}
         <Card>
            <CardHeader>
               <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                           <th className="text-left py-3 px-4 font-semibold">User Email</th>
                           <th className="text-left py-3 px-4 font-semibold">Action</th>
                           <th className="text-left py-3 px-4 font-semibold">Resource</th>
                           <th className="text-left py-3 px-4 font-semibold">IP Address</th>
                           <th className="text-left py-3 px-4 font-semibold">Details</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredLogs.map((log) => (
                           <tr
                              key={log.id}
                              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                           >
                              <td className="py-3 px-4 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm">{log.userEmail}</td>
                              <td className="py-3 px-4">
                                 <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                                 >
                                    {log.action}
                                 </span>
                              </td>
                              <td className="py-3 px-4 text-sm">{log.resource}</td>
                              <td className="py-3 px-4 text-sm">{log.ipAddress}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{log.details}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredLogs.length === 0 && <div className="text-center py-8 text-gray-500">No logs found</div>}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
