"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, TrendingUp, Package, Users, ArrowRight } from "lucide-react";
import { FaNairaSign } from "react-icons/fa6";
import useSWR from "swr";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

export function DashboardOverview({ user }) {
  const fetcher = async (url) => {
    const res = await fetch(url, {
      method: "GET",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const error = new Error(
        data.error || "An error occurred while fetching the data.",
      );
      throw error;
    }

    return data;
  };

  const { data, error, isLoading } = useSWR(
    "/api/proxy/vendor/storage/get-total-storage",
    fetcher,
  );

  return (
    <div className="my-25 lg:my-5 dark:text-(--foreground)">
      <div className="flex flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-(--foreground)">
            Storage Dashboard
          </h1>
          <p className="">Welcome back, {user}!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Total listings */}
        {isLoading ? (
          <CardSkeleton />
        ) : error ? (
          <Card className="text-red-500 text-sm h-32 flex items-center justify-center">
            {error.message}
          </Card>
        ) : (
          <Card className="px-4 py-6">
            <CardHeader className="flex items-center justify-between pb-2 px-2">
              <CardTitle className="text-sm font-medium">
                Total Facilities
              </CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>

            <CardContent>
              <div>
                <p className="text-2xl font-bold">{[data.total ?? 0]}</p>
                <p className="text-xs text-(--foreground)">
                  {[data.total ?? 0]} active
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Revenue */}
        <Card className="px-4 py-6">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2 px-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <FaNairaSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs">+15% from last month</p>
          </CardContent>
        </Card>

        {/* Active buyers */}
        <Card className="px-4 py-6">
          <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs">+7 new this week</p>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card className="px-4 py-6">
          <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0%</div>
            <p className="text-xs">vs last quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="px-4 py-6">
          <CardHeader>
            <CardTitle>Storage Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Manage your storage facilities, inventory, and pricing all in one
              place.
            </p>
            <Link
              href="/marketplace/storage-facility/storage-facilities"
              className="flex items-center justify-center group hover:bg-(--dark-green-color) focus:bg-(--dark-green-color) bg-(--greenish-color) transition transition-background text-(--gray-color) rounded-md p-2"
            >
              Manage Storage Facilities
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition" />
            </Link>
          </CardContent>
        </Card>

        <Card className="px-4 py-6">
          <CardHeader>
            <CardTitle>Quick Add Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Do you have new storage facilities to add? Add them to your
              dashboard quickly.
            </p>
            <Link
              href="/marketplace/storage-facility/storage-facilities/add-new"
              className="flex items-center justify-center hover:bg-(--dark-green-color) hover:text-(--white-fff) bg-gray-200 focus:bg-(--dark-green-color) transition transition-background text-black rounded-md p-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Facility
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
