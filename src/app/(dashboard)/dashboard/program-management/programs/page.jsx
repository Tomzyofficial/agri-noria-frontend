"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Briefcase, Globe, CheckCircle2 } from "lucide-react";
import { useProgramData } from "../useProgramData";

export default function EcosystemProgramsPage() {
   const { loading, programs, currentUserId } = useProgramData();

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Ecosystem Programs...</div>;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Ecosystem Programs</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Available agricultural empowerment programs</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.length === 0 ? (
               <Card className="col-span-full border-none shadow-xl bg-white dark:bg-gray-950 p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active programs found</p>
               </Card>
            ) : (
               programs.map((prog, i) => (
                  <Card key={i} className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden hover:scale-[1.02] transition-transform">
                     <div className="p-1 bg-amber-500" />
                     <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                           <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
                              <Briefcase size={24} />
                           </div>
                           <span className={`px-4 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest ${
                              prog.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"
                           }`}>
                              {prog.status}
                           </span>
                        </div>
                        <div className="mt-4">
                           <h3 className="text-xl font-black text-(--foreground)">{prog.name}</h3>
                           <div className="flex items-center gap-2 mt-1">
                              <Globe className="w-3 h-3 text-gray-400" />
                              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{prog.region} • {prog.commodity}</p>
                           </div>
                        </div>
                     </CardHeader>
                     <CardContent className="p-6 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                           <div>
                              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Target Farmers</p>
                              <p className="font-bold text-sm">{prog.target_farmers}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Creator</p>
                              <p className="font-bold text-sm truncate">{prog.created_by === currentUserId ? "You" : (prog.creator_name || "Institution")}</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Verified input disbursement</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Automated repayment tracking</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))
            )}
         </div>
      </div>
   );
}
