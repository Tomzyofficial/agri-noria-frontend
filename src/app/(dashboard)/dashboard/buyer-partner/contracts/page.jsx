"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaFileContract, FaCheckCircle, FaFileDownload, FaHistory } from "react-icons/fa";
import { useBuyerData } from "../useBuyerData";

export default function ContractsPage() {
   const { loading, buyerMatches } = useBuyerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Contracts...</div>;

   const activeContracts = buyerMatches.filter(m => m.contract_status === "confirmed" || m.contract_status === "completed");

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Contract Management</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Review and manage your ecosystem purchase agreements</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-10 border-b border-gray-50 dark:border-gray-900">
                     <CardTitle className="text-xl font-black flex items-center gap-3">
                        <FaFileContract className="text-indigo-600" /> Confirmed Agreements
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                     {activeContracts.length > 0 ? (
                        <div className="space-y-4">
                           {activeContracts.map((contract, i) => (
                              <ContractRow key={i} contract={contract} />
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-24 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                           <FaFileContract className="text-5xl text-gray-200 mx-auto mb-4" />
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No confirmed contracts found</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <Card className="border-none shadow-xl bg-indigo-600 text-white rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardContent className="p-8">
                     <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <FaHistory /> Contract Stats
                     </h3>
                     <div className="space-y-6">
                        <ContractStat label="Total Volume" value={`${activeContracts.reduce((sum, c) => sum + parseFloat(c.quantity_tons), 0).toLocaleString()} Tons`} />
                        <ContractStat label="Settled Value" value={`₦${activeContracts.reduce((sum, c) => sum + (parseFloat(c.offer_price) * parseFloat(c.quantity_tons)), 0).toLocaleString()}`} />
                        <ContractStat label="Average Price" value={`₦${(activeContracts.length > 0 ? activeContracts.reduce((sum, c) => sum + parseFloat(c.offer_price), 0) / activeContracts.length : 0).toLocaleString()}/Ton`} />
                     </div>
                  </CardContent>
               </Card>

               <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl">
                  <h3 className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2">Legal Notice</h3>
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                     All digital contracts are legally binding under the AgriNoria Ecosystem Governance Framework. Electronic signatures are verified via blockchain timestamps.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

function ContractRow({ contract }) {
   return (
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-lg transition-all group">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
               <FaFileContract size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black">{contract.buyer_name}</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{contract.commodity} • {contract.quantity_tons} Tons</p>
            </div>
         </div>
         <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
               <p className="text-xl font-black">₦{parseFloat(contract.offer_price || 0).toLocaleString()}/T</p>
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-1">
                  <FaCheckCircle size={10} /> Confirmed
               </span>
            </div>
            <button className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-600 transition-all">
               <FaFileDownload />
            </button>
         </div>
      </div>
   );
}

function ContractStat({ label, value }) {
   return (
      <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
         <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
         <p className="text-lg font-black">{value}</p>
      </div>
   );
}
