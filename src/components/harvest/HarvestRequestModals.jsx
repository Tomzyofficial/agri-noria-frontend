"use client";

import { useState, useEffect, useMemo } from "react";
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
  Box,
  Search,
  Thermometer,
  Sparkles,
  FileCheck,
  Info,
  Scale,
  Building2,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export function HarvestRequestModals({
  isOpen,
  type, // "logistics" | "storage"
  batch, // batch object with batch_id, batch_number, crop, quantity_mt, location, warehouse_name, etc.
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [failedImages, setFailedImages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [storageFilter, setStorageFilter] = useState("all"); // all | fits | dry | cold | silo
  const [onlyFittingVehicles, setOnlyFittingVehicles] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, detecting: false });

  // Logistics selection state
  const [selectedLogistics, setSelectedLogistics] = useState({
    provider_id: null,
    provider_name: "",
    vehicle_id: null,
    vehicle_title: "",
    max_tons: 15,
    base_amount: 35000,
    rate_amount: 120,
    distance_km: null,
    destination: "",
    destination_mode: "warehouse", // warehouse | custom
  });

  // Storage selection state
  const [selectedStorage, setSelectedStorage] = useState({
    warehouse_id: null,
    facility_id: null,
    facility_name: "",
    company_name: "",
    location: "",
    available_capacity_mt: 0,
    price_per_mt_month: 1200,
    start_date: new Date().toISOString().split("T")[0],
    duration_days: 30,
    distance_km: null,
  });

  // Geolocation lookup
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setUserLocation((prev) => ({ ...prev, detecting: true }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            detecting: false,
          });
        },
        () => {
          setUserLocation((prev) => ({ ...prev, detecting: false }));
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Reset search & pre-fill destination when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm("");
    setStorageFilter("all");
    setOnlyFittingVehicles(false);

    const reservedDestination = batch?.warehouse_name
      ? `${batch.warehouse_name}${batch.warehouse_location ? ` (${batch.warehouse_location})` : ""}`
      : "Designated Certified Ecosystem Warehouse";

    setSelectedLogistics((prev) => ({
      ...prev,
      destination: reservedDestination,
      destination_mode: batch?.warehouse_name ? "warehouse" : "custom",
    }));
  }, [isOpen, batch]);

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

        const res = await fetch(
          `/api/proxy/vendor/commodity-operations/providers/${type}?${queryParams.toString()}`
        );
        const data = await res.json();
        if (data.success) {
          const list = data.data || [];
          setProviders(list);

          const batchMt = parseFloat(batch?.quantity_mt || 0);

          if (type === "logistics" && list.length > 0) {
            // Smart pre-selection: prefer a vehicle that can carry the full batch in 1 trip
            let bestProv = list[0];
            let bestVeh = list[0]?.vehicles?.[0] || null;
            let foundFitting = false;

            for (const prov of list) {
              for (const veh of prov.vehicles || []) {
                if (parseFloat(veh.max_tons || 0) >= batchMt) {
                  bestProv = prov;
                  bestVeh = veh;
                  foundFitting = true;
                  break;
                }
                if (
                  !foundFitting &&
                  bestVeh &&
                  parseFloat(veh.max_tons || 0) > parseFloat(bestVeh.max_tons || 0)
                ) {
                  bestProv = prov;
                  bestVeh = veh;
                }
              }
              if (foundFitting) break;
            }

            if (bestVeh) {
              setSelectedLogistics((prev) => ({
                ...prev,
                provider_id: bestProv.id,
                provider_name: bestProv.company_name,
                vehicle_id: bestVeh.vehicle_id || bestVeh.id,
                vehicle_title: bestVeh.title,
                max_tons: parseFloat(bestVeh.max_tons) || 0,
                base_amount: parseFloat(bestVeh.base_amount) || 0,
                rate_amount: parseFloat(bestVeh.rate_amount) || 0,
                distance_km: bestVeh.distance_km ?? bestProv.distance_km ?? null,
              }));
            }
          } else if (type === "storage" && list.length > 0) {
            // Prefer first facility with sufficient capacity
            const fittingFac =
              list.find((f) => parseFloat(f.available_capacity_mt || 0) >= batchMt) || list[0];
            setSelectedStorage((prev) => ({
              ...prev,
              warehouse_id: fittingFac.warehouse_id || fittingFac.vendor_id || fittingFac.id,
              facility_id: fittingFac.facility_id || fittingFac.id,
              facility_name: fittingFac.facility_name,
              company_name: fittingFac.company_name,
              location: fittingFac.location,
              available_capacity_mt: parseFloat(fittingFac.available_capacity_mt) || 0,
              price_per_mt_month: parseFloat(fittingFac.price_per_mt_month) || 0,
              distance_km: fittingFac.distance_km,
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

  const batchMt = parseFloat(batch?.quantity_mt || 0);
  const bagCount = batch?.bag_count || Math.round((batchMt * 1000) / (batch?.bag_weight_kg || 50));

  // Filtered Storage Facilities
  const filteredStorageProviders = useMemo(() => {
    if (type !== "storage") return [];
    return providers.filter((fac) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        fac.facility_name?.toLowerCase().includes(q) ||
        fac.company_name?.toLowerCase().includes(q) ||
        fac.location?.toLowerCase().includes(q) ||
        fac.storage_type?.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (storageFilter === "fits") {
        return parseFloat(fac.available_capacity_mt || 0) >= batchMt;
      }
      if (storageFilter === "dry") {
        return fac.storage_type?.toLowerCase().includes("dry");
      }
      if (storageFilter === "cold") {
        return fac.storage_type?.toLowerCase().includes("cold");
      }
      if (storageFilter === "silo") {
        return fac.storage_type?.toLowerCase().includes("silo");
      }
      return true;
    });
  }, [providers, type, searchTerm, storageFilter, batchMt]);

  // Filtered Logistics Providers
  const filteredLogisticsProviders = useMemo(() => {
    if (type !== "logistics") return [];
    const q = searchTerm.trim().toLowerCase();
    return providers
      .map((prov) => {
        const vehicles = (prov.vehicles || []).filter((veh) => {
          const matchesSearch =
            !q ||
            prov.company_name?.toLowerCase().includes(q) ||
            veh.title?.toLowerCase().includes(q) ||
            veh.vehicle_type?.toLowerCase().includes(q) ||
            veh.base_location?.toLowerCase().includes(q);
          if (!matchesSearch) return false;
          if (onlyFittingVehicles) {
            return parseFloat(veh.max_tons || 0) >= batchMt;
          }
          return true;
        });
        return { ...prov, vehicles };
      })
      .filter((prov) => prov.vehicles.length > 0);
  }, [providers, type, searchTerm, onlyFittingVehicles, batchMt]);

  if (!isOpen) return null;

  const isLogistics = type === "logistics";

  // Calculate trips & fees
  const requiredTrips =
    selectedLogistics.max_tons > 0
      ? Math.max(1, Math.ceil(batchMt / selectedLogistics.max_tons))
      : 1;
  const singleTripFee = selectedLogistics.distance_km
    ? Math.round(
        selectedLogistics.base_amount + selectedLogistics.distance_km * selectedLogistics.rate_amount
      )
    : Math.round(selectedLogistics.base_amount);
  const totalLogisticsFee = singleTripFee * requiredTrips;

  const storageMonths = Math.max(1, Math.ceil(selectedStorage.duration_days / 30));
  const totalStorageFee = Math.round(
    Math.max(0.1, batchMt) * selectedStorage.price_per_mt_month * storageMonths
  );

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (type === "logistics") {
        if (!selectedLogistics.provider_id) {
          toast.error("Please select a logistics carrier and vehicle.");
          setSubmitting(false);
          return;
        }
        if (!selectedLogistics.destination?.trim()) {
          toast.error("Please specify a valid drop-off destination.");
          setSubmitting(false);
          return;
        }

        const body = {
          batch_id: batch.batch_id,
          logistics_provider_id: selectedLogistics.provider_id,
          vehicle_id: selectedLogistics.vehicle_id,
          vehicle_title:
            requiredTrips > 1
              ? `${selectedLogistics.vehicle_title} (${requiredTrips} Trips)`
              : selectedLogistics.vehicle_title,
          pickup_location: batch.location,
          destination: selectedLogistics.destination.trim(),
          logistics_fee: totalLogisticsFee,
          estimated_distance_km: selectedLogistics.distance_km,
        };

        const res = await fetch(
          "/api/proxy/vendor/commodity-operations/harvest/request-logistics",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json();
        if (data.success) {
          toast.success(
            "Logistics dispatch ticket generated! Carrier notified with digital gate pass."
          );
          onSuccess?.();
          onClose();
        } else {
          toast.error(data.error || "Failed to request logistics");
        }
      } else if (type === "storage") {
        if (!selectedStorage.warehouse_id) {
          toast.error("Please select a certified storage facility.");
          setSubmitting(false);
          return;
        }

        const startDate = new Date(selectedStorage.start_date);
        const endDate = new Date(
          startDate.getTime() + selectedStorage.duration_days * 24 * 60 * 60 * 1000
        );

        const body = {
          batch_id: batch.batch_id,
          warehouse_id: selectedStorage.warehouse_id,
          facility_id: selectedStorage.facility_id,
          storage_duration_days: selectedStorage.duration_days,
          storage_fee: totalStorageFee,
          start_date: selectedStorage.start_date,
          end_date: endDate.toISOString().split("T")[0],
        };

        const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(
            "Warehouse Storage Reserved! Insurance risk assessment & NWR intake initiated."
          );
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

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
                {isLogistics ? <Truck className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isLogistics
                      ? "Request Verified Haulage & Logistics"
                      : "Reserve Certified Warehouse Storage"}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" /> Anti-Fraud Traceable
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {isLogistics
                    ? "Book GPS-tracked fleet transport from your farm gate to a certified warehouse or buyer."
                    : "Reserve inspected storage space to qualify for Electronic Warehouse Receipts (e-NWR) & crop insurance."}
                </p>
              </div>
            </div>

            {/* Batch Identity Capsule Strip */}
            {batch && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-mono font-black bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {batch.batch_number}
                </span>
                {batch.farm_id && (
                  <span className="font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Farm ID: {batch.farm_id}
                  </span>
                )}
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {batch.crop} {batch.variety ? `(${batch.variety})` : ""} •{" "}
                    <strong>{batch.quantity_mt} MT</strong> (~{bagCount.toLocaleString()} Bags)
                  </span>
                </span>
                <span className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate max-w-[220px]">{batch.location}</span>
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH & FILTER BAR */}
        {/* ========================================================================= */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isLogistics
                  ? "Search by carrier company, truck type, or hub location..."
                  : "Search by warehouse name, storage type, or city/state..."
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {isLogistics ? (
            <button
              type="button"
              onClick={() => setOnlyFittingVehicles((v) => !v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 shrink-0 ${
                onlyFittingVehicles
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Single-Trip Capacity Fit ({batchMt} MT+)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All" },
                { id: "fits", label: `Fits ${batchMt} MT` },
                { id: "dry", label: "Dry" },
                { id: "silo", label: "Silo" },
                { id: "cold", label: "Cold" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStorageFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    storageFilter === tab.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE BODY */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-slate-50/40 dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <FaSpinner className="animate-spin text-3xl text-emerald-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Scanning verified {isLogistics ? "haulage fleets" : "storage facilities"} &
                calculating proximity...
              </p>
            </div>
          ) : isLogistics ? (
            /* ========================================================================= */
            /* LOGISTICS SELECTION VIEW */
            /* ========================================================================= */
            filteredLogisticsProviders.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  No Matching Carrier Vehicles Found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {onlyFittingVehicles
                    ? `No single truck has ${batchMt} MT capacity. Disable the "Single-Trip Capacity Fit" filter to book multi-trip haulage.`
                    : "No verified logistics providers matched your search."}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select Verified Carrier & Fleet Vehicle
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {filteredLogisticsProviders.reduce(
                      (sum, p) => sum + (p.vehicles?.length || 0),
                      0
                    )}{" "}
                    vehicles available
                  </span>
                </div>

                <div className="space-y-5">
                  {filteredLogisticsProviders.map((provider) => (
                    <div key={provider.id} className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Truck className="w-3.5 h-3.5" />
                          </span>
                          <span>{provider.company_name}</span>
                          {provider.location && (
                            <span className="text-[11px] font-medium text-slate-400">
                              • {provider.location}
                            </span>
                          )}
                        </span>
                        {provider.distance_km !== null && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" />
                            {provider.distance_km} km from farm
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {provider.vehicles?.map((veh) => {
                          const isSelected =
                            selectedLogistics.provider_id === provider.id &&
                            (selectedLogistics.vehicle_id === veh.id ||
                              selectedLogistics.vehicle_id === veh.vehicle_id);

                          const vehTons = parseFloat(veh.max_tons || 0);
                          const fitsSingleTrip = vehTons >= batchMt;
                          const tripsNeeded =
                            vehTons > 0 ? Math.max(1, Math.ceil(batchMt / vehTons)) : 1;
                          const imgKey = `veh_${veh.id}`;
                          const showImg = veh.image && !failedImages[imgKey];

                          return (
                            <div
                              key={veh.id}
                              onClick={() => {
                                setSelectedLogistics((prev) => ({
                                  ...prev,
                                  provider_id: provider.id,
                                  provider_name: provider.company_name,
                                  vehicle_id: veh.vehicle_id || veh.id,
                                  vehicle_title: veh.title,
                                  max_tons: vehTons || 0,
                                  base_amount: parseFloat(veh.base_amount) || 0,
                                  rate_amount: parseFloat(veh.rate_amount) || 0,
                                  distance_km: veh.distance_km ?? provider.distance_km ?? null,
                                }));
                              }}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-lg ring-2 ring-emerald-500/30"
                                  : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}

                              <div>
                                <div className="flex items-start gap-3 pr-7">
                                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 overflow-hidden">
                                    {showImg ? (
                                      <img
                                        src={veh.image}
                                        alt=""
                                        onError={() =>
                                          setFailedImages((prev) => ({ ...prev, [imgKey]: true }))
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Truck className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
                                      {veh.title}
                                    </h4>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize block mt-0.5">
                                      {veh.vehicle_type?.replace(/_/g, " ")} •{" "}
                                      {veh.cargo_type?.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                </div>

                                {/* High-Contrast Metric Boxes */}
                                <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
                                  <div className="bg-slate-50 dark:bg-slate-950/90 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                                      Payload Capacity
                                    </span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                                      {vehTons} MT{" "}
                                      <span className="text-[10px] font-semibold text-slate-400">
                                        ({Math.round((vehTons * 1000) / 50)} bags)
                                      </span>
                                    </span>
                                  </div>

                                  <div className="bg-slate-50 dark:bg-slate-950/90 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                                      Base Dispatch Rate
                                    </span>
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                      ₦{Number(veh.base_amount).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                                    fitsSingleTrip
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                  }`}
                                >
                                  {fitsSingleTrip
                                    ? `✓ Single-Trip Fit (${batchMt} MT)`
                                    : `${tripsNeeded} Trips Required (${vehTons} MT/trip)`}
                                </span>

                                {veh.distance_km !== null && veh.distance_km !== undefined && (
                                  <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px]">
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

                {/* Anti-Fraud Destination & Waybill Fee Summary Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 mt-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Verified Drop-Off Destination *</span>
                    </label>
                    {batch?.warehouse_name && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLogistics((prev) => ({
                            ...prev,
                            destination: `${batch.warehouse_name}${
                              batch.warehouse_location ? ` (${batch.warehouse_location})` : ""
                            }`,
                          }))
                        }
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Use Reserved Warehouse ({batch.warehouse_name})</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Destination Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      batch?.warehouse_name
                        ? `${batch.warehouse_name}${
                            batch.warehouse_location ? ` (${batch.warehouse_location})` : ""
                          }`
                        : null,
                      "Nearest Certified Ecosystem Grain Silo",
                      "Program Aggregation Hub & Weighbridge",
                      "Regional Commodity Exchange Warehouse",
                    ]
                      .filter(Boolean)
                      .map((destPreset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setSelectedLogistics((prev) => ({ ...prev, destination: destPreset }))
                          }
                          className={`text-[11px] px-3 py-1 rounded-xl font-bold border transition cursor-pointer ${
                            selectedLogistics.destination === destPreset
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          {destPreset}
                        </button>
                      ))}
                  </div>

                  <input
                    type="text"
                    value={selectedLogistics.destination}
                    onChange={(e) =>
                      setSelectedLogistics((prev) => ({ ...prev, destination: e.target.value }))
                    }
                    placeholder="Enter verified warehouse, processing mill, or off-taker facility address"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-500 dark:text-slate-400 font-medium">
                      <span>
                        Haulage Breakdown: ₦{singleTripFee.toLocaleString()}/trip ×{" "}
                        <strong>
                          {requiredTrips} {requiredTrips > 1 ? "trips" : "trip"}
                        </strong>
                      </span>
                      {selectedLogistics.distance_km ? (
                        <span className="ml-1.5 text-[11px] text-slate-400">
                          (~{selectedLogistics.distance_km} km transit)
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">
                        Total Estimated Fee:
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ₦{totalLogisticsFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : /* ========================================================================= */
          /* STORAGE SELECTION VIEW */
          /* ========================================================================= */
          filteredStorageProviders.length === 0 ? (
            <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                No Matching Storage Facilities Found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your filter or search query to view all available ecosystem warehouses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Available Certified Storage Facilities (Sorted by Proximity)
                </label>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {filteredStorageProviders.length} facilities open
                </span>
              </div>

              <div className="space-y-3.5">
                {filteredStorageProviders.map((fac) => {
                  const isSelected =
                    selectedStorage.warehouse_id ===
                      (fac.warehouse_id || fac.vendor_id || fac.id) &&
                    selectedStorage.facility_id === (fac.facility_id || fac.id);

                  const activeSchedules = fac.schedules || [];
                  const availMt = parseFloat(fac.available_capacity_mt || 0);
                  const fitsBatch = availMt >= batchMt;
                  const imgKey = `fac_${fac.id}`;
                  const showImg = fac.image && !failedImages[imgKey];

                  return (
                    <div
                      key={fac.id}
                      onClick={() => {
                        setSelectedStorage((prev) => ({
                          ...prev,
                          warehouse_id: fac.warehouse_id || fac.vendor_id || fac.id,
                          facility_id: fac.facility_id || fac.id,
                          facility_name: fac.facility_name,
                          company_name: fac.company_name,
                          location: fac.location,
                          available_capacity_mt: availMt,
                          price_per_mt_month: parseFloat(fac.price_per_mt_month) || 0,
                          distance_km: fac.distance_km,
                        }));
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3.5 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-lg ring-2 ring-emerald-500/30"
                          : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pr-8">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 overflow-hidden">
                            {showImg ? (
                              <img
                                src={fac.image}
                                alt=""
                                onError={() =>
                                  setFailedImages((prev) => ({ ...prev, [imgKey]: true }))
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Warehouse className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                                {fac.facility_name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  fitsBatch
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                }`}
                              >
                                {fitsBatch ? `✓ Fits ${batchMt} MT` : "Limited Space"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                              {fac.storage_type} • Operator:{" "}
                              <strong className="text-slate-700 dark:text-slate-200">
                                {fac.company_name}
                              </strong>
                            </p>
                            {fac.location && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{fac.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start">
                          {fac.distance_km !== null && fac.distance_km !== undefined && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                              <Navigation className="w-2.5 h-2.5" />
                              {fac.distance_km} km away
                            </span>
                          )}
                        </div>
                      </div>

                      {/* High-Contrast Capacity, Price & Schedule Metrics (Fixed dark mode!) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                            Available Space
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                            {availMt.toLocaleString()} MT{" "}
                            <span className="text-[10px] font-semibold text-slate-400">
                              ({Math.round((availMt * 1000) / 50).toLocaleString()} bags)
                            </span>
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                            Monthly Storage Fee
                          </span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                            ₦{Number(fac.price_per_mt_month).toLocaleString()}/MT
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                            Operational Schedule
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-xs mt-0.5">
                            {fac.operating_days || "Mon - Sat (08:00 - 18:00)"}
                          </span>
                        </div>
                      </div>

                      {/* Facility Features & Temperature Strip */}
                      {(fac.temperature || (Array.isArray(fac.features) && fac.features.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {fac.temperature && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                              <Thermometer className="w-3 h-3" /> {fac.temperature}
                            </span>
                          )}
                          {(Array.isArray(fac.features) ? fac.features : [])
                            .slice(0, 6)
                            .map((feat, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                              >
                                • {feat}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Active Availability Calendar Window Badge */}
                      {activeSchedules.length > 0 && (
                        <div className="bg-emerald-50/90 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px]">
                              Intake Window:{" "}
                              {new Date(activeSchedules[0].start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              –{" "}
                              {new Date(activeSchedules[0].end_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 uppercase">
                            Accepting {batch?.crop || "Grains"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reservation Dates, Duration & Cost Breakdown Box */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 mt-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Planned Intake Start Date *
                    </label>
                    <input
                      type="date"
                      value={selectedStorage.start_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedStorage((prev) => ({ ...prev, start_date: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Storage Reservation Duration
                    </label>
                    <select
                      value={selectedStorage.duration_days}
                      onChange={(e) =>
                        setSelectedStorage((prev) => ({
                          ...prev,
                          duration_days: parseInt(e.target.value, 10) || 30,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={30}>30 Days (1 Month Standard Cycle)</option>
                      <option value={60}>60 Days (2 Months Extended)</option>
                      <option value={90}>90 Days (3 Months Seasonal)</option>
                      <option value={180}>180 Days (6 Months Strategic Reserve)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">
                    <span>
                      Calculation: <strong>{batchMt || 1} MT</strong> × ₦
                      {Number(selectedStorage.price_per_mt_month).toLocaleString()}/MT ×{" "}
                      <strong>
                        {storageMonths} {storageMonths > 1 ? "months" : "month"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">
                      Total Storage Fee:
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ₦{totalStorageFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isLogistics
                ? "Generates a tamper-proof Logistics Ticket (LT) & notifies carrier."
                : "Generates a Storage Ticket (ST) & broadcasts batch for Insurance quotation."}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || providers.length === 0}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer transition-all"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>
                {submitting
                  ? "Processing Request..."
                  : `Confirm ${isLogistics ? "Logistics Dispatch" : "Storage Reservation"}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
