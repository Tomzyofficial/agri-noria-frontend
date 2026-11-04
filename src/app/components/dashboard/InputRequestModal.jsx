"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircle, CheckCircle2, Package, Calculator, Info, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const DEFAULT_INPUTS = [
   { id: "Mechanical",  name: "Mechanical",  ratePerHa: 150000, icon: "🚜", description: "Land preparation & machinery",  unit: "per hectare" },
   { id: "Seeds",       name: "Seeds",       ratePerHa: 45000,  icon: "🌱", description: "High-yield improved variety",    unit: "per hectare" },
   { id: "Fertilizer",  name: "Fertilizer",  ratePerHa: 65000,  icon: "🧪", description: "NPK and specialized blends",    unit: "per hectare" },
   { id: "Irrigations", name: "Irrigations", ratePerHa: 120000, icon: "💧", description: "Water management systems",      unit: "per hectare" },
   { id: "Pesticides",  name: "Pesticides",  ratePerHa: 35000,  icon: "🧴", description: "Crop protection chemicals",     unit: "per hectare" },
   { id: "Herbicides",  name: "Herbicides",  ratePerHa: 25000,  icon: "🌿", description: "Weed control solutions",        unit: "per hectare" },
];

const MAX_AMOUNT = 50_000_000; // Realistic cap for large clusters

export default function InputRequestModal({ 
   isOpen, 
   onClose, 
   farmerId = null, 
   clusterId = null, 
   programId = null,
   isClusterRequest = false, 
   requestId = null, 
   lockedFunds = null,
   onSuccess = null
}) {
   const [selected, setSelected] = useState([]);
   const [submitting, setSubmitting] = useState(false);
   const [farmSize, setFarmSize] = useState(1);
   const [loadingSize, setLoadingSize] = useState(true);
   const [catalogInputs, setCatalogInputs] = useState(DEFAULT_INPUTS);
   const [programDetails, setProgramDetails] = useState(null);

   // Fetch actual farm size and dynamically load program-configured inputs & pricing
   useEffect(() => {
      if (!isOpen) return;

      let isMounted = true;
      const fetchModalContext = async () => {
         setLoadingSize(true);
         try {
            let activeProgramId = programId;
            let detectedFarmSize = 1;

            if (isClusterRequest && clusterId) {
               const res = await fetch(`/api/proxy/pipeline/clusters/${clusterId}`);
               const json = await res.json();
               if (json.data) {
                  detectedFarmSize = parseFloat(json.data.total_hectares || json.data.target_hectares || 1);
                  if (!activeProgramId && json.data.program_id) {
                     activeProgramId = json.data.program_id;
                  }
               }
            } else if (isClusterRequest && requestId) {
               const res = await fetch(`/api/proxy/pipeline/inputs/all`);
               const json = await res.json();
               const req = json.data?.find(r => r.id === requestId);
               if (req) {
                  detectedFarmSize = parseFloat(req.total_hectares || req.farm_size_hectares || 1);
                  if (!activeProgramId && req.program_id) {
                     activeProgramId = req.program_id;
                  }
               }
            } else {
               const res = await fetch("/api/proxy/pipeline/farmer/profile");
               const json = await res.json();
               if (json.data) {
                  detectedFarmSize = parseFloat(json.data.farm_size_hectares || 1);
                  if (!activeProgramId && json.data.program_id) {
                     activeProgramId = json.data.program_id;
                  }
               }
            }

            if (isMounted) {
               setFarmSize(detectedFarmSize > 0 ? detectedFarmSize : 1);
            }

            // Fetch dynamic program configuration for custom inputs and rates
            if (activeProgramId) {
               try {
                  const progRes = await fetch(`/api/proxy/programs/${activeProgramId}`);
                  const progJson = await progRes.json();
                  const prog = progJson.data || progJson;
                  if (isMounted && prog) {
                     setProgramDetails(prog);
                     const customInputs = prog.configuration?.financing?.eligible_inputs;
                     if (Array.isArray(customInputs) && customInputs.length > 0) {
                        // Only show inputs that are enabled in this program
                        const activeCatalog = customInputs
                           .filter(i => i.enabled !== false)
                           .map(i => ({
                              id: i.name || i.id,
                              name: i.name || i.id,
                              ratePerHa: parseFloat(i.ratePerHa) || 0,
                              icon: i.icon || "📦",
                              description: i.description || "Program input package",
                              unit: i.unit || "per hectare"
                           }));
                        if (activeCatalog.length > 0) {
                           setCatalogInputs(activeCatalog);
                        } else {
                           setCatalogInputs(DEFAULT_INPUTS);
                        }
                     } else {
                        setCatalogInputs(DEFAULT_INPUTS);
                     }
                  }
               } catch (progErr) {
                  console.warn("Could not fetch program configuration:", progErr);
                  if (isMounted) setCatalogInputs(DEFAULT_INPUTS);
               }
            } else {
               if (isMounted) setCatalogInputs(DEFAULT_INPUTS);
            }
         } catch (err) {
            console.warn("Error fetching modal context:", err);
            if (isMounted) {
               setFarmSize(1);
               setCatalogInputs(DEFAULT_INPUTS);
            }
         } finally {
            if (isMounted) setLoadingSize(false);
         }
      };

      fetchModalContext();

      return () => {
         isMounted = false;
      };
   }, [isOpen, clusterId, isClusterRequest, requestId, programId]);

   if (!isOpen) return null;

   const toggleItem = (id) => {
      if (submitting) return;
      setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };

   // Per-hectare calculation
   const rawTotal = selected.reduce((acc, id) => {
      const item = catalogInputs.find(i => i.id === id || i.name === id);
      return acc + (item?.ratePerHa || 0) * farmSize;
   }, 0);
   const totalAmount = rawTotal;
   const exceedsBudget = lockedFunds !== null && lockedFunds !== undefined && parseFloat(lockedFunds) > 0 && totalAmount > parseFloat(lockedFunds);

   const handleSubmit = async () => {
      if (selected.length === 0) {
         toast.warning("Please select at least one input package to proceed");
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
               inputItems: selected,
               input_items: selected,
               requestId,
               farmer_id: farmerId,
               cluster_id: clusterId,
               is_cluster_request: isClusterRequest,
               requester_type: isClusterRequest ? "cluster_manager" : "farmer",
            }),
         });
         const json = await res.json();
         if (json.success) {
            toast.success(requestId ? "✅ Input selection confirmed and queued for distributor dispatch!" : "✅ Request submitted to Finance!");
            setSelected([]);
            if (onSuccess) onSuccess();
            onClose();
         } else {
            const friendlyMsg = json.error || "We couldn't process your request right now. Please check your network or try again later.";
            toast.error(friendlyMsg);
         }
      } catch (err) {
         console.error("Input Request Error:", err);
         toast.error("Network communication error. Please try again.");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
         <Card className="w-full max-w-2xl max-h-[88vh] flex flex-col border-none shadow-2xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 1. Header (Sticky Top) */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl shrink-0">
                     <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                     <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                        {requestId ? "Select Approved Input Packages" : "Request Agricultural Inputs"}
                     </h3>
                     <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 truncate">
                        {loadingSize ? (
                           <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                              Loading program rates...
                           </span>
                        ) : (
                           `${farmSize.toFixed(2)} Farmland Hectares · ${programDetails?.name || 'Program Catalog'}`
                        )}
                     </p>
                  </div>
               </div>
               <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={submitting}
                  className="rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
               >
                  <XCircle className="w-6 h-6" />
               </button>
            </div>

            {/* 2. Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
               {/* Locked Funds Budget Banner */}
               {lockedFunds !== null && lockedFunds !== undefined && parseFloat(lockedFunds) > 0 && (
                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                     exceedsBudget 
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40" 
                        : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  }`}>
                     <div className="flex items-center gap-2.5">
                        <span className="text-xl">💰</span>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Finance Authorized Budget (Locked Funds)
                           </p>
                           <p className={`text-xl font-black ${exceedsBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                              ₦{parseFloat(lockedFunds).toLocaleString()}
                           </p>
                        </div>
                     </div>
                     {exceedsBudget && (
                        <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                           Budget Exceeded
                        </span>
                     )}
                  </div>
               )}

               {/* Information Banner */}
               <div className="flex items-start gap-3 p-3.5 bg-blue-50/80 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                     {requestId 
                        ? "Select the input categories to be supplied under your authorized financing budget. Once confirmed, delivery will be scheduled with accredited distributors."
                        : "Inputs are auto-priced using the director's configured program package rates. Finance will authorize the budget allocation."}
                  </p>
               </div>

               {/* Input Catalog Grid */}
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                     Available Input Packages ({catalogInputs.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {catalogInputs.map((item) => {
                        const itemCost = item.ratePerHa * farmSize;
                        const isSelected = selected.includes(item.id);
                        return (
                           <div
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                                 submitting ? "opacity-60 pointer-events-none" : ""
                              } ${
                                 isSelected
                                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs shadow-emerald-500/10"
                                    : "border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 bg-white dark:bg-gray-900"
                              }`}
                           >
                              <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                 isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"
                              }`}>
                                 {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                       <span className="text-lg shrink-0">{item.icon}</span>
                                       <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">
                                          {item.name || item.id}
                                       </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                       <p className="font-black text-emerald-600 text-sm">
                                          ₦{Math.round(itemCost).toLocaleString()}
                                       </p>
                                       <p className="text-[9px] text-gray-400 font-bold">
                                          ₦{item.ratePerHa.toLocaleString()}/Ha
                                       </p>
                                    </div>
                                 </div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-tight">
                                    {item.description}
                                 </p>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Calculation Breakdown */}
               <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-3 border border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 mb-1">
                     <Calculator className="w-4 h-4 text-gray-400" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Package Valuation Breakdown ({selected.length} items)
                     </p>
                  </div>

                  {selected.map(id => {
                     const item = catalogInputs.find(i => i.id === id || i.name === id);
                     if (!item) return null;
                     return (
                        <div key={id} className="flex justify-between items-center text-xs sm:text-sm">
                           <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                              <span>{item.icon}</span>
                              <span className="font-semibold">{item.name || id}</span>
                           </span>
                           <span className="font-bold text-slate-900 dark:text-white">
                              ₦{Math.round(item.ratePerHa * farmSize).toLocaleString()}
                           </span>
                        </div>
                     );
                  })}

                  {selected.length > 0 && <div className="border-t border-gray-200 dark:border-gray-800 pt-2" />}

                  <div className="flex justify-between items-center">
                     <div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">Total Selection Value</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                           Calculated for {farmSize.toFixed(2)} Hectares
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                           ₦{selected.length === 0 ? "0" : Math.round(totalAmount).toLocaleString()}
                        </p>
                     </div>
                  </div>

                  {/* Budget exceeded warning */}
                  {exceedsBudget && (
                     <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800/40">
                        <span className="text-sm">⚠️</span>
                        <p className="text-xs text-red-700 dark:text-red-300 font-bold">
                           Selection exceeds locked funds by ₦{Math.round(totalAmount - parseFloat(lockedFunds)).toLocaleString()}. Remove some inputs or contact finance.
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* 3. Sticky Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-900/90 shrink-0">
               <div className="flex gap-3">
                  <Button
                     variant="outline"
                     onClick={onClose}
                     disabled={submitting}
                     className="flex-1 py-3 sm:py-3.5 rounded-xl font-bold border-gray-200 dark:border-gray-800 cursor-pointer"
                  >
                     Cancel
                  </Button>
                  <Button
                     onClick={handleSubmit}
                     disabled={submitting || selected.length === 0 || loadingSize || exceedsBudget}
                     className={`flex-1 py-3 sm:py-3.5 rounded-xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                        exceedsBudget 
                           ? "bg-red-400 cursor-not-allowed text-white opacity-70" 
                           : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                     }`}
                  >
                     {submitting ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin text-white" />
                           <span>Confirming Selection...</span>
                        </>
                     ) : exceedsBudget ? (
                        "⚠ Exceeds Budget"
                     ) : (
                        `Confirm Selection · ₦${Math.round(totalAmount).toLocaleString()}`
                     )}
                  </Button>
               </div>
            </div>
         </Card>
      </div>
   );
}
