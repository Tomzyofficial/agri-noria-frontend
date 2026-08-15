"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaUserTie, FaPhone, FaSeedling, FaPlusCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";
import ClusterChat from "../../components/ClusterChat";

export default function MyClusterPage() {
   const [cluster, setCluster] = useState(null);
   const [loading, setLoading] = useState(true);
   const [exploringClusters, setExploringClusters] = useState(false);
   const [clustersList, setClustersList] = useState([]);
   const [loadingClusters, setLoadingClusters] = useState(false);
   const [joiningId, setJoiningId] = useState(null);

   const fetchMyCluster = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/clusters/mine");
         const data = await res.json();
         if (data.success) {
            setCluster(data.data);
         } else {
            toast.error(data.error || "Failed to load cluster details");
         }
      } catch (error) {
         console.error("Error loading cluster", error);
         toast.error("Failed to load cluster");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchMyCluster();
   }, []);

   const fetchAllClusters = async () => {
      setLoadingClusters(true);
      setExploringClusters(true);
      try {
         const res = await fetch("/api/proxy/pipeline/clusters");
         const data = await res.json();
         if (data.success) {
            setClustersList(data.data || []);
         } else {
            toast.error(data.error || "Failed to fetch clusters");
         }
      } catch (error) {
         console.error("Error fetching clusters", error);
         toast.error("Failed to fetch clusters list");
      } finally {
         setLoadingClusters(false);
      }
   };

   const handleJoinCluster = async (clusterId) => {
      setJoiningId(clusterId);
      try {
         const res = await fetch("/api/proxy/pipeline/clusters/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cluster_id: clusterId }),
         });
         const data = await res.json();
         if (res.ok && data.success) {
            toast.success("Successfully joined cluster!");
            setExploringClusters(false);
            setLoading(true);
            await fetchMyCluster();
         } else {
            toast.error(data.error || "Failed to join cluster");
         }
      } catch (error) {
         console.error("Error joining cluster", error);
         toast.error("Network error joining cluster");
      } finally {
         setJoiningId(null);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
         </div>
      );
   }

   if (!cluster) {
      return (
         <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
               <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FaUsers className="text-4xl" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">No Cluster Joined Yet</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                     You are not currently assigned to any farming cluster. 
                     Clusters help you collaborate with other farmers, receive supervision, and access shared resources.
                  </p>
                  {!exploringClusters ? (
                     <button 
                        onClick={fetchAllClusters}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-green-500/20 uppercase tracking-widest text-xs cursor-pointer"
                     >
                        Explore Clusters
                     </button>
                  ) : (
                     <button 
                        onClick={() => setExploringClusters(false)}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider"
                     >
                        Close List
                     </button>
                  )}
               </CardContent>
            </Card>

            {exploringClusters && (
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black">Available Farming Clusters</h3>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{clustersList.length} Clusters Found</span>
                  </div>

                  {loadingClusters ? (
                     <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                        Loading Available Clusters...
                     </div>
                  ) : clustersList.length === 0 ? (
                     <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-xs">
                        No clusters available in the system currently.
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {clustersList.map((c) => (
                           <Card key={c.id} className="border-none shadow-lg bg-white dark:bg-gray-950 rounded-3xl p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800">
                              <div className="flex items-start justify-between gap-4">
                                 <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                                       <FaUsers size={24} />
                                    </div>
                                    <div>
                                       <h4 className="font-black text-xl text-gray-900 dark:text-white">{c.name}</h4>
                                       <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                                          <FaMapMarkerAlt className="text-green-500" /> {c.region || "General Region"}
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Farmers</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{c.farmer_count || 0}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Hectares</p>
                                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{c.total_hectares || 0} Ha</p>
                                 </div>
                              </div>

                              <button
                                 disabled={joiningId === c.id}
                                 onClick={() => handleJoinCluster(c.id)}
                                 className="w-full mt-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-lg shadow-green-500/20 uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                 {joiningId === c.id ? "Joining..." : "Join Cluster"}
                              </button>
                           </Card>
                        ))}
                     </div>
                  )}
               </div>
            )}
         </div>
      );
   }

   const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
         const date = new Date(dateString);
         if (Number.isNaN(date.getTime())) return dateString;

         const day = date.getDate();
         const suffix = day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
              ? "nd"
              : day % 10 === 3 && day !== 13
                ? "rd"
                : "th";
         const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
         const year = date.getFullYear();

         return `${month} ${day}${suffix}, ${year}`;
      } catch (e) {
         return dateString;
      }
   };

   return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">My Cluster</h1>
               <p className="text-sm font-medium text-gray-500 mt-1">
                  View details about your assigned farming cluster and supervisor
               </p>
            </div>
            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               {cluster.status === "active" ? "Active Cluster" : cluster.status || "Unknown Status"}
            </span>
         </div>

         <div className="grid xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.95fr)] gap-6 items-stretch">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden relative min-h-[360px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               <CardContent className="p-6 sm:p-8 lg:p-10 relative h-full flex flex-col">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                     <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                        <FaUsers className="text-3xl text-white" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <h2 className="text-3xl lg:text-4xl font-black mb-3 break-words">{cluster.name}</h2>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm font-medium text-gray-600 dark:text-gray-400 max-w-3xl">
                           <div className="flex items-center gap-2 min-w-0">
                              <FaMapMarkerAlt className="text-green-500" />
                              <span className="truncate">{cluster.region || "Region not specified"}</span>
                           </div>
                           <div className="flex items-center gap-2 min-w-0">
                              <FaCalendarAlt className="text-blue-500" />
                              <span>Created: {formatDate(cluster.created_at)}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5 mt-10 flex-1">
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-6 lg:p-7 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[150px]">
                        <div className="flex items-center gap-4 mb-5">
                           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                              <FaUsers className="text-lg" />
                           </div>
                           <p className="text-xs font-black uppercase tracking-widest text-gray-500 leading-relaxed">Total Farmers</p>
                        </div>
                        <p className="text-4xl font-black">{cluster.farmer_count || 0}</p>
                     </div>
                     
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-6 lg:p-7 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[150px]">
                        <div className="flex items-center gap-4 mb-5">
                           <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                              <FaSeedling className="text-lg" />
                           </div>
                           <p className="text-xs font-black uppercase tracking-widest text-gray-500 leading-relaxed">Total Hectares</p>
                        </div>
                        <p className="text-4xl font-black">{cluster.total_hectares || 0} <span className="text-sm text-gray-500 font-medium">ha</span></p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl p-6 sm:p-8">
                  <h3 className="text-xl font-black mb-6">Cluster Supervisor</h3>
                  {cluster.supervisor_name ? (
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
                              <FaUserTie size={20} />
                           </div>
                           <div>
                              <p className="font-black text-lg">{cluster.supervisor_name}</p>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Supervisor</p>
                           </div>
                        </div>
                        {cluster.supervisor_phone && (
                           <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
                              <FaPhone className="text-green-500" />
                              <span>{cluster.supervisor_phone}</span>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="text-center py-6 italic text-gray-400 font-bold text-xs uppercase tracking-wider">
                        No supervisor assigned to this cluster yet.
                     </div>
                  )}
               </Card>

               <ClusterChat clusterId={cluster.id} />
            </div>
         </div>
      </div>
   );
}
