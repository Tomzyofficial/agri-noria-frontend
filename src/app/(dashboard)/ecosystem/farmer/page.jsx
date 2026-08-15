"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
   FaSeedling,
   FaWallet,
   FaTractor,
   FaMapMarkerAlt,
   FaCloudSun,
   FaCheckCircle,
   FaExclamationTriangle,
   FaLock,
   FaTimes
} from "react-icons/fa";
import { useFarmerData } from "./useFarmerData";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function FarmerOverview() {
   const { loading, profile, isVerified, wallet, transactions, availablePrograms, enrollingProgramId, handleEnroll, myCluster } = useFarmerData();
   const router = useRouter();
   const [isLocating, setIsLocating] = useState(false);
   const [nearbyClusters, setNearbyClusters] = useState([]);
   const [bannerDismissed, setBannerDismissed] = useState(false);

   useEffect(() => {
      if (!isVerified) {
         const timer = setTimeout(() => {
            setBannerDismissed(true);
         }, 15000);
         return () => clearTimeout(timer);
      }
   }, [isVerified]);

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

         {!isVerified && !bannerDismissed && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-xl animate-in fade-in duration-300">
               <button
                  onClick={() => setBannerDismissed(true)}
                  className="absolute top-4 right-4 p-2 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-full transition-all cursor-pointer z-10"
                  title="Dismiss Notice"
               >
                  <FaTimes size={16} />
               </button>
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pr-6">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0 mt-1">
                        <FaExclamationTriangle size={28} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="inline-block px-3 py-0.5 text-[10px] font-black bg-amber-500 text-white dark:text-gray-950 rounded-full uppercase tracking-wider">
                              Unverified Status
                           </span>
                           <span className="text-xs font-bold text-gray-500 dark:text-gray-400">• Action Required</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2">
                           Complete Farm Mapping to Verify Account
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl leading-relaxed">
                           Your registration basic info is complete, but your farm is currently <strong className="text-amber-600 dark:text-amber-400 font-bold">Unverified</strong>. To unlock cluster enrollment, team participation, input financing, storage, and logistics, please complete your Farm Mapping and verification.
                        </p>
                     </div>
                  </div>
                  <Button
                     onClick={() => router.push("/ecosystem/farmer/onboarding?step=8")}
                     className="w-full md:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 uppercase tracking-wider text-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                     Resume Onboarding & Map Farm →
                  </Button>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Farm Size" value={`${farmSize} Ha`} icon={<FaSeedling size={24} />} color="green" />
            <StatCard label="Commodity" value={profile?.commodity || "—"} icon={<FaCloudSun size={24} />} color="sky" />
            <StatCard label="Wallet Balance" value={`₦${(walletBalance + lockedBalance).toLocaleString()}`} icon={<FaWallet size={24} />} color="amber" subValue={lockedBalance > 0 ? `₦${lockedBalance.toLocaleString()} locked` : null} />
            <StatCard label="Verification Status" value={isVerified ? "Verified" : "Unverified"} icon={isVerified ? <FaCheckCircle size={24} /> : <FaExclamationTriangle size={24} />} color={isVerified ? "emerald" : "amber"} />
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
                           <span className={`px-4 py-1.5 text-[10px] rounded-full font-black uppercase tracking-widest ${isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"}`}>
                              {isVerified ? "Verified" : "Unverified (Map Farm)"}
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
                        {(() => {
                           const activePrograms = availablePrograms.filter((p) => p.status === "active");
                           if (activePrograms.length === 0) {
                              return <p className="text-center py-8 text-gray-500 font-bold italic">No active programs available.</p>;
                           }
                           const PROGRAMS_PER_PAGE = 3;
                           const totalPages = Math.ceil(activePrograms.length / PROGRAMS_PER_PAGE) || 1;
                           const currentPage = Math.min(programPage, totalPages);
                           const paginatedPrograms = activePrograms.slice((currentPage - 1) * PROGRAMS_PER_PAGE, currentPage * PROGRAMS_PER_PAGE);

                           return (
                              <>
                                 {paginatedPrograms.map((prog) => (
                                    <ProgramRow 
                                       key={prog.id} 
                                       prog={prog} 
                                       isEnrolled={profile?.program_id === prog.id} 
                                       canEnroll={!profile?.program_id}
                                       enrolling={enrollingProgramId === prog.id}
                                       onEnroll={() => handleEnroll(prog.id)}
                                       isVerified={isVerified}
                                    />
                                 ))}

                                 {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                       <button
                                          disabled={currentPage === 1}
                                          onClick={() => setProgramPage(p => Math.max(p - 1, 1))}
                                          className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                       >
                                          ← Previous
                                       </button>
                                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                          Page {currentPage} of {totalPages}
                                       </span>
                                       <button
                                          disabled={currentPage === totalPages}
                                          onClick={() => setProgramPage(p => Math.min(p + 1, totalPages))}
                                          className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                       >
                                          Next →
                                       </button>
                                    </div>
                                 )}
                              </>
                           );
                        })()}
                     </div>
                  </CardContent>
               </Card>

               {profile?.program_id && !myCluster && (
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

               {myCluster && (
                  <Card className="border-none shadow-xl bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl overflow-hidden">
                     <CardHeader className="p-8 pb-4 border-b border-emerald-100 dark:border-emerald-900/30">
                        <CardTitle className="text-xl font-black">My Cluster</CardTitle>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">You are currently enrolled in this cluster</p>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm gap-4">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-2xl">
                                 {myCluster.name ? myCluster.name[0].toUpperCase() : 'C'}
                              </div>
                              <div>
                                 <p className="font-black text-xl">{myCluster.name}</p>
                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                    Created on {new Date(myCluster.created_at).toLocaleDateString()}
                                 </p>
                              </div>
                           </div>
                           <div className="flex flex-col items-start sm:items-end gap-1 mt-4 sm:mt-0 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Farmers</span>
                              <span className="text-3xl font-black text-emerald-600">{myCluster.farmer_count || 0}</span>
                           </div>
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

function ProgramRow({ prog, isEnrolled, canEnroll, enrolling, onEnroll, isVerified = true }) {
   return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border transition-all ${isEnrolled ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-lg" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1"} gap-4`}>
         <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isEnrolled ? "bg-emerald-500" : "bg-orange-500"}`}>
               {isEnrolled ? <FaCheckCircle size={24} /> : <FaSeedling size={24} />}
            </div>
            <div>
               <h3 className={`font-black text-lg ${isEnrolled ? "text-emerald-900 dark:text-emerald-300" : "text-gray-900 dark:text-white"}`}>{prog.name}</h3>
               <p className="text-[10px] font-black text-gray-500 mt-1 flex flex-wrap items-center gap-2 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                     <FaMapMarkerAlt className={isEnrolled ? "text-emerald-500" : "text-orange-400"} /> 
                     {prog.region}
                  </span>
                  <span>•</span>
                  <span>{prog.commodity}</span>
                  <span>•</span>
                  <span>{parseFloat(prog.target_hectares || 0).toLocaleString()} HA</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                     ₦{parseFloat(prog.wallet_balance || 0).toLocaleString()} PROGRAM FUND
                  </span>
               </p>
            </div>
         </div>
         <Button
            onClick={() => {
               if (!isVerified) {
                  toast.warning("🔒 Please complete farm mapping & verification first.");
                  return;
               }
               onEnroll();
            }}
            disabled={!canEnroll || enrolling || isEnrolled || !isVerified}
            className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEnrolled ? "bg-emerald-100 text-emerald-600 shadow-none cursor-default" : !isVerified ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-none cursor-not-allowed" : canEnroll ? "bg-orange-600 text-white shadow-xl shadow-orange-500/20 hover:scale-105" : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"}`}
         >
            {isEnrolled ? "Enrolled ✓" : !isVerified ? "🔒 Verify to Enroll" : enrolling ? "Enrolling..." : "Enroll Now"}
         </Button>
      </div>
   );
}
