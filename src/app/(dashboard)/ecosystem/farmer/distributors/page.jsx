"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTruck, FaPhone, FaMapMarkerAlt, FaEnvelope, FaSearch, FaFilter, FaStar, FaTimes, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributorsPage() {
   const [distributors, setDistributors] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   useEffect(() => {
      const fetchDistributors = async () => {
         try {
            const res = await fetch("/api/proxy/pipeline/distributors");
            if (res.ok) {
               const data = await res.json();
               setDistributors(data.data || []);
            }
         } catch (error) {
            toast.error("Failed to fetch distributors");
         } finally {
            setLoading(false);
         }
      };
      fetchDistributors();
   }, []);

   const filteredDistributors = distributors.filter(d => 
      d.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Distributors...</div>;

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Distributors Network</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Direct access to verified agricultural input providers</p>
            </div>
         </div>

         <div className="flex gap-4 p-6 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
            <div className="flex-grow relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
               <input 
                  type="text" 
                  placeholder="Search by company name or location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-4 rounded-2xl font-bold focus:ring-2 focus:ring-green-500" 
               />
            </div>
            <button className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors">
               <FaFilter /> Filters
            </button>
         </div>

         {filteredDistributors.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No distributors found</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredDistributors.map((dist) => (
                  <DistributorCard key={dist.id} distributor={dist} />
               ))}
            </div>
         )}
      </div>
   );
}

function DistributorCard({ distributor }) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const displayName = distributor.company_name || distributor.business_name || distributor.name || "Verified Distributor";
   const displayLocation = distributor.location || distributor.address || "Location not specified";
   const displayEmail = distributor.email || "N/A";
   const displayPhone = distributor.hot_line_phone_number || distributor.phone || "N/A";
   const displayCategory = distributor.business_desc || "General Agricultural Inputs";

   return (
      <>
         <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 flex items-center justify-center relative">
               <FaTruck className="text-5xl text-emerald-600 dark:text-emerald-500 opacity-50" />
               <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-500 shadow-sm">
                  <FaStar /> 5.0
               </span>
            </div>
            <CardContent className="p-6">
               <h3 className="text-xl font-black mb-1 truncate">{displayName}</h3>
               <p className="text-xs font-bold text-emerald-600 truncate mt-1 flex items-center gap-1.5">
                  <FaBoxOpen className="shrink-0" /> {displayCategory}
               </p>
               
               <div className="space-y-3 mt-5">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                     <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                        <FaMapMarkerAlt className="text-emerald-600" />
                     </div>
                     <span className="truncate font-medium">{displayLocation}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                     <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                        <FaPhone className="text-blue-500" />
                     </div>
                     <span className="font-medium">{displayPhone}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                     <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                        <FaEnvelope className="text-amber-500" />
                     </div>
                     <span className="truncate font-medium">{displayEmail}</span>
                  </div>
               </div>

               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
               >
                  View Full Details
               </button>
            </CardContent>
         </Card>

         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
               <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="relative h-32 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/20 flex items-center justify-center">
                     <FaTruck className="text-6xl text-emerald-600 dark:text-emerald-500 opacity-50" />
                     <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full flex items-center justify-center transition-colors"
                     >
                        <FaTimes />
                     </button>
                  </div>
                  <div className="p-8">
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-black">{displayName}</h2>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                           <FaStar /> 5.0
                        </span>
                     </div>
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-8">Verified Distributor Partner</p>

                     <div className="space-y-6">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deals In / Category</p>
                           <div className="flex items-center gap-3 font-bold bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                              <FaBoxOpen className="text-emerald-600 text-lg shrink-0" />
                              <span>{displayCategory}</span>
                           </div>
                        </div>

                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact Person</p>
                           <p className="font-bold">{distributor.name || `${distributor.fname || ""} ${distributor.lname || ""}`.trim() || "N/A"}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</p>
                              <div className="flex items-center gap-2 font-bold bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                 <FaPhone className="text-blue-500" />
                                 {displayPhone}
                              </div>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
                              <div className="flex items-center gap-2 font-bold bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 truncate" title={displayEmail}>
                                 <FaEnvelope className="text-amber-500 shrink-0" />
                                 <span className="truncate">{displayEmail}</span>
                              </div>
                           </div>
                        </div>

                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business Address / Location</p>
                           <div className="flex items-center gap-3 font-bold bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                              <FaMapMarkerAlt className="text-emerald-500 text-xl" />
                              {displayLocation}
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button 
                           onClick={() => setIsModalOpen(false)}
                           className="px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                        >
                           Close Window
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
}
