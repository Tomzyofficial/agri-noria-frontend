"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaGraduationCap, FaPlay, FaCheckCircle, FaLock, FaVideo, FaCalendarAlt } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";
import { LiveVideoSession } from "@/components/agora/LiveVideoSession";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function TrainingCenterPage() {
   const { loading, profile, trainingData, clusterTrainings } = useFarmerData();
   const [activeSession, setActiveSession] = useState(null);
   const [activeVideo, setActiveVideo] = useState(null);

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Curriculum...</div>;

   if (activeSession) {
      return (
         <div className="space-y-6">
            <button 
               onClick={() => setActiveSession(null)}
               className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
               ← Back to Training Center
            </button>
            <LiveVideoSession 
               sessionData={activeSession} 
               onEndSession={() => setActiveSession(null)} 
            />
         </div>
      );
   }

   const modules = trainingData?.modules || [];
   const progress = trainingData?.progress || [];
   const liveSessions = clusterTrainings || [];

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Training Center</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Master modern agricultural practices and earn certifications</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 px-6 py-3 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center gap-3">
               <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                  <FaGraduationCap size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Global Progress</p>
                  <p className="font-black text-lg text-amber-900 dark:text-amber-300">
                     {modules.length > 0 ? Math.round((progress.filter(p => p.status === 'completed').length / modules.length) * 100) : 0}% Complete
                  </p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-4">
               {modules.length > 0 ? (
                  modules.map((mod, i) => {
                     const prog = progress.find((p) => p.module_id === mod.id) || { status: "locked", score: null };
                     return (
                        <ModuleRow 
                           key={mod.id} 
                           index={i} 
                           mod={mod} 
                           prog={prog} 
                           onPlay={() => {
                              if (prog.status !== "locked") {
                                 setActiveVideo(mod);
                              }
                           }}
                        />
                     );
                  })
               ) : (
                  <div className="text-center py-24 bg-white dark:bg-gray-950 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900">
                     <FaGraduationCap className="text-6xl text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                     <h3 className="text-xl font-black mb-2">Curriculum Pending</h3>
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Enroll in a program to unlock your specialized training modules</p>
                  </div>
               )}
            </div>

            <div className="lg:col-span-1 space-y-6">
               <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                     <h3 className="text-xl font-black mb-4">Certifications</h3>
                     <p className="text-sm opacity-80 mb-6">Complete all mandatory modules to download your AgriNoria Farmer Certification.</p>
                     <div className="p-6 bg-white/10 rounded-2xl border border-white/20 text-center">
                        <FaLock className="mx-auto text-2xl mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Locked</p>
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl">
                  <CardHeader className="p-6 pb-2">
                     <CardTitle className="text-lg font-black">Help Center</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     <HelpLink label="Module Navigation" />
                     <HelpLink label="Quiz Requirements" />
                     <HelpLink label="Technical Support" />
                  </CardContent>
               </Card>

               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl">
                  <CardHeader className="p-6 pb-2">
                     <CardTitle className="text-lg font-black flex items-center gap-2">
                        <FaVideo className="text-purple-500" /> Live Sessions
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                     {liveSessions.length === 0 ? (
                        <p className="text-xs text-gray-400 font-medium">No upcoming sessions.</p>
                     ) : (
                        liveSessions.map((session, i) => (
                           <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                              <h4 className="font-bold text-sm mb-1">{session.title}</h4>
                              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                 <FaCalendarAlt /> {new Date(session.scheduled_time || session.scheduled_at).toLocaleString()}
                              </p>
                              <button 
                                 onClick={async () => {
                                    try {
                                       const res = await fetch(`/api/proxy/pipeline/clusters/training/${session.id}/join`, { method: "POST" });
                                       const data = await res.json();
                                       if (res.ok && data.success) {
                                          setActiveSession({
                                             token: data.data.agoraToken,
                                             channelName: data.data.channelName,
                                             appId: data.data.appId,
                                             trainingId: session.id,
                                             isHost: false,
                                             uid: data.data.uid,
                                             trainingTitle: session.title,
                                          });
                                       } else {
                                          toast.error(data.error || "Failed to join session");
                                       }
                                    } catch (e) {
                                       toast.error("Network error");
                                    }
                                 }}
                                 className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-lg text-xs font-bold transition-colors"
                              >
                                 Join Session
                              </button>
                           </div>
                        ))
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>

         {/* Video Library Modal */}
         {activeVideo && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                     <div>
                        <h3 className="text-xl font-black text-(--foreground)">{activeVideo.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{activeVideo.description || "Training Module Video"}</p>
                     </div>
                     <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <FaTimes size={20} />
                     </button>
                  </div>
                  <div className="aspect-video bg-black flex items-center justify-center">
                     {activeVideo.video_url ? (
                        <video controls className="w-full h-full" autoPlay>
                           <source src={activeVideo.video_url} type="video/mp4" />
                           Your browser does not support the video tag.
                        </video>
                     ) : (
                        <div className="text-center text-gray-500 flex flex-col items-center">
                           <FaPlay className="text-4xl mb-4 opacity-50" />
                           <p className="font-bold">Video content not available</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

function ModuleRow({ index, mod, prog, onPlay }) {
   const isCompleted = prog.status === "completed";
   const isLocked = prog.status === "locked";
   const isInProgress = prog.status === "in_progress";

   return (
      <div 
         onClick={onPlay}
         className={`group flex items-center justify-between p-6 bg-white dark:bg-gray-950 rounded-3xl border transition-all ${isLocked ? 'opacity-70 grayscale' : 'hover:shadow-2xl hover:border-green-500/50 hover:-translate-x-1 cursor-pointer shadow-xl'} border-gray-50 dark:border-gray-900`}
      >
         <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${isCompleted ? 'bg-green-500 text-white' : isInProgress ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
               {isCompleted ? <FaCheckCircle /> : index + 1}
            </div>
            <div>
               <h3 className="text-lg font-black text-(--foreground)">{mod.title}</h3>
               <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-500' : isInProgress ? 'text-amber-500' : 'text-gray-400'}`}>
                     {prog.status.replace("_", " ")}
                  </span>
                  {prog.score && (
                     <>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Score: {prog.score}%</span>
                     </>
                  )}
               </div>
            </div>
         </div>
         
         <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-100 text-green-600' : isLocked ? 'bg-gray-100 text-gray-300' : 'bg-amber-600 text-white shadow-lg shadow-amber-500/20 group-hover:scale-110'}`}>
            {isLocked ? <FaLock size={16} /> : <FaPlay size={16} className={isInProgress ? 'ml-1' : ''} />}
         </div>
      </div>
   );
}

function HelpLink({ label }) {
   return (
      <div className="flex items-center justify-between text-sm font-bold text-gray-500 hover:text-green-600 cursor-pointer transition-colors group">
         <span>{label}</span>
         <span className="opacity-0 group-hover:opacity-100 transition-all">→</span>
      </div>
   );
}
