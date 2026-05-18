"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, TrendingUp, Package, DollarSign, Users, ArrowRight } from "lucide-react";
import useSWR from "swr";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

export function DashboardOverview({ user }) {
   const fetcher = async (url) => {
      const res = await fetch(url, {
         method: "GET",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
         throw new Error(data?.error || "An error occurred while fetching the data.");
      }

      return data;
   };

   const { data, error, isLoading } = useSWR("/api/proxy/vendor/products/total", fetcher);

   return (
      <div className="my-25 lg:my-5 dark:text-(--foreground)">
         <div className="flex flex-row items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl lg:text-3xl font-bold text-(--foreground)">{user?.account_type} Dashboard</h1>
               <p className="">Welcome back, {user?.fname}!</p>
            </div>
         </div>

         <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Total listings */}
            {isLoading ? (
               <CardSkeleton />
            ) : error ? (
               <Card className="text-red-500 text-sm h-32 flex items-center justify-center">{error.message}</Card>
            ) : (
               <Card className="px-4 py-6">
                  <CardHeader className="flex items-center justify-between pb-2 px-2">
                     <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                     <Package className="h-4 w-4" />
                  </CardHeader>

                  <CardContent>
                     <div>
                        <p className="text-2xl font-bold">{[data.total ?? 0]}</p>
                        <p className="text-xs text-(--foreground)">{[data.total ?? 0]} active</p>
                     </div>
                  </CardContent>
               </Card>
            )}
            {/* Revenue */}
            <Card className="px-4 py-6">
               <CardHeader className="flex items-center justify-between space-y-0 pb-2 px-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
               </CardContent>
            </Card>

            {/* Active buyers */}
            <Card className="px-4 py-6">
               <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
                  <CardTitle className="text-sm font-medium">Active Buyers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+7 new this week</p>
               </CardContent>
            </Card>

            {/* Growth */}
            <Card className="px-4 py-6">
               <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
                  <CardTitle className="text-sm font-medium">Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">+0%</div>
                  <p className="text-xs text-muted-foreground">vs last quarter</p>
               </CardContent>
            </Card>
         </div>

         <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="px-4 py-6">
               <CardHeader>
                  <CardTitle>Product Management</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="mb-4">Manage your product listings, inventory, and pricing all in one place.</p>
                  <Link
                     href="/dashboard/store/products"
                     className="flex items-center justify-center group hover:bg-(--dark-green-color) focus:bg-(--dark-green-color) bg-(--greenish-color) transition transition-background text-(--gray-color) rounded-md p-2"
                  >
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
                  <Link
                     href="/dashboard/store/products/add-new"
                     className="flex items-center justify-center hover:bg-(--dark-green-color) hover:text-(--white-fff) bg-gray-200 focus:bg-(--dark-green-color) transition transition-background text-black rounded-md p-2"
                  >
                     <Plus className="mr-2 h-4 w-4" />
                     Add New Product
                  </Link>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
