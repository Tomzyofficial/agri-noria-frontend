"use client";

import useSWR from "swr";
import Link from "next/link";
import { Package, Wallet, ArrowRight } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "./logisticsOrderUtils";
import { fetcher } from "@/utils/otherUtils";
import { formatPrice } from "@/utils/formatPrice";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/otherUtils";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { quoteRequestDetails } from "./QuoteRequestDetails";

export function LogisticsOverview() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { data, error, isLoading } = useSWR("/api/proxy/vendor/logistics/orders/stats", fetcher);

  const stats = data?.data;

  const { data: quoteData, error: quoteError, isLoading: quoteIsLoading } = useSWR("/api/proxy/vendor/logistics/quote-requests", fetcher);

  const STATUS_BADGES = {
    pending: "bg-yellow-100 text-yellow-800",
    contacted: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logistics Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Orders assigned to your vehicles, grouped by status</p>
        </div>
        <Link href="/marketplace/logistics/orders" className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800">
          View all orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 p-4 text-sm">{error.message || "Failed to load order statistics"}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5 col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total deliveries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{isLoading ? "—" : (stats?.total_orders ?? 0)}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivery revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{isLoading ? "—" : stats?.total_delivery_revenue ? formatPrice(stats?.total_delivery_revenue, stats?.country_code, stats?.currency) : 0}</p>
            </div>
            <Wallet className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {ORDER_STATUS_CONFIG.map(({ key, label, status, icon: Icon, cardClass, iconClass }) => (
          <Link key={key} href={`/marketplace/logistics/orders?status=${status}`} className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className={`text-2xl font-bold mt-1 capitalize ${cardClass}`}>{isLoading ? "—" : (stats?.[key] ?? 0)}</p>
              </div>
              <Icon className={`w-7 h-7 ${iconClass}`} />
            </div>
          </Link>
        ))}
      </div>

      <section className="my-10">
        <table className="w-full text-left border-collapse rounded-lg">
          <caption className="py-5">Recent Quote Requests</caption>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-(--gray-color">
              {["Customer", "Vehicle", "Location", "Request Date", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {quoteIsLoading ? (
            <TableSkeleton rows={5} />
          ) : quoteError ? (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-red-500">
                  {quoteError.message}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white dark:bg-(--card-dark) divide-y divide-gray-100 dark:divide-gray-800">
              {quoteData?.quoteRequests?.length > 0 ? (
                quoteData?.quoteRequests?.map((req) => {
                  const initials = req.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={req.quote_request_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">{initials}</div>
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">{req.full_name}</span>
                        </div>
                      </td>

                      {/* Storage Facility */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{req.vehicle_title}</td>

                      {/* Location */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{req.base_location}</td>

                      {/* Request Date */}
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(req.created_at)}</td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[req.status]}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                      </td>

                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        <Button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowModal(true);
                          }}
                          className="bg-green-100 text-green-900 hover:bg-green-300 px-1 py-1 rounded-lg"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No quote requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </section>
      {/* section for modals */}
      <Modal
        isOpen={showModal}
        onClick={() => {
          setShowModal(false);
          setSelectedRequest(null);
        }}
        title="Quote Request Details"
      >
        {selectedRequest && quoteRequestDetails(selectedRequest)}
      </Modal>
    </div>
  );
}
