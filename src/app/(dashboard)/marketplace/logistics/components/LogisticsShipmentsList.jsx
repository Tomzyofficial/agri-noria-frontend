"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Truck, MapPin, ArrowLeft, Play, CheckCircle } from "lucide-react";
import { getStatusBadgeClass, formatStatusLabel } from "./logisticsOrderUtils";
import { fetcher } from "@/utils/otherUtils";
import { LogisticsOrderDetailModal } from "./LogisticsOrderDetailModal";
import { ShipmentStartModal } from "./ShipmentStartModal";
import { OTPVerificationModal } from "./OTPVerificationModal";

export function LogisticsShipmentsList() {
  const router = useRouter();
  const [viewOrderId, setViewOrderId] = useState(null);
  const [shipmentStartOrderId, setShipmentStartOrderId] = useState(null);
  const [shipmentStartOrderData, setShipmentStartOrderData] = useState(null);
  const [completeDeliveryOrderId, setCompleteDeliveryOrderId] = useState(null);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState(null);

  const { data, error, isLoading, mutate } = useSWR(
    "/api/proxy/vendor/logistics/shipments",
    fetcher,
  );

  const shipments = data?.data ?? [];

  const handleStartShipment = (order) => {
    setShipmentStartOrderId(order.id);
    setShipmentStartOrderData(order);
  };

  const handleShipmentStartSuccess = (result) => {
    toast.success(
      `Shipment started successfully! Tracking number: ${result.tracking_number}`,
    );
    mutate();
    router.push("/marketplace/logistics/orders?status=in_transit");
  };

  const handleCompleteDelivery = (orderId) => {
    setCompleteDeliveryOrderId(orderId);
    setOtpError(null);
  };

  const handleOTPVerify = async (otp) => {
    setVerifyingOTP(true);
    setOtpError(null);

    try {
      const res = await fetch(
        `/api/proxy/vendor/logistics/orders/${completeDeliveryOrderId}/complete-delivery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        },
      );

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error || "Failed to verify OTP");
      }

      toast.success("Delivery completed successfully!");
      setCompleteDeliveryOrderId(null);
      mutate();
      router.push("/marketplace/logistics/orders?status=completed");
    } catch (err) {
      setOtpError(err.message || "Failed to verify OTP");
    } finally {
      setVerifyingOTP(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/marketplace/logistics"
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
              href="/marketplace/logistics/orders?status=paid"
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
                            onClick={() => handleStartShipment(order)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start shipment
                          </button>
                        )}
                        {order.status === "in_transit" && (
                          <button
                            type="button"
                            onClick={() => handleCompleteDelivery(order.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Complete
                          </button>
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

      <ShipmentStartModal
        orderId={shipmentStartOrderId}
        orderData={shipmentStartOrderData}
        open={Boolean(shipmentStartOrderId)}
        onClose={() => {
          setShipmentStartOrderId(null);
          setShipmentStartOrderData(null);
        }}
        onSuccess={handleShipmentStartSuccess}
      />

      <OTPVerificationModal
        open={Boolean(completeDeliveryOrderId)}
        onClose={() => {
          setCompleteDeliveryOrderId(null);
          setOtpError(null);
        }}
        onConfirm={handleOTPVerify}
        title="Complete Delivery"
        description="Enter the 6-digit OTP code provided by the buyer to complete this delivery"
        loading={verifyingOTP}
        error={otpError}
      />
    </div>
  );
}
