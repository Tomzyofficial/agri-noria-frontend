"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Truck, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

import React from "react";
import { ORDER_STATUS_CONFIG, getStatusBadgeClass } from "@/app/(dashboard)/dashboard/components/orders/OrderStatusUtils";
import { fetcher, formatDate, formatLabel } from "@/utils/otherUtils";
// import { LogisticsOrderDetailModal } from "@/app/(dashboard)/marketplace/logistics/components/LogisticsOrderDetailModal";
import { OrderDetailModal } from "./OrderDetailModal";

export function OrdersList() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const statusFilter = searchParams.get("status") || "";
   const [selectedOrder, setSelectedOrder] = useState(null);

   // console.log(selectedOrder);

   const ordersUrl = useMemo(() => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      return `/api/proxy/buyer/orders/seller${qs ? `?${qs}` : ""}`;
   }, [statusFilter]);

   const { data, error, isLoading, mutate } = useSWR(ordersUrl, fetcher);
   const orders = data?.data ?? [];

   const getVehicleTitle = (order) => {
      return order.metadata?.logistics_provider?.vehicle_title || "—";
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <Link href="/marketplace/store" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to overview
               </Link>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchased orders</h1>
            </div>
         </div>

         <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => router.push("/marketplace/store/orders")} className={`px-3 cursor-pointer py-1.5 rounded-full text-sm border ${!statusFilter ? "bg-green-100 border-green-300 text-green-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
               All {isLoading ? "—" : orders && orders.length > 0 ? orders[0].all_orders : 0}
            </Button>
            {ORDER_STATUS_CONFIG.map(({ status, icon, label }) => (
               <Link key={status} href={`/marketplace/store/orders?status=${status}`} className={`px-2 flex items-center gap-2 py-1.5 rounded-full text-sm border ${statusFilter === status ? "bg-green-100 border-green-300 text-green-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {icon && React.createElement(icon, { className: "w-4 h-4" })}
                  {label} {isLoading ? "—" : orders && orders.length > 0 ? orders[0][status] : 0}
               </Link>
            ))}
         </div>

         <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border overflow-hidden">
            {error && <div className="p-6 text-red-600 text-sm">{error.message || "Failed to load orders"}</div>}

            {isLoading && <div className="p-10 text-center text-gray-500">Loading orders...</div>}

            {!isLoading && !error && orders.length === 0 && <div className="p-10 text-center text-gray-500">{statusFilter ? `No orders with status "${formatLabel(statusFilter)}".` : "No orders to see yet."}</div>}

            {!isLoading && !error && orders.length > 0 && (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                           <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">{order.id.slice(0, 8)}…</td>
                              <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                 <div className="flex items-center gap-1">
                                    <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                                    {formatLabel(getVehicleTitle(order))}
                                 </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px]">
                                 <div className="flex items-start gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{order.delivery_address || "—"}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                 <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(order.status)}`}>{formatLabel(order.status)}</span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{order.created_at ? formatDate(order.created_at) : "—"}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                 <div className="flex flex-wrap gap-2">
                                    <Button type="button" onClick={() => setSelectedOrder(order)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                       <Eye className="w-3.5 h-3.5" />
                                       View
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         <OrderDetailModal selectedOrder={selectedOrder} open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} />
      </div>
   );
}
