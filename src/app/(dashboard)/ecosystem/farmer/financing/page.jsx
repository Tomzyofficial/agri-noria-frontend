"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaPlusCircle, FaBoxOpen, FaInfoCircle, FaHandHoldingUsd } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";
import { useState } from "react";
import InputRequestModal from "@/app/components/dashboard/InputRequestModal";

export default function FinancingPage() {
   const { loading, inputRequests, refreshData } = useFarmerData();
   const [showInputModal, setShowInputModal] = useState(false);

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Financing Data...</div>;

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-950 p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 dark:border-gray-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600" />
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Financing & Inputs</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Request intervention inputs and manage agricultural credit</p>
            </div>
            <Button 
               onClick={() => setShowInputModal(true)}
               className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95"
            >
               <FaPlusCircle /> Request Intervention
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-black">Request History</CardTitle>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{inputRequests.length} Total Requests</span>
                  </CardHeader>
                  <CardContent className="p-8">
                     {inputRequests.length > 0 ? (
                        <div className="space-y-4">
                           {inputRequests.map((req, i) => (
                              <RequestRow key={i} req={req} />
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                           <FaBoxOpen className="text-5xl text-gray-200 mx-auto mb-4" />
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No input requests found</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardContent className="p-8">
                     <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <FaHandHoldingUsd /> Intervention Info
                     </h3>
                     <div className="space-y-6">
                        <Step index={1} text="Complete training modules to qualify for ecosystem inputs." />
                        <Step index={2} text="Select the required inputs based on your farm size (Ha)." />
                        <Step index={3} text="Finance will approve and assign your request to a local distributor." />
                     </div>
                  </CardContent>
               </Card>

               <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl flex gap-4">
                  <FaInfoCircle className="text-amber-500 shrink-0 mt-1" />
                  <div>
                     <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Important Note</p>
                     <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mt-1 leading-relaxed">
                        Approved input values are deducted from your future harvest off-take at a subsidized 0% interest rate.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <InputRequestModal 
            isOpen={showInputModal} 
            onClose={() => {
               setShowInputModal(false);
               refreshData();
            }}
         />
      </div>
   );
}

function RequestRow({ req }) {
   const statusColors = {
      approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
   };

   const items = Array.isArray(req.input_items) ? req.input_items : [];

   return (
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-lg transition-all">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
               <FaBoxOpen className="text-emerald-500" size={24} />
            </div>
            <div>
               <div className="flex flex-wrap gap-1.5 mb-2">
                  {items.map((item, idx) => (
                     <span key={idx} className="text-[9px] bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 font-black uppercase tracking-widest">
                        {typeof item === 'string' ? item : (item.name || item.category || 'Input')}
                     </span>
                  ))}
               </div>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Requested on {new Date(req.created_at).toLocaleDateString()}</p>
            </div>
         </div>
         <div className="flex flex-col items-end shrink-0">
            <p className="text-2xl font-black tracking-tighter">₦{parseFloat(req.total_value || req.total_amount || 0).toLocaleString()}</p>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 ${statusColors[req.status] || 'bg-gray-100 text-gray-500'}`}>
               {req.status}
            </span>
         </div>
      </div>
   );
}

function Step({ index, text }) {
   return (
      <div className="flex gap-4">
         <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0 font-black text-sm">{index}</div>
         <p className="text-sm font-bold opacity-90 leading-relaxed">{text}</p>
      </div>
   );
}
