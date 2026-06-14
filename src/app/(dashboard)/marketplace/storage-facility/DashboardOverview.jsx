"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetcher, formatDate } from "@/utils/otherUtils";
import Link from "next/link";
import useSWR from "swr";
import { LuMessageCircleMore } from "react-icons/lu";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { quoteRequestDetails } from "./components/QuoteRequestDetails";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, EyeIcon } from "lucide-react";
import { TbHandClick } from "react-icons/tb";
import BarChartLoading from "@/components/ui/BarChartLoadingSkeleton";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { StatCard } from "../../dashboard/components/ui/StatCard";

export function DashboardOverview({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data, error, isLoading } = useSWR(
    "/api/proxy/vendor/storage/stats",
    fetcher,
  );

  const {
    data: quoteData,
    error: quoteError,
    isLoading: quoteIsLoading,
  } = useSWR("/api/proxy/vendor/storage/quote-requests", fetcher);

  const STATUS_BADGES = {
    pending: "bg-yellow-100 text-yellow-800",
    contacted: "bg-green-100 text-green-800",
  };

  const overviewData = [
    { name: "Views", value: data?.view_count ?? 0 },
    { name: "Clicks", value: data?.booking_click_count ?? 0 },
    { name: "Requests", value: data?.quote_requests_count ?? 0 },
  ];

  return (
    <div className="my-25 lg:my-5 dark:text-(--foreground)">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user}!</h1>
        <p className="">Monitor your storage performance and leads</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard
          isLoading={isLoading}
          error={error}
          title="Total Facilities"
          value={data?.total ?? 0}
          icon={Package}
        />
        <StatCard
          isLoading={isLoading}
          error={error}
          title="Views"
          value={data?.view_count ?? 0}
          icon={EyeIcon}
        />
        <StatCard
          isLoading={isLoading}
          error={error}
          title="Booking Clicks"
          value={data?.booking_click_count ?? 0}
          icon={TbHandClick}
        />
        <StatCard
          isLoading={isLoading}
          error={error}
          title="Total Requests"
          value={data?.quote_requests_count ?? 0}
          icon={LuMessageCircleMore}
        />
      </div>

      <section className="grid lg:grid-cols-3 gap-6 my-10">
        {isLoading ? (
          <BarChartLoading />
        ) : error ? (
          <Card className="text-red-500 text-sm h-64 flex items-center justify-center">
            {error.message}
          </Card>
        ) : (
          <div className="lg:col-span-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="rounded-2xl py-2">
          <CardHeader>
            <CardTitle className="underline underline-offset-4 mb-2">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col">
            <Link
              className="hover:underline"
              href="/marketplace/storage-facility/storage-facilities"
            >
              Manage Listings
            </Link>
            <Link
              href="/marketplace/storage-facility/storage-facilities/add-new"
              className="hover:underline "
              variant="outline"
            >
              Create New Listing
            </Link>
            <Link
              href="/marketplace/storage-facility/quote-requests"
              className="hover:underline "
              variant="outline"
            >
              View All Quote Requests
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Leads Section */}
      <section className="my-10">
        <table className="w-full text-left border-collapse rounded-lg">
          <caption className="py-5">Recent Quote Requests</caption>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-(--gray-color">
              {[
                "Customer",
                "Storage Facility",
                "Location",
                "Request Date",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
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
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-red-500"
                >
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
                    <tr
                      key={req.quote_request_id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                            {req.full_name}
                          </span>
                        </div>
                      </td>

                      {/* Storage Facility */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {req.storage_name}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {req.location}
                      </td>

                      {/* Request Date */}
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[req.status]}`}
                        >
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </span>
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
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
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
