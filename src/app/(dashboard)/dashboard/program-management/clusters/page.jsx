"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaMapMarkedAlt, FaPlus, FaTimes, FaUserTie } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import { useProgramData } from "../useProgramData";
import InputRequestModal from "@/app/components/dashboard/InputRequestModal";

export default function ClusterOperationsPage() {
   const {
      loading, clusters, currentUserId, userRole, eligibleFarmers, clusterMembers, programs,
      fetchClusters, fetchClusterMembers, fetchEligibleFarmers, setClusters
   } = useProgramData();

   const [showCreateCluster, setShowCreateCluster] = useState(false);
   const [clusterForm, setClusterForm] = useState({ name: "", program_id: "", region: "" });
   const [showAddMember, setShowAddMember] = useState(null);
   const [showMembers, setShowMembers] = useState(null);
   const [isRequestingClusterInput, setIsRequestingClusterInput] = useState(null);
   const [showRequestModal, setShowRequestModal] = useState(false);
   const [selectingForRequest, setSelectingForRequest] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const canManageClusters = ["cluster supervisor", "super admin", "admin"].includes(userRole);

   const handleCreateCluster = async (e) => {
      e.preventDefault();
      if (!clusterForm.name) { toast.error("Cluster name required"); return; }
      setIsSubmitting(true);
      try {
         const res = await fetch("/api/proxy/pipeline/clusters", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clusterForm),
         });
         if (res.ok) {
            toast.success("Cluster created successfully");
            setShowCreateCluster(false);
            setClusterForm({ name: "", program_id: "", region: "" });
            fetchClusters();
         }
      } catch { toast.error("Failed to create cluster"); }
      finally { setIsSubmitting(false); }
   };

   const handleAssignFarmer = async (clusterId, farmerId) => {
      try {
         const res = await fetch("/api/proxy/pipeline/clusters/assign", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cluster_id: clusterId, farmer_id: farmerId }),
         });
         if (res.ok) {
            toast.success("Farmer assigned successfully");
            setShowAddMember(null);
            fetchClusters();
         }
      } catch { toast.error("Assignment failed"); }
   };

   const handleRemoveFarmer = async (clusterId, farmerId) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}/members/${farmerId}`, { method: "DELETE" });
         if (res.ok) {
            toast.success("Farmer removed");
            const cluster = clusters.find(c => c.id === clusterId);
            fetchClusterMembers(cluster);
            fetchClusters();
         }
      } catch { toast.error("Removal failed"); }
   };

   const handleRequestClusterInput = async (clusterId) => {
      setIsRequestingClusterInput(clusterId);
      try {
         const res = await fetch("/api/proxy/pipeline/inputs/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               cluster_id: clusterId,
               input_items: [],
               is_cluster_request: true,
               requester_type: 'cluster_manager'
            }),
         });
         if (res.ok) {
            toast.success("Input request for cluster submitted to Finance!");
            fetchClusters();
         } else {
            const d = await res.json();
            toast.error(d.error || "Failed to request inputs");
         }
      } catch { toast.error("Network error"); }
      finally { setIsRequestingClusterInput(null); }
   };

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Cluster Operations...</div>;

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Cluster Operations</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage field clusters and memberships</p>
            </div>
            {canManageClusters && (
               <Button onClick={() => setShowCreateCluster(true)} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl cursor-pointer font-bold transition shadow-lg shadow-orange-500/20">
                  <FaPlus /> Create Cluster
               </Button>
            )}
         </div>

         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
               <CardTitle>Active Clusters</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               {clusters.length === 0 ? (
                  <div className="text-center py-20">
                     <FaMapMarkedAlt className="text-6xl text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No clusters created yet</p>
                  </div>
               ) : (
                  <div className="grid gap-4">
                     {clusters.map((cluster, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                                    <FaMapMarkedAlt size={20} />
                                 </div>
                                 <div>
                                    <p className="font-black text-lg text-(--foreground)">{cluster.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-gray-400 mt-0.5">
                                       <span>{cluster.region}</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span>{cluster.program_name}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className={`px-4 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest ${
                                    cluster.request_status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200" :
                                    cluster.request_funds_status === "approved" && cluster.request_items_status === "pending" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200" :
                                       cluster.has_pending_request ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200" :
                                          cluster.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200" :
                                             "bg-gray-100 text-gray-600 border border-gray-200"
                                    }`}>
                                    {cluster.request_status === "approved" ? "Financing Approved" :
                                     cluster.request_funds_status === "approved" && cluster.request_items_status === "pending" ? "Awaiting Selection" :
                                       cluster.has_pending_request ? "Input Financing" : cluster.status}
                                 </span>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Supervisor</p>
                                 <p className="font-bold text-sm">{cluster.supervisor_id === currentUserId ? "You" : (cluster.supervisor_name || "—")}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Enrolled Farmers</p>
                                 <p className="font-bold text-sm">{cluster.farmer_count || 0}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Total Hectares</p>
                                 <p className="font-bold text-sm text-amber-600">{cluster.total_hectares || "—"} Ha</p>
                              </div>
                           </div>

                           {cluster.supervisor_id === currentUserId && (
                              <div className="flex flex-wrap gap-3">
                                 <Button onClick={() => { setShowAddMember(cluster.id); fetchEligibleFarmers(cluster.program_id, cluster.id); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-3 font-bold rounded-xl transition shadow-lg shadow-blue-500/10">Recruit Farmers</Button>
                                 <Button onClick={() => { setShowMembers(cluster); fetchClusterMembers(cluster); }} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-6 py-3 font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition">Manage Members</Button>
                                 <div className="ml-auto">
                                    {cluster.request_status !== "approved" && cluster.request_funds_status === "approved" && cluster.request_items_status === "pending" ? (
                                       <Button
                                          onClick={() => { setSelectingForRequest(cluster.pending_request_id); setShowRequestModal(true); }}
                                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-6 py-3 font-bold rounded-xl animate-pulse shadow-lg shadow-purple-500/20"
                                       >
                                          Select Inputs
                                       </Button>
                                    ) : (
                                       <Button
                                          onClick={() => handleRequestClusterInput(cluster.id)}
                                          disabled={isRequestingClusterInput === cluster.id || cluster.has_pending_request || cluster.request_status === "approved"}
                                          className={`${cluster.has_pending_request ? "bg-gray-400 cursor-not-allowed" : cluster.request_status === "approved" ? "bg-green-600 cursor-default" : "bg-orange-600 hover:bg-orange-700"} text-white text-xs px-6 py-3 font-bold rounded-xl shadow-lg shadow-orange-500/20 transition`}
                                       >
                                          {isRequestingClusterInput === cluster.id ? "Processing..." : 
                                           cluster.request_status === "approved" ? "Approved" : 
                                           cluster.has_pending_request ? "Financing Requested" : "Request Inputs"}
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Modals copied from page.jsx logic */}
         <InputRequestModal
            isOpen={showRequestModal}
            onClose={() => { setShowRequestModal(false); setSelectingForRequest(null); fetchClusters(); }}
            requestId={selectingForRequest}
            isClusterRequest={true}
         />

         {/* Create Cluster Modal */}
         {showCreateCluster && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gray-50/50 dark:bg-gray-950 p-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-black">Create New Cluster</CardTitle>
                     <button onClick={() => setShowCreateCluster(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                  </CardHeader>
                  <CardContent className="p-6">
                     <form onSubmit={handleCreateCluster} className="space-y-4">
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Cluster Name</label>
                           <input type="text" value={clusterForm.name} onChange={e => setClusterForm({ ...clusterForm, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none p-4 rounded-2xl font-bold" placeholder="e.g. Kano West A" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Target Program</label>
                           <select value={clusterForm.program_id} onChange={e => setClusterForm({ ...clusterForm, program_id: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none p-4 rounded-2xl font-bold">
                              <option value="">Select a Program</option>
                              {["super admin", "admin"].includes(userRole) ? (
                                 (programs || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                              ) : (
                                 (programs || []).filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                              )}
                           </select>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Geographic Region</label>
                           <input type="text" value={clusterForm.region} onChange={e => setClusterForm({ ...clusterForm, region: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none p-4 rounded-2xl font-bold" placeholder="e.g. North West" />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 mt-4 transition">
                           {isSubmitting ? "Creating..." : "Confirm Cluster"}
                        </Button>
                     </form>
                  </CardContent>
               </Card>
            </div>
         )}

         {/* Members Modal */}
         {showMembers && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950">
                     <div>
                        <h2 className="text-xl font-black">{showMembers.name}</h2>
                        <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mt-1">{clusterMembers.length} Enrolled Farmers</p>
                     </div>
                     <button onClick={() => setShowMembers(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><FaTimes className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/30 dark:bg-gray-950/30">
                     {clusterMembers.length === 0 ? (
                        <div className="text-center py-12">
                           <FaUserTie className="text-4xl text-gray-200 mx-auto mb-4" />
                           <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No members assigned yet</p>
                        </div>
                     ) : (
                        <div className="grid gap-3">
                           {clusterMembers.map(member => (
                              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm gap-4 hover:border-amber-200 transition">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <p className="font-bold text-gray-900 dark:text-white">{member.fname} {member.lname}</p>
                                       <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">{member.role}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase flex items-center gap-2 tracking-tighter">
                                       <span>{member.farm_size_hectares} Ha</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span>{member.commodity}</span>
                                    </div>
                                 </div>
                                 <Button onClick={() => handleRemoveFarmer(showMembers.id, member.farmer_id)} className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 text-[10px] font-black uppercase px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/30">Remove</Button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </Card>
            </div>
         )}

         {/* Add Member Modal */}
         {showAddMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border-none shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950">
                     <h2 className="text-xl font-black">Recruit Farmers</h2>
                     <button onClick={() => setShowAddMember(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><FaTimes className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                     {eligibleFarmers.length === 0 ? (
                        <div className="text-center py-12">
                           <FaUserTie className="text-4xl text-gray-200 mx-auto mb-4" />
                           <p className="text-gray-500 font-bold">No eligible farmers found</p>
                           <p className="text-xs text-gray-400 mt-1">Only verified farmers matching the cluster program and region are shown.</p>
                        </div>
                     ) : (
                        <div className="grid gap-3">
                           {eligibleFarmers.map(farmer => (
                              <div key={farmer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 gap-4 hover:border-blue-200 transition">
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{farmer.fname} {farmer.lname}</p>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                       <span>{farmer.farm_size_hectares} Ha</span>
                                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                       <span className="text-blue-600">{farmer.commodity}</span>
                                    </div>
                                 </div>
                                 <Button onClick={() => handleAssignFarmer(showAddMember, farmer.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl shadow-lg shadow-blue-500/10">Assign</Button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </Card>
            </div>
         )}
      </div>
   );
}
