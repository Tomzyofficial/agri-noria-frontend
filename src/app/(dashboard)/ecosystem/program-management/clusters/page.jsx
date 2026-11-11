"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaMapMarkedAlt, FaPlus, FaTimes, FaUserTie, FaWallet, FaVideo } from "react-icons/fa";
import { 
   Users, UserPlus, MessageSquare, Calendar, TrendingUp, Eye, Sparkles, 
   CheckCircle2, Clock, PackageCheck, AlertCircle, ShieldCheck, MapPin, 
   Building2, ChevronRight, Wallet, UserCheck, Check, ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useProgramData } from "../useProgramData";
import InputRequestModal from "@/app/components/dashboard/InputRequestModal";
import ClusterChat from "../../components/ClusterChat";

export default function ClusterOperationsPage() {
   const {
      loading, clusters, currentUserId, currentUser, userRole, eligibleFarmers, clusterMembers, programs,
      fetchClusters, fetchClusterMembers, fetchEligibleFarmers, setClusters
   } = useProgramData();

   const [showCreateCluster, setShowCreateCluster] = useState(false);
   const [clusterForm, setClusterForm] = useState({ name: "", program_id: "", region: "" });
   const [showAddMember, setShowAddMember] = useState(null);
   const [showMembers, setShowMembers] = useState(null);
   const [showChat, setShowChat] = useState(null);
   const [showScheduleTraining, setShowScheduleTraining] = useState(null);
   const [clusterTrainings, setClusterTrainings] = useState([]);
   const [trainingForm, setTrainingForm] = useState({ title: "", description: "", scheduled_at: "" });
   const [isRequestingClusterInput, setIsRequestingClusterInput] = useState(null);
   const [showPreHarvest, setShowPreHarvest] = useState(null);
   const [preHarvestForm, setPreHarvestForm] = useState({ commodity: "", estimated_yield_tons: "", offer_price_per_ton: "", expected_harvest_date: "" });
   const [isListingPreHarvest, setIsListingPreHarvest] = useState(false);
   const [showViewPreHarvest, setShowViewPreHarvest] = useState(null);
   const [clusterPreHarvests, setClusterPreHarvests] = useState([]);

   const fetchClusterTrainings = async (clusterId) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}/training`);
         if (res.ok) {
            const data = await res.json();
            if (data.success) setClusterTrainings(data.data || []);
         }
      } catch (e) {
         console.error(e);
      }
   };

   // Fetch trainings when modal opens
   useEffect(() => {
      if (showScheduleTraining) {
         fetchClusterTrainings(showScheduleTraining);
      } else {
         setClusterTrainings([]);
      }
   }, [showScheduleTraining]);
   const [showRequestModal, setShowRequestModal] = useState(false);
   const [selectingForRequest, setSelectingForRequest] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [activeTab, setActiveTab] = useState("my_clusters");

   const canManageClusters = ["cluster supervisor", "super admin", "admin"].includes(userRole);

   // Check if this user already has a cluster (as supervisor)
   const userHasCluster = clusters.some(c => c.supervisor_id === currentUserId);

   const handleCreateCluster = async (e) => {
      e.preventDefault();
      if (userRole === "cluster supervisor" && currentUser?.approval_status !== "approved") {
         toast.warning("Your supervisor account is pending SuperAdmin verification. Full operational management unlocks once approved.");
         return;
      }
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

   const handleScheduleTraining = async (e) => {
      e.preventDefault();
      if (!trainingForm.title || !trainingForm.scheduled_at) {
         toast.error("Title and Scheduled Time are required");
         return;
      }
      setIsSubmitting(true);
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/${showScheduleTraining}/training`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trainingForm),
         });
         if (res.ok) {
            toast.success("Training scheduled successfully");
            setShowScheduleTraining(null);
            setTrainingForm({ title: "", description: "", scheduled_at: "" });
         } else {
            toast.error("Failed to schedule training");
         }
      } catch { toast.error("Network error"); }
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
            toast.success("Funding request submitted to Finance!");
            fetchClusters();
         } else {
            const d = await res.json();
            toast.error(d.error || "Failed to request funding");
         }
      } catch { toast.error("Network error"); }
      finally { setIsRequestingClusterInput(null); }
   };

   const handleViewPreHarvest = async (cluster) => {
      setShowViewPreHarvest(cluster);
      setClusterPreHarvests([]);
      try {
         const res = await fetch(`/api/proxy/pipeline/preharvest/cluster/${cluster.id}`);
         if (res.ok) {
            const data = await res.json();
            setClusterPreHarvests(data.data || []);
         }
      } catch (e) {
         toast.error("Failed to fetch listings");
      }
   };

   // Derive button state for a cluster
   const getClusterButtonState = (cluster) => {
      if (cluster.request_items_status === "confirmed_delivered" || cluster.request_status === "distributed") {
         return "completed"; // Delivery confirmed, now ready for distribution
      }
      if (cluster.request_items_status === "delivered") {
         return "needs_confirmation"; // Items delivered by distributor at farm gate, needs physical confirmation
      }
      if (cluster.request_items_status === "dispatched") {
         return "in_transit"; // Items dispatched and en route
      }
      if (cluster.request_status === "approved" && cluster.request_items_status !== "pending") {
         return "processing"; // Still processing / not dispatched yet
      }
      if (cluster.request_status === "items_selected") {
         return "awaiting_items_approval"; // Items selected, waiting for final approval
      }
      if (cluster.request_funds_status === "approved" && cluster.request_items_status === "pending") {
         return "select_inputs"; // Funds approved, needs input selection
      }
      if (cluster.has_pending_request) {
         return "awaiting_approval"; // Waiting for finance approval
      }
      return "request_funding"; // Can request
   };

   const displayedClusters = activeTab === "my_clusters"
      ? clusters.filter(c => c.supervisor_id === currentUserId)
      : clusters;

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Cluster Operations...</div>;

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Cluster Operations</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage field clusters and memberships</p>
            </div>
            {canManageClusters && (
               <Button
                  onClick={() => setShowCreateCluster(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer font-bold transition shadow-lg bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
               >
                  <FaPlus /> Create Cluster
               </Button>
            )}
         </div>

         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Active Clusters</CardTitle>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                     <button
                        onClick={() => setActiveTab("my_clusters")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "my_clusters" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        My Clusters
                     </button>
                     <button
                        onClick={() => setActiveTab("all_clusters")}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === "all_clusters" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                     >
                        All Clusters
                     </button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-6">
               {displayedClusters.length === 0 ? (
                  <div className="text-center py-20">
                     <FaMapMarkedAlt className="text-6xl text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No clusters found</p>
                  </div>
               ) : (
                  <div className="grid gap-6">
                     {displayedClusters.map((cluster, i) => {
                        const btnState = getClusterButtonState(cluster);
                        const walletBalance = parseFloat(cluster.wallet_balance || 0);
                        const lockedBalance = parseFloat(cluster.wallet_locked_balance || 0);
                        const isMySupervisorNode = cluster.supervisor_id === currentUserId;

                        return (
                           <div 
                              key={cluster.id || i} 
                              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 p-6 space-y-6 overflow-hidden"
                           >
                              {/* 1. Header: Identity & Status Badge */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                                 <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                                       <FaMapMarkedAlt className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight truncate">
                                          {cluster.name}
                                       </h3>
                                       <div className="flex flex-wrap items-center gap-2 mt-1">
                                          {cluster.region && (
                                             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {cluster.region}
                                             </span>
                                          )}
                                          {cluster.program_name && (
                                             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                                <Building2 className="w-3 h-3 text-emerald-500" />
                                                {cluster.program_name}
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                     <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                        btnState === "completed" 
                                           ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
                                        btnState === "awaiting_items_approval" 
                                           ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800" :
                                        btnState === "select_inputs" 
                                           ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800" :
                                        btnState === "awaiting_approval" 
                                           ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800" :
                                        btnState === "needs_confirmation" 
                                           ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800" :
                                        btnState === "in_transit" 
                                           ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800" :
                                        cluster.status === "active" 
                                           ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
                                           "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200"
                                     }`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                           btnState === "needs_confirmation" ? "bg-teal-500 animate-pulse" :
                                           btnState === "in_transit" ? "bg-blue-500 animate-pulse" :
                                           btnState === "select_inputs" ? "bg-purple-500 animate-pulse" :
                                           btnState === "awaiting_approval" ? "bg-amber-500 animate-pulse" :
                                           btnState === "completed" ? "bg-emerald-500" : "bg-blue-500"
                                        }`} />
                                        {btnState === "completed" ? "Ready for Distribution" :
                                         btnState === "needs_confirmation" ? "Delivery Awaiting Confirmation" :
                                         btnState === "awaiting_items_approval" ? "Inputs Submitted" :
                                         btnState === "select_inputs" ? "Awaiting Input Selection" :
                                         btnState === "awaiting_approval" ? "Funding Requested" :
                                         btnState === "processing" ? "Processing Order" : cluster.status}
                                     </span>
                                 </div>
                              </div>

                              {/* 2. Metrics Bar: 4 Distinct Executive Tiles */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                       <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                       Supervisor
                                    </div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                                       {isMySupervisorNode ? "You (Lead)" : (cluster.supervisor_name || "—")}
                                    </p>
                                 </div>

                                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                       <Users className="w-3.5 h-3.5 text-blue-500" />
                                       Enrolled Farmers
                                    </div>
                                    <p className="font-black text-lg text-slate-900 dark:text-white">
                                       {cluster.farmer_count || 0}
                                       <span className="text-xs font-bold text-slate-400 ml-1">members</span>
                                    </p>
                                 </div>

                                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                       <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                       Total Farmland
                                    </div>
                                    <p className="font-black text-lg text-amber-600 dark:text-amber-400">
                                       {parseFloat(cluster.total_hectares || 0).toFixed(2)}
                                       <span className="text-xs font-bold text-slate-400 ml-1">Ha</span>
                                    </p>
                                 </div>

                                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                       <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                                       Locked Funds
                                    </div>
                                    <p className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                                       ₦{lockedBalance.toLocaleString()}
                                    </p>
                                 </div>
                              </div>

                              {/* 3. Primary Financing & Milestone Action Card */}
                              {isMySupervisorNode && (
                                 <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                       <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                          {btnState === "select_inputs" ? (
                                             <>
                                                <Sparkles className="w-4 h-4 text-purple-600" />
                                                Financing Authorized — Action Required
                                             </>
                                          ) : btnState === "awaiting_approval" ? (
                                             <>
                                                <Clock className="w-4 h-4 text-amber-500" />
                                                Financing Authorization In Review
                                             </>
                                          ) : btnState === "awaiting_items_approval" ? (
                                             <>
                                                <PackageCheck className="w-4 h-4 text-blue-500" />
                                                Input Selection Submitted
                                             </>
                                          ) : btnState === "in_transit" ? (
                                             <>
                                                <Truck className="w-4 h-4 text-blue-500" />
                                                Inputs In Transit to Cluster Depot
                                             </>
                                          ) : btnState === "needs_confirmation" ? (
                                             <>
                                                <AlertCircle className="w-4 h-4 text-teal-600 animate-pulse" />
                                                Materials Arrived — Verification Required
                                             </>
                                          ) : btnState === "completed" ? (
                                             <>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                Two-Way Verified — Ready for Member Distribution
                                             </>
                                          ) : (
                                             <>
                                                <Wallet className="w-4 h-4 text-amber-600" />
                                                Cluster Financing Application
                                             </>
                                          )}
                                       </p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {btnState === "select_inputs" 
                                             ? `₦${lockedBalance.toLocaleString()} has been unlocked by Finance. Choose eligible inputs to initiate delivery.`
                                             : btnState === "awaiting_approval"
                                             ? "Your financing requisition is pending Finance Department authorization and budget allocation."
                                             : btnState === "awaiting_items_approval"
                                             ? "Selected inputs are being packaged for distributor dispatch to your cluster."
                                             : btnState === "in_transit"
                                             ? `Distributor ${cluster.distributor_name || "Partner"} has dispatched your input requisition. Materials are en route to your depot.`
                                             : btnState === "needs_confirmation"
                                             ? `Distributor ${cluster.distributor_name || "Partner"} has reported physical delivery at the depot. Please inspect materials and click Confirm Physical Receipt below.`
                                             : btnState === "completed"
                                             ? "Delivery physically verified by both distributor and supervisor. Escrow payout queued for Finance authorization."
                                             : "Apply for input financing based on the total farm size of your enrolled cluster members."}
                                       </p>
                                    </div>

                                    <div className="shrink-0 self-stretch md:self-auto">
                                       {btnState === "select_inputs" ? (
                                          <Button
                                             onClick={() => { 
                                                setSelectingForRequest({
                                                   requestId: cluster.pending_request_id,
                                                   clusterId: cluster.id,
                                                   programId: cluster.program_id,
                                                   lockedFunds: lockedBalance
                                                }); 
                                                setShowRequestModal(true); 
                                             }}
                                             className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                          >
                                             <Sparkles className="w-4 h-4" />
                                             <span>Select Inputs</span>
                                          </Button>
                                       ) : btnState === "awaiting_items_approval" ? (
                                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-100/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                             <Clock className="w-3.5 h-3.5" />
                                             Inputs Pending Dispatch
                                          </span>
                                       ) : btnState === "awaiting_approval" ? (
                                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-100/60 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                             <Clock className="w-3.5 h-3.5" />
                                             Funding Awaiting Approval
                                          </span>
                                       ) : btnState === "completed" ? (
                                          <div className="flex flex-col items-end gap-1">
                                             <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                <Check className="w-3.5 h-3.5" />
                                                Delivery Confirmed
                                             </span>
                                             {cluster.distributor_name && (
                                                <span className="text-[10px] text-slate-500">
                                                   Distributor: {cluster.distributor_name} {cluster.distributor_phone && `(${cluster.distributor_phone})`}
                                                </span>
                                             )}
                                          </div>
                                       ) : btnState === "in_transit" ? (
                                          <div className="flex flex-col items-end gap-1">
                                             <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-100/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                <Truck className="w-3.5 h-3.5" />
                                                In Transit to Depot
                                             </span>
                                             {cluster.distributor_name && (
                                                <span className="text-[10px] text-slate-500">
                                                   Distributor: {cluster.distributor_name} {cluster.distributor_phone && `(${cluster.distributor_phone})`}
                                                </span>
                                             )}
                                          </div>
                                       ) : btnState === "needs_confirmation" ? (
                                          <div className="flex flex-col items-end gap-1">
                                             <Button
                                                onClick={async () => {
                                                   try {
                                                      const res = await fetch(`/api/proxy/pipeline/inputs/${cluster.pending_request_id}/confirm-delivery`, { method: "PATCH" });
                                                      if (res.ok) {
                                                         toast.success("Physical receipt confirmed! Escrow authorized for payout.");
                                                         fetchClusters();
                                                      } else {
                                                         toast.error("Failed to confirm delivery");
                                                      }
                                                   } catch { toast.error("Network error"); }
                                                }}
                                                className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs px-6 py-2.5 font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                                             >
                                                <Check className="w-4 h-4" /> Confirm Physical Receipt
                                             </Button>
                                             {cluster.distributor_name && (
                                                <span className="text-[10px] text-slate-500">
                                                   Delivered by: {cluster.distributor_name}
                                                </span>
                                             )}
                                          </div>
                                       ) : btnState === "processing" ? (
                                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-100 text-blue-700">
                                             Processing Order
                                          </span>
                                       ) : (
                                          <Button
                                             onClick={() => handleRequestClusterInput(cluster.id)}
                                             disabled={isRequestingClusterInput === cluster.id}
                                             className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white text-xs px-6 py-2.5 font-bold rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                                          >
                                             <Wallet className="w-4 h-4" />
                                             {isRequestingClusterInput === cluster.id ? "Processing..." : "Request Funding"}
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              )}

                              {/* 4. Structured Operational Toolbar */}
                              {isMySupervisorNode && (
                                 <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex flex-wrap items-center gap-2">
                                       <button
                                          type="button"
                                          onClick={() => { setShowAddMember(cluster.id); fetchEligibleFarmers(cluster.program_id, cluster.id); }}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 transition cursor-pointer"
                                       >
                                          <UserPlus className="w-3.5 h-3.5" />
                                          <span>Recruit Farmers</span>
                                       </button>

                                       <button
                                          type="button"
                                          onClick={() => { setShowMembers(cluster); fetchClusterMembers(cluster); }}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                       >
                                          <Users className="w-3.5 h-3.5" />
                                          <span>Members ({cluster.farmer_count || 0})</span>
                                       </button>

                                       <button
                                          type="button"
                                          onClick={() => setShowChat(cluster.id)}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 border border-teal-200/60 dark:border-teal-800/60 transition cursor-pointer"
                                       >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Team Chat</span>
                                       </button>

                                       <button
                                          type="button"
                                          onClick={() => setShowScheduleTraining(cluster.id)}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100/80 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/60 transition cursor-pointer"
                                       >
                                          <Calendar className="w-3.5 h-3.5" />
                                          <span>Training</span>
                                       </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                       <button
                                          type="button"
                                          onClick={() => { 
                                             setShowPreHarvest(cluster); 
                                             setPreHarvestForm({ commodity: cluster.program_name || "", estimated_yield_tons: "", offer_price_per_ton: "", expected_harvest_date: "" });
                                          }}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60 transition cursor-pointer"
                                       >
                                          <TrendingUp className="w-3.5 h-3.5" />
                                          <span>List Pre-Harvest</span>
                                       </button>

                                       <button
                                          type="button"
                                          onClick={() => handleViewPreHarvest(cluster)}
                                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                       >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span>View Listings</span>
                                       </button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Modals */}
         <InputRequestModal
            isOpen={showRequestModal}
            onClose={() => { setShowRequestModal(false); setSelectingForRequest(null); fetchClusters(); }}
            requestId={typeof selectingForRequest === "object" ? selectingForRequest?.requestId : selectingForRequest}
            clusterId={typeof selectingForRequest === "object" ? selectingForRequest?.clusterId : null}
            programId={typeof selectingForRequest === "object" ? selectingForRequest?.programId : null}
            lockedFunds={typeof selectingForRequest === "object" ? selectingForRequest?.lockedFunds : null}
            isClusterRequest={true}
            onSuccess={() => { fetchClusters(); }}
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
         {/* Pre-Harvest Listing Modal */}
         {showPreHarvest && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative border border-gray-100 dark:border-gray-800">
                  <button onClick={() => setShowPreHarvest(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition bg-gray-50 dark:bg-gray-800 rounded-full p-2">
                     <FaTimes />
                  </button>
                  <h2 className="text-2xl font-black text-(--foreground) tracking-tight mb-2">List Pre-Harvest</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Offer future yields to buyers</p>
                  
                  <form onSubmit={async (e) => {
                     e.preventDefault();
                     setIsListingPreHarvest(true);
                     try {
                        const res = await fetch("/api/proxy/pipeline/preharvest", {
                           method: "POST", headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({
                              cluster_id: showPreHarvest.id,
                              program_id: showPreHarvest.program_id,
                              commodity: preHarvestForm.commodity,
                              estimated_yield_tons: preHarvestForm.estimated_yield_tons,
                              offer_price_per_ton: preHarvestForm.offer_price_per_ton,
                              expected_harvest_date: preHarvestForm.expected_harvest_date
                           })
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                           toast.success("Pre-harvest listing created successfully!");
                           setShowPreHarvest(null);
                        } else {
                           toast.error(data.error || "Failed to create listing");
                        }
                     } catch(err) {
                        toast.error("Error creating listing");
                     } finally {
                        setIsListingPreHarvest(false);
                     }
                  }} className="space-y-6">
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Commodity</label>
                        <input type="text" required value={preHarvestForm.commodity} onChange={e => setPreHarvestForm({...preHarvestForm, commodity: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Estimated Yield (Tons)</label>
                        <input type="number" step="0.01" required value={preHarvestForm.estimated_yield_tons} onChange={e => setPreHarvestForm({...preHarvestForm, estimated_yield_tons: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Offer Price per Ton (₦)</label>
                        <input type="number" step="0.01" required value={preHarvestForm.offer_price_per_ton} onChange={e => setPreHarvestForm({...preHarvestForm, offer_price_per_ton: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" />
                     </div>
                     <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Expected Harvest Date</label>
                        <input type="date" required value={preHarvestForm.expected_harvest_date} onChange={e => setPreHarvestForm({...preHarvestForm, expected_harvest_date: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-6 py-4 font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" />
                     </div>
                     
                     <Button disabled={isListingPreHarvest} type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-xl shadow-xl shadow-amber-600/20">
                        {isListingPreHarvest ? "Listing..." : "Submit Listing"}
                     </Button>
                  </form>
               </div>
            </div>
         )}
         {/* Chat Interface */}
         {showChat && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                     <h3 className="text-xl font-black text-(--foreground)">Cluster Chat</h3>
                     <button onClick={() => setShowChat(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FaTimes size={20} />
                     </button>
                  </div>
                  <div className="p-6">
                     <ClusterChat clusterId={showChat} />
                  </div>
               </div>
            </div>
         )}
         {/* Schedule/Live Sessions Modal */}
         {showScheduleTraining && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-(--foreground)">Cluster Live Sessions</h3>
                     <button onClick={() => setShowScheduleTraining(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FaTimes size={20} />
                     </button>
                  </div>
                  
                  {clusterTrainings.length > 0 && (
                     <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Scheduled Sessions</h4>
                        <div className="space-y-3">
                           {clusterTrainings.map(t => (
                              <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                 <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{t.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(t.scheduled_time).toLocaleString()}</p>
                                 </div>
                                 <Button 
                                    onClick={() => window.open(`/ecosystem/program-management/clusters/live/${t.id}`, '_blank')}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                 >
                                    <FaVideo /> Join Session
                                 </Button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Schedule New Session</h4>
                     <form onSubmit={handleScheduleTraining} className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Training Title</label>
                           <input
                              required
                              type="text"
                              value={trainingForm.title}
                              onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g. Pest Control Best Practices"
                           />
                        </div>
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                        <textarea
                           value={trainingForm.description}
                           onChange={e => setTrainingForm({ ...trainingForm, description: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 resize-none h-24"
                           placeholder="Brief description of the session..."
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Scheduled Time</label>
                        <input
                           required
                           type="datetime-local"
                           value={trainingForm.scheduled_at}
                           onChange={e => setTrainingForm({ ...trainingForm, scheduled_at: e.target.value })}
                           className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500"
                        />
                     </div>
                     <Button disabled={isSubmitting} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mt-4">
                        {isSubmitting ? "Scheduling..." : "Schedule Live Session"}
                     </Button>
                  </form>
               </div>
            </div>
         </div>
      )}
      
      {/* View Pre-Harvest Listings Modal */}
      {showViewPreHarvest && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
               <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                  <div>
                     <h2 className="text-2xl font-black text-(--foreground) tracking-tight mb-1">Pre-Harvest Listings</h2>
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Listings for {showViewPreHarvest.name}</p>
                  </div>
                  <button onClick={() => setShowViewPreHarvest(null)} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                     <FaTimes className="text-gray-500" />
                  </button>
               </div>
               <div className="p-8 max-h-[60vh] overflow-y-auto">
                  {clusterPreHarvests.length === 0 ? (
                     <div className="text-center py-10">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No listings found</p>
                     </div>
                  ) : (
                     <div className="grid gap-4">
                        {clusterPreHarvests.map(listing => (
                           <div key={listing.id} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                 <p className="font-black text-lg text-gray-900 dark:text-gray-100">{listing.commodity}</p>
                                 <p className="text-xs text-gray-500 font-bold uppercase mt-1">Status: <span className={listing.status === 'available' ? 'text-green-500' : 'text-orange-500'}>{listing.status}</span></p>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                 <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Yield</p>
                                    <p className="font-bold">{listing.estimated_yield_tons} Tons</p>
                                 </div>
                                 <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Price/Ton</p>
                                    <p className="font-bold text-emerald-600">₦{parseFloat(listing.offer_price_per_ton).toLocaleString()}</p>
                                 </div>
                                 <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Expected</p>
                                    <p className="font-bold">{new Date(listing.expected_harvest_date).toLocaleDateString()}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
      </div>
   );
}
