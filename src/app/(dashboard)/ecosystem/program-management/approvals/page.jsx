"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Network, CheckCircle2, Clock, User, UserCheck, XCircle, ShieldCheck, Users, Check, X, Loader2, Layers } from "lucide-react";
import { useProgramData } from "../useProgramData";
import { toast } from "react-toastify";

export default function PendingApprovalsPage() {
   const { loading, pendingInputs, currentUserId, fetchData } = useProgramData();
   const [activeTab, setActiveTab] = useState("program_enrollments"); // Default to Program Enrolments!
   const [fieldOpsApprovals, setFieldOpsApprovals] = useState([]);
   const [activeOfficers, setActiveOfficers] = useState([]);
   const [distributors, setDistributors] = useState([]);
   const [selectedDistributors, setSelectedDistributors] = useState({});
   const [loadingFieldOps, setLoadingFieldOps] = useState(true);
   const [loadingActiveOfficers, setLoadingActiveOfficers] = useState(true);
   const [processingId, setProcessingId] = useState(null);

   // Program Enrolments state (transferred from Institution to Program Director!)
   const [enrollments, setEnrollments] = useState({ farmers: [], clusters: [] });
   const [loadingEnrollments, setLoadingEnrollments] = useState(true);
   const [verifyingEnrollmentId, setVerifyingEnrollmentId] = useState(null);

   useEffect(() => {
      fetchFieldOpsApprovals();
      fetchAllOfficers();
      fetchDistributors();
      fetchProgramEnrollments();
   }, []);

   const fetchProgramEnrollments = async () => {
      setLoadingEnrollments(true);
      try {
         const res = await fetch("/api/proxy/programs/director/enrollments");
         const json = await res.json();
         if (json.success) {
            setEnrollments(json.data || { farmers: [], clusters: [] });
         }
      } catch (e) {
         console.error("Failed to fetch program enrollments", e);
      } finally {
         setLoadingEnrollments(false);
      }
   };

   const handleVerifyEnrollment = async (type, id, status) => {
      setVerifyingEnrollmentId(id);
      try {
         const res = await fetch("/api/proxy/programs/enrollments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, id, status }),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(json.message || `Candidate marked as ${status}`);
            await fetchProgramEnrollments();
         } else {
            toast.error(json.error || "Failed to update enrollment verification");
         }
      } catch (err) {
         toast.error("Network error while updating enrollment");
      } finally {
         setVerifyingEnrollmentId(null);
      }
   };

   const fetchDistributors = async () => {
      try {
         const res = await fetch("/api/proxy/admin/institution/distributors");
         const json = await res.json();
         if (json.success) {
            setDistributors(json.data || []);
         }
      } catch (e) {
         console.error("Failed to fetch distributors", e);
      }
   };

   const handleApproveAgronomic = async (requestId) => {
      setProcessingId(requestId);
      try {
         const distributorId = selectedDistributors[requestId] || null;
         const res = await fetch(`/api/proxy/pipeline/inputs/${requestId}/approve-items`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ distributor_id: distributorId })
         });
         const json = await res.json();
         if (json.success) {
            toast.success("Agronomic suitability & input package approved!");
            if (fetchData) fetchData();
         } else {
            toast.error(json.error || "Failed to approve request");
         }
      } catch (err) {
         toast.error("Failed to approve request");
      } finally {
         setProcessingId(null);
      }
   };

   const fetchFieldOpsApprovals = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/pending-approvals");
         const data = await res.json();
         if (data.success) {
            setFieldOpsApprovals(data.data);
         }
      } catch (err) {
         console.error("Failed to fetch field ops approvals", err);
      } finally {
         setLoadingFieldOps(false);
      }
   };

   const fetchAllOfficers = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/all-officers");
         const data = await res.json();
         if (data.success) {
            setActiveOfficers(data.data);
         }
      } catch (err) {
         console.error("Failed to fetch all officers", err);
      } finally {
         setLoadingActiveOfficers(false);
      }
   };

   const handleApproveOfficer = async (vendorId, status) => {
      try {
         const res = await fetch("/api/proxy/field-operations/approve-officer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendorId, status })
         });
         const data = await res.json();
         if (data.success) {
            toast.success(`Officer ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
            fetchFieldOpsApprovals();
            fetchAllOfficers();
         } else {
            toast.error(data.message || "Failed to update officer status");
         }
      } catch (err) {
         toast.error("An error occurred");
      }
   };

   const handleSuspendOfficer = async (vendorId, isSuspended) => {
      try {
         const res = await fetch("/api/proxy/field-operations/suspend-officer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendorId, isSuspended })
         });
         const data = await res.json();
         if (data.success) {
            toast.success(`Officer ${isSuspended ? 'suspended' : 'activated'} successfully`);
            fetchAllOfficers();
         } else {
            toast.error(data.message || "Failed to update suspension status");
         }
      } catch (err) {
         toast.error("An error occurred");
      }
   };

   const pendingFarmers = (enrollments.farmers || []).filter(f => f.enrollment_status === 'pending_verification');
   const pendingClusters = (enrollments.clusters || []).filter(c => c.enrollment_status === 'pending_verification');
   const totalPendingEnrollments = pendingFarmers.length + pendingClusters.length;

   const displayedInputs = activeTab === "my_approvals"
      ? pendingInputs.filter(input => input.supervisor_id === currentUserId)
      : pendingInputs;

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Pending Approvals...</div>;

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Program Approvals & Governance</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
               Review farmer program enrollments, agronomic requests & field personnel
            </p>
         </div>

         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-amber-600" />
                        Approvals Pipeline
                     </CardTitle>
                     {totalPendingEnrollments > 0 && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200 animate-pulse">
                           {totalPendingEnrollments} Candidates Awaiting
                        </span>
                     )}
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
                     <button
                        onClick={() => setActiveTab("program_enrollments")}
                        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                           activeTab === "program_enrollments" ? "bg-white dark:bg-gray-700 shadow-sm text-amber-600 dark:text-amber-400 font-black" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                     >
                        <ShieldCheck size={14} /> Program Enrolments
                        {totalPendingEnrollments > 0 && (
                           <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        )}
                     </button>
                     <button
                        onClick={() => setActiveTab("my_approvals")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors shrink-0 ${activeTab === "my_approvals" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        Inputs Review
                     </button>
                     <button
                        onClick={() => setActiveTab("all_approvals")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors shrink-0 ${activeTab === "all_approvals" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        All Pipeline
                     </button>
                     <button
                        onClick={() => setActiveTab("field_ops")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors shrink-0 ${activeTab === "field_ops" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        Pending Officers
                     </button>
                     <button
                        onClick={() => setActiveTab("active_officers")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors shrink-0 ${activeTab === "active_officers" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        Active Officers
                     </button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {/* 1. Program Enrolments Tab (Transferred from Institution to Program Director!) */}
               {activeTab === "program_enrollments" ? (
                  loadingEnrollments ? (
                     <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Program Candidate Applications...</div>
                  ) : (
                     <div className="space-y-6 p-6">
                        {/* Farmers Table */}
                        <div>
                           <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-black text-(--foreground) flex items-center gap-2">
                                 <User className="w-4 h-4 text-amber-600" /> Farmers Awaiting Enrollment Approval ({enrollments.farmers?.length || 0})
                              </h3>
                              {pendingFarmers.length > 0 && (
                                 <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                                    {pendingFarmers.length} Pending
                                 </span>
                              )}
                           </div>

                           {enrollments.farmers?.length === 0 ? (
                              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                 <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No farmers currently applied to this program</p>
                              </div>
                           ) : (
                              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                       <tr>
                                          <th className="p-3">Farmer</th>
                                          <th className="p-3">Program</th>
                                          <th className="p-3">Farm Size</th>
                                          <th className="p-3">Status</th>
                                          <th className="p-3 text-right">Actions</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                       {enrollments.farmers.map((f) => {
                                          const isVerified = f.enrollment_status === 'verified';
                                          const isRejected = f.enrollment_status === 'rejected';

                                          return (
                                             <tr key={f.farmer_profile_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                                                <td className="p-3">
                                                   <p className="font-bold text-gray-900 dark:text-gray-100">{f.fname} {f.lname}</p>
                                                   <p className="text-[10px] text-gray-500">{f.email || f.phone || "—"}</p>
                                                </td>
                                                <td className="p-3">
                                                   <p className="font-bold text-amber-600">{f.program_name}</p>
                                                   <span className="text-[10px] text-gray-400 capitalize">{f.program_commodity || f.commodity}</span>
                                                </td>
                                                <td className="p-3 font-bold">
                                                   {f.farm_size_hectares ? `${f.farm_size_hectares} Ha` : "—"}
                                                </td>
                                                <td className="p-3">
                                                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                      isVerified ? "bg-emerald-100 text-emerald-700" : isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                                                   }`}>
                                                      {isVerified ? "Approved" : isRejected ? "Rejected" : "Pending Review"}
                                                   </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                   <div className="flex items-center justify-end gap-1.5">
                                                      {!isVerified && (
                                                         <button
                                                            disabled={verifyingEnrollmentId === f.farmer_profile_id}
                                                            onClick={() => handleVerifyEnrollment('farmer', f.farmer_profile_id, 'verified')}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition"
                                                         >
                                                            {verifyingEnrollmentId === f.farmer_profile_id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                            Approve
                                                         </button>
                                                      )}
                                                      {!isRejected && (
                                                         <button
                                                            disabled={verifyingEnrollmentId === f.farmer_profile_id}
                                                            onClick={() => handleVerifyEnrollment('farmer', f.farmer_profile_id, 'rejected')}
                                                            className="text-red-600 hover:bg-red-50 border border-red-200 text-[11px] px-2.5 py-1 rounded-lg font-bold transition"
                                                         >
                                                            Reject
                                                         </button>
                                                      )}
                                                   </div>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>

                        {/* Clusters Table */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                           <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-black text-(--foreground) flex items-center gap-2">
                                 <Users className="w-4 h-4 text-purple-600" /> Clusters & Aggregators Applied ({enrollments.clusters?.length || 0})
                              </h3>
                              {pendingClusters.length > 0 && (
                                 <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                                    {pendingClusters.length} Pending
                                 </span>
                              )}
                           </div>

                           {enrollments.clusters?.length === 0 ? (
                              <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                 <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No clusters currently applied to this program</p>
                              </div>
                           ) : (
                              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                                 <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                       <tr>
                                          <th className="p-3">Cluster</th>
                                          <th className="p-3">Program</th>
                                          <th className="p-3">Supervisor</th>
                                          <th className="p-3">Members</th>
                                          <th className="p-3">Status</th>
                                          <th className="p-3 text-right">Actions</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                       {enrollments.clusters.map((c) => {
                                          const isVerified = c.enrollment_status === 'verified';
                                          const isRejected = c.enrollment_status === 'rejected';

                                          return (
                                             <tr key={c.cluster_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                                                <td className="p-3 font-bold">{c.cluster_name}</td>
                                                <td className="p-3 font-bold text-purple-600">{c.program_name}</td>
                                                <td className="p-3">{c.supervisor_fname ? `${c.supervisor_fname} ${c.supervisor_lname || ''}` : "Assigned"}</td>
                                                <td className="p-3 font-bold">{c.farmer_count || 0} Farmers</td>
                                                <td className="p-3">
                                                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                      isVerified ? "bg-emerald-100 text-emerald-700" : isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                                                   }`}>
                                                      {isVerified ? "Approved" : isRejected ? "Rejected" : "Pending Review"}
                                                   </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                   <div className="flex items-center justify-end gap-1.5">
                                                      {!isVerified && (
                                                         <button
                                                            disabled={verifyingEnrollmentId === c.cluster_id}
                                                            onClick={() => handleVerifyEnrollment('cluster', c.cluster_id, 'verified')}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition"
                                                         >
                                                            {verifyingEnrollmentId === c.cluster_id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                            Approve
                                                         </button>
                                                      )}
                                                      {!isRejected && (
                                                         <button
                                                            disabled={verifyingEnrollmentId === c.cluster_id}
                                                            onClick={() => handleVerifyEnrollment('cluster', c.cluster_id, 'rejected')}
                                                            className="text-red-600 hover:bg-red-50 border border-red-200 text-[11px] px-2.5 py-1 rounded-lg font-bold transition"
                                                         >
                                                            Reject
                                                         </button>
                                                      )}
                                                   </div>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           )}
                        </div>
                     </div>
                  )
               ) : activeTab === "active_officers" ? (
                  loadingActiveOfficers ? (
                     <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading...</div>
                  ) : activeOfficers.length === 0 ? (
                     <div className="text-center py-20">
                        <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active field officers found</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {activeOfficers.map((officer, i) => (
                           <div key={i} className={`p-6 transition-colors flex items-center justify-between group ${officer.is_suspended ? 'bg-red-50/50 dark:bg-red-900/10 opacity-70' : 'hover:bg-gray-50/50 dark:hover:bg-gray-900/50'}`}>
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${officer.is_suspended ? 'bg-red-100 text-red-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:scale-110'}`}>
                                    <UserCheck size={24} />
                                 </div>
                                 <div>
                                    <h4 className="font-black text-(--foreground)">
                                       {officer.fname} {officer.lname} {officer.is_suspended && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Suspended</span>}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                       <span>{officer.role}</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span>{officer.phone}</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span className="lowercase">{officer.email}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 {officer.is_suspended ? (
                                    <button onClick={() => handleSuspendOfficer(officer.id, false)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-2 rounded-md font-bold text-xs flex items-center gap-1 transition-colors">
                                       <CheckCircle2 size={16} /> Activate
                                    </button>
                                 ) : (
                                    <button onClick={() => handleSuspendOfficer(officer.id, true)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md font-bold text-xs flex items-center gap-1 transition-colors">
                                       <XCircle size={16} /> Suspend
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )
               ) : activeTab === "field_ops" ? (
                  loadingFieldOps ? (
                     <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading...</div>
                  ) : fieldOpsApprovals.length === 0 ? (
                     <div className="text-center py-20">
                        <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pending field officer approvals</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {fieldOpsApprovals.map((officer, i) => (
                           <div key={i} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <User size={24} />
                                 </div>
                                 <div>
                                    <h4 className="font-black text-(--foreground)">
                                       {officer.fname} {officer.lname}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                       <span>{officer.role}</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span>{officer.phone}</span>
                                    </div>
                                    <div className="mt-2 flex gap-3 text-xs">
                                       {officer.appointment_letter_url && <a href={officer.appointment_letter_url} target="_blank" className="text-blue-500 hover:underline">Appointment Letter</a>}
                                       {officer.id_card_url && <a href={officer.id_card_url} target="_blank" className="text-blue-500 hover:underline">ID Card</a>}
                                       {officer.optional_document_url && <a href={officer.optional_document_url} target="_blank" className="text-blue-500 hover:underline">Optional Doc</a>}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => handleApproveOfficer(officer.id, 'approved')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-2 rounded-md font-bold text-xs flex items-center gap-1">
                                    <CheckCircle2 size={16} /> Approve
                                 </button>
                                 <button onClick={() => handleApproveOfficer(officer.id, 'rejected')} className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-md font-bold text-xs flex items-center gap-1">
                                    <XCircle size={16} /> Reject
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )
               ) : displayedInputs.length === 0 ? (
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
                                    {input.farm_size_hectares && (
                                       <>
                                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <span>{input.farm_size_hectares} Ha</span>
                                       </>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-2 mt-2">
                                    {input.items_status === "approved" ? (
                                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200">
                                          <CheckCircle2 className="w-3 h-3" /> Agronomic Approved
                                       </span>
                                    ) : (
                                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-200">
                                          <Clock className="w-3 h-3" /> Awaiting Agronomic Review
                                       </span>
                                    )}
                                    {input.funds_status === "approved" ? (
                                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200">
                                          <CheckCircle2 className="w-3 h-3" /> Funds Authorized
                                       </span>
                                    ) : (
                                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[10px] font-bold rounded-full border border-gray-200">
                                          <Clock className="w-3 h-3" /> Awaiting Finance
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col sm:items-end gap-2">
                              <p className="font-black text-lg text-emerald-600 tracking-tighter">₦{parseFloat(input.total_value).toLocaleString()}</p>
                              {input.items_status !== "approved" && (
                                 <div className="flex items-center gap-2">
                                    {distributors.length > 0 && (
                                       <select
                                          className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 font-bold"
                                          value={selectedDistributors[input.id] || ""}
                                          onChange={(e) => setSelectedDistributors({ ...selectedDistributors, [input.id]: e.target.value })}
                                       >
                                          <option value="">Assign Distributor...</option>
                                          {distributors.map((d) => (
                                             <option key={d.id} value={d.id}>{d.company_name || `${d.fname} ${d.lname}`}</option>
                                          ))}
                                       </select>
                                    )}
                                    <button
                                       onClick={() => handleApproveAgronomic(input.id)}
                                       disabled={processingId === input.id}
                                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                       <CheckCircle2 size={14} /> Approve
                                    </button>
                                 </div>
                              )}
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
