"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
/*********** Lucid icon ***********/
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";
import useSWR from "swr";
import { apiUrl } from "@/_lib/api";
import { CardSkeleton } from "@/components/ui/CardSkeleton";

export function BuyerDashboardOverview({ user }) {
   // fetcher function for useSWR
   const fetcher = async (url) => {
      try {
         const data = await apiUrl(url);
         return data;
      } catch (err) {
         throw err;
      }
   };

   const { data, error, isLoading } = useSWR("/api/buyer/products/total-orders", fetcher, {
      refreshInterval: 40000,
   });

   return (
      <div className="py-15 lg:py-5 dark:text-(--foreground)">
         <div className="mb-8">
            <h1 className="text-xl lg:text-2xl font-semibold text-(--foreground)">
               Welcome back, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-500">Here's what's happening with your orders and marketplace activity</p>
         </div>

         <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Total Order */}
            {isLoading ? (
               <CardSkeleton />
            ) : error ? (
               <Card className="text-red-500 text-sm h-32 flex items-center justify-center">{error.message}</Card>
            ) : (
               <Card className="px-4 py-6">
                  <CardHeader className="flex items-center justify-between pb-2 px-2">
                     <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                     <Package className="h-4 w-4" />
                  </CardHeader>

                  <CardContent>
                     <div>
                        <p className="text-2xl font-bold">{data?.total ?? 0}</p>
                        <p className="text-xs text-(--foreground)">{data?.total} Orders</p>
                     </div>
                  </CardContent>
               </Card>
            )}
            {/* In progress */}
            <Card className="px-4 py-6">
               <CardHeader className="flex items-center justify-between space-y-0 pb-2 px-2">
                  <CardTitle className="text-sm font-medium">In progress</CardTitle>
                  <DollarSign className="h-4 w-4" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs">+15% from last month</p>
               </CardContent>
            </Card>

            {/* Completed */}
            <Card className="px-4 py-6">
               <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Users className="h-4 w-4" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs">+7 new this week</p>
               </CardContent>
            </Card>

            {/* Total sPENT */}
            <Card className="px-4 py-6">
               <CardHeader className="flex flex-row items-center justify-between px-2 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">+0%</div>
                  <p className="text-xs">vs last quarter</p>
               </CardContent>
            </Card>
         </div>

         <div className="grid md:grid-cols-2 gap-6 mb-8"></div>
      </div>
   );
}
