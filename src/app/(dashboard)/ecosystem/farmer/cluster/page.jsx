"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaUserTie, FaPhone, FaSeedling } from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";

export default function MyClusterPage() {
   const [cluster, setCluster] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
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

      fetchMyCluster();
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
         </div>
      );
   }

   if (!cluster) {
      return (
         <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
               <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FaUsers className="text-4xl text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">No Cluster Joined Yet</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                     You are not currently assigned to any farming cluster. 
                     Clusters help you collaborate with other farmers, receive supervision, and access shared resources.
                  </p>
                  <Link 
                     href="/ecosystem/farmer/programs" 
                     className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                  >
                     Explore Programs
                  </Link>
               </CardContent>
            </Card>
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

            <Card className="border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 rounded-3xl overflow-hidden min-h-[360px]">
               <CardContent className="p-6 sm:p-8 lg:p-10 h-full flex flex-col">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mb-8">
                     <FaUserTie className="text-xl text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">Cluster Supervisor</h3>
                  <p className="text-2xl font-black mb-8 break-words">
                     {cluster.supervisor_fname} {cluster.supervisor_lname}
                  </p>

                  <div className="space-y-4 mt-auto">
                     <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur p-5 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                           <FaPhone className="text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone</p>
                           <p className="font-bold break-words">{cluster.supervisor_phone || "N/A"}</p>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
