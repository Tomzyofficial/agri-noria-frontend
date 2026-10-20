"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
   Briefcase, Globe, Users, CheckCircle2, DollarSign, Package, X, Plus, Check, Loader2,
   Sliders, Settings, MapPin, Target, ShieldCheck, FileText, AlertTriangle, Layers,
   Rocket, PauseCircle, Eye, EyeOff
} from "lucide-react";
import { useProgramData } from "../useProgramData";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

export default function EcosystemProgramsPage() {
   const { loading, programs, currentUserId, clusters, fetchData } = useProgramData();
   const [enrollingId, setEnrollingId] = useState(null);
   const [isTogglingStatus, setIsTogglingStatus] = useState(null);

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

   // Program Director configuration modal state (Rules & Parameters from PDF)
   const [selectedConfigProgram, setSelectedConfigProgram] = useState(null);
   const [configTab, setConfigTab] = useState("eligibility"); // "eligibility" | "crop_targets" | "financing" | "monitoring"
   const [isSavingConfig, setIsSavingConfig] = useState(false);
   const [configForm, setConfigForm] = useState({
      eligibility: {
         min_farm_size: "0.5",
         max_farm_size: "50",
         kyc_required: true,
         gps_mapping_required: true,
         experience_level: "Any",
      },
      geography: {
         target_states: "",
         target_lgas: "",
         focal_communities: "",
      },
      crop_parameters: {
         target_crop: "",
         seed_variety: "",
         expected_yield_mt: "3.5",
         planting_window: "",
         harvest_window: "",
      },
      financing: {
         support_type: "in_kind_input_credit",
         max_credit_per_ha: "350000",
         interest_fee_pct: "5",
         repayment_tenor_months: "6",
      },
      operational_targets: {
         target_farmers: "500",
         target_hectares: "1000",
         target_production_mt: "3500",
      },
      monitoring: {
         inspection_stages: ["Land Preparation", "Planting", "Vegetative Growth", "Pre-harvest Audit"],
         satellite_monitoring: true,
         field_visit_frequency: "biweekly",
      },
      repayment: {
         recovery_mechanism: "warehouse_offtake_deduction",
         timeline_description: "Deduction at harvest aggregation and warehouse intake",
         default_penalty_pct: "2",
      }
   });

   const openConfigModal = (prog) => {
      const cfg = prog.configuration || {};
      setSelectedConfigProgram(prog);
      setConfigTab("eligibility");
      setConfigForm({
         eligibility: {
            min_farm_size: cfg.eligibility?.min_farm_size || "0.5",
            max_farm_size: cfg.eligibility?.max_farm_size || "50",
            kyc_required: cfg.eligibility?.kyc_required !== false,
            gps_mapping_required: cfg.eligibility?.gps_mapping_required !== false,
            experience_level: cfg.eligibility?.experience_level || "Any",
         },
         geography: {
            target_states: cfg.geography?.target_states || prog.region || "",
            target_lgas: cfg.geography?.target_lgas || "",
            focal_communities: cfg.geography?.focal_communities || "",
         },
         crop_parameters: {
            target_crop: cfg.crop_parameters?.target_crop || prog.commodity || "",
            seed_variety: cfg.crop_parameters?.seed_variety || "",
            expected_yield_mt: cfg.crop_parameters?.expected_yield_mt || "3.5",
            planting_window: cfg.crop_parameters?.planting_window || "",
            harvest_window: cfg.crop_parameters?.harvest_window || "",
         },
         financing: {
            support_type: cfg.financing?.support_type || "in_kind_input_credit",
            max_credit_per_ha: cfg.financing?.max_credit_per_ha || "350000",
            interest_fee_pct: cfg.financing?.interest_fee_pct || "5",
            repayment_tenor_months: cfg.financing?.repayment_tenor_months || "6",
         },
         operational_targets: {
            target_farmers: cfg.operational_targets?.target_farmers || prog.target_farmers || "500",
            target_hectares: cfg.operational_targets?.target_hectares || prog.target_hectares || "1000",
            target_production_mt: cfg.operational_targets?.target_production_mt || "3500",
         },
         monitoring: {
            inspection_stages: cfg.monitoring?.inspection_stages || ["Land Preparation", "Planting", "Vegetative Growth", "Pre-harvest Audit"],
            satellite_monitoring: cfg.monitoring?.satellite_monitoring !== false,
            field_visit_frequency: cfg.monitoring?.field_visit_frequency || "biweekly",
         },
         repayment: {
            recovery_mechanism: cfg.repayment?.recovery_mechanism || "warehouse_offtake_deduction",
            timeline_description: cfg.repayment?.timeline_description || "Deduction at harvest aggregation and warehouse intake",
            default_penalty_pct: cfg.repayment?.default_penalty_pct || "2",
         }
      });
   };

   const handleSaveConfiguration = async (e, makeActive = false) => {
      if (e) e.preventDefault();
      setIsSavingConfig(true);
      try {
         const res = await fetch(`/api/proxy/programs/${selectedConfigProgram.id}/configuration`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...configForm, make_active: makeActive }),
         });
         const data = await res.json();
         if (res.ok && data.success) {
            toast.success(makeActive ? "Program rules saved and program is now ACTIVE for farmers & clusters!" : "Program operational rules saved successfully!");
            setSelectedConfigProgram(null);
            fetchData();
         } else {
            toast.error(data.error || "Failed to save configuration");
         }
      } catch (err) {
         toast.error("Network error while saving program rules");
      } finally {
         setIsSavingConfig(false);
      }
   };

   const handleToggleProgramStatus = async (prog, targetStatus) => {
      setIsTogglingStatus(prog.id);
      try {
         const res = await fetch(`/api/proxy/programs/${prog.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: targetStatus }),
         });
         const data = await res.json();
         if (res.ok && data.success) {
            toast.success(data.message || `Program status updated to ${targetStatus}`);
            fetchData();
         } else {
            toast.error(data.error || "Failed to update status");
         }
      } catch (err) {
         toast.error("Network error while updating status");
      } finally {
         setIsTogglingStatus(null);
      }
   };

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
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Operational agricultural programs & rules configuration</p>
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
                     <p className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">Program Operations Mode</p>
                     <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Configure rules, eligibility, and input packages below.</p>
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
                  const hasConfiguration = prog.configuration && Object.keys(prog.configuration).length > 0;
                  const isConfiguring = prog.status === "configuring" || prog.status === "draft";
                  const isActive = prog.status === "active";

                  return (
                     <Card key={i} className={`border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden transition-all ${isEnrolled ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : "hover:scale-[1.01]"}`}>
                        <div className={`p-1 ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <CardHeader className="p-6">
                           <div className="flex justify-between items-start gap-2">
                              <div className={`p-3 rounded-2xl ${isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                 <Briefcase size={24} />
                              </div>
                              {isActive ? (
                                 <span className="px-3.5 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Active & Live
                                 </span>
                              ) : (
                                 <span className="px-3.5 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                                    <Sliders className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                    In Configuration
                                 </span>
                              )}
                           </div>
                           <div className="mt-4">
                              <h3 className="text-xl font-black text-(--foreground)">{prog.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                 <Globe className="w-3 h-3 text-gray-400" />
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{prog.region} • {prog.commodity}</p>
                              </div>
                              {prog.director_name && (
                                 <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-200/60 font-bold inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Director: {prog.director_name}
                                 </div>
                              )}
                           </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                           {/* Visibility Alert Banner */}
                           {isConfiguring ? (
                              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs flex items-start gap-2.5">
                                 <EyeOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-black text-amber-900 dark:text-amber-200 text-[11px] uppercase tracking-wide">Hidden from Farmers & Clusters</p>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                                       Participants cannot see or join this program yet. Configure rules below and click <strong>Make Active</strong> when ready.
                                    </p>
                                 </div>
                              </div>
                           ) : (
                              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-start gap-2.5">
                                 <Eye className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-black text-emerald-900 dark:text-emerald-200 text-[11px] uppercase tracking-wide">Live in Ecosystem</p>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                                       Visible to farmers & clusters. Eligible participants can now discover and enroll.
                                    </p>
                                 </div>
                              </div>
                           )}

                           <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Available Program Fund</p>
                                 <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">₦{parseFloat(prog.wallet_balance || 0).toLocaleString()}</p>
                              </div>
                              <span className="text-[10px] font-black bg-white dark:bg-gray-900 px-2.5 py-1 rounded-xl text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                 Allocated
                              </span>
                           </div>
                           <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Target</p>
                                 <p className="font-bold text-sm">{prog.target_farmers} Farmers</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Enrolled</p>
                                 <p className="font-bold text-sm">{prog.enrolled_farmers || 0}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Hectares</p>
                                 <p className="font-bold text-sm">{prog.target_hectares || 0} Ha</p>
                              </div>
                           </div>

                           {/* Operational Configuration Status */}
                           <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs flex justify-between items-center">
                              <span className="text-gray-500 font-bold">Operational Rules:</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${hasConfiguration ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                 {hasConfiguration ? "Configured" : "Default Rules"}
                              </span>
                           </div>

                           <div className="pt-2 space-y-2">
                              {/* Primary Activation Toggle */}
                              {isConfiguring ? (
                                 <button
                                    onClick={() => handleToggleProgramStatus(prog, "active")}
                                    disabled={isTogglingStatus === prog.id}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 cursor-pointer"
                                 >
                                    {isTogglingStatus === prog.id ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                    Make Active (Publish for Farmers & Clusters)
                                 </button>
                              ) : (
                                 <button
                                    onClick={() => handleToggleProgramStatus(prog, "configuring")}
                                    disabled={isTogglingStatus === prog.id}
                                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                                 >
                                    {isTogglingStatus === prog.id ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={14} />}
                                    Pause Program (Set to Configuring)
                                 </button>
                              )}

                              {/* Configure Rules (Director Feature) */}
                              <button
                                 onClick={() => openConfigModal(prog)}
                                 className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                              >
                                 <Sliders size={14} /> Configure Program Rules
                              </button>

                              {/* Input Packages */}
                              <button
                                 onClick={() => openPackagesModal(prog)}
                                 className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                 <Package size={14} /> Manage Input Packages
                              </button>

                              {/* Field Monitoring & Officers */}
                              <Link
                                 href={`/ecosystem/program-management/monitoring?programId=${prog.id}`}
                                 className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                 <Users size={14} /> Assign & Monitor Field Officers
                              </Link>

                              {isEnrolled ? (
                                 <button disabled className="w-full py-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2 shadow-inner">
                                    <CheckCircle2 size={16} /> Cluster Enrolled in Program
                                 </button>
                              ) : isConfiguring ? (
                                 <button disabled className="w-full py-3 bg-gray-100 dark:bg-gray-900 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                    <EyeOff size={14} /> Program In Configuration (Cannot Enroll)
                                 </button>
                              ) : (
                                 <button 
                                    onClick={() => handleEnrollCluster(prog.id)}
                                    disabled={enrollingId === prog.id || !canEnroll}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                 >
                                    {enrollingId === prog.id ? "Enrolling Cluster..." : (!activeCluster) ? "Register Cluster to Enroll" : (activeCluster && activeCluster.program_id) ? "Cluster Enrolled in Another Program" : "Enroll Cluster in Program"}
                                 </button>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  );
               })
            )}
         </div>

         {/* Program Director Operational Rules Configuration Modal (from PDF) */}
         {selectedConfigProgram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <Sliders className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Configure Program Rules & Targets</h3>
                           <p className="text-xs text-amber-100 font-medium mt-0.5">{selectedConfigProgram.name}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setSelectedConfigProgram(null)}
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full flex items-center justify-center"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 pt-3 bg-gray-50/50 dark:bg-gray-900/50 gap-4 shrink-0 overflow-x-auto">
                     <button
                        onClick={() => setConfigTab("eligibility")}
                        className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                           configTab === "eligibility" ? "border-amber-600 text-amber-600 dark:text-amber-400" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                     >
                        <ShieldCheck size={14} /> Eligibility & Geography
                     </button>
                     <button
                        onClick={() => setConfigTab("crop_targets")}
                        className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                           configTab === "crop_targets" ? "border-amber-600 text-amber-600 dark:text-amber-400" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                     >
                        <Target size={14} /> Crop & Targets
                     </button>
                     <button
                        onClick={() => setConfigTab("financing")}
                        className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                           configTab === "financing" ? "border-amber-600 text-amber-600 dark:text-amber-400" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                     >
                        <DollarSign size={14} /> Financing & Repayment
                     </button>
                     <button
                        onClick={() => setConfigTab("monitoring")}
                        className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                           configTab === "monitoring" ? "border-amber-600 text-amber-600 dark:text-amber-400" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                     >
                        <Layers size={14} /> Monitoring & Stages
                     </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSaveConfiguration} className="p-6 overflow-y-auto space-y-6 flex-1">
                     {configTab === "eligibility" && (
                        <div className="space-y-4 animate-in fade-in">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Farmer Eligibility Rules</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Minimum Farm Size (Ha)</label>
                                 <input
                                    type="number"
                                    step="0.1"
                                    value={configForm.eligibility.min_farm_size}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       eligibility: { ...configForm.eligibility, min_farm_size: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Maximum Farm Size (Ha)</label>
                                 <input
                                    type="number"
                                    step="0.1"
                                    value={configForm.eligibility.max_farm_size}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       eligibility: { ...configForm.eligibility, max_farm_size: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 pt-2">
                              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
                                 <input
                                    type="checkbox"
                                    checked={configForm.eligibility.kyc_required}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       eligibility: { ...configForm.eligibility, kyc_required: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded text-amber-600"
                                 />
                                 <span className="text-xs font-bold">Mandatory Identity / NIN KYC</span>
                              </label>

                              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
                                 <input
                                    type="checkbox"
                                    checked={configForm.eligibility.gps_mapping_required}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       eligibility: { ...configForm.eligibility, gps_mapping_required: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded text-amber-600"
                                 />
                                 <span className="text-xs font-bold">GPS Farm Polygon Required</span>
                              </label>
                           </div>

                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-2">Geographic Scope</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target State(s)</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. Kaduna, Niger, Kano"
                                    value={configForm.geography.target_states}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       geography: { ...configForm.geography, target_states: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target LGAs</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. Zaria, Makarfi, Kudan"
                                    value={configForm.geography.target_lgas}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       geography: { ...configForm.geography, target_lgas: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {configTab === "crop_targets" && (
                        <div className="space-y-4 animate-in fade-in">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Commodity & Production Parameters</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Crop / Commodity</label>
                                 <input
                                    type="text"
                                    value={configForm.crop_parameters.target_crop}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       crop_parameters: { ...configForm.crop_parameters, target_crop: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Seed Variety / Hybrid</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. FARO 44, SAMMAZ 15"
                                    value={configForm.crop_parameters.seed_variety}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       crop_parameters: { ...configForm.crop_parameters, seed_variety: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Expected Yield (MT/Ha)</label>
                                 <input
                                    type="number"
                                    step="0.1"
                                    value={configForm.crop_parameters.expected_yield_mt}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       crop_parameters: { ...configForm.crop_parameters, expected_yield_mt: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Planting Window</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. May - June"
                                    value={configForm.crop_parameters.planting_window}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       crop_parameters: { ...configForm.crop_parameters, planting_window: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Harvest Window</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. October - November"
                                    value={configForm.crop_parameters.harvest_window}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       crop_parameters: { ...configForm.crop_parameters, harvest_window: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>

                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-2">Operational Targets</h4>
                           <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Farmers</label>
                                 <input
                                    type="number"
                                    value={configForm.operational_targets.target_farmers}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       operational_targets: { ...configForm.operational_targets, target_farmers: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Target Hectares</label>
                                 <input
                                    type="number"
                                    value={configForm.operational_targets.target_hectares}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       operational_targets: { ...configForm.operational_targets, target_hectares: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Production Goal (MT)</label>
                                 <input
                                    type="number"
                                    value={configForm.operational_targets.target_production_mt}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       operational_targets: { ...configForm.operational_targets, target_production_mt: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {configTab === "financing" && (
                        <div className="space-y-4 animate-in fade-in">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Financing & Input Support Model</h4>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Support Structure</label>
                                 <select
                                    value={configForm.financing.support_type}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       financing: { ...configForm.financing, support_type: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 >
                                    <option value="in_kind_input_credit">In-kind Input Credit (Direct Supplier Order)</option>
                                    <option value="loan">Revolving Loan Facility</option>
                                    <option value="grant">Subsidized Grant Scheme</option>
                                    <option value="hybrid">Blended Finance / Co-pay</option>
                                 </select>
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Max Credit Value Per Hectare (NGN)</label>
                                 <input
                                    type="number"
                                    value={configForm.financing.max_credit_per_ha}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       financing: { ...configForm.financing, max_credit_per_ha: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Service Fee / Interest (%)</label>
                                 <input
                                    type="number"
                                    step="0.5"
                                    value={configForm.financing.interest_fee_pct}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       financing: { ...configForm.financing, interest_fee_pct: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Repayment Cycle (Months)</label>
                                 <input
                                    type="number"
                                    value={configForm.financing.repayment_tenor_months}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       financing: { ...configForm.financing, repayment_tenor_months: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 />
                              </div>
                           </div>

                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-2">Repayment & Recovery Structure</h4>
                           <div className="space-y-3">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Recovery Mechanism</label>
                                 <select
                                    value={configForm.repayment.recovery_mechanism}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       repayment: { ...configForm.repayment, recovery_mechanism: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 >
                                    <option value="warehouse_offtake_deduction">Commodity Off-take Deduction (Warehouse Receipt Net Settlement)</option>
                                    <option value="buyback_guarantee">Guaranteed Institutional Buyback</option>
                                    <option value="cash_direct">Direct Farmer Wallet Debit Upon Sale</option>
                                 </select>
                              </div>

                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Recovery Terms & Settlement Timeline</label>
                                 <textarea
                                    rows="2"
                                    value={configForm.repayment.timeline_description}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       repayment: { ...configForm.repayment, timeline_description: e.target.value }
                                    })}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-medium text-xs"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {configTab === "monitoring" && (
                        <div className="space-y-4 animate-in fade-in">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Field Operations & Intelligence Monitoring</h4>
                           
                           <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
                              Field officers assigned to this program will execute mandatory ground inspections across these defined operational milestones.
                           </div>

                           <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Mandatory Inspection Milestones</label>
                              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                 {["Land Preparation / Clearing", "Sowing & Planting", "Vegetative Growth & Weeding", "Pre-harvest Audit"].map((stage, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                                       <CheckCircle2 size={16} className="text-emerald-500" />
                                       <span>{stage}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Field Inspection Cadence</label>
                                 <select
                                    value={configForm.monitoring.field_visit_frequency}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       monitoring: { ...configForm.monitoring, field_visit_frequency: e.target.value }
                                    })}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-sm"
                                 >
                                    <option value="weekly">Weekly Verification</option>
                                    <option value="biweekly">Bi-weekly Inspections</option>
                                    <option value="milestone_only">At Key Growth Milestones Only</option>
                                 </select>
                              </div>

                              <div className="flex items-center gap-2 pt-6">
                                 <input
                                    type="checkbox"
                                    id="satelliteToggle"
                                    checked={configForm.monitoring.satellite_monitoring}
                                    onChange={(e) => setConfigForm({
                                       ...configForm,
                                       monitoring: { ...configForm.monitoring, satellite_monitoring: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                                 />
                                 <label htmlFor="satelliteToggle" className="text-xs font-bold cursor-pointer">
                                    Continuous Satellite / NDVI Crop Health Telemetry
                                 </label>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Action Buttons */}
                     <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button
                           type="button"
                           onClick={() => setSelectedConfigProgram(null)}
                           disabled={isSavingConfig}
                           className="px-5 h-12 rounded-2xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm cursor-pointer"
                        >
                           Cancel
                        </button>
                        <button
                           type="button"
                           onClick={(e) => handleSaveConfiguration(e, false)}
                           disabled={isSavingConfig}
                           className="flex-1 h-12 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                           {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Rules (Keep Inactive)"}
                        </button>
                        <button
                           type="button"
                           onClick={(e) => handleSaveConfiguration(e, true)}
                           disabled={isSavingConfig}
                           className="flex-1 h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                           {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                              <>
                                 <Rocket className="w-4 h-4" /> Save & Make Active (Live)
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Input Packages Modal */}
         {selectedProgramForPackages && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-black">Program Input Packages</h3>
                        <p className="text-xs text-emerald-100 font-medium mt-0.5">{selectedProgramForPackages.name}</p>
                     </div>
                     <button onClick={() => setSelectedProgramForPackages(null)} className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full flex items-center justify-center">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="p-6 space-y-6">
                     <form onSubmit={handleCreatePackage} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Define New Package</h4>
                        <div className="grid grid-cols-2 gap-3">
                           <input
                              type="text"
                              required
                              placeholder="Package Name (e.g. Rice Starter Pack)"
                              value={newPackage.name}
                              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                              className="px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                           />
                           <input
                              type="number"
                              required
                              placeholder="Total Value (NGN)"
                              value={newPackage.total_value}
                              onChange={(e) => setNewPackage({ ...newPackage, total_value: e.target.value })}
                              className="px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold"
                           />
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-gray-700 dark:text-gray-300 pt-1">
                           <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={newPackage.seeds} onChange={(e) => setNewPackage({ ...newPackage, seeds: e.target.checked })} />
                              <span>Seeds</span>
                           </label>
                           <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={newPackage.fertilizer} onChange={(e) => setNewPackage({ ...newPackage, fertilizer: e.target.checked })} />
                              <span>Fertilizer</span>
                           </label>
                           <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={newPackage.herbicides} onChange={(e) => setNewPackage({ ...newPackage, herbicides: e.target.checked })} />
                              <span>Herbicides</span>
                           </label>
                        </div>
                        <button
                           type="submit"
                           disabled={isCreatingPackage}
                           className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 mt-2"
                        >
                           {isCreatingPackage ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Package
                        </button>
                     </form>

                     <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">Defined Packages</h4>
                        {loadingPackages ? (
                           <p className="text-xs text-gray-400 font-bold animate-pulse text-center py-4">Loading packages...</p>
                        ) : packages.length === 0 ? (
                           <p className="text-xs text-gray-400 font-bold text-center py-4">No packages defined for this program yet.</p>
                        ) : (
                           packages.map((pkg, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                                 <div>
                                    <p className="font-bold text-sm text-(--foreground)">{pkg.name}</p>
                                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                                       {pkg.seeds && <span>✓ Seeds</span>}
                                       {pkg.fertilizer && <span>✓ Fertilizer</span>}
                                       {pkg.herbicides && <span>✓ Herbicides</span>}
                                    </div>
                                 </div>
                                 <p className="font-black text-sm text-emerald-600">₦{parseFloat(pkg.total_value || 0).toLocaleString()}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
