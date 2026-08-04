"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fetcher } from "@/utils/otherUtils";
import Link from "next/link";
import useSWR from "swr";
import { LuMessageCircleMore } from "react-icons/lu";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { QuoteRequestDetails } from "./QuoteRequestDetails";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Package, EyeIcon } from "lucide-react";
import { TbHandClick } from "react-icons/tb";
import BarChartLoading from "@/components/ui/BarChartLoadingSkeleton";
import { StatCard } from "../../../dashboard/components/ui/StatCard";
import { QuoteRequestTable } from "@/app/(dashboard)/dashboard/components/QuoteRequestTable";

export function DashboardOverview({ user }) {
   const [showModal, setShowModal] = useState(false);
   const [selectedRequest, setSelectedRequest] = useState(null);

   const { data, error, isLoading } = useSWR("/api/proxy/vendor/storage/stats", fetcher);

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
            <StatCard isLoading={isLoading} error={error} title="Total Facilities" value={data?.total ?? 0} icon={Package} />
            <StatCard isLoading={isLoading} error={error} title="Views" value={data?.view_count ?? 0} icon={EyeIcon} />
            <StatCard isLoading={isLoading} error={error} title="Booking Clicks" value={data?.booking_click_count ?? 0} icon={TbHandClick} />
            <StatCard isLoading={isLoading} error={error} title="Total Requests" value={data?.quote_requests_count ?? 0} icon={LuMessageCircleMore} />
         </div>

         <section className="grid lg:grid-cols-3 gap-6 my-10">
            {isLoading ? (
               <BarChartLoading />
            ) : error ? (
               <Card className="text-red-500 text-sm h-64 flex items-center justify-center">{error.message}</Card>
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
                  <CardTitle className="underline underline-offset-4 mb-2">Quick Actions</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 flex flex-col">
                  <Link className="hover:underline" href="/marketplace/storage-facility/storage-facilities">
                     Manage Listings
                  </Link>
                  <Link href="/marketplace/storage-facility/storage-facilities/add-new" className="hover:underline " variant="outline">
                     Create New Listing
                  </Link>
                  <Link href="/marketplace/storage-facility/quote-requests" className="hover:underline " variant="outline">
                     View All Quote Requests
                  </Link>
               </CardContent>
            </Card>
         </section>

         {/* Recent quote request */}
         <QuoteRequestTable url="/api/proxy/vendor/storage/quote-requests" setSelectedRequest={setSelectedRequest} setShowModal={setShowModal} />
         {/* section for modals */}
         <Modal
            isOpen={showModal}
            onClick={() => {
               setShowModal(false);
               setSelectedRequest(null);
            }}
            title="Quote Request Details"
         >
            {selectedRequest && QuoteRequestDetails(selectedRequest)}
         </Modal>
      </div>
   );
}
