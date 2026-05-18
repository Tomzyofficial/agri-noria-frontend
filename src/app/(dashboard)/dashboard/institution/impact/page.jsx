"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Leaf, Droplets, Sun, Activity } from "lucide-react";

export default function ImpactTrackingPage() {
   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Impact Tracking</h1>
            <p className="text-gray-500 mt-1 font-medium">Measuring the socio-economic and environmental footprint of your programs.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
               { label: "Yield Increase", value: "+34%", icon: <TrendingUp />, color: "emerald" },
               { label: "Income Boost", value: "+22%", icon: <TrendingUp />, color: "blue" },
               { label: "Carbon Offset", value: "450t", icon: <Leaf />, color: "green" },
               { label: "Water Saved", value: "1.2M L", icon: <Droplets />, color: "cyan" },
            ].map((stat, i) => (
               <Card key={i} className="border-none shadow-sm">
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
