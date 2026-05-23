"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Truck, MapPin, ArrowLeft, Play } from "lucide-react";
import {
  logisticsFetcher,
  getStatusBadgeClass,
  formatStatusLabel,
} from "./BuyerOrderUtils";
import { LogisticsOrderDetailModal } from "./BuyerOrderDetailModal";

export function LogisticsShipmentsList() {
  const router = useRouter();
  const [viewOrderId, setViewOrderId] = useState(null);
  const [actingId, setActingId] = useState(null);

  const { data, error, isLoading, mutate } = useSWR(
    "/api/proxy/vendor/logistics/shipments",
    logisticsFetcher,
  );

  const shipments = data?.data ?? [];

  const handleStartShipment = async (orderId) => {
    if (!confirm("Notify system that shipment has started for this order?")) {
      return;
    }
    setActingId(orderId);
    try {
      const res = await fetch(
        `/api/proxy/vendor/logistics/orders/${orderId}/start-shipment`,
        { method: "POST" },
      );
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to start shipment");
      }
      toast.success("Shipment started — order marked in transit");
      mutate();
      router.push("/dashboard/logistics/orders?status=in_transit");
    } catch (err) {
      toast.error(err.message || "Failed to start shipment");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/logistics"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to overview
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Shipments
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Accepted orders ready for pickup and delivery
        </p>
      </div>

      <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border overflow-hidden">
        {error && (
          <div className="p-6 text-red-600 text-sm">
            {error.message || "Failed to load shipments"}
          </div>
        )}
        {isLoading && (
          <div className="p-10 text-center text-gray-500">
            Loading shipments...
          </div>
        )}
        {!isLoading && !error && shipments.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No active shipments. Accept paid orders from the{" "}
            <Link
              href="/dashboard/logistics/orders?status=paid"
              className="text-green-700 underline"
            >
              orders page
            </Link>
            .
          </div>
        )}

        {!isLoading && !error && shipments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 text-sm font-mono">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-4 text-sm">{order.buyer_name}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {order.vehicle_title}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm max-w-[180px]">
                      <div className="flex items-start gap-1 line-clamp-2">
                        <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                        {order.delivery_address}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(order.status)}`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setViewOrderId(order.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        {order.status === "processing" && (
                          <button
                            type="button"
                            disabled={actingId === order.id}
                            onClick={() => handleStartShipment(order.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                            {actingId === order.id
                              ? "Starting..."
                              : "Start shipment"}
                          </button>
                        )}
                        {order.status === "in_transit" && (
                          <span className="text-xs text-cyan-700">
                            In transit
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LogisticsOrderDetailModal
        orderId={viewOrderId}
        open={Boolean(viewOrderId)}
        onClose={() => setViewOrderId(null)}
      />
    </div>
  );
}
