"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Briefcase, Globe, CheckCircle2, DollarSign, Package, X, Plus, Check, Loader2 } from "lucide-react";
import { useProgramData } from "../useProgramData";
import { useState } from "react";
import { toast } from "react-toastify";

export default function EcosystemProgramsPage() {
   const { loading, programs, currentUserId, clusters, fetchData } = useProgramData();
   const [enrollingId, setEnrollingId] = useState(null);

   // Input packages modal state
   const [selectedProgramForPackages, setSelectedProgramForPackages] = useState(null);
   const [packages, setPackages] = useState([]);
   const [loadingPackages, setLoadingPackages] = useState(false);
   const [isCreatingPackage, setIsCreatingPackage] = useState(false);
   const [newPackage, setNewPackage] = useState({
      name: "",
      total_value: "",
      seeds: true,
      fertilizer: true,
      herbicides: true,
   });

   const openPackagesModal = async (prog) => {
      setSelectedProgramForPackages(prog);
      setLoadingPackages(true);
      try {
         const res = await fetch(`/api/proxy/programs/${prog.id}/packages`);
         const data = await res.json();
         if (data.success) {
            setPackages(data.data || []);
         }
      } catch (err) {
         console.error("Error loading packages:", err);
         toast.error("Failed to load program input packages");
      } finally {
         setLoadingPackages(false);
      }
   };

   const handleCreatePackage = async (e) => {
      e.preventDefault();
      if (!newPackage.name || !newPackage.total_value) {
         toast.error("Package name and total value are required");
         return;
      }
      setIsCreatingPackage(true);
      try {
         const res = await fetch(`/api/proxy/programs/${selectedProgramForPackages.id}/packages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPackage),
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Input package created!");
            setPackages([data.data, ...packages]);
            setNewPackage({ name: "", total_value: "", seeds: true, fertilizer: true, herbicides: true });
         } else {
            toast.error(data.error || "Failed to create package");
         }
      } catch (err) {
         toast.error("Network error creating package");
      } finally {
         setIsCreatingPackage(false);
      }
   };

   const activeCluster = clusters && clusters.length > 0 ? (clusters.find(c => c.supervisor_id === currentUserId) || null) : null;

   const handleEnrollCluster = async (progId) => {
      if (!activeCluster) {
         toast.error("No active cluster found to enroll in this program.");
         return;
      }
      setEnrollingId(progId);
      try {
         const res = await fetch("/api/proxy/pipeline/clusters/enroll", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ program_id: progId, cluster_id: activeCluster.id }),
         });
         const data = await res.json();
         if (res.ok && data.success) {
            toast.success("Cluster successfully enrolled in program!");
            fetchData();
         } else {
            toast.error(data.error || "Failed to enroll cluster");
         }
      } catch (err) {
         toast.error("Network error while enrolling cluster");
      } finally {
         setEnrollingId(null);
      }
   };

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Ecosystem Programs...</div>;

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Ecosystem Programs</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Available agricultural empowerment programs</p>
            </div>
            {activeCluster ? (
               <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                     <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Active Cluster Target</p>
                     <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">{activeCluster.name} ({activeCluster.total_hectares || 0} HA)</p>
                  </div>
               </div>
            ) : (
               <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                     <p className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">No Active Cluster Created</p>
                     <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Go to Cluster Operations to register your cluster before enrolling.</p>
                  </div>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.length === 0 ? (
               <Card className="col-span-full border-none shadow-xl bg-white dark:bg-gray-950 p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active programs found</p>
               </Card>
            ) : (
               programs.map((prog, i) => {
                  const isEnrolled = activeCluster && activeCluster.program_id === prog.id;
                  const canEnroll = activeCluster && !activeCluster.program_id;

                  return (
                     <Card key={i} className={`border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden transition-all ${isEnrolled ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : "hover:scale-[1.02]"}`}>
                        <div className={`p-1 ${isEnrolled ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <CardHeader className="p-6">
                           <div className="flex justify-between items-start">
                              <div className={`p-3 rounded-2xl ${isEnrolled ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                 <Briefcase size={24} />
                              </div>
                              <span className={`px-4 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest ${prog.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"
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
                           <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Available Program Fund</p>
                                 <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">₦{parseFloat(prog.wallet_balance || 0).toLocaleString()}</p>
                              </div>
                              <span className="text-[10px] font-black bg-white dark:bg-gray-900 px-2.5 py-1 rounded-xl text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                 For Input Financing
                              </span>
                           </div>
                           <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Target</p>
                                 <p className="font-bold text-sm">{prog.target_farmers}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Enrolled</p>
                                 <p className="font-bold text-sm">{prog.enrolled_farmers || 0}</p>
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
                                 <span>Automated repayment tracking & strict fund deduction</span>
                              </div>
                           </div>
                            <div className="pt-2">
                               <button
                                  onClick={() => openPackagesModal(prog)}
                                  className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mb-2 transition"
                               >
                                  <Package size={14} /> Input Packages
                               </button>

                               {isEnrolled ? (
                                  <button disabled className="w-full py-3.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2 shadow-inner">
                                     <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> Cluster Enrolled in Program
                                  </button>
                               ) : (
                                  <button 
                                     onClick={() => handleEnrollCluster(prog.id)}
                                     disabled={enrollingId === prog.id || !canEnroll}
                                     className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                                  >
                                     {enrollingId === prog.id ? "Enrolling Cluster..." : (!activeCluster) ? "Register a Cluster First to Enroll" : (activeCluster && activeCluster.program_id) ? "Cluster Enrolled in Another Program" : "Enroll Cluster in Program"}
                                  </button>
                               )}
                            </div>
                        </CardContent>
                     </Card>
                  );
               })
            )}
         </div>

         {/* Input Packages Modal */}
         {selectedProgramForPackages && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-900 border rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b pb-4">
                     <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                           <Package className="w-5 h-5 text-emerald-600" />
                           Input Packages: {selectedProgramForPackages.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                           {selectedProgramForPackages.commodity} • {selectedProgramForPackages.region}
                        </p>
                     </div>
                     <button 
                        onClick={() => setSelectedProgramForPackages(null)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  {/* Existing Packages */}
                  <div className="space-y-3">
                     <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Defined Packages</h4>
                     {loadingPackages ? (
                        <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                     ) : packages.length === 0 ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-center text-xs text-gray-500">
                           No input packages defined for this program yet. Define one below.
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {packages.map((pkg) => (
                              <div key={pkg.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border flex items-center justify-between">
                                 <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{pkg.name}</p>
                                    <div className="flex gap-2 mt-1">
                                       {pkg.seeds && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Seeds</span>}
                                       {pkg.fertilizer && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">Fertilizer</span>}
                                       {pkg.herbicides && <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Crop Protection</span>}
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Per Farmer / Ha</p>
                                    <p className="font-black text-emerald-600 text-sm">₦{parseFloat(pkg.total_value || 0).toLocaleString()}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Add Package Form */}
                  <form onSubmit={handleCreatePackage} className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border space-y-4">
                     <h4 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider flex items-center gap-1">
                        <Plus size={14} /> Add New Package
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-bold uppercase text-gray-500">Package Name</label>
                           <input 
                              type="text" 
                              placeholder="e.g. Standard Input Package"
                              value={newPackage.name}
                              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                              className="w-full mt-1 p-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold uppercase text-gray-500">Total Value (₦)</label>
                           <input 
                              type="number" 
                              placeholder="e.g. 150000"
                              value={newPackage.total_value}
                              onChange={(e) => setNewPackage({ ...newPackage, total_value: e.target.value })}
                              className="w-full mt-1 p-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl"
                           />
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                              type="checkbox"
                              checked={newPackage.seeds}
                              onChange={(e) => setNewPackage({ ...newPackage, seeds: e.target.checked })}
                              className="rounded text-emerald-600"
                           />
                           <span>Seeds Included</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                              type="checkbox"
                              checked={newPackage.fertilizer}
                              onChange={(e) => setNewPackage({ ...newPackage, fertilizer: e.target.checked })}
                              className="rounded text-emerald-600"
                           />
                           <span>Fertilizer Included</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                              type="checkbox"
                              checked={newPackage.herbicides}
                              onChange={(e) => setNewPackage({ ...newPackage, herbicides: e.target.checked })}
                              className="rounded text-emerald-600"
                           />
                           <span>Crop Protection Included</span>
                        </label>
                     </div>
                     <button
                        type="submit"
                        disabled={isCreatingPackage}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {isCreatingPackage ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                        Create Package
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
