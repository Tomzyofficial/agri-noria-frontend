"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, Search, Filter, ArrowUpRight, ArrowDownRight, Users, Map, Loader2 } from "lucide-react";

export default function PortfolioMonitoringPage() {
   const [portfolio, setPortfolio] = useState({
      activeLoans: 0,
      repaymentRate: 0,
      atRisk: 0,
      enrolledFarmers: 0
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPortfolio = async () => {
         try {
            const res = await fetch("/api/proxy/admin/institution/portfolio");
            const json = await res.json();
            if (json.success) {
               setPortfolio(json.data);
            }
         } catch (error) {
            console.error("Failed to fetch portfolio:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchPortfolio();
   }, []);

   const formatCurrency = (amount) => {
      if (amount === 0) return "₦0";
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Portfolio Monitoring</h1>
            <p className="text-gray-500 mt-1 font-medium">Real-time health tracking of institutional interventions.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
               { label: "Active Loans", value: formatCurrency(portfolio.activeLoans), icon: <Activity className="w-4 h-4" />, color: "blue" },
               { label: "Repayment Rate", value: `${portfolio.repaymentRate}%`, icon: <ArrowUpRight className="w-4 h-4" />, color: "emerald" },
               { label: "Outstanding Balance", value: formatCurrency(portfolio.atRisk), icon: <ArrowDownRight className="w-4 h-4" />, color: "rose" },
               { label: "Enrolled Farmers", value: portfolio.enrolledFarmers.toLocaleString(), icon: <Users className="w-4 h-4" />, color: "purple" },
            ].map((stat, i) => (
               <Card key={i} className="border-none shadow-sm bg-white dark:bg-gray-950">
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>{stat.icon}</div>
                     </div>
                     <p className="text-2xl font-black mt-2">{stat.value}</p>
                     <p className="text-[10px] font-bold mt-1 text-gray-400">From database records</p>
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
