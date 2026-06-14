"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "../../dashboard/components/ui/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EyeIcon, Package } from "lucide-react";
import { TbHandClick } from "react-icons/tb";
import BarChartLoading from "@/components/ui/BarChartLoadingSkeleton";
import { LuMessageCircleMore } from "react-icons/lu";
import useSWR from "swr";
import { fetcher } from "@/utils/otherUtils";

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/proxy/farm-development/analytics", fetcher);

  const overviewData = [
    { name: "Views", value: data?.data?.totalViews || 0 },
    { name: "Clicks", value: data?.data?.totalInquiries || 0 },
    { name: "Requests", value: data?.data?.totalInquiries || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard isLoading={isLoading} error={error} title="Total Listings" value={data?.data?.totalListings || 0} icon={Package} />
        <StatCard isLoading={isLoading} error={error} title="Booking Clicks" value="0" icon={TbHandClick} />
        <StatCard isLoading={isLoading} error={error} title="Total Views" value={data?.data?.totalViews || 0} icon={EyeIcon} />
        <StatCard isLoading={isLoading} error={error} title="Total Inquiries" value={data?.data?.totalInquiries || 0} icon={LuMessageCircleMore} />
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Distribution of lead statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {leadStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No leads yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Listings</CardTitle>
            <CardDescription>By number of views</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topListings && analytics.topListings.length > 0 ? (
              <div className="space-y-4">
                {analytics.topListings.map((listing, idx) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {listing.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {listing.views_count} views
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/listings/${listing.id}/view`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No listings yet
              </p>
            )}
          </CardContent>
        </Card>
      </div> */}

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

        {/* Quick Actions */}
        <Card className="rounded-2xl py-2">
          <CardHeader>
            <CardTitle className="underline underline-offset-4 mb-2">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col">
            <Link className="hover:underline" href="/marketplace/storage-facility/storage-facilities">
              Manage Listings
            </Link>
            <Link className="hover:underline" href="/marketplace/storage-facility/storage-facilities">
              Add Portfolio Project
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
    </div>
  );
}
