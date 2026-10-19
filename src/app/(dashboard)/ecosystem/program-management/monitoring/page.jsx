"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
   Layers, Users, ShieldCheck, UserPlus, Trash2, MapPin, Search, 
   CheckCircle2, AlertCircle, RefreshCw, Phone, Mail, Award, Activity, 
   Sprout, ChevronRight, Check, X, Loader2, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProgrammeMonitoringPage() {
   const [selectedProgramId, setSelectedProgramId] = useState(null);
   const [searchOfficer, setSearchOfficer] = useState("");
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const [selectedOfficerToAssign, setSelectedOfficerToAssign] = useState(null);
   const [isAssigning, setIsAssigning] = useState(false);
   const [isRemovingId, setIsRemovingId] = useState(null);
   const [activeViewTab, setActiveViewTab] = useState("officers"); // "officers" | "farmers"

   // 1. Fetch programs
   const { data: programsRes, isLoading: loadingPrograms, mutate: mutatePrograms } = useSWR(
      "/api/proxy/programs", 
      fetcher, 
      { revalidateOnFocus: true }
   );
   const programs = programsRes?.data || [];

   // Auto-select first program if none selected
   useEffect(() => {
      if (programs.length > 0 && !selectedProgramId) {
         setSelectedProgramId(programs[0].id);
      }
   }, [programs, selectedProgramId]);

   const currentProgram = programs.find((p) => p.id === selectedProgramId) || programs[0] || null;

   // 2. Fetch assigned field officers for selected program
   const { 
      data: assignedOfficersRes, 
      isLoading: loadingAssignedOfficers, 
      mutate: mutateAssignedOfficers 
   } = useSWR(
      currentProgram ? `/api/proxy/programs/${currentProgram.id}/field-officers` : null,
      fetcher,
      { revalidateOnFocus: true }
   );
   const assignedOfficers = assignedOfficersRes?.data || [];

   // 3. Fetch all available ecosystem field officers
   const { 
      data: availableOfficersRes, 
      isLoading: loadingAvailableOfficers 
   } = useSWR(
      isAssignModalOpen ? "/api/proxy/programs/field-officers/available" : null,
      fetcher
   );
   const availableOfficers = availableOfficersRes?.data || [];

   // 4. Fetch enrolled farmers / verifications for this program
   const {
      data: enrollmentsRes,
      isLoading: loadingEnrollments
   } = useSWR(
      currentProgram ? "/api/proxy/programs/director/enrollments" : null,
      fetcher
   );
   const allEnrollments = enrollmentsRes?.data?.farmers || [];
   const programFarmers = allEnrollments.filter(f => f.program_id === currentProgram?.id);

   // Handle assigning field officer
   const handleAssignOfficer = async () => {
      if (!selectedOfficerToAssign || !currentProgram) return;
      setIsAssigning(true);
      try {
         const res = await fetch(`/api/proxy/programs/${currentProgram.id}/field-officers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ officerId: selectedOfficerToAssign.id })
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(json.message || "Field officer successfully assigned to program!");
            setIsAssignModalOpen(false);
            setSelectedOfficerToAssign(null);
            await mutateAssignedOfficers();
         } else {
            toast.error(json.error || "Failed to assign field officer");
         }
      } catch (err) {
         toast.error("Network error while assigning officer");
      } finally {
         setIsAssigning(false);
      }
   };

   // Handle removing field officer
   const handleRemoveOfficer = async (officerId) => {
      if (!currentProgram) return;
      if (!confirm("Are you sure you want to remove this field officer from the program?")) return;
      setIsRemovingId(officerId);
      try {
         const res = await fetch(`/api/proxy/programs/${currentProgram.id}/field-officers/${officerId}`, {
            method: "DELETE"
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success("Field officer unassigned from program");
            await mutateAssignedOfficers();
         } else {
            toast.error(json.error || "Failed to remove officer");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setIsRemovingId(null);
      }
   };

   // Filter assigned officers
   const filteredAssignedOfficers = assignedOfficers.filter(o => {
      const q = searchOfficer.toLowerCase();
      const name = `${o.fname || ""} ${o.lname || ""}`.toLowerCase();
      return name.includes(q) || (o.email && o.email.toLowerCase().includes(q)) || (o.role && o.role.toLowerCase().includes(q));
   });

   // Filter available officers (exclude already assigned)
   const assignedIds = new Set(assignedOfficers.map(o => o.officer_id || o.id));
   const unassignedAvailableOfficers = availableOfficers.filter(o => !assignedIds.has(o.id));

   return (
      <div className="space-y-6 pb-20">
         {/* Top Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl">
                     <Layers className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                     Programme <span className="text-amber-600">Monitoring</span>
                  </h1>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Assign ecosystem field officers to programs, orchestrate ground verification teams, and monitor farm progress.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={() => setIsAssignModalOpen(true)}
                  disabled={!currentProgram}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
               >
                  <UserPlus className="w-4 h-4" />
                  Assign Field Officer
               </button>
            </div>
         </div>

         {/* Program Selector Tabs / Dropdown */}
         {loadingPrograms ? (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <Loader2 className="w-6 h-6 animate-spin text-amber-600 mr-2" />
               <span className="text-sm text-gray-500 font-medium">Loading programs...</span>
            </div>
         ) : programs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
               <p className="text-gray-500 font-medium">No programs found under your management.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {/* Program Selection Bar */}
               <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {programs.map((prog) => {
                     const isSelected = prog.id === currentProgram?.id;
                     return (
                        <button
                           key={prog.id}
                           onClick={() => setSelectedProgramId(prog.id)}
                           className={`cursor-pointer shrink-0 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 border ${
                              isSelected
                                 ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20"
                                 : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-amber-300"
                           }`}
                        >
                           <Sprout className={`w-4 h-4 ${isSelected ? "text-white" : "text-amber-600"}`} />
                           <div className="text-left">
                              <p className="leading-tight">{prog.name}</p>
                              <p className={`text-[10px] font-normal lowercase tracking-normal ${isSelected ? "text-amber-100" : "text-gray-400"}`}>
                                 {prog.region || "All regions"} • {prog.commodity || "General"}
                              </p>
                           </div>
                        </button>
                     );
                  })}
               </div>

               {/* Selected Program KPI Header */}
               {currentProgram && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <Card className="bg-white dark:bg-gray-900 border-none shadow-sm p-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                              <Users className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Assigned Officers</p>
                              <p className="text-2xl font-black text-gray-900 dark:text-white">{assignedOfficers.length}</p>
                              <p className="text-[11px] text-gray-500 font-medium">Field agents monitoring this program</p>
                           </div>
                        </div>
                     </Card>

                     <Card className="bg-white dark:bg-gray-900 border-none shadow-sm p-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                              <Sprout className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Enrolled Farmers</p>
                              <p className="text-2xl font-black text-gray-900 dark:text-white">
                                 {currentProgram.enrolled_farmers || programFarmers.length}
                              </p>
                              <p className="text-[11px] text-gray-500 font-medium">
                                 Target: {currentProgram.target_farmers || "500"} farmers
                              </p>
                           </div>
                        </div>
                     </Card>

                     <Card className="bg-white dark:bg-gray-900 border-none shadow-sm p-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                              <MapPin className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Hectares Under Watch</p>
                              <p className="text-2xl font-black text-gray-900 dark:text-white">
                                 {currentProgram.target_hectares || "1,000"} Ha
                              </p>
                              <p className="text-[11px] text-gray-500 font-medium">GIS & boundary tracking ready</p>
                           </div>
                        </div>
                     </Card>

                     <Card className="bg-white dark:bg-gray-900 border-none shadow-sm p-4">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                              <Activity className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Verification Rate</p>
                              <p className="text-2xl font-black text-gray-900 dark:text-white">
                                 {programFarmers.length > 0 
                                    ? `${Math.round((programFarmers.filter(f => f.program_enrollment_status === 'verified').length / programFarmers.length) * 100)}%` 
                                    : "100%"}
                              </p>
                              <p className="text-[11px] text-gray-500 font-medium">Approved candidate ratio</p>
                           </div>
                        </div>
                     </Card>
                  </div>
               )}

               {/* View Switcher: Assigned Officers vs Enrolled Farmers */}
               <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                  <div className="flex gap-2">
                     <button
                        onClick={() => setActiveViewTab("officers")}
                        className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                           activeViewTab === "officers"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                     >
                        <Users className="w-4 h-4" />
                        Assigned Field Officers ({assignedOfficers.length})
                     </button>
                     <button
                        onClick={() => setActiveViewTab("farmers")}
                        className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                           activeViewTab === "farmers"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                     >
                        <Sprout className="w-4 h-4" />
                        Enrolled Farmers & Farms ({programFarmers.length})
                     </button>
                  </div>

                  {activeViewTab === "officers" && (
                     <div className="relative w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                           type="text"
                           placeholder="Search officers..."
                           value={searchOfficer}
                           onChange={(e) => setSearchOfficer(e.target.value)}
                           className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-amber-500"
                        />
                     </div>
                  )}
               </div>

               {/* SECTION 1: Assigned Officers */}
               {activeViewTab === "officers" && (
                  <div className="space-y-4">
                     {loadingAssignedOfficers ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                           <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
                           <p className="text-xs text-gray-500">Loading assigned field officers...</p>
                        </div>
                     ) : filteredAssignedOfficers.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 space-y-4">
                           <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                              <Users className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-base">No Field Officers Assigned Yet</h3>
                              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                                 Assign ecosystem field officers to this program so they can conduct farm inspections, capture farm boundaries, and supervise enrolled farmers.
                              </p>
                           </div>
                           <button
                              onClick={() => setIsAssignModalOpen(true)}
                              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
                           >
                              <UserPlus className="w-4 h-4" />
                              Assign First Officer
                           </button>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {filteredAssignedOfficers.map((officer) => (
                              <Card key={officer.id || officer.officer_id} className="bg-white dark:bg-gray-900 border-none shadow-sm p-5 text-left flex flex-col justify-between hover:shadow-md transition-all">
                                 <div>
                                    <div className="flex items-start justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-black text-sm flex items-center justify-center">
                                             {officer.fname?.[0]?.toUpperCase() || "O"}{officer.lname?.[0]?.toUpperCase() || "F"}
                                          </div>
                                          <div>
                                             <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                                                {officer.fname} {officer.lname}
                                             </h4>
                                             <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {officer.role || "Field Officer"}
                                             </span>
                                          </div>
                                       </div>
                                       <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
                                          Active
                                       </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                       {officer.email && (
                                          <div className="flex items-center gap-2">
                                             <Mail className="w-3.5 h-3.5 text-gray-400" />
                                             <span className="truncate">{officer.email}</span>
                                          </div>
                                       )}
                                       {officer.phone && (
                                          <div className="flex items-center gap-2">
                                             <Phone className="w-3.5 h-3.5 text-gray-400" />
                                             <span>{officer.phone}</span>
                                          </div>
                                       )}
                                       <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                                          <Activity className="w-3.5 h-3.5 text-amber-500" />
                                          <span>Total inspections: <strong>{officer.total_inspections || 0}</strong></span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-medium">
                                       Assigned {officer.assigned_at ? new Date(officer.assigned_at).toLocaleDateString() : "Recently"}
                                    </span>
                                    <button
                                       onClick={() => handleRemoveOfficer(officer.officer_id || officer.id)}
                                       disabled={isRemovingId === (officer.officer_id || officer.id)}
                                       className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                       title="Remove officer from this program"
                                    >
                                       {isRemovingId === (officer.officer_id || officer.id) ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                       ) : (
                                          <Trash2 className="w-3.5 h-3.5" />
                                       )}
                                       <span>Remove</span>
                                    </button>
                                 </div>
                              </Card>
                           ))}
                        </div>
                     )}
                  </div>
               )}

               {/* SECTION 2: Enrolled Farmers & Farm Verification Status */}
               {activeViewTab === "farmers" && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                           <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                              Farmers in {currentProgram.name}
                           </h3>
                           <p className="text-xs text-gray-500">
                              These farmers and their farms appear directly in assigned field officers' dashboards for ground verification.
                           </p>
                        </div>
                        <Link
                           href="/ecosystem/program-management/approvals"
                           className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                           Review Pending Approvals <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                     </div>

                     {loadingEnrollments ? (
                        <div className="p-8 text-center">
                           <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
                           <p className="text-xs text-gray-500">Loading enrolled farmers...</p>
                        </div>
                     ) : programFarmers.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                           <Sprout className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-600" />
                           <p className="text-xs font-bold uppercase tracking-wider">No farmers currently enrolled in this program</p>
                           <p className="text-[11px] text-gray-500 mt-1">
                              When farmers register or apply to this program, they will appear here and in your Approvals queue.
                           </p>
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-xs">
                              <thead className="bg-gray-50 dark:bg-gray-800/50 uppercase text-[10px] font-black tracking-wider text-gray-500">
                                 <tr>
                                    <th className="p-3">Farmer</th>
                                    <th className="p-3">AIN / Phone</th>
                                    <th className="p-3">Commodity</th>
                                    <th className="p-3">Farm Size</th>
                                    <th className="p-3">Boundary Mapped</th>
                                    <th className="p-3">Approval Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                                 {programFarmers.map((f) => (
                                    <tr key={f.profile_id || f.farmer_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                                       <td className="p-3">
                                          <p className="font-bold text-gray-900 dark:text-white">{f.fname} {f.lname}</p>
                                          <p className="text-[10px] text-gray-400">{f.email || "No email"}</p>
                                       </td>
                                       <td className="p-3">
                                          <p className="font-mono text-[11px]">{f.ain || "Pending AIN"}</p>
                                          <p className="text-[10px] text-gray-400">{f.phone || "N/A"}</p>
                                       </td>
                                       <td className="p-3">
                                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold uppercase">
                                             {f.commodity || currentProgram.commodity || "General"}
                                          </span>
                                       </td>
                                       <td className="p-3">
                                          {f.farm_size_hectares ? `${f.farm_size_hectares} Ha` : "—"}
                                       </td>
                                       <td className="p-3">
                                          {f.boundary_polygon ? (
                                             <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Mapped
                                             </span>
                                          ) : (
                                             <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                                                Pending field mapping
                                             </span>
                                          )}
                                       </td>
                                       <td className="p-3">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                             f.program_enrollment_status === 'verified'
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                : f.program_enrollment_status === 'rejected'
                                                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                          }`}>
                                             {f.program_enrollment_status === 'verified' ? 'Approved' : f.program_enrollment_status || 'Pending'}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* MODAL: Assign Ecosystem Field Officer */}
         {isAssignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-gray-100 dark:border-gray-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                           <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-black text-base text-gray-900 dark:text-white">
                              Assign Field Officer
                           </h3>
                           <p className="text-xs text-gray-500">
                              Program: <strong className="text-amber-600">{currentProgram?.name}</strong>
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => { setIsAssignModalOpen(false); setSelectedOfficerToAssign(null); }}
                        className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Select an accredited Field Officer, Agronomist, or Enumerator from the ecosystem to assign to this program:
                     </p>

                     {loadingAvailableOfficers ? (
                        <div className="p-8 text-center">
                           <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
                           <p className="text-xs text-gray-500">Loading ecosystem officers...</p>
                        </div>
                     ) : unassignedAvailableOfficers.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                           <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                           <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No additional field officers available</p>
                           <p className="text-[11px] text-gray-400 mt-1">All qualified field officers are already assigned to this program.</p>
                        </div>
                     ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                           {unassignedAvailableOfficers.map((officer) => {
                              const isSelected = selectedOfficerToAssign?.id === officer.id;
                              return (
                                 <button
                                    key={officer.id}
                                    type="button"
                                    onClick={() => setSelectedOfficerToAssign(officer)}
                                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                                       isSelected
                                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 shadow-sm"
                                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300"
                                    }`}
                                 >
                                    <div className="flex items-center gap-3">
                                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                          isSelected ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                       }`}>
                                          {officer.fname?.[0] || "O"}{officer.lname?.[0] || "F"}
                                       </div>
                                       <div>
                                          <p className="font-bold text-xs text-gray-900 dark:text-white">
                                             {officer.fname} {officer.lname}
                                          </p>
                                          <p className="text-[10px] text-gray-400">
                                             {officer.email || officer.phone || "No contact"} • <span className="font-semibold text-amber-600">{officer.role || "Field Officer"}</span>
                                          </p>
                                       </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                                 </button>
                              );
                           })}
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                     <button
                        type="button"
                        onClick={() => { setIsAssignModalOpen(false); setSelectedOfficerToAssign(null); }}
                        className="cursor-pointer px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={handleAssignOfficer}
                        disabled={!selectedOfficerToAssign || isAssigning}
                        className="cursor-pointer px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                     >
                        {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isAssigning ? "Assigning..." : "Confirm Assignment"}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
