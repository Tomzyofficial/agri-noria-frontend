"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
   Briefcase, Globe, Users, CheckCircle2, DollarSign, Package, X, Plus, Check, Loader2,
   Sliders, Settings, MapPin, Target, ShieldCheck, FileText, AlertTriangle, Layers,
   Rocket, PauseCircle, Eye, EyeOff, Clock, AlertCircle, CalendarPlus, Calendar, Sparkles, Trash2
} from "lucide-react";
import { useProgramData } from "../useProgramData";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

export const DEFAULT_FINANCING_INPUTS = [
   { id: "Mechanical",  name: "Mechanical",  ratePerHa: 150000, icon: "🚜", description: "Land preparation & machinery",  unit: "per hectare", enabled: true },
   { id: "Seeds",       name: "Seeds",       ratePerHa: 45000,  icon: "🌱", description: "High-yield improved variety",    unit: "per hectare", enabled: true },
   { id: "Fertilizer",  name: "Fertilizer",  ratePerHa: 65000,  icon: "🧪", description: "NPK and specialized blends",    unit: "per hectare", enabled: true },
   { id: "Irrigations", name: "Irrigations", ratePerHa: 120000, icon: "💧", description: "Water management systems",      unit: "per hectare", enabled: true },
   { id: "Pesticides",  name: "Pesticides",  ratePerHa: 35000,  icon: "🧴", description: "Crop protection chemicals",     unit: "per hectare", enabled: true },
   { id: "Herbicides",  name: "Herbicides",  ratePerHa: 25000,  icon: "🌿", description: "Weed control solutions",        unit: "per hectare", enabled: true },
];

export default function EcosystemProgramsPage() {
   const { loading, programs, currentUserId, userRole, clusters, fetchData } = useProgramData();
   const isSupervisor = (userRole || "").toLowerCase().includes("supervisor");
   const isDirector = (userRole || "").toLowerCase().includes("director") || (!isSupervisor && ((userRole || "").toLowerCase() === "program director" || (userRole || "").toLowerCase() === "director"));
   const [enrollingId, setEnrollingId] = useState(null);
   const [confirmingEnrollProgram, setConfirmingEnrollProgram] = useState(null);
   const [isTogglingStatus, setIsTogglingStatus] = useState(null);

   // Program Season Extension Modal state
   const [extendingProgram, setExtendingProgram] = useState(null);
   const [isExtending, setIsExtending] = useState(false);
   const [extendForm, setExtendForm] = useState({
      start_date: "",
      end_date: "",
      make_active: false
   });

   const isProgramExpired = (prog) => {
      if (!prog?.end_date) return false;
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endDate = new Date(prog.end_date);
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return todayDateOnly > endDateOnly;
   };

   const openExtendModal = (prog) => {
      setExtendingProgram(prog);
      const sDate = prog.start_date ? prog.start_date.split("T")[0] : "";
      const eDate = prog.end_date ? prog.end_date.split("T")[0] : "";
      setExtendForm({
         start_date: sDate,
         end_date: eDate,
         make_active: prog.status !== "active"
      });
   };

   const applyDatePreset = (monthsToAdd) => {
      const base = new Date();
      base.setMonth(base.getMonth() + monthsToAdd);
      const yyyy = base.getFullYear();
      const mm = String(base.getMonth() + 1).padStart(2, "0");
      const dd = String(base.getDate()).padStart(2, "0");
      setExtendForm(prev => ({
         ...prev,
         end_date: `${yyyy}-${mm}-${dd}`
      }));
   };

   const handleExtendProgram = async (e) => {
      if (e) e.preventDefault();
      if (!extendForm.end_date) {
         toast.error("Please specify a valid program end date.");
         return;
      }
      if (extendForm.start_date && extendForm.end_date && extendForm.end_date < extendForm.start_date) {
         toast.error("Program end date cannot be earlier than start date.");
         return;
      }

      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const newEndDate = new Date(extendForm.end_date);
      const newEndDateOnly = new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDate());
      if (todayDateOnly > newEndDateOnly) {
         toast.error("End date must be in the future to keep the program active.");
         return;
      }

      setIsExtending(true);
      try {
         const payload = {
            start_date: extendForm.start_date || undefined,
            end_date: extendForm.end_date,
            ...(extendForm.make_active ? { status: "active" } : {})
         };

         const res = await fetch(`/api/proxy/programs/${extendingProgram.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });
         const data = await res.json();
         if (res.ok && data.success) {
            toast.success(
               extendForm.make_active
                  ? `Program season extended to ${new Date(extendForm.end_date).toLocaleDateString("en-GB")} and published LIVE!`
                  : `Program season successfully extended to ${new Date(extendForm.end_date).toLocaleDateString("en-GB")}!`
            );
            setExtendingProgram(null);
            fetchData();
         } else {
            toast.error(data.error || "Failed to extend program dates");
         }
      } catch (err) {
         console.error("Error extending program dates:", err);
         toast.error("Network error while extending program dates");
      } finally {
         setIsExtending(false);
      }
   };

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
         eligible_inputs: DEFAULT_FINANCING_INPUTS,
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
            eligible_inputs: (Array.isArray(cfg.financing?.eligible_inputs) && cfg.financing.eligible_inputs.length > 0)
               ? cfg.financing.eligible_inputs
               : DEFAULT_FINANCING_INPUTS,
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

   // Handlers for Input Packages & Pricing Catalog inside Program Rules
   const handleToggleInput = (index) => {
      const inputs = [...(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS)];
      inputs[index] = { ...inputs[index], enabled: !inputs[index].enabled };
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: inputs }
      });
   };

   const handleUpdateInputPrice = (index, newPrice) => {
      const inputs = [...(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS)];
      inputs[index] = { ...inputs[index], ratePerHa: Math.max(0, parseFloat(newPrice) || 0) };
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: inputs }
      });
   };

   const handleUpdateInputName = (index, newName) => {
      const inputs = [...(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS)];
      inputs[index] = { ...inputs[index], name: newName, id: newName };
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: inputs }
      });
   };

   const handleUpdateInputDesc = (index, newDesc) => {
      const inputs = [...(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS)];
      inputs[index] = { ...inputs[index], description: newDesc };
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: inputs }
      });
   };

   const handleAddCustomInput = () => {
      const current = configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS;
      const customItem = {
         id: `Input_${Date.now()}`,
         name: "Specialized Agro-Input",
         ratePerHa: 50000,
         icon: "📦",
         description: "Custom agronomic support package",
         unit: "per hectare",
         enabled: true,
         isCustom: true
      };
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: [...current, customItem] }
      });
   };

   const handleRemoveCustomInput = (index) => {
      const current = [...(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS)];
      current.splice(index, 1);
      setConfigForm({
         ...configForm,
         financing: { ...configForm.financing, eligible_inputs: current }
      });
   };

   const handleSaveConfiguration = async (e, makeActive = false) => {
      if (e) e.preventDefault();
      if (makeActive && isProgramExpired(selectedConfigProgram)) {
         toast.error(`Cannot activate program: the program end date (${new Date(selectedConfigProgram.end_date).toLocaleDateString("en-GB")}) has passed. Please extend the dates first.`);
         return;
      }
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
            toast.success("Cluster enrollment submitted! Awaiting Program Director approval.");
            setConfirmingEnrollProgram(null);
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
            {isSupervisor && activeCluster ? (
               <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                     <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Active Cluster Target</p>
                     <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">{activeCluster.name} ({activeCluster.total_hectares || 0} HA)</p>
                  </div>
               </div>
            ) : isSupervisor ? (
               <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                     <p className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">Cluster Enrollment Mode</p>
                     <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Select an active program below to enroll your cluster.</p>
                  </div>
               </div>
            ) : (
               <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                     <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Director Governance Mode</p>
                     <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Configure program rules, input packages, and monitoring officers.</p>
                  </div>
               </div>
            )}
         </div>

         <div className="w-full space-y-6">
            {programs.length === 0 ? (
               <Card className="w-full border-none shadow-xl bg-white dark:bg-gray-950 p-12 text-center rounded-3xl">
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
                  const isExpired = isProgramExpired(prog);

                  return (
                     <Card key={i} className={`w-full border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden transition-all ${isEnrolled ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : "hover:shadow-2xl"}`}>
                        <div className={`h-1.5 w-full ${isExpired ? "bg-rose-500" : isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <CardHeader className="p-6 md:p-8 pb-4">
                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                 <div className={`p-3.5 rounded-2xl shrink-0 ${isExpired ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600" : isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600"}`}>
                                    <Briefcase size={28} />
                                 </div>
                                 <div>
                                    <div className="flex flex-wrap items-center gap-2.5">
                                       <h3 className="text-2xl font-black text-(--foreground) tracking-tight">{prog.name}</h3>
                                       {isExpired ? (
                                          <span className="px-3.5 py-1 text-[10px] rounded-full font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 shadow-xs">
                                             <Clock className="w-3.5 h-3.5 text-rose-600" />
                                             Season Expired
                                          </span>
                                       ) : isActive ? (
                                          <span className="px-3.5 py-1 text-[10px] rounded-full font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
                                             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                             Active & Live
                                          </span>
                                       ) : (
                                          <span className="px-3.5 py-1 text-[10px] rounded-full font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-xs">
                                             <Sliders className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                             In Configuration
                                          </span>
                                       )}
                                       {isEnrolled && (
                                          activeCluster?.program_enrollment_status === 'pending_verification' ? (
                                             <span className="px-3.5 py-1 text-[10px] rounded-full font-black uppercase tracking-widest bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                                                <Clock className="w-3.5 h-3.5" />
                                                Enrollment Pending Approval
                                             </span>
                                          ) : (
                                             <span className="px-3.5 py-1 text-[10px] rounded-full font-black uppercase tracking-widest bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Your Cluster Enrolled
                                             </span>
                                          )
                                       )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-gray-500">
                                       <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] font-black">
                                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                                          {prog.region} • {prog.commodity}
                                       </span>
                                       {prog.director_name && (
                                          <>
                                             <span className="text-gray-300 dark:text-gray-700">•</span>
                                             <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-200/60 text-[11px] font-bold inline-flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Director: {prog.director_name}
                                             </span>
                                          </>
                                       )}
                                       {(prog.start_date || prog.end_date) && (
                                          <>
                                             <span className="text-gray-300 dark:text-gray-700">•</span>
                                             <span className={`text-[11px] inline-flex items-center gap-1 font-semibold ${isExpired ? "text-rose-600 dark:text-rose-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                {prog.start_date ? new Date(prog.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Immediate"}
                                                {" — "}
                                                {prog.end_date ? new Date(prog.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Ongoing"}
                                                {isExpired && (
                                                   <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] uppercase font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                      Expired
                                                   </span>
                                                )}
                                             </span>
                                          </>
                                       )}
                                    </div>
                                 </div>
                              </div>

                              {/* Visibility Status Badge */}
                              <div className="shrink-0">
                                 {isExpired ? (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300">
                                       <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                       <div className="text-left">
                                          <p className="font-black text-[11px] uppercase tracking-wide">Season Ended ({new Date(prog.end_date).toLocaleDateString("en-GB")})</p>
                                          <p className="text-[10px] text-rose-700 dark:text-rose-400">Extend end date to publish and accept enrollments.</p>
                                       </div>
                                    </div>
                                 ) : isConfiguring ? (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300">
                                       <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                                       <div className="text-left">
                                          <p className="font-black text-[11px] uppercase tracking-wide">Hidden from Farmers & Clusters</p>
                                          <p className="text-[10px] text-amber-700 dark:text-amber-400">Configure rules, then click Make Active when ready.</p>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                                       <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                                       <div className="text-left">
                                          <p className="font-black text-[11px] uppercase tracking-wide">Live in Ecosystem</p>
                                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Published and accepting eligible enrollments.</p>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 pt-2 space-y-6">
                           {/* 4-5 Column Horizontal Metrics Dashboard */}
                           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {/* 1. Available Fund */}
                              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 flex flex-col justify-between">
                                 <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Available Fund</p>
                                    <span className="text-[9px] font-black bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md text-emerald-600 border border-emerald-100 dark:border-emerald-800">
                                       Allocated
                                    </span>
                                 </div>
                                 <p className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    ₦{parseFloat(prog.wallet_balance || 0).toLocaleString()}
                                 </p>
                                 <p className="text-[10px] font-bold text-gray-400 mt-1">Disbursement pool</p>
                              </div>

                              {/* 2. Target Farmers */}
                              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Target Farmers</p>
                                 <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                                    {parseInt(prog.target_farmers || 0).toLocaleString()}
                                 </p>
                                 <p className="text-[10px] font-bold text-gray-400 mt-1">Program capacity</p>
                              </div>

                              {/* 3. Enrolled Farmers */}
                              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Enrolled Farmers</p>
                                 <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                                    {parseInt(prog.enrolled_farmers || 0).toLocaleString()}
                                 </p>
                                 <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {prog.target_farmers > 0 ? `${Math.round(((prog.enrolled_farmers || 0) / prog.target_farmers) * 100)}% filled` : "0% filled"}
                                 </p>
                              </div>

                              {/* 4. Target Hectares */}
                              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Target Hectares</p>
                                 <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                                    {parseFloat(prog.target_hectares || 0).toLocaleString()} <span className="text-xs font-bold text-gray-400">Ha</span>
                                 </p>
                                 <p className="text-[10px] font-bold text-gray-400 mt-1">Farmland reach</p>
                              </div>

                              {/* 5. Operational Rules */}
                              <div className="col-span-2 md:col-span-4 lg:col-span-1 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Operational Rules</p>
                                 <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${hasConfiguration ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                                       {hasConfiguration ? "Configured" : "Default Rules"}
                                    </span>
                                 </div>
                                 <p className="text-[10px] font-bold text-gray-400 mt-1">
                                    {hasConfiguration ? "Customized criteria" : "Standard baseline"}
                                 </p>
                              </div>
                           </div>

                           {/* Horizontal Action Controls Bar */}
                           <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                              {/* Program Director Governance Controls */}
                              {!isSupervisor && (
                                 <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    {isConfiguring ? (
                                       <button
                                          onClick={() => {
                                             if (isExpired) {
                                                toast.warning(`Cannot activate program: the program end date (${new Date(prog.end_date).toLocaleDateString("en-GB")}) has passed. Please extend the dates first.`);
                                                openExtendModal(prog);
                                                return;
                                             }
                                             handleToggleProgramStatus(prog, "active");
                                          }}
                                          disabled={isTogglingStatus === prog.id || isExpired}
                                          title={isExpired ? "Program season end date has passed. Please extend the program end date first." : "Make program live for farmers & clusters"}
                                          className={`py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-98 ${
                                             isExpired
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                                          }`}
                                       >
                                          {isTogglingStatus === prog.id ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                          {isExpired ? "Activation Disabled (Expired)" : "Make Active (Publish)"}
                                       </button>
                                    ) : (
                                       <button
                                          onClick={() => handleToggleProgramStatus(prog, "configuring")}
                                          disabled={isTogglingStatus === prog.id}
                                          className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                                       >
                                          {isTogglingStatus === prog.id ? <Loader2 size={14} className="animate-spin" /> : <PauseCircle size={14} />}
                                          Pause Program
                                       </button>
                                    )}

                                    {/* Dedicated Extend Program Dates Action */}
                                    <button
                                       onClick={() => openExtendModal(prog)}
                                       className={`py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer ${
                                          isExpired
                                             ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 ring-2 ring-purple-400/50"
                                             : "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                       }`}
                                    >
                                       <CalendarPlus size={14} />
                                       {isExpired ? "Extend Program End Date" : "Extend Season / Dates"}
                                    </button>

                                    <button
                                       onClick={() => openConfigModal(prog)}
                                       className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                                    >
                                       <Sliders size={14} /> Configure Program Rules
                                    </button>

                                    <button
                                       onClick={() => openPackagesModal(prog)}
                                       className="py-2.5 px-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                       <Package size={14} /> Manage Input Packages
                                    </button>

                                    <Link
                                       href={`/ecosystem/program-management/monitoring?programId=${prog.id}`}
                                       className="py-2.5 px-5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                       <Users size={14} /> Assign Field Officers
                                    </Link>
                                 </div>
                              )}

                              {/* Cluster Supervisor Enrollment Actions */}
                              {isSupervisor && (
                                 <div className="w-full sm:w-auto">
                                    {isEnrolled ? (
                                       activeCluster?.program_enrollment_status === 'pending_verification' ? (
                                          <button disabled className="py-2.5 px-6 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-xl font-black text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2 shadow-inner">
                                             <Clock size={16} className="animate-pulse" /> Enrollment Pending Director Approval
                                          </button>
                                       ) : (
                                          <button disabled className="py-2.5 px-6 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest cursor-default flex items-center justify-center gap-2 shadow-inner">
                                             <CheckCircle2 size={16} /> Cluster Enrolled in Program
                                          </button>
                                       )
                                    ) : isConfiguring ? (
                                       <button disabled className="py-2.5 px-6 bg-gray-100 dark:bg-gray-900 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                          <EyeOff size={14} /> Program In Configuration (Cannot Enroll)
                                       </button>
                                    ) : (prog.end_date && new Date() > new Date(new Date(prog.end_date).getFullYear(), new Date(prog.end_date).getMonth(), new Date(prog.end_date).getDate(), 23, 59, 59)) ? (
                                       <button disabled className="py-2.5 px-6 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                          <Clock size={14} /> Program Ended ({new Date(prog.end_date).toLocaleDateString("en-GB")})
                                       </button>
                                    ) : (prog.start_date && new Date() < new Date(new Date(prog.start_date).getFullYear(), new Date(prog.start_date).getMonth(), new Date(prog.start_date).getDate())) ? (
                                       <button disabled className="py-2.5 px-6 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                          <Clock size={14} /> Enrollment Starts {new Date(prog.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                       </button>
                                    ) : (parseInt(prog.target_farmers) > 0 && parseInt(prog.enrolled_farmers) >= parseInt(prog.target_farmers)) ? (
                                       <button disabled className="py-2.5 px-6 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                          <AlertCircle size={14} /> Target Capacity Reached ({prog.enrolled_farmers}/{prog.target_farmers})
                                       </button>
                                    ) : (
                                       <button 
                                          onClick={() => {
                                             if (!activeCluster) {
                                                toast.error("No active cluster found to enroll in this program.");
                                                return;
                                             }
                                             if (activeCluster.program_id) {
                                                toast.warning("This cluster is already associated with another program.");
                                                return;
                                             }
                                             setConfirmingEnrollProgram(prog);
                                          }}
                                          disabled={enrollingId === prog.id || !canEnroll}
                                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                       >
                                          {enrollingId === prog.id ? "Enrolling Cluster..." : (!activeCluster) ? "Register Cluster to Enroll" : (activeCluster && activeCluster.program_id) ? "Cluster Enrolled in Another Program" : "Enroll Cluster in Program"}
                                       </button>
                                    )}
                                 </div>
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

                           {/* Dynamic Eligible Inputs & Pricing Catalog Configuration */}
                           <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                 <div>
                                    <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                       <Package className="w-4 h-4" /> Eligible Inputs & Pricing Catalog (₦/Ha)
                                    </h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                       Configure which inputs are available for cluster & farmer financing, and set custom rates per hectare.
                                    </p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={handleAddCustomInput}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-800 transition cursor-pointer self-start sm:self-auto"
                                 >
                                    <Plus className="w-3.5 h-3.5" /> Add Custom Input
                                 </button>
                              </div>

                              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                                 {(configForm.financing.eligible_inputs || DEFAULT_FINANCING_INPUTS).map((item, idx) => (
                                    <div 
                                       key={item.id || idx}
                                       className={`p-3.5 rounded-2xl border transition-all ${
                                          item.enabled !== false
                                             ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs"
                                             : "bg-gray-50/70 dark:bg-gray-950/60 border-dashed border-gray-200 dark:border-gray-800 opacity-60"
                                       }`}
                                    >
                                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                          {/* Left: Enable Toggle + Icon + Title */}
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                             <button
                                                type="button"
                                                onClick={() => handleToggleInput(idx)}
                                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                                   item.enabled !== false
                                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                                      : "bg-transparent border-gray-300 dark:border-gray-700"
                                                }`}
                                                title={item.enabled !== false ? "Input enabled" : "Input disabled"}
                                             >
                                                {item.enabled !== false && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                             </button>

                                             <span className="text-xl shrink-0">{item.icon || "📦"}</span>

                                             <div className="flex-1 min-w-0">
                                                {item.isCustom ? (
                                                   <input
                                                      type="text"
                                                      value={item.name}
                                                      onChange={(e) => handleUpdateInputName(idx, e.target.value)}
                                                      className="w-full font-bold text-xs bg-transparent border-b border-gray-300 dark:border-gray-700 pb-0.5 outline-none focus:border-amber-500"
                                                      placeholder="Input Name"
                                                   />
                                                ) : (
                                                   <p className="font-black text-xs text-gray-900 dark:text-gray-100 truncate">
                                                      {item.name || item.id}
                                                   </p>
                                                )}
                                                <input
                                                   type="text"
                                                   value={item.description || ""}
                                                   onChange={(e) => handleUpdateInputDesc(idx, e.target.value)}
                                                   className="w-full text-[11px] text-gray-500 bg-transparent border-none p-0 outline-none mt-0.5"
                                                   placeholder="Short description..."
                                                />
                                             </div>
                                          </div>

                                          {/* Right: Rate Per Hectare + Custom Delete */}
                                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                             <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                                <span className="text-xs font-black text-amber-600">₦</span>
                                                <input
                                                   type="number"
                                                   min="0"
                                                   step="1000"
                                                   value={item.ratePerHa || 0}
                                                   onChange={(e) => handleUpdateInputPrice(idx, e.target.value)}
                                                   className="w-24 font-black text-xs bg-transparent border-none outline-none text-right"
                                                />
                                                <span className="text-[10px] text-gray-400 font-bold">/ Ha</span>
                                             </div>

                                             {item.isCustom && (
                                                <button
                                                   type="button"
                                                   onClick={() => handleRemoveCustomInput(idx)}
                                                   className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                                                   title="Remove custom input"
                                                >
                                                   <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
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
                           disabled={isSavingConfig || isProgramExpired(selectedConfigProgram)}
                           title={isProgramExpired(selectedConfigProgram) ? "Program season has expired. Please extend the dates first before activating." : "Save and make live"}
                           className={`flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition ${
                              isProgramExpired(selectedConfigProgram)
                                 ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                                 : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 cursor-pointer"
                           }`}
                        >
                           {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                              <>
                                 <Rocket className="w-4 h-4" /> {isProgramExpired(selectedConfigProgram) ? "Cannot Activate (Season Expired)" : "Save & Make Active (Live)"}
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

         {/* Program Season Extension Modal */}
         {extendingProgram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <CalendarPlus className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Extend Program Season</h3>
                           <p className="text-xs text-purple-100 font-medium mt-0.5">{extendingProgram.name}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => setExtendingProgram(null)} 
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full flex items-center justify-center cursor-pointer"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <form onSubmit={handleExtendProgram} className="p-6 space-y-6">
                     {isProgramExpired(extendingProgram) ? (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
                           <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                           <div>
                              <p className="font-black text-sm">Season Expired on {new Date(extendingProgram.end_date).toLocaleDateString("en-GB")}</p>
                              <p className="mt-0.5 text-rose-700 dark:text-rose-400 font-medium">
                                 The scheduled end date for this program has passed. Set a new future end date below to re-enable activation and allow clusters and farmers to enroll.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
                           <Calendar className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                           <div>
                              <p className="font-bold">Current Season Schedule</p>
                              <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                 {extendingProgram.start_date ? new Date(extendingProgram.start_date).toLocaleDateString("en-GB") : "Immediate"} — {extendingProgram.end_date ? new Date(extendingProgram.end_date).toLocaleDateString("en-GB") : "Ongoing"}
                              </p>
                           </div>
                        </div>
                     )}

                     {/* Quick Extension Presets */}
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                           <Sparkles size={14} className="text-purple-600" />
                           Quick Extension Presets (From Today)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                           <button
                              type="button"
                              onClick={() => applyDatePreset(3)}
                              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800 transition text-center cursor-pointer active:scale-95"
                           >
                              +3 Months
                           </button>
                           <button
                              type="button"
                              onClick={() => applyDatePreset(6)}
                              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800 transition text-center cursor-pointer active:scale-95"
                           >
                              +6 Months
                           </button>
                           <button
                              type="button"
                              onClick={() => applyDatePreset(12)}
                              className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800 transition text-center cursor-pointer active:scale-95"
                           >
                              +1 Year
                           </button>
                        </div>
                     </div>

                     {/* Date Pickers */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                           <input
                              type="date"
                              value={extendForm.start_date}
                              onChange={(e) => setExtendForm({ ...extendForm, start_date: e.target.value })}
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-xs"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              New End Date <span className="text-rose-500">*</span>
                           </label>
                           <input
                              type="date"
                              required
                              value={extendForm.end_date}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setExtendForm({ ...extendForm, end_date: e.target.value })}
                              className="w-full h-11 px-3 rounded-xl border-2 border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-950 font-bold text-xs focus:border-purple-600 focus:outline-hidden"
                           />
                        </div>
                     </div>

                     {/* Auto-Activate Checkbox */}
                     {extendingProgram.status !== "active" && (
                        <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={extendForm.make_active}
                              onChange={(e) => setExtendForm({ ...extendForm, make_active: e.target.checked })}
                              className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                           />
                           <div className="text-xs">
                              <p className="font-bold text-(--foreground)">Publish & Make Active Immediately</p>
                              <p className="text-gray-500 text-[11px]">Automatically activate this program upon saving so farmers and clusters can enroll immediately.</p>
                           </div>
                        </label>
                     )}

                     <div className="pt-2 flex gap-3">
                        <button
                           type="button"
                           onClick={() => setExtendingProgram(null)}
                           disabled={isExtending}
                           className="px-5 h-12 rounded-2xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs uppercase tracking-wider cursor-pointer"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isExtending}
                           className="flex-1 h-12 rounded-2xl font-black bg-purple-600 hover:bg-purple-700 text-white text-xs uppercase tracking-wider shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                        >
                           {isExtending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                              <>
                                 <Check className="w-4 h-4" /> Save Extension & Update
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Cluster Enrollment Confirmation Modal */}
         {confirmingEnrollProgram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  {/* Modal Header */}
                  <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Confirm Cluster Enrollment</h3>
                           <p className="text-xs text-emerald-100 font-medium mt-0.5">Formal application to Program Directorate</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => !enrollingId && setConfirmingEnrollProgram(null)} 
                        disabled={enrollingId === confirmingEnrollProgram.id}
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <div className="p-6 space-y-5">
                     {/* Target Program Card */}
                     <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Target Program</span>
                           <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Active Season
                           </span>
                        </div>
                        <h4 className="text-lg font-black text-(--foreground)">{confirmingEnrollProgram.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Region & Crop</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{confirmingEnrollProgram.region} • {confirmingEnrollProgram.commodity}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Program Director</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{confirmingEnrollProgram.director_name || "Appointed Director"}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Reach</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                                 {confirmingEnrollProgram.target_farmers ? `${parseInt(confirmingEnrollProgram.target_farmers).toLocaleString()} Farmers` : "Open"} ({confirmingEnrollProgram.target_hectares ? `${parseFloat(confirmingEnrollProgram.target_hectares).toLocaleString()} Ha` : "Flexible"})
                              </p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Season Schedule</p>
                              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                                 {confirmingEnrollProgram.start_date ? new Date(confirmingEnrollProgram.start_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Immediate"}
                                 {" — "}
                                 {confirmingEnrollProgram.end_date ? new Date(confirmingEnrollProgram.end_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Ongoing"}
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Enrolling Cluster Details */}
                     {activeCluster && (
                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50">
                           <div className="flex items-center gap-2 mb-2">
                              <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">Enrolling Cluster</p>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                              <div>
                                 <p className="font-black text-sm text-(--foreground)">{activeCluster.name}</p>
                                 <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{activeCluster.region || "Operational Hub"}</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-black text-sm text-emerald-700 dark:text-emerald-300">{parseFloat(activeCluster.total_hectares || 0).toLocaleString()} Ha</p>
                                 <p className="text-[10px] font-bold text-gray-400">Total Farmland Area</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Terms and Explanation Alert */}
                     <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                           By confirming, this cluster's enrollment request will be submitted to Program Director <strong>{confirmingEnrollProgram.director_name || "Peter Parker"}</strong> for review. Once verified, eligible farmers in your cluster can receive program inputs and offtake guarantees.
                        </p>
                     </div>

                     {/* Action Buttons */}
                     <div className="pt-2 flex gap-3">
                        <button
                           type="button"
                           onClick={() => setConfirmingEnrollProgram(null)}
                           disabled={enrollingId === confirmingEnrollProgram.id}
                           className="px-5 h-12 rounded-2xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs uppercase tracking-wider cursor-pointer transition disabled:opacity-50"
                        >
                           Cancel
                        </button>
                        <button
                           type="button"
                           onClick={() => handleEnrollCluster(confirmingEnrollProgram.id)}
                           disabled={enrollingId === confirmingEnrollProgram.id}
                           className="flex-1 h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
                        >
                           {enrollingId === confirmingEnrollProgram.id ? (
                              <>
                                 <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                              </>
                           ) : (
                              <>
                                 <CheckCircle2 className="w-4 h-4" /> Confirm & Submit Enrollment
                              </>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
