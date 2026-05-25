"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
   FaSeedling,
   FaWallet,
   FaTractor,
   FaMapMarkerAlt,
   FaCloudSun,
   FaCheckCircle
} from "react-icons/fa";
import { useFarmerData } from "./useFarmerData";
import { useState } from "react";
import { toast } from "react-toastify";

export default function FarmerOverview() {
   const { loading, profile, wallet, transactions, availablePrograms, enrollingProgramId, handleEnroll, myCluster } = useFarmerData();
   const [isLocating, setIsLocating] = useState(false);
   const [nearbyClusters, setNearbyClusters] = useState([]);

   if (loading) return (
      <div className="flex items-center justify-center py-32">
         <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
   );

   const walletBalance = wallet ? parseFloat(wallet.balance || 0) : 0;
   const lockedBalance = wallet ? parseFloat(wallet.locked_balance || 0) : 0;
   const farmSize = profile?.farm_size_hectares || 0;

   const findNearbyClusters = () => {
      setIsLocating(true);
      if (!navigator.geolocation) {
         toast.error("Geolocation not supported");
         setIsLocating(false);
         return;
      }
      navigator.geolocation.getCurrentPosition(
         async (pos) => {
            try {
               const res = await fetch(
                  `/api/proxy/pipeline/clusters/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`,
               );
               if (res.ok) {
                  const d = await res.json();
                  setNearbyClusters(d.data || []);
                  if (d.data?.length === 0) toast.info("No clusters found nearby");
               }
            } catch (err) {
               toast.error("Failed to find clusters");
            } finally {
               setIsLocating(false);
            }
         },
         (err) => {
            toast.error("Location access denied");
            setIsLocating(false);
         },
      );
   };

   const handleJoinCluster = async (clusterId) => {
      try {
         const res = await fetch("/api/proxy/pipeline/clusters/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cluster_id: clusterId, farmer_id: profile.id }),
         });
         const d = await res.json();
         if (res.ok) {
            toast.success("Successfully joined cluster!");
            window.location.reload();
         } else {
            toast.error(d.error || "Failed to join cluster");
         }
      } catch (err) {
         toast.error("Network error");
      }
   };

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Farmer Dashboard</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Monitor your farm, training, wallet, and marketplace activity.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Farm Size" value={`${farmSize} Ha`} icon={<FaSeedling size={24} />} color="green" />
            <StatCard label="Commodity" value={profile?.commodity || "—"} icon={<FaCloudSun size={24} />} color="sky" />
            <StatCard label="Wallet Balance" value={`₦${(walletBalance + lockedBalance).toLocaleString()}`} icon={<FaWallet size={24} />} color="amber" subValue={lockedBalance > 0 ? `₦${lockedBalance.toLocaleString()} locked` : null} />
            <StatCard label="Status" value={profile?.onboarding_status === "completed" ? "Active" : "Pending"} icon={<FaTractor size={24} />} color="emerald" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  <CardHeader className="p-8 pb-4">
                     <CardTitle className="text-xl font-black">Profile Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                     <div className="space-y-4">
                        <ProfileItem label="Program" value={profile?.program_name || "Not assigned"} />
                        <ProfileItem label="Commodity" value={profile?.commodity || "—"} />
                        <ProfileItem label="Farm Size" value={`${parseFloat(farmSize).toLocaleString()} Hectares`} />
                        <ProfileItem label="Experience" value={profile?.experience_level || "—"} />
                        <div className="flex justify-between items-center pt-4">
                           <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Status</span>
                           <span className={`px-4 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest ${profile ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-gray-100 text-gray-500"}`}>
                              {profile ? "Active" : "Not Onboarded"}
                           </span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
                  <CardHeader className="p-8 pb-4 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-black">Agricultural Programs</CardTitle>
                     {!profile?.program_id && <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">Action Required</span>}
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="space-y-4">
                        {availablePrograms.filter((p) => p.status === "active").length === 0 ? (
                           <p className="text-center py-8 text-gray-500 font-bold italic">No active programs available.</p>
                        ) : (
                           availablePrograms
                              .filter((p) => p.status === "active")
                              .map((prog) => (
                                 <ProgramRow 
                                    key={prog.id} 
                                    prog={prog} 
                                    isEnrolled={profile?.program_id === prog.id} 
                                    canEnroll={!profile?.program_id}
                                    enrolling={enrollingProgramId === prog.id}
                                    onEnroll={() => handleEnroll(prog.id)}
                                 />
                              ))
                        )}
                     </div>
                  </CardContent>
               </Card>

               {profile?.program_id && !profile.cluster_id && (
                  <Card className="border-none shadow-xl bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl overflow-hidden">
                     <CardHeader className="p-8 pb-4 border-b border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                           <CardTitle className="text-xl font-black">Local Clusters</CardTitle>
                           <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Discover and join agricultural clusters nearby.</p>
                        </div>
                        <Button
                           onClick={findNearbyClusters}
                           disabled={isLocating}
                           className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 py-4 shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest"
                        >
                           {isLocating ? "Scanning..." : "Find Nearby"}
                        </Button>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="space-y-4">
                           {nearbyClusters.length > 0 ? (
                              nearbyClusters.map((cluster) => (
                                 <div key={cluster.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm gap-4 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl">C</div>
                                       <div>
                                          <p className="font-black text-lg">{cluster.name}</p>
                                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                                             <FaMapMarkerAlt className="text-blue-500" />
                                             {Math.round(cluster.distance * 1.609).toLocaleString()} KM AWAY • {cluster.region}
                                          </p>
                                       </div>
                                    </div>
                                    <Button onClick={() => handleJoinCluster(cluster.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl px-8 py-4 shadow-lg shadow-emerald-500/20 uppercase tracking-wider text-xs">Join Cluster</Button>
                                 </div>
                              ))
                           ) : (
                              <div className="text-center py-10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl">
                                 <FaMapMarkerAlt className="text-blue-300 dark:text-blue-700 mx-auto text-4xl mb-3" />
                                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Scan to find nearby clusters</p>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
      </div>
   );
}

function StatCard({ label, value, icon, color, subValue }) {
   const colors = {
      green: "bg-green-500 shadow-green-500/20",
      sky: "bg-sky-500 shadow-sky-500/20",
      amber: "bg-amber-500 shadow-amber-500/20",
      emerald: "bg-emerald-500 shadow-emerald-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
         <CardContent className="p-6 flex items-center gap-6">
            <div className={`p-4 ${colors[color]} text-white rounded-3xl shadow-lg`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
               <p className="text-2xl font-black text-(--foreground) tracking-tighter">{value}</p>
               {subValue && <p className="text-[10px] font-bold text-gray-400 mt-1">{subValue}</p>}
            </div>
         </CardContent>
      </Card>
   );
}

function ProfileItem({ label, value }) {
   return (
      <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-gray-900 last:border-0 gap-4">
         <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest shrink-0">{label}</span>
         <span className="font-black text-(--foreground) text-sm text-right truncate" title={value}>{value}</span>
      </div>
   );
}

function ProgramRow({ prog, isEnrolled, canEnroll, enrolling, onEnroll }) {
   return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border transition-all ${isEnrolled ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-lg" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1"} gap-4`}>
         <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isEnrolled ? "bg-emerald-500" : "bg-orange-500"}`}>
               {isEnrolled ? <FaCheckCircle size={24} /> : <FaSeedling size={24} />}
            </div>
            <div>
               <h3 className={`font-black text-lg ${isEnrolled ? "text-emerald-900 dark:text-emerald-300" : "text-gray-900 dark:text-white"}`}>{prog.name}</h3>
               <p className="text-[10px] font-black text-gray-500 mt-1 flex items-center gap-2 uppercase tracking-widest">
                  <FaMapMarkerAlt className={isEnrolled ? "text-emerald-500" : "text-orange-400"} /> 
                  {prog.region} • {prog.commodity} • {parseFloat(prog.target_hectares || 0).toLocaleString()} HA
               </p>
            </div>
         </div>
         <Button
            onClick={onEnroll}
            disabled={!canEnroll || enrolling || isEnrolled}
            className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEnrolled ? "bg-emerald-100 text-emerald-600 shadow-none cursor-default" : canEnroll ? "bg-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-105" : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"}`}
         >
            {isEnrolled ? "Enrolled ✓" : enrolling ? "Enrolling..." : "Enroll Now"}
         </Button>
      </div>
   );
}
