"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Network, CheckCircle2, Clock, User, UserCheck, XCircle } from "lucide-react";
import { useProgramData } from "../useProgramData";
import { toast } from "react-toastify";

export default function PendingApprovalsPage() {
   const { loading, pendingInputs, currentUserId } = useProgramData();
   const [activeTab, setActiveTab] = useState("my_approvals");
   const [fieldOpsApprovals, setFieldOpsApprovals] = useState([]);
   const [activeOfficers, setActiveOfficers] = useState([]);
   const [loadingFieldOps, setLoadingFieldOps] = useState(true);
   const [loadingActiveOfficers, setLoadingActiveOfficers] = useState(true);

   useEffect(() => {
      fetchFieldOpsApprovals();
      fetchAllOfficers();
   }, []);

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
                     <button
                        onClick={() => setActiveTab("field_ops")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "field_ops" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        Pending Officers
                     </button>
                     <button
                        onClick={() => setActiveTab("active_officers")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "active_officers" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        Active Officers
                     </button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               {activeTab === "active_officers" ? (
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
