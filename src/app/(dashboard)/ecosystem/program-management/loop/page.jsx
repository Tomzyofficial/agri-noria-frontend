"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart3, TrendingUp, CheckCircle2, ChevronRight } from "lucide-react";
import { useProgramData } from "../useProgramData";

export default function FullLoopPage() {
   const { loading, stats } = useProgramData();

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Loop Metrics...</div>;

   // Calculate real stats
   const totalDisbursed = stats?.totalDeployed || 0;
   const verifiedPlanting = stats?.activeFarmers > 0 ? Math.round((stats?.verifiedFarms / stats?.activeFarmers) * 100) : 0;
   const repaymentRate = stats?.repaymentsTotal > 0 ? Math.round((stats?.repaymentsRecovered / stats?.repaymentsTotal) * 100) : 0;
   // ROI = ((Sales - Deployed) / Deployed) * 100
   const ecosystemROI = stats?.totalDeployed > 0 ? Math.round(((stats?.totalSalesValue - stats?.totalDeployed) / stats?.totalDeployed) * 100) : 0;

   // Format Disbursed
   const formatCurrency = (val) => {
      if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `₦${(val / 1000).toFixed(1)}K`;
      return `₦${val.toLocaleString()}`;
   };

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Full Loop Monitoring</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">End-to-end visibility from input to repayment</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard title="Total Disbursed" value={formatCurrency(totalDisbursed)} trend="+0%" color="amber" />
            <MetricCard title="Verified Planting" value={`${verifiedPlanting}%`} trend="+0%" color="emerald" />
            <MetricCard title="Repayment Rate" value={`${repaymentRate}%`} trend="+0%" color="blue" />
            <MetricCard title="Ecosystem ROI" value={`${ecosystemROI}%`} trend="+0%" color="purple" />
         </div>

         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
               <CardTitle className="text-2xl font-black">Lifecycle Tracking</CardTitle>
               <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mt-1">Real-time status of all active cycles</p>
            </CardHeader>
            <CardContent className="p-8">
               <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  <TimelineItem status="Completed" date="Jan 15" title="Input Authorization" desc="Finance approved ₦12M for Kano West Clusters." />
                  <TimelineItem status="In Progress" date="Feb 02" title="Seed Distribution" desc="Distributors are currently delivering seeds to 140 farmers." isCurrent />
                  <TimelineItem status="Pending" date="Mar 10" title="Planting Verification" desc="Field staff will verify planting via GPS coordinates." />
                  <TimelineItem status="Upcoming" date="Jul 20" title="Harvest & Repayment" desc="Sales off-take and loan settlement phase." />
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

function MetricCard({ title, value, trend, color }) {
   const colors = {
      amber: "bg-amber-500 shadow-amber-500/20",
      emerald: "bg-emerald-500 shadow-emerald-500/20",
      blue: "bg-blue-500 shadow-blue-500/20",
      purple: "bg-purple-500 shadow-purple-500/20",
   };
   return (
      <Card className="border-none shadow-lg bg-white dark:bg-gray-900 p-6 overflow-hidden relative">
         <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full ${colors[color]}`} />
         <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</p>
         <div className="flex items-end gap-2 mt-2">
            <p className="text-2xl font-black">{value}</p>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mb-1">
               <TrendingUp className="w-3 h-3" /> {trend}
            </span>
         </div>
      </Card>
   );
}

function TimelineItem({ status, date, title, desc, isCurrent }) {
   return (
      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
         <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isCurrent ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400"}`}>
            <CheckCircle2 size={20} />
         </div>
         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center justify-between space-x-2 mb-1">
               <div className="font-black text-sm text-(--foreground)">{title}</div>
               <time className="font-bold text-[10px] text-amber-600 uppercase tracking-widest">{date}</time>
            </div>
            <div className="text-xs text-gray-500">{desc}</div>
         </div>
      </div>
   );
}
