"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { ShieldAlert, AlertTriangle, CheckCircle2, CloudRain, ThermometerSun, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function RiskManagementPage() {
   const [clusters, setClusters] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchClusters = async () => {
         try {
            const res = await fetch("/api/proxy/pipeline/clusters");
            const json = await res.json();
            if (json.success) {
               setClusters(json.data.slice(0, 5)); // show top 5
            }
         } catch (error) {
            console.error("Failed to fetch clusters:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchClusters();
   }, []);

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Risk Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Predictive risk assessment and mitigation governance.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-rose-50 dark:bg-rose-900/20">
               <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-rose-600 mb-4">
                     <AlertTriangle className="w-6 h-6" />
                     <h3 className="font-bold">Climate Risk</h3>
                  </div>
                  <p className="text-3xl font-black text-rose-900 dark:text-rose-100">MODERATE</p>
                  <p className="text-sm text-rose-600/80 mt-1 font-medium">Low rainfall predicted in Northern clusters.</p>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-900/20">
               <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-amber-600 mb-4">
                     <ShieldAlert className="w-6 h-6" />
                     <h3 className="font-bold">Credit Risk</h3>
                  </div>
                  <p className="text-3xl font-black text-amber-900 dark:text-amber-100">LOW</p>
                  <p className="text-sm text-amber-600/80 mt-1 font-medium">94% of active agreements are on schedule.</p>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/20">
               <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-emerald-600 mb-4">
                     <CheckCircle2 className="w-6 h-6" />
                     <h3 className="font-bold">Platform Security</h3>
                  </div>
                  <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">OPTIMAL</p>
                  <p className="text-sm text-emerald-600/80 mt-1 font-medium">All nodes operational with 2FA enforced.</p>
               </CardContent>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-none shadow-sm bg-white dark:bg-gray-950">
               <h3 className="font-bold mb-4 flex items-center gap-2"><CloudRain className="w-4 h-4 text-blue-500" /> Weather Anomalies</h3>
               <div className="space-y-4">
                  {loading ? (
                     <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                     </div>
                  ) : clusters.length === 0 ? (
                     <div className="text-center text-gray-400 italic text-sm p-4">No active clusters found.</div>
                  ) : (
                     clusters.map((cluster) => {
                        const isHighRisk = cluster.region?.toLowerCase().includes("north") || cluster.name?.toLowerCase().includes("north");
                        return (
                           <div key={cluster.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                              <div className="text-sm font-bold">{cluster.name}</div>
                              <div className={`text-xs font-bold uppercase ${isHighRisk ? 'text-rose-500' : 'text-amber-500'}`}>
                                 {isHighRisk ? "Severe Drought Warning" : "Moderate Weather Risk"}
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </Card>
            <Card className="p-6 border-none shadow-sm bg-white dark:bg-gray-950">
               <h3 className="font-bold mb-4 flex items-center gap-2"><ThermometerSun className="w-4 h-4 text-orange-500" /> Heat Mapping</h3>
               <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 text-xs italic">
                  Thermal satellite data integration coming soon.
               </div>
            </Card>
         </div>
      </div>
   );
}
