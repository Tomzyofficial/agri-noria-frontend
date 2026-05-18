"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTruckMoving, FaBoxOpen, FaRoute, FaCheckCircle, FaUsers, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SalesDistributionDashboard() {
   const [stats, setStats] = useState({
      activeShipments: 0,
      pendingDeliveries: 0,
      fulfilledOrders: 0
   });
   const [loading, setLoading] = useState(true);
   const [ecosystemOrders, setEcosystemOrders] = useState([]);
   const [distributors, setDistributors] = useState([]);
   const [loadingOrders, setLoadingOrders] = useState(false);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const res = await fetch("/api/proxy/pipeline/stats/sales");
            const data = await res.json();
            if (data.success) setStats(data.data);
         } catch (error) {
            console.error("Failed to fetch sales stats", error);
         } finally {
            setLoading(false);
         }
      };
      fetchStats();
      fetchEcosystemOrders();
   }, []);

   const fetchEcosystemOrders = async () => {
      setLoadingOrders(true);
      try {
         const [ordersRes, distRes] = await Promise.all([
            fetch("/api/proxy/pipeline/buyer-orders/all"),
            fetch("/api/proxy/pipeline/distributors")
         ]);
         if (ordersRes.ok) {
            const od = await ordersRes.json();
            setEcosystemOrders(od.data || []);
         }
         if (distRes.ok) {
            const dd = await distRes.json();
            setDistributors(dd.data || []);
         }
      } catch (err) {
         toast.error("Failed to fetch ecosystem orders");
      } finally {
         setLoadingOrders(false);
      }
   };

   const assignDistributor = async (orderId, distributorId) => {
      if (!distributorId) return toast.error("Please select a distributor");
      try {
         const res = await fetch("/api/proxy/pipeline/buyer-orders/assign-distributor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId, distributor_id: distributorId })
         });
         const data = await res.json();
         if (res.ok) {
            toast.success("Order assigned successfully");
            fetchEcosystemOrders();
         } else {
            toast.error(data.error || "Failed to assign");
         }
      } catch (err) {
         toast.error("Network error");
      }
   };

   return (
      <div className="space-y-10 max-w-7xl mx-auto py-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Sales & <span className="text-blue-600">Distribution</span></h1>
               <p className="text-gray-500 mt-2 font-medium text-lg">Platform Logistics Hub & Order Fulfillment Center.</p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operational Node: Active</span>
            </div>
         </div>

         {/* Quick Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="Active Shipments" value={loading ? "..." : stats.activeShipments} icon={<FaTruckMoving />} color="text-blue-600" bg="bg-blue-50" link="/dashboard/sales-&-distribution/shipments" />
            <StatCard title="Warehouse Stock" value={loading ? "..." : "450 T"} icon={<FaBoxOpen />} color="text-amber-600" bg="bg-amber-50" link="/dashboard/sales-&-distribution/warehouse" />
            <StatCard title="Fulfilled Orders" value={loading ? "..." : stats.fulfilledOrders} icon={<FaCheckCircle />} color="text-emerald-600" bg="bg-emerald-50" />
         </div>

         {/* Primary Action Section: Ecosystem Orders */}
         <div className="space-y-6">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ecosystem Orders</h2>
                  <p className="text-sm text-gray-500 font-medium">Fulfill buyer orders secured in platform escrow.</p>
               </div>
               <Link href="/dashboard/sales-&-distribution/analytics">
                  <Button variant="ghost" className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50">View Analytics <FaArrowRight /></Button>
               </Link>
            </div>

            {loadingOrders ? (
               <div className="py-20 text-center font-black text-gray-300 italic animate-pulse">Scanning Ecosystem Ledger...</div>
            ) : ecosystemOrders.length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                  {ecosystemOrders.map((order) => (
                     <Card key={order.id} className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-900 p-10 flex flex-col md:flex-row justify-between items-center gap-10 hover:shadow-2xl transition-shadow border-t-8 border-slate-50 dark:border-gray-800">
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-4">
                              <h3 className="font-black text-2xl text-slate-900 dark:text-white">{order.buyer_name}</h3>
                              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                 {order.status}
                              </span>
                              {order.escrow_status === 'held' && (
                                 <div className="flex items-center gap-1.5 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    <FaShieldAlt /> Escrow Secured
                                 </div>
                              )}
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                 <p className="font-bold text-sm dark:text-gray-300">#{order.id.substring(0, 8)}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</p>
                                 <p className="font-bold text-sm text-slate-900 dark:text-white">₦{parseFloat(order.total_amount).toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fulfillment Address</p>
                                 <p className="font-bold text-sm truncate max-w-[200px] dark:text-gray-300">{order.delivery_address}</p>
                              </div>
                           </div>
                        </div>
                        
                        <div className="shrink-0">
                           {order.escrow_status === 'held' && !order.distributor_id ? (
                              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                 <select 
                                    id={`dist-${order.id}`}
                                    className="bg-transparent border-none outline-none font-black text-sm px-4 pr-10 appearance-none cursor-pointer"
                                 >
                                    <option value="">Select Logistics Agent...</option>
                                    {distributors.map(d => (
                                       <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                 </select>
                                 <Button 
                                    onClick={() => assignDistributor(order.id, document.getElementById(`dist-${order.id}`).value)}
                                    className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl shadow-2xl hover:bg-black uppercase tracking-widest text-[10px]"
                                 >
                                    Assign
                                 </Button>
                              </div>
                           ) : order.distributor_id ? (
                              <Link href="/dashboard/sales-&-distribution/shipments">
                                 <div className="bg-emerald-50 dark:bg-emerald-900/20 px-10 py-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.2em] group cursor-pointer hover:bg-emerald-100 transition-colors">
                                    <FaTruckMoving size={18} className="group-hover:translate-x-1 transition-transform" /> Logistics Active
                                 </div>
                              </Link>
                           ) : (
                              <div className="bg-amber-50 dark:bg-amber-900/20 px-10 py-6 rounded-3xl border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                 Awaiting Escrow
                              </div>
                           )}
                        </div>
                     </Card>
                  ))}
               </div>
            ) : (
               <Card className="rounded-[4rem] border-none shadow-xl bg-white dark:bg-gray-800 p-24 text-center">
                  <FaBoxOpen className="text-6xl text-gray-100 mx-auto mb-8" />
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Ecosystem Pipeline Clear</h3>
                  <p className="text-gray-400 mt-2 max-w-sm mx-auto">New buyer orders from the marketplace will appear here once they secure funding.</p>
               </Card>
            )}
         </div>
      </div>
   );
}

function StatCard({ title, value, icon, color, bg, link }) {
   const content = (
      <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all group ${link ? 'hover:scale-[1.03] cursor-pointer' : ''}`}>
         <CardContent className="p-10 flex items-center gap-6">
            <div className={`p-6 rounded-[2rem] ${bg} ${color} text-3xl group-hover:scale-110 transition-transform`}>{icon}</div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
               <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{value}</p>
            </div>
         </CardContent>
      </Card>
   );

   return link ? <Link href={link}>{content}</Link> : content;
}
