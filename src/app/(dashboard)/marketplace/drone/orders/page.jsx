"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { Search, ShoppingBag, MapPin, Eye, CheckCircle2, Clock } from "lucide-react";
import { fetcher, formatDate } from "@/utils/otherUtils";
import { Modal } from "@/components/ui/Modal";

const STATUS_BADGES = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function DroneOrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, error, isLoading } = useSWR("/api/proxy/buyer/orders/seller", fetcher);

  const orders = Array.isArray(data?.orders) ? data.orders : [];

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      String(o.id || "").toLowerCase().includes(term) ||
      String(o.buyer_name || "").toLowerCase().includes(term) ||
      String(o.status || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 my-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-(--foreground) tracking-tight">
            Drone Service & Hardware Orders
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage incoming purchase, rental, and spraying service orders.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> All Drone Orders ({orders.length})
          </CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID or Buyer..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-rose-500">
              Failed to load drone orders. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No orders recorded yet. Incoming drone purchases and service bookings will appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const st = (order.status || "pending").toLowerCase();
                      const badgeClass = STATUS_BADGES[st] || STATUS_BADGES.pending;

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100">
                            #{String(order.id).slice(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {order.buyer_name || order.metadata?.buyer_info?.fname || "Ecosystem Client"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                            ₦{Number(order.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${badgeClass}`}>
                              {st}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs font-semibold rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClick={() => setSelectedOrder(null)}
          title={`Order #${String(selectedOrder.id).slice(0, 8)}`}
        >
          <div className="space-y-4 text-sm text-left">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2">
              <p><strong>Total Amount:</strong> ₦{Number(selectedOrder.total_amount || 0).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className="capitalize font-bold">{selectedOrder.status}</span></p>
              <p><strong>Delivery Address:</strong> {selectedOrder.delivery_address || "On-site deployment"}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            <Button onClick={() => setSelectedOrder(null)} className="w-full rounded-xl">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
