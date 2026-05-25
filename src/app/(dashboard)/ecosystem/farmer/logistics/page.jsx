"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTruck, FaWarehouse, FaMapMarkerAlt, FaHistory } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";

export default function LogisticsPage() {
   const { loading } = useFarmerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Logistics...</div>;

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Storage & Logistics</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your harvest storage and transportation requests</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
               <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                     <FaWarehouse className="text-amber-500" /> Storage Capacity
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="flex items-center justify-between p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                     <div>
                        <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Available Space</p>
                        <p className="text-3xl font-black text-amber-900 dark:text-amber-300">1,200 MT</p>
                     </div>
                     <button className="bg-amber-600 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">Book Space</button>
                  </div>
                  <div className="mt-6 space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nearby Warehouses</p>
                     <WarehouseRow name="Kano Central Silos" distance="4.2 KM" />
                     <WarehouseRow name="Northern Aggregator Hub" distance="12.8 KM" />
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
               <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                     <FaTruck className="text-blue-500" /> Active Shipments
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                     <FaTruck className="text-4xl text-gray-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active shipments in transit</p>
                     <button className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Request Transport</button>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

function WarehouseRow({ name, distance }) {
   return (
      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
         <div className="flex items-center gap-3">
            <FaWarehouse className="text-gray-400" />
            <span className="font-bold text-sm">{name}</span>
         </div>
         <span className="text-[10px] font-black text-gray-500">{distance}</span>
      </div>
   );
}
