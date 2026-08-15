"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTractor, FaSeedling, FaCalendarCheck, FaCamera, FaMapMarkedAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaExternalLinkAlt } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";
import { Button } from "@/components/ui/Button";

export default function MyFarmPage() {
   const { loading, profile, plantingData, isVerified } = useFarmerData();
   const [selectedImage, setSelectedImage] = useState(null);

   if (loading) return (
      <div className="flex items-center justify-center py-32">
         <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
   );

   const rawFarmSize = parseFloat(profile?.farm_size_hectares || 0);
   const farmSizeFormatted = rawFarmSize > 0 ? rawFarmSize.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0";

   return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-12">
         {/* Page Title */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">My Farm</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Track calculated hectares, GIS polygon boundaries, and farm evidence photos
               </p>
            </div>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityStat 
               label="Primary Commodity" 
               value={profile?.commodity || "Maize"} 
               icon={<FaTractor size={24} />} 
               color="blue" 
            />
            <ActivityStat 
               label="Verification Status" 
               value={isVerified ? "Verified" : "Unverified"} 
               icon={isVerified ? <FaCheckCircle size={24} /> : <FaExclamationTriangle size={24} />} 
               color={isVerified ? "emerald" : "orange"} 
            />
         </div>

         {/* Farm Evidence & Uploaded Media Gallery */}
         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-gray-100 dark:border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                     <FaCamera className="text-emerald-500" /> Farm Evidence & GIS Verification Gallery
                  </CardTitle>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                     Uploaded Entrance, Interior Photos & KML Boundary Files
                  </p>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Farm Entrance Photo */}
                  <MediaCard 
                     title="Farm Entrance Photo"
                     category="Entrance Inspection"
                     icon={<FaCamera />}
                     url={profile?.farm_entrance_photo_url}
                     onPreview={() => setSelectedImage(profile?.farm_entrance_photo_url)}
                  />

                  {/* Farm Interior Photo */}
                  <MediaCard 
                     title="Farm Interior Photo"
                     category="Crop & Soil Verification"
                     icon={<FaCamera />}
                     url={profile?.farm_interior_photo_url}
                     onPreview={() => setSelectedImage(profile?.farm_interior_photo_url)}
                  />

                  {/* KML / GeoJSON / Land Title Document */}
                  <MediaCard 
                     title="Boundary File / Land Title"
                     category="KML / GeoJSON / Land Title"
                     icon={<FaMapMarkedAlt />}
                     url={profile?.boundary_file_url || profile?.land_title_url}
                     isFile={true}
                     onPreview={() => setSelectedImage(profile?.boundary_file_url || profile?.land_title_url)}
                  />
               </div>
            </CardContent>
         </Card>

         {/* Planting Tracker Section */}
         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-xl font-black">Planting Tracker</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               {plantingData && plantingData.length > 0 ? (
                  <div className="space-y-6">
                     {plantingData.map((cycle, i) => (
                        <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                                 <FaSeedling size={24} />
                              </div>
                              <div>
                                 <h3 className="text-lg font-black">{cycle.crop_name || profile?.commodity || "Commercial Production"}</h3>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Started: {cycle.start_date ? new Date(cycle.start_date).toLocaleDateString() : "Active"}</p>
                              </div>
                           </div>
                           <div className="flex flex-wrap gap-4 items-center">
                              <span className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest">{cycle.area || farmSizeFormatted} Ha</span>
                              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">{cycle.status || "Active Growth"}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-xs">
                     <FaSeedling size={36} className="mx-auto mb-3 text-emerald-500 opacity-60" />
                     <p className="text-sm font-black text-gray-700 dark:text-gray-300">FARM REGISTERED ({farmSizeFormatted} HECTARES)</p>
                     <p className="mt-1 text-xs text-gray-400 font-normal">No active planting records logged yet. Enrolled program cycles will appear here.</p>
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Fullscreen Image Preview Modal */}
         {selectedImage && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
               <div className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                     <h3 className="font-black text-lg">Farm Verification Document Preview</h3>
                     <button onClick={() => setSelectedImage(null)} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-xs uppercase tracking-widest">Close</button>
                  </div>
                  <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto">
                     {selectedImage.endsWith('.pdf') ? (
                        <iframe src={selectedImage} className="w-full h-[60vh] rounded-2xl" title="Document Preview"></iframe>
                     ) : (
                        <img src={selectedImage} alt="Farm Document Preview" className="max-h-[60vh] w-auto rounded-2xl object-contain shadow-lg" />
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

function MediaCard({ title, category, icon, url, isFile = false, onPreview }) {
   return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col justify-between space-y-4">
         <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                  {icon}
               </div>
               <div>
                  <h4 className="font-black text-base text-gray-900 dark:text-white">{title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</p>
               </div>
            </div>

            {url ? (
               <div className="relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 h-44 group shadow-sm">
                  {url.endsWith('.pdf') ? (
                     <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
                        <FaFileAlt size={40} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">PDF Document</span>
                     </div>
                  ) : (
                     <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button onClick={onPreview} className="px-4 py-2 bg-white text-gray-900 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 uppercase tracking-wider cursor-pointer">
                        <FaExternalLinkAlt size={12} /> View Full
                     </button>
                  </div>
               </div>
            ) : (
               <div className="h-44 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center bg-white/50 dark:bg-gray-950/50">
                  <FaExclamationTriangle className="text-amber-400 mb-2" size={24} />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Not Uploaded Yet</p>
                  <p className="text-[10px] text-gray-400 mt-1">Upload during Farm Mapping Verification</p>
               </div>
            )}
         </div>
      </div>
   );
}

function ActivityStat({ label, value, icon, color }) {
   const colors = {
      emerald: "bg-emerald-500 shadow-emerald-500/20",
      blue: "bg-blue-500 shadow-blue-500/20",
      orange: "bg-orange-500 shadow-orange-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 p-6 flex items-center gap-6 rounded-3xl">
         <div className={`p-4 ${colors[color]} text-white rounded-2xl shadow-lg`}>
            {icon}
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black">{value}</p>
         </div>
      </Card>
   );
}
