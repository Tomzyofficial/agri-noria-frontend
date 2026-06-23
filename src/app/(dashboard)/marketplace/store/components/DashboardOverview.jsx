"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, TrendingUp, Package, DollarSign, Users, ArrowRight } from "lucide-react";
import useSWR from "swr";
import { formatPrice } from "@/utils/formatPrice";
import { StatCard } from "@/app/(dashboard)/dashboard/components/ui/StatCard";
import { fetcher } from "@/utils/otherUtils";

export function DashboardOverview({ user }) {
  const { data, error, isLoading } = useSWR("/api/proxy/vendor/products/total", fetcher);

  const { data: sellerStatsData, error: sellerStatsError, isLoading: sellerStatsLoading } = useSWR("/api/proxy/buyer/orders/seller/stats", fetcher);

  // Calculate sales increase
  const currentMonthSales = Number(sellerStatsData?.data?.current_month_sales ?? 0);
  const previousMonthSales = Number(sellerStatsData?.data?.previous_month_sales ?? 0);

  let salesText = "No sales yet";

  if (previousMonthSales === 0 && currentMonthSales > 0) {
    salesText = "New sales this month";
  } else if (previousMonthSales > 0) {
    const percentage = ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;

    salesText = `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}% from last month`;
  }

  return (
    <div className="my-25 lg:my-5 dark:text-(--foreground)">
      <div className="flex flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-(--foreground)">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard</h1>
          <p className="">Welcome back, {user?.fname}!</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard isLoading={isLoading} error={error} title="Total products" value={data?.total ?? 0} subValue={`${data?.total} active`} icon={Package} />
        <StatCard isLoading={sellerStatsLoading} error={sellerStatsError} title="Revenue" value={formatPrice(sellerStatsData?.data?.total_revenue ?? 0, sellerStatsData?.data?.country_code, sellerStatsData?.data?.currency) ?? 0} subValue={salesText} icon={DollarSign} />
        <StatCard isLoading={sellerStatsLoading} error={sellerStatsError} title="Active Buyers" value={sellerStatsData?.data?.active_buyers ?? 0} subValue="new this week" icon={Users} />
        <StatCard isLoading={sellerStatsLoading} error={sellerStatsError} title="Total Orders" value={sellerStatsData?.data?.total_orders ?? 0} subValue="orders this week" icon={Package} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="px-4 py-6">
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage your product listings, inventory, and pricing all in one place.</p>
            <Link href="/marketplace/store/products" className="flex items-center justify-center group hover:bg-(--dark-green-color) focus:bg-(--dark-green-color) bg-(--greenish-color) transition transition-background text-(--gray-color) rounded-md p-2">
              Manage Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition" />
            </Link>
          </CardContent>
        </Card>

        <Card className="px-4 py-6">
          <CardHeader>
            <CardTitle>Quick Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Do you have fresh produce ready? Add it to your marketplace quickly.</p>
            <Link href="/marketplace/store/products/add-new" className="flex items-center justify-center hover:bg-(--dark-green-color) hover:text-(--white-fff) bg-gray-200 focus:bg-(--dark-green-color) transition transition-background text-black rounded-md p-2">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
