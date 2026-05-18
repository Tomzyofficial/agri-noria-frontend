"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTractor, FaSeedling, FaWater, FaCalendarCheck, FaPlusCircle } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";
import { Button } from "@/components/ui/Button";

export default function MyFarmPage() {
   const { loading, plantingData } = useFarmerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Farm Data...</div>;

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">My Farm</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Track planting cycles and manage farm activities</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 uppercase tracking-widest text-xs">
               <FaPlusCircle /> Add Activity
            </Button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActivityStat label="Active Cycles" value={plantingData.length} icon={<FaSeedling />} color="emerald" />
            <ActivityStat label="Water Usage" value="Low" icon={<FaWater />} color="blue" />
            <ActivityStat label="Next Harvest" value="Nov 2026" icon={<FaCalendarCheck />} color="orange" />
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-xl font-black">Planting Tracker</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               {plantingData.length > 0 ? (
                  <div className="space-y-6">
                     {plantingData.map((cycle, i) => (
                        <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                                 <FaSeedling size={24} />
                              </div>
                              <div>
                                 <h3 className="text-lg font-black">{cycle.crop_name || "Commercial Maize"}</h3>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Started: {new Date(cycle.start_date || Date.now()).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-4 items-center">
                              <span className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest">{cycle.area || "2.5"} Ha</span>
                              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">{cycle.status || "Vegetative Stage"}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-20 italic text-gray-400 font-bold uppercase tracking-widest text-xs">
                     No active planting records found. Start a new cycle to track progress.
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function ActivityStat({ label, value, icon, color }) {
   const colors = {
      emerald: "bg-emerald-500 shadow-emerald-500/20",
      blue: "bg-blue-500 shadow-blue-500/20",
      orange: "bg-orange-500 shadow-orange-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 p-6 flex items-center gap-6 rounded-3xl">
         <div className={`p-4 ${colors[color]} text-white rounded-2xl shadow-lg`}>
            {icon}
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black">{value}</p>
         </div>
      </Card>
   );
}
