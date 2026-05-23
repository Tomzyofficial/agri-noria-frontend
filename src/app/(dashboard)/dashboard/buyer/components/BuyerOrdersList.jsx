"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { MapPin, Truck, ArrowLeft, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

import React from "react";
import {
  ORDER_STATUS_CONFIG,
  logisticsFetcher,
  getStatusBadgeClass,
  formatStatusLabel,
} from "./BuyerOrderUtils";
import { BuyerOrderDetailModal } from "./BuyerOrderDetailModal";

export function BuyerOrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [viewOrderId, setViewOrderId] = useState(null);
  const [actingId, setActingId] = useState(null);

  const ordersUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const qs = params.toString();
    return `/api/proxy/buyer/orders${qs ? `?${qs}` : ""}`;
  }, [statusFilter]);

  const { data, error, isLoading, mutate } = useSWR(
    ordersUrl,
    logisticsFetcher,
  );
  const orders = data?.data ?? [];

  // Helper to extract seller name from order metadata
  const getSellerName = (order) => {
    const vendorInfo = order.metadata?.vendor_info || {};
    const fname = vendorInfo.seller_fname || order.seller_fname || "";
    const lname = vendorInfo.seller_lname || order.seller_lname || "";
    return [fname, lname].filter(Boolean).join(" ") || "—";
  };

  // Helper to extract vehicle title from order metadata
  const getVehicleTitle = (order) => {
    return (
      order.metadata?.logistics_provider?.vehicle_title ||
      order.vehicle_title ||
      "—"
    );
  };

  console.log("orders", orders);

  const handleAccept = async (orderId) => {
    if (!confirm("Accept this order and assign it for shipment?")) return;
    setActingId(orderId);
    try {
      const res = await fetch(
        `/api/proxy/vendor/logistics/orders/${orderId}/accept`,
        { method: "POST" },
      );
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to accept order");
      }
      toast.success("Order accepted — moved to shipments");
      mutate();
      router.push("/dashboard/logistics/shipments");
    } catch (err) {
      toast.error(err.message || "Failed to accept order");
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (orderId) => {
    if (
      !confirm(
        "Decline this order? It will be marked declined and reassigned to the nearest available partner.",
      )
    ) {
      return;
    }
    setActingId(orderId);
    try {
      const res = await fetch(
        `/api/proxy/vendor/logistics/orders/${orderId}/decline`,
        { method: "POST" },
      );
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to decline order");
      }
      toast.success(body.message || "Order declined");
      mutate();
    } catch (err) {
      toast.error(err.message || "Failed to decline order");
    } finally {
      setActingId(null);
    }
  };

  const canRespond = (status) => status === "paid";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/logistics"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Purchased orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review, accept, or decline delivery assignments for your fleet
          </p>
        </div>
        <Link
          href="/dashboard/logistics/shipments"
          className="text-sm font-medium text-green-700 hover:text-green-800"
        >
          Go to shipments →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => router.push("/dashboard/logistics/orders")}
          className={`px-3 cursor-pointer py-1.5 rounded-full text-sm border ${
            !statusFilter
              ? "bg-green-100 border-green-300 text-green-800"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </Button>
        {ORDER_STATUS_CONFIG.map(({ status, icon, label }) => (
          <Link
            key={status}
            href={`/dashboard/logistics/orders?status=${status}`}
            className={`px-2 flex items-center gap-2 py-1.5 rounded-full text-sm border ${
              statusFilter === status
                ? "bg-green-100 border-green-300 text-green-800"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {icon && React.createElement(icon, { className: "w-4 h-4" })}
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border overflow-hidden">
        {error && (
          <div className="p-6 text-red-600 text-sm">
            {error.message || "Failed to load orders"}
          </div>
        )}

        {isLoading && (
          <div className="p-10 text-center text-gray-500">
            Loading orders...
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            {statusFilter
              ? `No orders with status "${formatStatusLabel(statusFilter)}".`
              : "No orders assigned to your vehicles yet."}
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buyer
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
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
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                      {order.id.slice(0, 8)}…
                    </td>
                    {/* <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>{order.buyer_name || "—"}</div>
                      <div className="text-xs text-gray-500">
                        {order.buyer_email}
                      </div>
                    </td> */}
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {getSellerName(order)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                        {getVehicleTitle(order)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Fee: ₦{Number(order.delivery_fee ?? 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px]">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.delivery_address || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(order.status)}`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => setViewOrderId(order.id)}
                          className="cursor-pointer inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        {canRespond(order.status) && (
                          <>
                            <Button
                              type="button"
                              disabled={actingId === order.id}
                              onClick={() => handleAccept(order.id)}
                              className="cursor-pointer inline-flex items-center gap-1 text-sm text-green-700 hover:underline disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept
                            </Button>
                            <Button
                              type="button"
                              disabled={actingId === order.id}
                              onClick={() => handleDecline(order.id)}
                              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Decline
                            </Button>
                          </>
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

      <BuyerOrderDetailModal
        orderId={viewOrderId}
        open={Boolean(viewOrderId)}
        onClose={() => setViewOrderId(null)}
      />
    </div>
  );
}
