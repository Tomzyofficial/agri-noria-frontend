"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Network, CheckCircle2, Clock, User } from "lucide-react";
import { useProgramData } from "../useProgramData";

export default function PendingApprovalsPage() {
   const { loading, pendingInputs, currentUserId } = useProgramData();
   const [activeTab, setActiveTab] = useState("my_approvals");

   const displayedInputs = activeTab === "my_approvals"
      ? pendingInputs.filter(input => input.supervisor_id === currentUserId)
      : pendingInputs;

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Pending Approvals...</div>;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Pending Approvals</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Track input requests awaiting finance authorization</p>
         </div>

         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-amber-600" />
                        Approval Pipeline
                     </CardTitle>
                     <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200">
                        {displayedInputs.length} Awaiting
                     </span>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                     <button
                        onClick={() => setActiveTab("my_approvals")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "my_approvals" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        My Approvals
                     </button>
                     <button
                        onClick={() => setActiveTab("all_approvals")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "all_approvals" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        All Approvals
                     </button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {displayedInputs.length === 0 ? (
                  <div className="text-center py-20">
                     <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending approvals at this time</p>
                  </div>
               ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                     {displayedInputs.map((input, i) => (
                        <div key={i} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                 <User size={24} />
                              </div>
                              <div>
                                 <h4 className="font-black text-(--foreground)">
                                    <span className="capitalize text-gray-500 mr-2">{input.requester_type?.replace('_', ' ') || 'Farmer'}</span>
                                    {input.fname} {input.lname}
                                 </h4>
                                 <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                    <span>{input.cluster_name || "Direct Request"}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{input.program_name || "AgriNoria Program"}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-lg text-emerald-600 tracking-tighter">₦{parseFloat(input.total_value).toLocaleString()}</p>
                              <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                                 <Clock className="w-3 h-3" />
                                 Awaiting Finance
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
