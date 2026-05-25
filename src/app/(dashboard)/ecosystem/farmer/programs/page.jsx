"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaSeedling, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";

export default function EnrolledProgramsPage() {
   const { loading, profile } = useFarmerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Programs...</div>;

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Enrolled Programs</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your active agricultural program participation</p>
         </div>

         {profile?.program_id ? (
            <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32" />
               <CardHeader className="p-10 pb-6 border-b border-gray-50 dark:border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                        <FaSeedling size={40} />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-(--foreground)">{profile.program_name}</h2>
                        <div className="flex items-center gap-3 mt-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-green-500" /> {profile.region || "All Regions"}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                           <span>ID: {profile.program_id.slice(0, 12)}</span>
                        </div>
                     </div>
                  </div>
                  <span className="px-6 py-2.5 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-500/20">Active Enrollment</span>
               </CardHeader>
               <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     <ProgramStat label="Commodity" value={profile.commodity || "—"} />
                     <ProgramStat label="Assigned Hectares" value={`${profile.farm_size_hectares || 0} Ha`} />
                     <ProgramStat label="Start Date" value={profile.program_start_date ? new Date(profile.program_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"} />
                     <ProgramStat label="End Date" value={profile.program_end_date ? new Date(profile.program_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"} />
                  </div>

                  <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                     <h3 className="text-lg font-black mb-4">Program Objectives</h3>
                     <p className="text-gray-500 font-medium leading-relaxed">
                        This program aims to boost local productivity through high-quality input financing and modern agronomic training. As an enrolled farmer, you are eligible for the input request cycle and full-season technical support from our field operations team.
                     </p>
                  </div>
               </CardContent>
            </Card>
         ) : (
            <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl p-16 text-center">
               <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FaSeedling className="text-4xl text-gray-300" />
               </div>
               <h3 className="text-2xl font-black mb-2">No Active Enrollment</h3>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">You haven't joined an agricultural program yet</p>
               <a href="/dashboard/farmer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-green-500/20 transition-all hover:scale-105 uppercase tracking-widest text-xs">Explore Available Programs</a>
            </Card>
         )}
      </div>
   );
}

function ProgramStat({ label, value }) {
   return (
      <div className="space-y-2 p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-900 transition-all hover:shadow-lg">
         <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
         <p className="text-xl font-black text-(--foreground) truncate">{value}</p>
      </div>
   );
}
