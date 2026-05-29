"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Leaf, Droplets, Users, Activity, Loader2, BarChart3 } from "lucide-react";

export default function ImpactTrackingPage() {
   const [impact, setImpact] = useState({
      totalHarvests: 0,
      totalYield: 0,
      totalVerifications: 0,
      trainedFarmers: 0,
      totalFarmerIncome: 0
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchImpact = async () => {
         try {
            const res = await fetch("/api/proxy/admin/institution/impact");
            const json = await res.json();
            if (json.success) {
               setImpact(json.data);
            }
         } catch (error) {
            console.error("Failed to fetch impact:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchImpact();
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
            <h1 className="text-3xl font-black text-(--foreground)">Impact Tracking</h1>
            <p className="text-gray-500 mt-1 font-medium">Measuring the socio-economic and environmental footprint of your programs.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
               { label: "Approved Harvests", value: impact.totalHarvests.toLocaleString(), icon: <BarChart3 />, color: "emerald" },
               { label: "Total Yield (tons)", value: impact.totalYield.toLocaleString(), icon: <TrendingUp />, color: "blue" },
               { label: "Verified Fields", value: impact.totalVerifications.toLocaleString(), icon: <Leaf />, color: "green" },
               { label: "Trained Farmers", value: impact.trainedFarmers.toLocaleString(), icon: <Users />, color: "purple" },
               { label: "Farmer Income", value: formatCurrency(impact.totalFarmerIncome), icon: <Droplets />, color: "cyan" },
            ].map((stat, i) => (
               <Card key={i} className="border-none shadow-sm bg-white dark:bg-gray-950">
                  <CardContent className="p-6">
                     <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                        {stat.icon}
                     </div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                     <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </CardContent>
               </Card>
            ))}
         </div>

         <Card className="border-none shadow-sm h-64 flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="text-center space-y-2">
               <Activity className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
               <h3 className="font-bold">Impact Analytics Engine</h3>
               <p className="text-gray-400 text-sm">Aggregating field data to generate impact reports.</p>
            </div>
         </Card>
      </div>
   );
}
