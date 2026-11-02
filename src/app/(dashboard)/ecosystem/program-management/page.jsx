"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaSeedling, FaTasks, FaWallet, FaMapMarkedAlt } from "react-icons/fa";
import { ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { useProgramData } from "./useProgramData";

export default function ProgramManagementOverview() {
   const { loading, clusters, stats, clusterWallet, clusterTransactions = [], pendingInputs = [], currentUser, userRole } = useProgramData();

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Dashboard...</div>;

   const isSupervisor = userRole === "cluster supervisor";
   const approvalStatus = currentUser?.approval_status || "pending_approval";
   const onboardingStatus = currentUser?.onboarding_status || "pending";
   const isApproved = approvalStatus === "approved";
   const hasSubmittedKyc = onboardingStatus === "unverified" || Boolean(currentUser?.onboarding_draft);

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Overview</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time status of your agricultural ecosystem</p>
            </div>

            {isSupervisor && isApproved && (
               <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     Verified Cluster Supervisor • Node Active
                  </span>
               </div>
            )}
         </div>

         {/* Supervisor KYC / Verification Status Banners */}
         {isSupervisor && !isApproved && hasSubmittedKyc && (
            <div className="p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                     <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                     <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 block">
                        Verification Pending • SuperAdmin Review in Progress
                     </span>
                     <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                        Your Cluster Supervisor credentials, appointment letter, and biometric KYC have been received and are awaiting SuperAdmin approval.
                     </p>
                  </div>
               </div>
               <Link
                  href="/ecosystem/program-management/onboarding"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shrink-0"
               >
                  Update KYC Dossier
               </Link>
            </div>
         )}

         {isSupervisor && !isApproved && !hasSubmittedKyc && (
            <div className="p-5 rounded-3xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0">
                     <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                     <span className="text-xs font-black uppercase tracking-wider text-red-900 dark:text-red-200 block">
                        Cluster Supervisor KYC Required
                     </span>
                     <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                        Please complete your supervisory onboarding with your appointment letter, cluster jurisdiction, and biometric selfie to unlock full platform operations.
                     </p>
                  </div>
               </div>
               <Link
                  href="/ecosystem/program-management/onboarding"
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition shrink-0 flex items-center gap-2"
               >
                  <span>Complete Supervisor KYC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
               </Link>
            </div>
         )}

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
               label="Active Clusters"
               value={stats.activeClusters || clusters.length}
               icon={<FaMapMarkedAlt />}
               bg="from-orange-50 to-orange-100 dark:from-orange-900/40"
               color="bg-orange-500"
            />
            <StatCard
               label="Total Farmers"
               value={stats.activeFarmers || 0}
               icon={<FaSeedling />}
               bg="from-green-50 to-green-100 dark:from-green-900/40"
               color="bg-green-500"
            />
            <StatCard
               label="Pending Inputs"
               value={stats.pendingInputRequests || pendingInputs.length}
               icon={<FaTasks />}
               bg="from-blue-50 to-blue-100 dark:from-blue-900/40"
               color="bg-blue-500"
            />
            <StatCard
               label="Wallet Balance"
               value={`₦${clusterWallet ? parseFloat(clusterWallet.balance).toLocaleString() : "0"}`}
               icon={<FaWallet />}
               bg="from-indigo-50 to-indigo-100 dark:from-indigo-900/40"
               color="bg-indigo-500"
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
               <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <CardTitle>Recent Operational Activity</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  {(() => {
                     // Synthesize real activity events from cluster transactions and pending requisitions
                     const activities = [];
                     const safeTransactions = Array.isArray(clusterTransactions) ? clusterTransactions : [];
                      if (safeTransactions.length > 0) {
                        safeTransactions.slice(0, 5).forEach((tx) => {
                           activities.push({
                              id: `tx-${tx.id}`,
                              title: tx.description || "Cluster Wallet Transaction",
                              detail: `₦${parseFloat(tx.amount || 0).toLocaleString()} · ${tx.owner_type || 'System'}`,
                              date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Recent",
                              badge: tx.type || "transaction",
                              color: tx.type === 'credit' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
                           });
                        });
                     }
                     if (Array.isArray(pendingInputs) && activities.length < 5) {
                        pendingInputs.slice(0, 5 - activities.length).forEach((inp, idx) => {
                           activities.push({
                              id: `inp-${inp.id || idx}`,
                              title: `Input Requisition: ${inp.package_name || inp.crop || 'Agro-Inputs'}`,
                              detail: `Farmer: ${inp.farmer_name || 'Ecosystem Member'} · Status: Pending Approval`,
                              date: inp.created_at ? new Date(inp.created_at).toLocaleDateString() : "Pending",
                              badge: "Requisition",
                              color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
                           });
                        });
                     }
                     if (Array.isArray(clusters) && activities.length === 0) {
                        clusters.slice(0, 3).forEach((cl, idx) => {
                           activities.push({
                              id: `cl-${cl.id || idx}`,
                              title: `Operational Cluster: ${cl.name || 'Production Unit'}`,
                              detail: `Location: ${cl.location || 'Regional Basin'} · ${cl.total_farmers || 0} enrolled farmers`,
                              date: "Active",
                              badge: "Cluster",
                              color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
                           });
                        });
                     }

                     if (activities.length === 0) {
                        return (
                           <div className="p-8 text-center">
                              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                 <FaTasks className="text-gray-300 text-2xl" />
                              </div>
                              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No operational activities recorded yet</p>
                              <p className="text-xs text-gray-400 mt-1">Transactions, input disbursements, and cluster audits will appear here in real-time.</p>
                           </div>
                        );
                     }

                     return (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-3">
                           {activities.map((act) => (
                              <div key={act.id} className="pt-3 first:pt-0 flex items-center justify-between">
                                 <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{act.title}</p>
                                    <p className="text-xs text-gray-500">{act.detail}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${act.color}`}>
                                       {act.badge}
                                    </span>
                                    <p className="text-[11px] text-gray-400 mt-1">{act.date}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     );
                  })()}
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
               <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle>Distribution Status</CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-6">
                     <ProgressItem label="Seed Disbursement" value={Math.round(stats.seedDisbursementPct || 0)} color="bg-orange-500" />
                     <ProgressItem label="Fertilizer Allocation" value={Math.round(stats.fertilizerAllocationPct || 0)} color="bg-green-500" />
                     <ProgressItem label="Loan Repayments" value={stats.repaymentsTotal ? Math.round((stats.repaymentsRecovered / stats.repaymentsTotal) * 100) : 0} color="bg-blue-500" />
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

function StatCard({ label, value, icon, bg, color }) {
   return (
      <Card className={`bg-gradient-to-br ${bg} border-none shadow-sm overflow-hidden group`}>
         <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-4 ${color} text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
               <p className="text-2xl font-black text-(--foreground) tracking-tighter">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}

function ProgressItem({ label, value, color }) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-gray-500">{label}</span>
            <span className="text-amber-600">{value}%</span>
         </div>
         <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
         </div>
      </div>
   );
}
