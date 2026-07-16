"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaMapMarkerAlt, FaClipboardCheck, FaSatelliteDish, FaThermometerHalf, FaLeaf, FaCalendarDay, FaCheckCircle, FaSpinner, FaClock, FaHistory, FaEdit, FaSave, FaUserAlt, FaTools, FaWater, FaSeedling, FaLayerGroup, FaSun } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MapboxFarmCapture from "@/components/MapboxFarmCapture";

export default function FieldOperationsDashboard() {
   const [activeSection, setActiveSection] = useState("overview");
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({});
   const [clusters, setClusters] = useState([]);
   const [selectedCluster, setSelectedCluster] = useState(null);
   const [clusterFarmers, setClusterFarmers] = useState([]);
   const [selectedFarmer, setSelectedFarmer] = useState(null);
   const [supervision, setSupervision] = useState(null);
   const [isSaving, setIsSaving] = useState(false);
   const [uploadingImageFor, setUploadingImageFor] = useState(null);
   const [verifications, setVerifications] = useState([]);
   const [assignments, setAssignments] = useState([]);
   const [assignmentForm, setAssignmentForm] = useState({ officerId: "", community: "", ward: "", lga: "", zone: "", target: "" });
   const [userRole, setUserRole] = useState(null);

   const [farmerRegData, setFarmerRegData] = useState({
      fname: "", lname: "", email: "", phone: "", pword: "", country_name: "Nigeria", country_code: "NG", state_name: "", currency: "NGN"
   });
   const [isRegistering, setIsRegistering] = useState(false);

   const stages = [
      { id: 'clearing', label: 'Farm Clearing', icon: <FaTools /> },
      { id: 'irrigation', label: 'Irrigation', icon: <FaWater /> },
      { id: 'ridging', label: 'Ridging/Mounding', icon: <FaLayerGroup /> },
      { id: 'weeding', label: 'Weeding', icon: <FaSeedling /> },
      { id: 'harvesting', label: 'Harvesting', icon: <FaSun /> },
   ];

   useEffect(() => {
      fetchInitialData();
   }, []);

   const handleFarmerRegChange = (e) => {
      setFarmerRegData({ ...farmerRegData, [e.target.name]: e.target.value });
   };

   const handleRegisterFarmer = async (e) => {
      e.preventDefault();
      setIsRegistering(true);
      try {
         const res = await fetch("/api/proxy/field-operations/register-farmer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(farmerRegData),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(json.message || "Farmer registered successfully!");
            setFarmerRegData({ fname: "", lname: "", email: "", phone: "", pword: "", country_name: "Nigeria", country_code: "NG", state_name: "", currency: "NGN" });
         } else {
            toast.error(json.error?.[0] || "Failed to register farmer.");
         }
      } catch (err) {
         toast.error("Network error.");
      } finally {
         setIsRegistering(false);
      }
   };

   const fetchInitialData = async () => {
      try {
         setLoading(true);
         const [statsRes, clustersRes, assignmentsRes, sessionRes, farmersRes] = await Promise.all([
            fetch("/api/proxy/pipeline/stats"),
            fetch("/api/proxy/pipeline/clusters"),
            fetch("/api/proxy/field-operations/work-assignments"),
            fetch("/api/proxy/auth/verify-vendor"),
            fetch("/api/proxy/field-operations/farmers")
         ]);
         if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data || {}); }
         if (assignmentsRes.ok) { const d = await assignmentsRes.json(); setAssignments(d.data || []); }
         if (sessionRes.ok) { const d = await sessionRes.json(); setUserRole(d.role?.toLowerCase() || ""); }
         
         let globalFarmers = [];
         if (farmersRes.ok) { const d = await farmersRes.json(); globalFarmers = d.data || []; }

         if (clustersRes.ok) {
            const d = await clustersRes.json();
            const cl = d.data || [];
            setClusters(cl);

            let allVerifications = [];
            let allFarmers = [];

            if (cl.length > 0) {
               await Promise.all(cl.map(async (c) => {
                  const [vRes, fRes] = await Promise.all([
                     fetch(`/api/proxy/pipeline/verifications/cluster/${c.id}`),
                     fetch(`/api/proxy/pipeline/clusters/${c.id}/members`),
                  ]);
                  if (vRes.ok) {
                     const vd = await vRes.json();
                     allVerifications.push(...(vd.data || []).map(v => ({ ...v, cluster_name: c.name })));
                  }
                  if (fRes.ok) {
                     const fd = await fRes.json();
                     allFarmers.push(...(fd.data || []).map(f => ({ ...f, cluster_name: c.name, cluster_id: c.id, cluster_region: c.region })));
                  }
               }));
            }

            setVerifications(allVerifications);
            
            const uniqueFarmersMap = new Map();
            allFarmers.forEach(f => {
               if (!uniqueFarmersMap.has(f.farmer_id)) {
                  uniqueFarmersMap.set(f.farmer_id, f);
               }
            });
            globalFarmers.forEach(f => {
               if (!uniqueFarmersMap.has(f.farmer_id)) {
                  uniqueFarmersMap.set(f.farmer_id, f);
               }
            });
            setClusterFarmers(Array.from(uniqueFarmersMap.values()));
         }
      } catch (err) {
         console.error(err);
         toast.error("Failed to load dashboard data");
      } finally {
         setLoading(false);
      }
   };

   const handleSelectCluster = async (cluster) => {
      setSelectedCluster(cluster);
      try {
         const res = await fetch(`/api/proxy/pipeline/supervision/cluster/${cluster.id}`);
         if (res.ok) {
            const d = await res.json();
            setSupervision(d.data || {
               cluster_id: cluster.id,
               clearing_status: 'pending', irrigation_status: 'pending', ridging_status: 'pending', weeding_status: 'pending', harvesting_status: 'pending'
            });
         }
      } catch (err) {
         toast.error("Failed to load cluster supervision");
      }
   };

   const handleUpdateSupervision = async () => {
      if (!selectedCluster || !supervision) return;
      setIsSaving(true);
      try {
         const res = await fetch("/api/proxy/pipeline/supervision/cluster/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               ...supervision,
               cluster_id: selectedCluster.id
            })
         });
         if (res.ok) {
            toast.success("Cluster supervision updated successfully");
            const d = await res.json();
            setSupervision(d.data);
         } else {
            toast.error("Failed to update supervision");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setIsSaving(false);
      }
   };

   const handleImageUpload = async (e, stageId) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImageFor(stageId);
      const formData = new FormData();
      formData.append("file", file);

      try {
         const res = await fetch("/api/proxy/vendor/upload/document", {
            method: "POST",
            body: formData
         });
         const json = await res.json();
         if (res.ok && json.success) {
            setSupervision(prev => ({ ...prev, [`${stageId}_image`]: json.data.url }));
            toast.success("Image uploaded successfully");
         } else {
            toast.error(json.error || "Failed to upload image");
         }
      } catch (err) {
         toast.error("Network error during upload");
      } finally {
         setUploadingImageFor(null);
      }
   };

   const getStatusColor = (status, isSolid = false) => {
      switch (status) {
         case 'completed':
         case 'verified':
            return isSolid
               ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
               : 'bg-emerald-100 text-emerald-700 border-emerald-200';
         case 'in_progress':
         case 'dispatched':
            return isSolid
               ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
               : 'bg-blue-100 text-blue-700 border-blue-200';
         case 'pending':
            return isSolid
               ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
               : 'bg-amber-100 text-amber-700 border-amber-200';
         default:
            return isSolid
               ? 'bg-gray-400 text-white shadow-lg'
               : 'bg-gray-100 text-gray-500 border-gray-200';
      }
   };

   const handleCreateAssignment = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         const res = await fetch("/api/proxy/field-operations/work-assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignmentForm)
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Work assignment created successfully");
            setAssignments([data.data, ...assignments]);
            setAssignmentForm({ officerId: "", community: "", ward: "", lga: "", zone: "", target: "" });
         } else {
            toast.error(data.message || "Failed to create assignment");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setIsSaving(false);
      }
   };

   const handleBoundaryCapture = async (data) => {
      if (!selectedFarmer || !data) return;
      setIsSaving(true);
      try {
         const res = await fetch("/api/proxy/field-operations/capture-farm-boundary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               farmerId: selectedFarmer.farmer_id,
               polygon: data.polygon,
               hectares: data.hectares,
               lat: data.location?.latitude,
               lng: data.location?.longitude
            })
         });
         const result = await res.json();
         if (result.success) {
            toast.success("Farm boundary captured and verified successfully");
         } else {
            toast.error(result.message || "Failed to capture boundary");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="space-y-6 pb-20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Field <span className="text-teal-600">Operations</span></h1>
               <p className="text-gray-500 mt-1 font-medium">Manage visits, verify farms, and monitor agricultural progress.</p>
            </div>
         </div>

         <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
            {[
               { key: "overview", label: "Overview", roles: ["all"] },
               { key: "register_farmer", label: "Register Farmer", roles: ["enumerator", "field officer", "agronomist", "field operations supervisor", "program director"] },
               { key: "capture_boundary", label: "Capture Boundary", roles: ["field officer", "agronomist", "field operations supervisor", "program director"] },
               { key: "supervision", label: "Farm Supervision (Agronomy)", roles: ["agronomist", "field operations supervisor", "program director"] },
               { key: "inspections", label: "Field Inspections", roles: ["inspector", "field operations supervisor", "program director"] },
               { key: "assignments", label: "Work Assignments", roles: ["field operations supervisor", "program director"] }
            ]
            .filter(tab => !userRole || tab.roles.includes("all") || tab.roles.some(r => userRole.includes(r)))
            .map(({ key, label }) => (
               <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeSection === key ? "bg-white dark:bg-gray-700 text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
               >
                  {label}
               </button>
            ))}
         </div>

         {loading ? (
            <div className="flex justify-center py-24"><div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full shadow-lg shadow-teal-500/20"></div></div>
         ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               {activeSection === "overview" && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-white dark:bg-gray-800 border-none shadow-xl shadow-teal-500/5 group hover:scale-[1.02] transition-transform">
                           <CardContent className="p-6 flex items-center gap-4">
                              <div className="p-4 bg-teal-500 text-white rounded-2xl shadow-lg shadow-teal-500/20"><FaClipboardCheck size={24} /></div>
                              <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Farms</p>
                                 <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{stats.verifiedFarms || verifications.filter(v => v.status === "verified").length}</p>
                              </div>
                           </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800 border-none shadow-xl shadow-emerald-500/5 group hover:scale-[1.02] transition-transform">
                           <CardContent className="p-6 flex items-center gap-4">
                              <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><FaSatelliteDish size={24} /></div>
                              <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Clusters</p>
                                 <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{stats.activeClusters || clusters.length}</p>
                              </div>
                           </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800 border-none shadow-xl shadow-lime-500/5 group hover:scale-[1.02] transition-transform">
                           <CardContent className="p-6 flex items-center gap-4">
                              <div className="p-4 bg-lime-500 text-white rounded-2xl shadow-lg shadow-lime-500/20"><FaMapMarkerAlt size={24} /></div>
                              <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cluster Farmers</p>
                                 <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{clusterFarmers.length}</p>
                              </div>
                           </CardContent>
                        </Card>
                        {/* <Card className="bg-white dark:bg-gray-800 border-none shadow-xl shadow-cyan-500/5 group hover:scale-[1.02] transition-transform">
                           <CardContent className="p-6 flex items-center gap-4">
                              <div className="p-4 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20"><FaCalendarDay size={24} /></div>
                              <div>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Yield Potential</p>
                                 <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{stats.totalSalesValue ? "₦" + (stats.totalSalesValue / 1000000).toFixed(1) + "M" : "Calculating..."}</p>
                              </div>
                           </CardContent>
                        </Card> */}
                     </div>

                     <Card className="border-none shadow-2xl shadow-gray-200 dark:shadow-none overflow-hidden rounded-3xl">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 p-6">
                           <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter"><FaHistory className="text-teal-500" /> Recent Cluster Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           {verifications.length > 0 ? (
                              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                 {verifications.slice(0, 8).map((v, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center font-bold text-sm">
                                             {v.farmer_fname[0]}{v.farmer_lname[0]}
                                          </div>
                                          <div>
                                             <p className="font-bold text-gray-900 dark:text-white">{v.farmer_fname} {v.farmer_lname}</p>
                                             <p className="text-xs text-gray-500 font-medium">Verified by {v.officer_fname || "Field Officer"} • {new Date(v.created_at).toLocaleDateString()}</p>
                                          </div>
                                       </div>
                                       <span className={`px-4 py-1 text-[10px] rounded-full font-black uppercase tracking-widest border ${getStatusColor(v.status)}`}>{v.status}</span>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center py-20">
                                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <FaHistory size={24} />
                                 </div>
                                 <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No recent verifications</p>
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  </div>
               )}

               {activeSection === "supervision" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Cluster List */}
                     <Card className="lg:col-span-1 border-none shadow-xl shadow-gray-200 dark:shadow-none rounded-3xl overflow-hidden h-fit">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-6 border-b border-gray-100 dark:border-gray-700">
                           <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><FaSatelliteDish className="text-teal-500" /> Clusters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                           {clusters.length > 0 ? (
                              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                 {clusters.map((c) => (
                                    <button
                                       key={c.id}
                                       onClick={() => handleSelectCluster(c)}
                                       className={`w-full p-5 text-left transition-all flex items-center justify-between group ${selectedCluster?.id === c.id ? "bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${selectedCluster?.id === c.id ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600"}`}>
                                             {c.name?.[0]?.toUpperCase() || "C"}
                                          </div>
                                          <div>
                                             <p className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</p>
                                             <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{c.region || "Region"} • {c.farmer_count || 0} Farmers • {c.total_hectares || 0} Ha</p>
                                          </div>
                                       </div>
                                       {selectedCluster?.id === c.id && <FaEdit className="text-teal-500 animate-pulse" size={14} />}
                                    </button>
                                 ))}
                              </div>
                           ) : (
                              <p className="p-10 text-center text-gray-400 font-bold text-xs uppercase italic">No clusters found</p>
                           )}
                        </CardContent>
                     </Card>

                     {/* Supervision Log */}
                     <Card className="lg:col-span-2 border-none shadow-2xl shadow-teal-500/5 dark:shadow-none rounded-3xl overflow-hidden min-h-[500px]">
                        {!selectedCluster ? (
                           <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-4">
                              <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center text-teal-600">
                                 <FaSatelliteDish size={32} className="opacity-50" />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Select a Cluster</h3>
                                 <p className="text-gray-500 font-medium max-w-xs mx-auto">Select a cluster from the list to update the farm supervision log and track farming stages for the entire group.</p>
                              </div>
                           </div>
                        ) : (
                           <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                              <CardHeader className="bg-teal-600 text-white p-8">
                                 <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                       <div className="flex items-center gap-3">
                                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaSatelliteDish size={24} /></div>
                                          <div>
                                             <h2 className="text-2xl font-black leading-tight uppercase tracking-tight">Cluster {selectedCluster.name}</h2>
                                             <p className="text-teal-100 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                <FaMapMarkerAlt /> {selectedCluster.region || "Region"} • {selectedCluster.farmer_count || 0} Farmers • {selectedCluster.total_hectares || 0} Ha
                                             </p>
                                             {selectedCluster.supervisor_name && (
                                                <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                   Supervisor: {selectedCluster.supervisor_name}
                                                </p>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    <button
                                       onClick={handleUpdateSupervision}
                                       disabled={isSaving}
                                       className="bg-white text-teal-700 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                                    >
                                       {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                       {isSaving ? "Saving..." : "Save Progress"}
                                    </button>
                                 </div>
                              </CardHeader>

                              <CardContent className="p-8 space-y-8 flex-1 overflow-y-auto">
                                 <div className="space-y-12">
                                    {stages.map((stage, idx) => (
                                       <div key={stage.id} className="relative">
                                          {idx !== stages.length - 1 && (
                                             <div className="absolute left-6 top-12 bottom-[-48px] w-0.5 bg-gray-100 dark:bg-gray-800 z-0"></div>
                                          )}

                                          <div className="flex gap-6 relative z-10">
                                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all duration-500 ${getStatusColor(supervision?.[`${stage.id}_status`], true)
                                                } ${supervision?.[`${stage.id}_status`] === 'in_progress' ? 'animate-pulse' : ''}`}>
                                                {supervision?.[`${stage.id}_status`] === 'completed' ? <FaCheckCircle /> : stage.icon}
                                             </div>

                                             <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                   <div className="shrink-0 min-w-[200px]">
                                                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{stage.label}</h4>
                                                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                                                         <FaClock /> Last Updated: {supervision?.[`${stage.id}_updated_at`] ? new Date(supervision[`${stage.id}_updated_at`]).toLocaleString() : "Never"}
                                                      </p>
                                                   </div>

                                                   <div className="flex flex-wrap p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit gap-1">
                                                      {['pending', 'in_progress', 'completed'].map((status) => (
                                                         <button
                                                            key={status}
                                                            onClick={() => setSupervision({ ...supervision, [`${stage.id}_status`]: status })}
                                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${supervision?.[`${stage.id}_status`] === status
                                                               ? getStatusColor(status, true)
                                                               : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                                                               }`}
                                                         >
                                                            {status.replace('_', ' ')}
                                                         </button>
                                                      ))}
                                                   </div>
                                                </div>

                                                <textarea
                                                   placeholder={`Add field notes for ${stage.label}...`}
                                                   value={supervision?.[`${stage.id}_notes`] || ""}
                                                   onChange={(e) => setSupervision({ ...supervision, [`${stage.id}_notes`]: e.target.value })}
                                                   className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all min-h-[80px] resize-none"
                                                />
                                                <div className="flex items-center gap-4">
                                                   <label className={`cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${uploadingImageFor === stage.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                                      {uploadingImageFor === stage.id ? <FaSpinner className="animate-spin" /> : <FaTools />}
                                                      {uploadingImageFor === stage.id ? 'Uploading...' : 'Upload Image'}
                                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, stage.id)} disabled={uploadingImageFor === stage.id} />
                                                   </label>
                                                   {supervision?.[`${stage.id}_image`] && (
                                                      <a href={supervision[`${stage.id}_image`]} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 text-xs font-bold underline">
                                                         View Image
                                                      </a>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </CardContent>
                           </div>
                        )}
                     </Card>
                  </div>
               )}



               {activeSection === "verification" && (
                  <Card className="border-none shadow-2xl shadow-gray-200 dark:shadow-none rounded-3xl overflow-hidden">
                     <CardHeader className="bg-white dark:bg-gray-800 p-8 border-b border-gray-50 dark:border-gray-700">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                           <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl"><FaClipboardCheck /></div>
                           Field Verification Protocol
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Verification Checklist</p>
                                 <div className="space-y-4">
                                    {["Farm Visited", "Crop Verified", "Plant Density Checked"].map((task) => (
                                       <div key={task} className="flex items-center gap-4 group">
                                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">✓</div>
                                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{task}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">System Validation</p>
                                 <div className="space-y-4">
                                    {["GPS Match", "Timestamp Recorded", "Cluster Synced"].map((val) => (
                                       <div key={val} className="flex items-center gap-4 group">
                                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">✓</div>
                                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{val}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="p-8 bg-emerald-500 text-white rounded-3xl shadow-xl shadow-emerald-500/20 text-center transform hover:rotate-1 transition-transform">
                                 <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Protocol Status</p>
                                 <span className="text-3xl font-black uppercase tracking-tighter">Verified</span>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               )}

               {activeSection === "monitoring" && (
                  <Card className="border-none shadow-2xl shadow-gray-200 dark:shadow-none rounded-3xl overflow-hidden">
                     <CardHeader className="bg-white dark:bg-gray-800 p-8 border-b border-gray-50 dark:border-gray-700">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                           <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-2xl"><FaLeaf /></div>
                           Crop Monitoring Intelligence
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                                 <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Crop Health Index</p>
                                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 uppercase">Excellent</p>
                                 </div>
                                 <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">94%</div>
                              </div>
                              <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                                 <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Risk Assessment</p>
                                 <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm">
                                    <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold">!</div>
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Moderate pest risk detected in Zone B</span>
                                 </div>
                              </div>
                              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                                 <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20"><FaSatelliteDish /></div>
                                 <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-0.5">Sentinel-2 Link</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase">Live Vegetation Feed Active</p>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                                 <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-6">Agronomic Insights</p>
                                 <div className="space-y-3">
                                    {["Optimize nitrogen application by week 6", "Secondary irrigation pass recommended"].map(r => (
                                       <div key={r} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-50 dark:border-purple-900/20">
                                          <div className="w-6 h-6 bg-purple-500 text-white rounded-lg flex items-center justify-center text-[10px]">AI</div>
                                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-tight">{r}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Met-Office Data</p>
                                 <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-orange-500 text-white rounded-3xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20"><FaThermometerHalf /></div>
                                    <div>
                                       <p className="text-xl font-black text-gray-900 dark:text-white leading-none">31°C</p>
                                       <p className="text-xs font-bold text-gray-500 uppercase mt-1">Slight chance of precipitation</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               )}

               {activeSection === "harvest" && (
                  <Card className="border-none shadow-2xl shadow-gray-200 dark:shadow-none rounded-3xl overflow-hidden">
                     <CardHeader className="bg-white dark:bg-gray-800 p-8 border-b border-gray-50 dark:border-gray-700">
                        <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                           <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl"><FaSun /></div>
                           Harvest Pre-Approval
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-8 bg-gray-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                                 <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                                 <p className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Projected Yield</p>
                                 <p className="text-5xl font-black tracking-tighter leading-none">24.5 <span className="text-lg text-gray-500 font-bold uppercase tracking-widest">Tons</span></p>
                                 <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confidence Score</p>
                                       <p className="text-lg font-black text-emerald-500 uppercase tracking-tighter">High (92%)</p>
                                    </div>
                                    <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Grade A+</div>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-gray-100 dark:border-gray-700">
                                 <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Quality Assurance Protocols</p>
                                 <div className="space-y-4">
                                    {["Field Readiness Inspection", "Satellite Yield Validation", "Grain Moisture Analysis"].map((v) => (
                                       <div key={v} className="flex items-center gap-4">
                                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">✓</div>
                                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{v}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                              <button className="w-full py-6 bg-teal-600 text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                 Authorize Harvest Request
                              </button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               )}
               {activeSection === "assignments" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <Card className="lg:col-span-1 border-none shadow-xl rounded-3xl p-6 bg-white dark:bg-gray-800">
                        <CardTitle className="text-sm font-black uppercase mb-4">Create Assignment</CardTitle>
                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                           <input type="text" placeholder="Officer ID" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.officerId} onChange={e => setAssignmentForm({...assignmentForm, officerId: e.target.value})} />
                           <input type="text" placeholder="Community" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.community} onChange={e => setAssignmentForm({...assignmentForm, community: e.target.value})} />
                           <input type="text" placeholder="Ward" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.ward} onChange={e => setAssignmentForm({...assignmentForm, ward: e.target.value})} />
                           <input type="text" placeholder="LGA" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.lga} onChange={e => setAssignmentForm({...assignmentForm, lga: e.target.value})} />
                           <input type="text" placeholder="Enumeration Zone" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.zone} onChange={e => setAssignmentForm({...assignmentForm, zone: e.target.value})} />
                           <input type="number" placeholder="Target Farmers" className="w-full p-2 border rounded text-gray-900 dark:text-white dark:bg-gray-700" required value={assignmentForm.target} onChange={e => setAssignmentForm({...assignmentForm, target: e.target.value})} />
                           <button type="submit" disabled={isSaving} className="w-full bg-teal-600 text-white p-3 rounded font-bold uppercase tracking-widest hover:bg-teal-700 transition">{isSaving ? 'Assigning...' : 'Assign Work'}</button>
                        </form>
                     </Card>
                     <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl p-6 bg-white dark:bg-gray-800">
                        <CardTitle className="text-sm font-black uppercase mb-4">Work Assignments</CardTitle>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                           {assignments.length > 0 ? assignments.map(a => (
                              <div key={a.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex justify-between items-center">
                                 <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">{a.officer_name}</p>
                                    <p className="text-sm text-gray-500">Zone: {a.enumeration_zone}, Ward: {a.ward}, LGA: {a.lga}</p>
                                    <p className="text-xs text-gray-400 mt-1">Created: {new Date(a.created_at).toLocaleDateString()}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Target Farmers</p>
                                    <p className="text-2xl font-black">{a.target_farmers}</p>
                                 </div>
                              </div>
                           )) : (
                              <p className="text-center text-gray-500 mt-10">No assignments found.</p>
                           )}
                        </div>
                     </Card>
                  </div>
               )}

               {activeSection === "capture_boundary" && (
                  <div className="space-y-6">
                     <Card className="border-none shadow-xl rounded-3xl p-6 bg-white dark:bg-gray-800">
                        <CardTitle className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                           <FaMapMarkerAlt className="text-teal-500" /> Search & Select Farmer for Boundary Capture
                        </CardTitle>
                        <p className="text-sm text-gray-500 mb-4">Search by full name, phone number, or unapproved AIN to proceed with farm mapping.</p>
                        <select className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" onChange={(e) => setSelectedFarmer(clusterFarmers.find(f => f.farmer_id === e.target.value))} value={selectedFarmer?.farmer_id || ""}>
                           <option value="">-- Select Farmer --</option>
                           {clusterFarmers.map(f => (
                              <option key={f.farmer_id} value={f.farmer_id}>{f.fname} {f.lname} | AIN: {f.ain || 'Pending'} | Phone: {f.phone || 'N/A'}</option>
                           ))}
                        </select>
                     </Card>
                     
                     {selectedFarmer ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <MapboxFarmCapture key={selectedFarmer.farmer_id} onCapture={handleBoundaryCapture} initialPolygon={typeof selectedFarmer.boundary_polygon === 'string' ? JSON.parse(selectedFarmer.boundary_polygon) : selectedFarmer.boundary_polygon} />
                        </div>
                     ) : (
                        <div className="p-10 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl">
                           <p className="text-gray-500">Please select a farmer from the list above to begin farm boundary capture.</p>
                        </div>
                     )}
                  </div>
               )}

               {activeSection === "register_farmer" && (
                  <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl max-w-4xl mx-auto">
                     <div className="text-center mb-8">
                        <FaUserAlt className="text-teal-500 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Farmer Registration Module</h3>
                        <p className="text-gray-500 mt-2 max-w-lg mx-auto">Field operations staff can register new farmers and create their initial Agricultural Identity Number (AIN) here. Once registered, they can be scheduled for a later boundary capture and full verification.</p>
                     </div>
                     <form onSubmit={handleRegisterFarmer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                           <input type="text" name="fname" required value={farmerRegData.fname} onChange={handleFarmerRegChange} className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                           <input type="text" name="lname" required value={farmerRegData.lname} onChange={handleFarmerRegChange} className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                           <input type="email" name="email" value={farmerRegData.email} onChange={handleFarmerRegChange} className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                           <input type="text" name="phone" required value={farmerRegData.phone} onChange={handleFarmerRegChange} className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State / Region *</label>
                           <input type="text" name="state_name" required value={farmerRegData.state_name} onChange={handleFarmerRegChange} className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Password *</label>
                           <input type="password" name="pword" required value={farmerRegData.pword} onChange={handleFarmerRegChange} placeholder="e.g. Farmer123!" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                        <div className="md:col-span-2 mt-4 text-center">
                           <button type="submit" disabled={isRegistering} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50">
                              {isRegistering ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                              {isRegistering ? "Registering..." : "Complete Registration"}
                           </button>
                        </div>
                     </form>
                  </div>
               )}

               {activeSection === "inspections" && (
                  <div className="p-10 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl">
                     <FaCheckCircle className="text-teal-500 text-5xl mx-auto mb-4" />
                     <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Field Inspections Module</h3>
                     <p className="text-gray-500 mt-2">Inspectors can log quality checks and verify standard operating procedures here.</p>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
