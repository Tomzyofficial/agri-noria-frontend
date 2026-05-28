"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircle, CheckCircle2, Package, Calculator, Info, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";

const INPUTS = [
   { id: "Mechanical",  ratePerHa: 150000, icon: "🚜", description: "Land preparation & machinery",  unit: "per hectare" },
   { id: "Seeds",       ratePerHa: 45000,  icon: "🌱", description: "High-yield improved variety",    unit: "per hectare" },
   { id: "Fertilizer",  ratePerHa: 65000,  icon: "🧪", description: "NPK and specialized blends",    unit: "per hectare" },
   { id: "Irrigations", ratePerHa: 120000, icon: "💧", description: "Water management systems",      unit: "per hectare" },
   { id: "Pesticides",  ratePerHa: 35000,  icon: "🧴", description: "Crop protection chemicals",     unit: "per hectare" },
   { id: "Herbicides",  ratePerHa: 25000,  icon: "🌿", description: "Weed control solutions",        unit: "per hectare" },
];

const MAX_AMOUNT = 1_000_000;

export default function InputRequestModal({ isOpen, onClose, farmerId = null, clusterId = null, isClusterRequest = false, requestId = null, lockedFunds = null }) {
   const [selected, setSelected] = useState([]);
   const [submitting, setSubmitting] = useState(false);
   const [farmSize, setFarmSize] = useState(1);
   const [loadingSize, setLoadingSize] = useState(true);

   // Fetch actual farm size to show accurate calculation
   useEffect(() => {
      if (!isOpen) return;
      const fetchSize = async () => {
         setLoadingSize(true);
         try {
            if (isClusterRequest && clusterId) {
               const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}`);
               const json = await res.json();
               setFarmSize(parseFloat(json.data?.total_hectares || json.data?.target_hectares || 1));
            } else if (isClusterRequest && requestId) {
               // If we only have requestId, we need to find the cluster size via the request
               const res = await fetch(`/api/proxy/pipeline/inputs/all`);
               const json = await res.json();
               const req = json.data?.find(r => r.id === requestId);
               if (req) setFarmSize(parseFloat(req.total_hectares || req.farm_size_hectares || 1));
            } else {
               const res = await fetch("/api/proxy/pipeline/farmer/profile");
               const json = await res.json();
               setFarmSize(parseFloat(json.data?.farm_size_hectares || 1));
            }
         } catch {
            setFarmSize(1);
         } finally {
            setLoadingSize(false);
         }
      };
      fetchSize();
   }, [isOpen, clusterId, isClusterRequest, requestId]);

   if (!isOpen) return null;

   const toggleItem = (id) => {
      setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };

   // Per-hectare calculation with 1M cap
   const rawTotal = selected.reduce((acc, id) => {
      const item = INPUTS.find(i => i.id === id);
      return acc + (item?.ratePerHa || 0) * farmSize;
   }, 0);
   const totalAmount = Math.min(rawTotal, MAX_AMOUNT);
   const isCapped = rawTotal > MAX_AMOUNT;
   const exceedsBudget = lockedFunds !== null && lockedFunds !== undefined && totalAmount > parseFloat(lockedFunds);

   const handleSubmit = async () => {
      if (selected.length === 0) {
         toast.warning("Please select at least one input");
         return;
      }
      setSubmitting(true);
      try {
         const url = requestId 
            ? `/api/proxy/pipeline/inputs/${requestId}/submit-items`
            : "/api/proxy/pipeline/inputs/request";
         
         const method = requestId ? "PATCH" : "POST";

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               inputItems: selected, // Backend expects inputItems for the patch
               input_items: selected, // and input_items for the post
               requestId,
               farmer_id: farmerId,
               cluster_id: clusterId,
               is_cluster_request: isClusterRequest,
               requester_type: isClusterRequest ? "cluster_manager" : "farmer",
            }),
         });
         const json = await res.json();
         if (json.success) {
            toast.success(requestId ? "✅ Items selected! Ready for distribution." : "✅ Request submitted to Finance!");
            setSelected([]);
            onClose();
         } else {
            // Provide a friendly error message
            const friendlyMsg = json.error || "We couldn't process your request right now. Please check your network or try again later.";
            toast.error(friendlyMsg);
         }
      } catch (err) {
         console.error("Input Request Error:", err);
         toast.error("Oops! Something went wrong on our end. Our team has been notified.");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
         <Card className="w-full max-w-2xl border-none shadow-2xl bg-white dark:bg-gray-950 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                     <Package className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-black text-xl tracking-tight">
                        {requestId ? "Select Approved Inputs" : "Request Agricultural Inputs"}
                     </h3>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        {loadingSize ? "Loading farm data..." : `${farmSize.toFixed(1)} Ha · Auto-calculated at ₦1M max`}
                     </p>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
                  <XCircle className="w-6 h-6" />
               </Button>
            </div>

            <div className="p-6 space-y-5">
                {/* Locked Funds Budget Banner */}
                {lockedFunds !== null && lockedFunds !== undefined && (
                   <div className={`flex items-center justify-between p-4 rounded-xl border ${
                      exceedsBudget 
                         ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30" 
                         : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                   }`}>
                      <div className="flex items-center gap-2">
                         <span className="text-lg">🔒</span>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Available Budget (Locked Funds)</p>
                            <p className={`text-xl font-black ${exceedsBudget ? "text-red-600" : "text-emerald-600"}`}>
                               ₦{parseFloat(lockedFunds).toLocaleString()}
                            </p>
                         </div>
                      </div>
                      {exceedsBudget && (
                         <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full uppercase tracking-widest animate-pulse">
                            Budget Exceeded
                         </span>
                      )}
                   </div>
                )}

               {/* Info banner */}
               <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                     {requestId 
                        ? "Pick the specific inputs to be released under your approved budget. This will notify the delivery partner."
                        : "Amount is auto-calculated based on farm size and selected inputs. Finance will review and authorize the budget."}
                  </p>
               </div>

               {/* Input grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                  {INPUTS.map((item) => {
                     const itemCost = item.ratePerHa * farmSize;
                     const isSelected = selected.includes(item.id);
                     return (
                        <div
                           key={item.id}
                           onClick={() => toggleItem(item.id)}
                           className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                 ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-900/15 shadow-sm shadow-emerald-500/10"
                                 : "border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-gray-900"
                           }`}
                        >
                           <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"
                           }`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                 <div className="flex items-center gap-1.5">
                                    <span className="text-base">{item.icon}</span>
                                    <p className="font-black text-sm">{item.id}</p>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="font-black text-emerald-600 text-sm">₦{Math.min(itemCost, MAX_AMOUNT).toLocaleString()}</p>
                                    <p className="text-[9px] text-gray-400 font-bold">₦{item.ratePerHa.toLocaleString()}/ha</p>
                                 </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* Calculation Summary */}
               <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                     <Calculator className="w-4 h-4 text-gray-400" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculated Package Value</p>
                  </div>

                  {selected.map(id => {
                     const item = INPUTS.find(i => i.id === id);
                     if (!item) return null;
                     return (
                        <div key={id} className="flex justify-between items-center text-sm">
                           <span className="text-gray-600 dark:text-gray-400">{item.icon} {id}</span>
                           <span className="font-bold">₦{(item.ratePerHa * farmSize).toLocaleString()}</span>
                        </div>
                     );
                  })}

                  {selected.length > 0 && <div className="border-t border-gray-200 dark:border-gray-800 pt-2" />}

                  <div className="flex justify-between items-center">
                     <div>
                        <p className="text-sm font-black">Total Selection Value</p>
                        {isCapped && (
                           <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                              <TrendingUp className="w-3 h-3" /> Capped at ₦1,000,000 maximum
                           </p>
                        )}
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                           ₦{selected.length === 0 ? "0" : totalAmount.toLocaleString()}
                        </p>
                        {isCapped && (
                           <p className="text-[9px] text-gray-400 line-through">Raw: ₦{rawTotal.toLocaleString()}</p>
                        )}
                     </div>
                </div>

                {/* Budget exceeded warning */}
                {exceedsBudget && (
                   <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
                      <span className="text-sm">⚠️</span>
                      <p className="text-xs text-red-700 dark:text-red-300 font-bold">
                         Selection exceeds locked funds by ₦{(totalAmount - parseFloat(lockedFunds)).toLocaleString()}. Remove some inputs or request additional funding.
                      </p>
                   </div>
                )}               </div>

               {/* Actions */}
               <div className="flex gap-3">
                  <Button
                     variant="outline"
                     onClick={onClose}
                     className="flex-1 py-6 rounded-2xl font-bold border-gray-200 dark:border-gray-800"
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSubmit}
                     disabled={submitting || selected.length === 0 || loadingSize || exceedsBudget}
                     className={`flex-1 py-6 rounded-2xl font-black transition-all active:scale-95 ${
                        exceedsBudget 
                           ? "bg-red-400 cursor-not-allowed text-white opacity-70" 
                           : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                     }`}
                  >
                     {submitting ? "Processing..." : exceedsBudget ? "⚠ Exceeds Budget" : `Confirm Selection · ₦${totalAmount.toLocaleString()}`}
                  </Button>
               </div>
            </div>
         </Card>
      </div>
   );
}

