"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Search, Filter, Truck, MapPin, Clock, CheckCircle, Navigation } from "lucide-react";

export default function LogisticsPage() {
   const [shipments, setShipments] = useState([]);
   const [filteredShipments, setFilteredShipments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");

   const statuses = ["PENDING", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELAYED"];

   useEffect(() => {
      const fetchShipments = async () => {
         try {
            const res = await fetch("/api/proxy/buyer/logistics");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  setShipments(json.data);
                  setFilteredShipments(json.data);
               }
            }
         } catch (err) {
            console.error("Failed to fetch logistics:", err);
            // Mock data
            const mockShipments = [
               {
                  id: "SHIP-001",
                  orderId: "ORD-001",
                  destination: "Nairobi, Kenya",
                  carrier: "FastFreight Ltd",
                  status: "DELIVERED",
                  estimatedDate: new Date(Date.now() + 86400000).toISOString(),
                  actualDate: new Date().toISOString(),
                  items: 15,
               },
               {
                  id: "SHIP-002",
                  orderId: "ORD-002",
                  destination: "Mombasa, Kenya",
                  carrier: "TransportCo",
                  status: "IN_TRANSIT",
                  estimatedDate: new Date(Date.now() + 259200000).toISOString(),
                  items: 8,
               },
            ];
            setShipments(mockShipments);
            setFilteredShipments(mockShipments);
         } finally {
            setLoading(false);
         }
      };
      fetchShipments();
   }, []);

   useEffect(() => {
      let filtered = shipments;

      if (searchTerm) {
         filtered = filtered.filter(
            (shipment) =>
               shipment.id?.includes(searchTerm) ||
               shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (statusFilter) {
         filtered = filtered.filter((shipment) => shipment.status === statusFilter);
      }

      setFilteredShipments(filtered);
   }, [searchTerm, statusFilter, shipments]);

   const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
   const inTransitCount = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length;

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Logistics & Shipments</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time tracking of global deliveries and supply chain flow</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Shipments" value={shipments.length} icon={<Navigation size={24} />} color="indigo" />
            <StatCard label="In Transit" value={inTransitCount} icon={<Truck size={24} />} color="orange" />
            <StatCard label="Delivered" value={deliveredCount} icon={<CheckCircle size={24} />} color="emerald" />
         </div>

         <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow flex gap-4 p-4 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
               <div className="flex-grow relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input 
                     type="text" 
                     placeholder="Search shipment ID or destination..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500" 
                  />
               </div>
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
               >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                     <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                  ))}
               </select>
            </div>
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Truck className="text-indigo-600" /> Transit Log ({filteredShipments.length})
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {loading ? (
                  <div className="text-center py-20 animate-pulse font-black text-gray-300">Tracking Shipments...</div>
               ) : filteredShipments.length > 0 ? (
                  <div className="space-y-6">
                     {filteredShipments.map((shipment) => (
                        <ShipmentRow key={shipment.id} shipment={shipment} />
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900">
                     <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No shipments found in log</p>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function StatCard({ label, value, icon, color }) {
   const colors = {
      indigo: "bg-indigo-500 shadow-indigo-500/20",
      orange: "bg-orange-500 shadow-orange-500/20",
      emerald: "bg-emerald-500 shadow-emerald-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
         <CardContent className="p-6 flex items-center gap-6">
            <div className={`p-4 ${colors[color]} text-white rounded-3xl shadow-lg`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
               <p className="text-2xl font-black text-(--foreground) tracking-tighter">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}

function ShipmentRow({ shipment }) {
   const getStatusColor = (status) => {
      switch (status) {
         case "PENDING": return "bg-gray-100 text-gray-700";
         case "IN_TRANSIT": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
         case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
         case "DELIVERED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
         case "DELAYED": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
         default: return "bg-gray-100 text-gray-700";
      }
   };

   return (
      <div className="p-8 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 hover:shadow-xl transition-all">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-sm">
               <Truck className="text-indigo-600" size={28} />
            </div>
            <div>
               <h3 className="text-xl font-black">{shipment.id}</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order: {shipment.orderId} • {shipment.items} items</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
                  <MapPin size={16} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                  <p className="font-black text-sm">{shipment.destination}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
                  <Clock size={16} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                  <p className="font-black text-sm">{new Date(shipment.estimatedDate).toLocaleDateString()}</p>
               </div>
            </div>
         </div>

         <div className="flex flex-col items-end shrink-0">
            <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(shipment.status)}`}>
               {shipment.status.replace(/_/g, " ")}
            </span>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Carrier: {shipment.carrier}</p>
         </div>
      </div>
   );
}
