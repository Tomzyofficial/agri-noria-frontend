"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Truck, 
  Warehouse, 
  MapPin, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  Navigation, 
  Clock, 
  Box, 
  ChevronRight,
  Gauge
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export function HarvestRequestModals({
  isOpen,
  type, // "logistics" | "storage"
  batch, // batch object with batch_id, batch_number, crop, quantity_mt, location
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, detecting: false });

  // Logistics selection state
  const [selectedLogistics, setSelectedLogistics] = useState({
    provider_id: null,
    vehicle_id: null,
    vehicle_title: "",
    base_amount: 35000,
    rate_amount: 120,
    distance_km: null,
    destination: "Designated Warehouse / Buyer Facility"
  });

  // Storage selection state
  const [selectedStorage, setSelectedStorage] = useState({
    warehouse_id: null,
    facility_id: null,
    facility_name: "",
    price_per_mt_month: 1200,
    start_date: new Date().toISOString().split("T")[0],
    duration_days: 30,
    distance_km: null
  });

  // Geolocation lookup
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setUserLocation(prev => ({ ...prev, detecting: true }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            detecting: false
          });
        },
        () => {
          setUserLocation(prev => ({ ...prev, detecting: false }));
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Fetch providers
  useEffect(() => {
    if (!isOpen || !type) return;
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (userLocation.lat && userLocation.lng) {
          queryParams.set("lat", userLocation.lat);
          queryParams.set("lng", userLocation.lng);
        }
        if (batch?.location) {
          queryParams.set("origin_location", batch.location);
        }
        if (batch?.quantity_mt) {
          queryParams.set("batch_quantity", batch.quantity_mt);
        }
        if (batch?.crop) {
          queryParams.set("batch_crop", batch.crop);
        }

        const res = await fetch(`/api/proxy/vendor/commodity-operations/providers/${type}?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProviders(data.data || []);

          // Pre-select first valid option
          if (type === "logistics" && data.data?.length > 0) {
            const firstProv = data.data[0];
            const firstVeh = firstProv.vehicles?.[0];
            if (firstVeh) {
              setSelectedLogistics(prev => ({
                ...prev,
                provider_id: firstProv.id,
                vehicle_id: firstVeh.vehicle_id || firstVeh.id,
                vehicle_title: firstVeh.title,
                base_amount: firstVeh.base_amount || 35000,
                rate_amount: firstVeh.rate_amount || 120,
                distance_km: firstVeh.distance_km || firstProv.distance_km
              }));
            }
          } else if (type === "storage" && data.data?.length > 0) {
            const firstFac = data.data[0];
            setSelectedStorage(prev => ({
              ...prev,
              warehouse_id: firstFac.warehouse_id || firstFac.vendor_id || firstFac.id,
              facility_id: firstFac.facility_id || firstFac.id,
              facility_name: firstFac.facility_name,
              price_per_mt_month: firstFac.price_per_mt_month || 1200,
              distance_km: firstFac.distance_km
            }));
          }
        } else {
          toast.error(data.error || "Failed to load providers");
        }
      } catch (err) {
        console.error(err);
        toast.error("Network error while loading providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [isOpen, type, batch, userLocation.lat, userLocation.lng]);

  if (!isOpen) return null;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (type === "logistics") {
        if (!selectedLogistics.provider_id) {
          toast.error("Please select a logistics provider and vehicle.");
          setSubmitting(false);
          return;
        }

        const fee = selectedLogistics.distance_km
          ? Math.round(selectedLogistics.base_amount + (selectedLogistics.distance_km * selectedLogistics.rate_amount))
          : selectedLogistics.base_amount;

        const body = {
          batch_id: batch.batch_id,
          logistics_provider_id: selectedLogistics.provider_id,
          vehicle_id: selectedLogistics.vehicle_id,
          vehicle_title: selectedLogistics.vehicle_title,
          pickup_location: batch.location,
          destination: selectedLogistics.destination,
          logistics_fee: fee,
          estimated_distance_km: selectedLogistics.distance_km
        };

        const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-logistics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Logistics requested successfully!");
          onSuccess?.();
          onClose();
        } else {
          toast.error(data.error || "Failed to request logistics");
        }

      } else if (type === "storage") {
        if (!selectedStorage.warehouse_id) {
          toast.error("Please select a storage facility.");
          setSubmitting(false);
          return;
        }

        const months = Math.max(1, Math.ceil(selectedStorage.duration_days / 30));
        const estimatedFee = Math.round(parseFloat(batch.quantity_mt || 1) * selectedStorage.price_per_mt_month * months);

        const startDate = new Date(selectedStorage.start_date);
        const endDate = new Date(startDate.getTime() + (selectedStorage.duration_days * 24 * 60 * 60 * 1000));

        const body = {
          batch_id: batch.batch_id,
          warehouse_id: selectedStorage.warehouse_id,
          facility_id: selectedStorage.facility_id,
          storage_duration_days: selectedStorage.duration_days,
          storage_fee: estimatedFee,
          start_date: selectedStorage.start_date,
          end_date: endDate.toISOString().split("T")[0]
        };

        const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Storage requested successfully! Insurance risk assessment broadcasted.");
          onSuccess?.();
          onClose();
        } else {
          toast.error(data.error || "Failed to request storage");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while processing request");
    } finally {
      setSubmitting(false);
    }
  };

  const isLogistics = type === "logistics";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-(--background) rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 shrink-0 bg-gray-50/50 dark:bg-gray-850/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-(--greenish-color)/15 text-(--greenish-color)">
                {isLogistics ? <Truck className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
              </span>
              <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize">
                Request {isLogistics ? "Logistics & Transport" : "Warehouse Storage"}
              </h2>
            </div>
            
            {/* Batch summary capsule */}
            {batch && (
              <div className="flex flex-wrap items-center gap-2 text-xs mt-2 text-gray-600 dark:text-gray-400">
                <span className="font-mono font-bold bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                  {batch.batch_number}
                </span>
                <span>•</span>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-blue-500" /> {batch.crop} ({batch.quantity_mt} MT)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-(--greenish-color)" /> {batch.location}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <FaSpinner className="animate-spin text-3xl text-(--greenish-color)" />
              <p className="text-xs text-gray-500 font-semibold">Finding nearest providers & calculating distance...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-850 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-gray-800">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">No {isLogistics ? "Logistics Providers" : "Storage Facilities"} Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No verified providers currently match this region. Please try again or contact ecosystem administration.
              </p>
            </div>
          ) : isLogistics ? (
            /* ========================================================================= */
            /* LOGISTICS SELECTION VIEW */
            /* ========================================================================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Select Carrier Vehicle & Capacity
                </label>
                <span className="text-[11px] text-gray-400">
                  {providers.reduce((sum, p) => sum + (p.vehicles?.length || 0), 0)} vehicles available
                </span>
              </div>

              <div className="space-y-3">
                {providers.map((provider) => (
                  <div key={provider.id} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-(--greenish-color)" />
                        {provider.company_name}
                      </span>
                      {provider.distance_km !== null && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5 text-(--greenish-color)" />
                          {provider.distance_km} km away
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {provider.vehicles?.map((veh) => {
                        const isSelected = selectedLogistics.provider_id === provider.id && 
                          (selectedLogistics.vehicle_id === veh.id || selectedLogistics.vehicle_id === veh.vehicle_id);

                        const batchMt = parseFloat(batch?.quantity_mt || 0);
                        const fitsBatch = veh.max_tons >= batchMt;

                        return (
                          <div
                            key={veh.id}
                            onClick={() => {
                              setSelectedLogistics(prev => ({
                                ...prev,
                                provider_id: provider.id,
                                vehicle_id: veh.vehicle_id || veh.id,
                                vehicle_title: veh.title,
                                base_amount: veh.base_amount || 35000,
                                rate_amount: veh.rate_amount || 120,
                                distance_km: veh.distance_km || provider.distance_km
                              }));
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? "border-(--greenish-color) bg-green-50/50 dark:bg-green-950/20 shadow-md ring-2 ring-(--greenish-color)/20"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-(--background)"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-(--greenish-color) text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-3" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-start gap-3 pr-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 overflow-hidden">
                                  {veh.image ? (
                                    <img src={veh.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Truck className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                                    {veh.title}
                                  </h4>
                                  <span className="text-[10px] text-gray-500 capitalize block mt-0.5">
                                    {veh.vehicle_type?.replace(/_/g, " ")} • {veh.cargo_type?.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Payload Capacity</span>
                                  <span className="font-black text-gray-900 dark:text-white">
                                    {veh.max_tons} MT
                                  </span>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Base Amount</span>
                                  <span className="font-black text-emerald-600">
                                    ₦{Number(veh.base_amount).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
                              <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${
                                fitsBatch 
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}>
                                {fitsBatch ? `✓ Fits Batch (${batchMt} MT)` : `Under Capacity`}
                              </span>

                              {veh.distance_km && (
                                <span className="text-gray-400 text-[10px]">
                                  ~{veh.distance_km} km
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Destination & Fee Calculation Box */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Destination Drop-off Location *
                  </label>
                  <input
                    type="text"
                    value={selectedLogistics.destination}
                    onChange={(e) => setSelectedLogistics(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="e.g. Processing Mill / Buyer Warehouse, Lagos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-(--background) text-xs font-semibold"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 font-medium">Estimated Logistics Fee:</span>
                  <span className="text-base font-black text-emerald-600">
                    ₦{(
                      selectedLogistics.distance_km
                        ? Math.round(selectedLogistics.base_amount + (selectedLogistics.distance_km * selectedLogistics.rate_amount))
                        : selectedLogistics.base_amount
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STORAGE SELECTION VIEW */
            /* ========================================================================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Available Storage Facilities (Sorted by Proximity)
                </label>
                <span className="text-[11px] text-gray-400">{providers.length} facilities open</span>
              </div>

              <div className="space-y-3">
                {providers.map((fac) => {
                  const isSelected = selectedStorage.warehouse_id === (fac.warehouse_id || fac.vendor_id || fac.id) &&
                    selectedStorage.facility_id === (fac.facility_id || fac.id);

                  const activeSchedules = fac.schedules || [];

                  return (
                    <div
                      key={fac.id}
                      onClick={() => {
                        setSelectedStorage(prev => ({
                          ...prev,
                          warehouse_id: fac.warehouse_id || fac.vendor_id || fac.id,
                          facility_id: fac.facility_id || fac.id,
                          facility_name: fac.facility_name,
                          price_per_mt_month: fac.price_per_mt_month || 1200,
                          distance_km: fac.distance_km
                        }));
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                        isSelected
                          ? "border-(--greenish-color) bg-green-50/50 dark:bg-green-950/20 shadow-md ring-2 ring-(--greenish-color)/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-(--background)"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-(--greenish-color) text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3 pr-6">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 overflow-hidden">
                            {fac.image ? (
                              <img src={fac.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Warehouse className="w-6 h-6 text-(--greenish-color)" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                              {fac.facility_name}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {fac.storage_type} • {fac.company_name}
                            </p>
                          </div>
                        </div>

                        {fac.distance_km !== null && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Navigation className="w-2.5 h-2.5 text-(--greenish-color)" />
                            {fac.distance_km} km away
                          </span>
                        )}
                      </div>

                      {/* Capacity & Price Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">Available Space</span>
                          <span className="font-black text-gray-900 dark:text-white">
                            {Number(fac.available_capacity_mt).toLocaleString()} MT
                          </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">Monthly Storage Fee</span>
                          <span className="font-black text-emerald-600">
                            ₦{Number(fac.price_per_mt_month).toLocaleString()}/MT
                          </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">Operational Schedule</span>
                          <span className="font-bold text-gray-700 dark:text-gray-300 truncate block text-[11px]">
                            {fac.operating_days || "Mon - Sat"}
                          </span>
                        </div>
                      </div>

                      {/* Active Availability Calendar Window Badge */}
                      {activeSchedules.length > 0 && (
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px]">
                              Open Window: {new Date(activeSchedules[0].start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(activeSchedules[0].end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-gray-900 px-2 py-0.5 rounded shadow-2xs uppercase">
                            Accepting {batch?.crop || "Grains"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reservation Dates & Duration */}
              <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={selectedStorage.start_date}
                      onChange={(e) => setSelectedStorage(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-(--background) text-xs font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Storage Duration
                    </label>
                    <select
                      value={selectedStorage.duration_days}
                      onChange={(e) => setSelectedStorage(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-(--background) text-xs font-semibold cursor-pointer"
                    >
                      <option value={30}>30 Days (1 Month)</option>
                      <option value={60}>60 Days (2 Months)</option>
                      <option value={90}>90 Days (3 Months)</option>
                      <option value={180}>180 Days (6 Months)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 font-medium">Estimated Storage Fee ({batch?.quantity_mt || 1} MT):</span>
                  <span className="text-base font-black text-emerald-600">
                    ₦{Math.round(parseFloat(batch?.quantity_mt || 1) * selectedStorage.price_per_mt_month * Math.max(1, Math.ceil(selectedStorage.duration_days / 30))).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || providers.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-(--greenish-color) hover:opacity-95 text-white font-black text-xs shadow-md shadow-green-900/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? "Processing..." : `Confirm ${isLogistics ? "Logistics" : "Storage"} Request`}
          </button>
        </div>

      </div>
    </div>
  );
}
