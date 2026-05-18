"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaTruckLoading, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributorDashboard() {
   const [inputs, setInputs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isUpdating, setIsUpdating] = useState(null);

   useEffect(() => {
      fetchInputs();
   }, []);

   const fetchInputs = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/inputs/distributor");
         if (res.ok) {
            const data = await res.json();
            setInputs(data.data || []);
         }
      } catch (err) {
         toast.error("Failed to load inputs");
      } finally {
         setLoading(false);
      }
   };

   const handleUpdateStatus = async (id, status) => {
      setIsUpdating(id);
      try {
         const res = await fetch(`/api/proxy/pipeline/inputs/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
         });
         if (res.ok) {
            toast.success(`Input marked as ${status}`);
            setInputs(prev => prev.map(req => req.id === id ? { ...req, items_status: status } : req));
         } else {
            toast.error("Failed to update status");
         }
      } catch {
         toast.error("Network error");
      } finally {
         setIsUpdating(null);
      }
   };

   return (
      <div className="space-y-8 pb-20 max-w-6xl mx-auto">
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
               <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  Delivery <span className="text-amber-500">Queue</span>
               </h1>
               <p className="text-gray-500 mt-2 font-medium">Manage and track your assigned input distributions.</p>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div></div>
         ) : inputs.length === 0 ? (
            <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FaBoxOpen size={24} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Deliveries Yet</h3>
               <p className="text-gray-500 mt-1">You have no inputs assigned for distribution at the moment.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {inputs.map((req) => (
                  <Card key={req.id} className="border-none shadow-xl shadow-amber-500/5 dark:shadow-none overflow-hidden group bg-white dark:bg-(--card-dark) rounded-2xl relative">
                     <CardContent className="p-0">
                        {/* Status Header */}
                        <div className={`p-4 flex items-center justify-between text-white ${req.items_status === 'delivered' ? 'bg-emerald-500' : req.items_status === 'dispatched' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                           <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                              {req.items_status === 'delivered' ? <FaCheckCircle /> : req.items_status === 'dispatched' ? <FaTruckLoading /> : <FaBoxOpen />}
                              {req.items_status || "Pending Dispatch"}
                           </div>
                           <div className="text-xs font-medium opacity-90">
                              {new Date(req.created_at).toLocaleDateString()}
                           </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                           <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                              <div>
                                 <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {req.farmer_fname} {req.farmer_lname}
                                    {req.is_cluster_request && (
                                       <span className="ml-2 inline-flex items-center text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black align-middle">
                                          Cluster
                                       </span>
                                    )}
                                 </h3>
                                 <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FaMapMarkerAlt className="text-amber-500" /> {req.region || "Unknown Region"}</p>
                              </div>
                              <a href={`tel:${req.farmer_phone}`} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition">
                                 <FaPhoneAlt size={14} />
                              </a>
                           </div>

                           <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                              <div className="col-span-2">
                                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Assigned Materials</p>
                                 <div className="flex flex-wrap gap-1">
                                    {(Array.isArray(req.input_items) ? req.input_items : []).map((it, idx) => (
                                       <span key={idx} className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-[10px] font-bold border border-gray-100 dark:border-gray-700 shadow-sm">
                                          {it}
                                       </span>
                                    ))}
                                    {(req.input_items || []).length === 0 && <span className="text-xs italic text-gray-400">No items listed</span>}
                                 </div>
                              </div>
                              <div className="pt-2">
                                 <p className="text-xs text-gray-500 font-medium uppercase">Value</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-1">₦{parseFloat(req.total_value || req.total_amount || 0).toLocaleString()}</p>
                              </div>
                              <div className="pt-2">
                                 <p className="text-xs text-gray-500 font-medium uppercase">Farm Size</p>
                                 <p className="font-bold text-gray-900 dark:text-white mt-1">{req.farm_size_hectares || 0} Ha</p>
                              </div>
                           </div>

                           {/* Actions */}
                           {req.items_status !== 'delivered' && (
                              <div className="pt-2 flex gap-3">
                                 {req.items_status !== 'dispatched' && (
                                    <Button 
                                       onClick={() => handleUpdateStatus(req.id, 'dispatched')} 
                                       disabled={isUpdating === req.id}
                                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-200 dark:shadow-none"
                                    >
                                       Mark Dispatched
                                    </Button>
                                 )}
                                 <Button 
                                    onClick={() => handleUpdateStatus(req.id, 'delivered')} 
                                    disabled={isUpdating === req.id}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-200 dark:shadow-none"
                                 >
                                    Mark Delivered
                                 </Button>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </div>
   );
}
