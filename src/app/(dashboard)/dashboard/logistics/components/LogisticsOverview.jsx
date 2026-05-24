"use client";

import useSWR from "swr";
import Link from "next/link";
import { Package, Wallet, ArrowRight } from "lucide-react";
import { ORDER_STATUS_CONFIG, logisticsFetcher } from "./logisticsOrderUtils";
import { formatPrice } from "@/utils/formatPrice";

export function LogisticsOverview() {
  const { data, error, isLoading } = useSWR(
    "/api/proxy/vendor/logistics/orders/stats",
    logisticsFetcher,
  );

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Logistics Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Orders assigned to your vehicles, grouped by status
          </p>
        </div>
        <Link
          href="/dashboard/logistics/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          View all orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 p-4 text-sm">
          {error.message || "Failed to load order statistics"}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5 col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {isLoading ? "—" : (stats?.total_orders ?? 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivery revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {isLoading
                  ? "—"
                  : formatPrice(
                      stats?.total_delivery_revenue,
                      stats?.country_code,
                      stats?.currency,
                    )}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {ORDER_STATUS_CONFIG.map(
          ({ key, label, status, icon: Icon, cardClass, iconClass }) => (
            <Link
              key={key}
              href={`/dashboard/logistics/orders?status=${status}`}
              className="bg-white dark:bg-(--card-dark) rounded-xl shadow-sm border p-5 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{label}</p>
                  <p
                    className={`text-2xl font-bold mt-1 capitalize ${cardClass}`}
                  >
                    {isLoading ? "—" : (stats?.[key] ?? 0)}
                  </p>
                </div>
                <Icon className={`w-7 h-7 ${iconClass}`} />
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
