"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, Search, Filter, ArrowUpRight, ArrowDownRight, Users, Map } from "lucide-react";

export default function PortfolioMonitoringPage() {
   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Portfolio Monitoring</h1>
            <p className="text-gray-500 mt-1 font-medium">Real-time health tracking of institutional interventions.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
               { label: "Active Loans", value: "₦125.4M", trend: "+2.4%", icon: <Activity className="w-4 h-4" />, color: "blue" },
               { label: "Repayment Rate", value: "94.2%", trend: "+0.5%", icon: <ArrowUpRight className="w-4 h-4" />, color: "emerald" },
               { label: "At Risk", value: "₦4.1M", trend: "-1.2%", icon: <ArrowDownRight className="w-4 h-4" />, color: "rose" },
               { label: "Enrolled Farmers", value: "1,240", trend: "+12%", icon: <Users className="w-4 h-4" />, color: "purple" },
            ].map((stat, i) => (
               <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>{stat.icon}</div>
                     </div>
                     <p className="text-2xl font-black mt-2">{stat.value}</p>
                     <p className={`text-[10px] font-bold mt-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stat.trend} <span className="text-gray-400 font-normal">vs last month</span>
                     </p>
                  </CardContent>
               </Card>
            ))}
         </div>

         <Card className="border-none shadow-sm h-[400px] flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="text-center space-y-3">
               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-block">
                  <Map className="w-8 h-8 text-blue-500 animate-pulse" />
               </div>
               <h3 className="font-bold text-lg">Interactive Geospatial Monitoring</h3>
               <p className="text-gray-500 text-sm max-w-xs mx-auto">Connecting real-time farm data to your portfolio view. Coming soon.</p>
            </div>
         </Card>
      </div>
   );
}
