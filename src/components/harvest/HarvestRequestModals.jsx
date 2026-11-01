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
  ChevronRight,
  ChevronLeft,
  Car,
  Phone,
  ZoomIn,
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
  const [failedImages, setFailedImages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [storageFilter, setStorageFilter] = useState("all"); // all | fits | dry | cold | silo
  const [onlyFittingVehicles, setOnlyFittingVehicles] = useState(false);
  const [logisticsProximityFilter, setLogisticsProximityFilter] = useState("all"); // all | 50km | 100km | 200km
  const [logisticsCapacityFilter, setLogisticsCapacityFilter] = useState("all"); // all | fits | heavy | medium | light
  const [zoomImage, setZoomImage] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null, detecting: false });

  // Integrated 2-step intake wizard state
  // Step 1: Select Storage Facility
  // Step 2: Choose Transportation Method (Platform Truck vs Self-Delivery)
  const [step, setStep] = useState(1);
  const [transportMethod, setTransportMethod] = useState("platform_truck"); // "platform_truck" | "self_delivery"

  // Providers lists
  const [storageProviders, setStorageProviders] = useState([]);
  const [logisticsProviders, setLogisticsProviders] = useState([]);

  // Self-delivery form state
  const [selfDeliveryForm, setSelfDeliveryForm] = useState({
    driver_name: "",
    vehicle_plate: "",
    dropoff_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

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

  // Reset modal state when opened
  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm("");
    setStorageFilter("all");
    setOnlyFittingVehicles(false);
    setLogisticsProximityFilter("all");
    setLogisticsCapacityFilter("all");
    setZoomImage(null);
    
    // If opened directly for logistics (e.g. storage already reserved), go directly to Step 2
    if (type === "logistics") {
      setStep(2);
    } else {
      setStep(1);
    }

    const reservedDestination = batch?.warehouse_name
      ? `${batch.warehouse_name}${batch.warehouse_location ? ` (${batch.warehouse_location})` : ""}`
      : "Designated Certified Ecosystem Warehouse";

    setSelectedLogistics((prev) => ({
      ...prev,
      destination: reservedDestination,
    }));
  }, [isOpen, type, batch]);

  // Fetch both storage and logistics providers concurrently
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllProviders = async () => {
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

        const [storageRes, logisticsRes] = await Promise.all([
          fetch(`/api/proxy/vendor/commodity-operations/providers/storage?${queryParams.toString()}`),
          fetch(`/api/proxy/vendor/commodity-operations/providers/logistics?${queryParams.toString()}`)
        ]);

        const [storageJson, logisticsJson] = await Promise.all([
          storageRes.json(),
          logisticsRes.json()
        ]);

        const sList = storageJson?.success ? (storageJson.data || []) : [];
        const lList = logisticsJson?.success ? (logisticsJson.data || []) : [];

        setStorageProviders(sList);
        setLogisticsProviders(lList);

        const batchMt = parseFloat(batch?.quantity_mt || 0);

        // Smart pre-selection for Storage
        if (sList.length > 0) {
          const fittingFac = sList.find((f) => parseFloat(f.available_capacity_mt || 0) >= batchMt) || sList[0];
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

        // Smart pre-selection for Logistics
        if (lList.length > 0) {
          let bestProv = lList[0];
          let bestVeh = lList[0]?.vehicles?.[0] || null;
          let foundFitting = false;

          for (const prov of lList) {
            for (const veh of prov.vehicles || []) {
              if (parseFloat(veh.max_tons || 0) >= batchMt) {
                bestProv = prov;
                bestVeh = veh;
                foundFitting = true;
                break;
              }
              if (!foundFitting && bestVeh && parseFloat(veh.max_tons || 0) > parseFloat(bestVeh.max_tons || 0)) {
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
        }
        if (storageJson?.success || logisticsJson?.success) {
          setLoading(false);
        } else {
          setTimeout(() => {
            if (isOpen) fetchAllProviders();
          }, 2000);
        }
      } catch (err) {
        console.warn("Retrying provider fetch:", err?.message);
        setTimeout(() => {
          if (isOpen) fetchAllProviders();
        }, 2000);
      }
    };

    fetchAllProviders();
  }, [isOpen, batch, userLocation.lat, userLocation.lng]);

  const batchMt = parseFloat(batch?.quantity_mt || 0);
  const bagCount = batch?.bag_count || Math.round((batchMt * 1000) / (batch?.bag_weight_kg || 50));

  // Filtered Storage Facilities
  const filteredStorageProviders = useMemo(() => {
    return storageProviders.filter((fac) => {
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
  }, [storageProviders, searchTerm, storageFilter, batchMt]);

  // Filtered Logistics Providers
  const filteredLogisticsProviders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logisticsProviders
      .map((prov) => {
        const provMatches =
          !q ||
          prov.company_name?.toLowerCase().includes(q) ||
          prov.location?.toLowerCase().includes(q) ||
          prov.email?.toLowerCase().includes(q) ||
          prov.phone?.toLowerCase().includes(q);

        const vehicles = (prov.vehicles || []).filter((veh) => {
          const vehMatches =
            provMatches ||
            !q ||
            veh.title?.toLowerCase().includes(q) ||
            veh.vehicle_type?.toLowerCase().includes(q) ||
            veh.license_plate?.toLowerCase().includes(q) ||
            veh.base_location?.toLowerCase().includes(q);

          if (!vehMatches) return false;

          const vehTons = parseFloat(veh.max_tons || 0);

          // Capacity filter
          if (logisticsCapacityFilter === "fits" || onlyFittingVehicles) {
            if (vehTons < batchMt) return false;
          } else if (logisticsCapacityFilter === "heavy") {
            if (vehTons < 10) return false;
          } else if (logisticsCapacityFilter === "medium") {
            if (vehTons < 5 || vehTons >= 10) return false;
          } else if (logisticsCapacityFilter === "light") {
            if (vehTons >= 5) return false;
          }

          // Proximity filter
          const dist = veh.distance_km ?? prov.distance_km;
          if (logisticsProximityFilter === "50km") {
            if (dist === null || dist > 50) return false;
          } else if (logisticsProximityFilter === "100km") {
            if (dist === null || dist > 100) return false;
          } else if (logisticsProximityFilter === "200km") {
            if (dist === null || dist > 200) return false;
          }

          return true;
        });

        return { ...prov, vehicles };
      })
      .filter((prov) => prov.vehicles.length > 0);
  }, [logisticsProviders, searchTerm, logisticsCapacityFilter, logisticsProximityFilter, onlyFittingVehicles, batchMt]);

  if (!isOpen) return null;

  // Trips & Fee Calculations
  const requiredTrips =
    selectedLogistics.max_tons > 0
      ? Math.max(1, Math.ceil(batchMt / selectedLogistics.max_tons))
      : 1;
  const singleTripFee = selectedLogistics.distance_km
    ? Math.round(selectedLogistics.base_amount + selectedLogistics.distance_km * selectedLogistics.rate_amount)
    : Math.round(selectedLogistics.base_amount);
  const totalLogisticsFee = transportMethod === "platform_truck" ? singleTripFee * requiredTrips : 0;

  const storageMonths = Math.max(1, Math.ceil(selectedStorage.duration_days / 30));
  const totalStorageFee = Math.round(
    Math.max(0.1, batchMt) * selectedStorage.price_per_mt_month * storageMonths
  );

  const totalIntegratedFee = totalStorageFee + (transportMethod === "platform_truck" ? totalLogisticsFee : 0);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. If Standalone Logistics Mode
      if (type === "logistics" && step === 2) {
        if (transportMethod === "self_delivery") {
          const body = {
            batch_id: batch.batch_id,
            delivery_method: "self_delivery",
            driver_name: selfDeliveryForm.driver_name?.trim() || null,
            vehicle_plate: selfDeliveryForm.vehicle_plate?.trim() || null,
            self_delivery_notes: selfDeliveryForm.notes?.trim() || null,
          };
          const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-logistics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.success) {
            toast.success("Self-delivery gate pass generated! You can deliver directly to the warehouse.");
            onSuccess?.();
            onClose();
          } else {
            toast.error(data.error || "Failed to issue self-delivery gate pass");
          }
          return;
        }

        if (!selectedLogistics.provider_id) {
          toast.error("Please select a logistics carrier and vehicle.");
          setSubmitting(false);
          return;
        }

        const dropoffDestination = selectedLogistics.destination?.trim() || 
          (batch?.warehouse_name ? `${batch.warehouse_name} (${batch.warehouse_location || ''})` : "Designated Certified Warehouse");

        const body = {
          batch_id: batch.batch_id,
          logistics_provider_id: selectedLogistics.provider_id,
          vehicle_id: selectedLogistics.vehicle_id,
          vehicle_title: requiredTrips > 1
            ? `${selectedLogistics.vehicle_title} (${requiredTrips} Trips)`
            : selectedLogistics.vehicle_title,
          pickup_location: batch.location,
          destination: dropoffDestination,
          logistics_fee: totalLogisticsFee,
          estimated_distance_km: selectedLogistics.distance_km,
        };

        const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-logistics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Logistics dispatch ticket generated! Carrier notified with digital gate pass.");
          onSuccess?.();
          onClose();
        } else {
          toast.error(data.error || "Failed to request logistics");
        }
        return;
      }

      // 2. Integrated Storage & Intake Submission
      if (!selectedStorage.warehouse_id) {
        toast.error("Please select a certified storage facility.");
        setSubmitting(false);
        return;
      }

      const startDate = new Date(selectedStorage.start_date);
      const endDate = new Date(startDate.getTime() + selectedStorage.duration_days * 24 * 60 * 60 * 1000);

      const targetDestinationName = `${selectedStorage.facility_name}${selectedStorage.location ? ` (${selectedStorage.location})` : ""}`;

      const body = {
        batch_id: batch.batch_id,
        warehouse_id: selectedStorage.warehouse_id,
        facility_id: selectedStorage.facility_id,
        storage_duration_days: selectedStorage.duration_days,
        storage_fee: totalStorageFee,
        start_date: selectedStorage.start_date,
        end_date: endDate.toISOString().split("T")[0],
        delivery_method: transportMethod,
        driver_name: transportMethod === "self_delivery" ? (selfDeliveryForm.driver_name?.trim() || null) : null,
        vehicle_plate: transportMethod === "self_delivery" ? (selfDeliveryForm.vehicle_plate?.trim() || null) : null,
        self_delivery_notes: transportMethod === "self_delivery" ? (selfDeliveryForm.notes?.trim() || null) : null,
        logistics: transportMethod === "platform_truck" && selectedLogistics.provider_id ? {
          logistics_provider_id: selectedLogistics.provider_id,
          vehicle_id: selectedLogistics.vehicle_id,
          vehicle_title: requiredTrips > 1 ? `${selectedLogistics.vehicle_title} (${requiredTrips} Trips)` : selectedLogistics.vehicle_title,
          pickup_location: batch.location,
          destination: targetDestinationName,
          logistics_fee: totalLogisticsFee,
          estimated_distance_km: selectedLogistics.distance_km
        } : null
      };

      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/request-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        if (transportMethod === "self_delivery") {
          toast.success("Storage reserved! Digital self-delivery gate pass issued for your vehicle.");
        } else {
          toast.success("Storage reserved & platform haulage truck dispatched to your farm!");
        }
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error || "Failed to reserve storage");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while processing request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* ========================================================================= */}
        {/* MODAL HEADER WITH INTEGRATED STEP WIZARD */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
                {step === 2 && transportMethod === "platform_truck" ? (
                  <Truck className="w-5 h-5" />
                ) : step === 2 && transportMethod === "self_delivery" ? (
                  <Car className="w-5 h-5" />
                ) : (
                  <Warehouse className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {step === 1
                      ? "Step 1 of 2: Select Destination Storage Warehouse"
                      : "Step 2 of 2: How will this grain get to the warehouse?"}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" /> Anti-Fraud Traceable
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {step === 1
                    ? "Choose a certified warehouse to store and grade your harvest for Electronic Warehouse Receipts (NWR)."
                    : "Select whether you need a platform haulage truck to pick it up, or if you will transport it yourself."}
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
                  <span className="truncate max-w-[220px]">Origin: {batch.location}</span>
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
        {/* STEP 1: SELECT WAREHOUSE STORAGE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <>
            {/* Search & Filter Bar */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by warehouse name, storage type, or location..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All Facilities" },
                  { id: "fits", label: `Fits ${batchMt} MT` },
                  { id: "dry", label: "Dry Bulk" },
                  { id: "silo", label: "Silos" },
                  { id: "cold", label: "Cold Storage" },
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
            </div>

            {/* Scrollable Facilities List */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-slate-50/40 dark:bg-slate-950">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Scanning certified storage facilities nearby...
                  </p>
                </div>
              ) : filteredStorageProviders.length === 0 ? (
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
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Select Verified Ecosystem Storage Warehouse (Sorted by Proximity)
                    </label>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {filteredStorageProviders.length} facilities open
                    </span>
                  </div>

                  {filteredStorageProviders.map((fac) => {
                    const isSelected =
                      selectedStorage.warehouse_id === (fac.warehouse_id || fac.vendor_id || fac.id) &&
                      selectedStorage.facility_id === (fac.facility_id || fac.id);

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
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
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
                                  onError={() => setFailedImages((prev) => ({ ...prev, [imgKey]: true }))}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Warehouse className="w-6 h-6" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                  {fac.facility_name}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified Storage
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {fac.storage_type || "Hermetic Warehouse"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Managed by {fac.company_name}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{fac.location || "Ecosystem Hub"}</span>
                                {fac.distance_km !== null && (
                                  <span className="text-slate-400 font-bold">• {fac.distance_km} km away</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                              Storage Rate
                            </span>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              ₦{Number(fac.price_per_mt_month || 1200).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold block">/ MT / Month</span>
                          </div>
                        </div>

                        {/* Capacity Pill & Status */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className={`font-bold ${fitsBatch ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                            {availMt.toLocaleString()} MT Available Capacity
                            {fitsBatch ? " (Sufficient for full batch)" : " (Partial fit)"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Certified Weighbridge Intake
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dates & Duration Selector */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Intake Start Date *
                    </label>
                    <input
                      type="date"
                      value={selectedStorage.start_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedStorage((prev) => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Storage Duration
                    </label>
                    <select
                      value={selectedStorage.duration_days}
                      onChange={(e) => setSelectedStorage((prev) => ({ ...prev, duration_days: parseInt(e.target.value, 10) || 30 }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={30}>30 Days (1 Month Standard)</option>
                      <option value={60}>60 Days (2 Months Extended)</option>
                      <option value={90}>90 Days (3 Months Seasonal)</option>
                      <option value={180}>180 Days (6 Months Strategic)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Estimated Storage Fee: <strong>{batchMt || 1} MT</strong> × ₦{Number(selectedStorage.price_per_mt_month).toLocaleString()} × {storageMonths} {storageMonths > 1 ? "months" : "month"}
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ₦{totalStorageFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer (Step 1) */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-medium">
                Warehouse selected: <strong className="text-slate-800 dark:text-white">{selectedStorage.facility_name || "None"}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStorage.warehouse_id}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <span>Continue to Transportation (Step 2)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CHOOSE TRANSPORTATION METHOD */}
        {/* ========================================================================= */}
        {step === 2 && (
          <>
            {/* Top Destination Notice & Step Switcher */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                {type !== "logistics" && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline mr-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Storage</span>
                  </button>
                )}
                <span className="text-slate-500 dark:text-slate-400">Destination:</span>
                <strong className="text-slate-900 dark:text-white">
                  {selectedStorage.facility_name || batch?.warehouse_name || "Certified Warehouse"}
                </strong>
                <span className="text-slate-400 hidden sm:inline">
                  ({selectedStorage.location || batch?.warehouse_location || "Designated Location"})
                </span>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                Transport Setup
              </span>
            </div>

            {/* Scrollable Transportation Method Selector */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar bg-slate-50/40 dark:bg-slate-950">
              {/* The Two Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Choice 1: Platform Haulage Truck */}
                <div
                  onClick={() => setTransportMethod("platform_truck")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative space-y-3 ${
                    transportMethod === "platform_truck"
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    {transportMethod === "platform_truck" && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      Request Platform Haulage Truck
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      Recommended if you do not have a commercial vehicle. A verified carrier picks up from your farm gate and delivers directly to the warehouse.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Carrier Network</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      Standard Haulage Rates Apply
                    </span>
                  </div>
                </div>

                {/* Choice 2: Self-Delivery (Own Vehicle / Direct Drop-Off) */}
                <div
                  onClick={() => setTransportMethod("self_delivery")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative space-y-3 ${
                    transportMethod === "self_delivery"
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Car className="w-5 h-5" />
                    </div>
                    {transportMethod === "self_delivery" && (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Self-Delivery (Own Vehicle)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Free • ₦0
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      Choose this if you have a pickup, tractor, or car to transport it yourself. We generate a digital gate pass for warehouse intake.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Transport Cost</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      ₦0 Free Direct Drop-Off
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS FOR CHOSEN METHOD */}
              {transportMethod === "self_delivery" ? (
                /* Self Delivery Form */
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-gray-800">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Self-Delivery Gate Pass Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Driver / Transporter Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={selfDeliveryForm.driver_name}
                        onChange={(e) => setSelfDeliveryForm({ ...selfDeliveryForm, driver_name: e.target.value })}
                        placeholder="e.g. Self / Musa Bello"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Vehicle Plate Number / Type (Optional)
                      </label>
                      <input
                        type="text"
                        value={selfDeliveryForm.vehicle_plate}
                        onChange={(e) => setSelfDeliveryForm({ ...selfDeliveryForm, vehicle_plate: e.target.value })}
                        placeholder="e.g. KJA-482-AA / Toyota Hilux"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Delivery Instructions / Gate Notes
                    </label>
                    <textarea
                      rows="2"
                      value={selfDeliveryForm.notes}
                      onChange={(e) => setSelfDeliveryForm({ ...selfDeliveryForm, notes: e.target.value })}
                      placeholder="e.g. Produce arriving in two pickup loads on Saturday morning."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      Upon booking, your batch is assigned a <strong>Digital Gate Pass</strong>. Drive your vehicle directly to the warehouse gate; the operator will weigh your bags and issue your Electronic Warehouse Receipt (NWR).
                    </span>
                  </div>
                </div>
              ) : (
                /* Platform Truck Fleet Selector */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Verified Ecosystem Logistics Fleets
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Select your preferred carrier and specific haulage truck to pick up your harvest.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full shrink-0">
                      {filteredLogisticsProviders.reduce((sum, p) => sum + (p.vehicles?.length || 0), 0)} trucks available
                    </span>
                  </div>

                  {/* Logistics Search & Comprehensive Filters */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search carriers, cities, truck models, or plate numbers..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills Grid: Proximity & Capacity */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      {/* Proximity / Distance Filter */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-0.5">
                          <Navigation className="w-3 h-3 text-emerald-600" />
                          Distance:
                        </span>
                        {[
                          { id: "all", label: "All Locations" },
                          { id: "50km", label: "< 50 km (Nearby)" },
                          { id: "100km", label: "< 100 km" },
                          { id: "200km", label: "< 200 km" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setLogisticsProximityFilter(opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              logisticsProximityFilter === opt.id
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Capacity / Payload Filter */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-0.5">
                          <Scale className="w-3 h-3 text-indigo-600" />
                          Capacity:
                        </span>
                        {[
                          { id: "all", label: "All Sizes" },
                          { id: "fits", label: `Fits Batch (≥ ${batchMt} MT)` },
                          { id: "heavy", label: "Heavy (≥10T)" },
                          { id: "medium", label: "5-10T" },
                          { id: "light", label: "Light (<5T)" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setLogisticsCapacityFilter(opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              logisticsCapacityFilter === opt.id
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Filter Clear Helper */}
                    {(searchTerm || logisticsProximityFilter !== "all" || logisticsCapacityFilter !== "all") && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span>Showing filtered carriers & trucks</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            setLogisticsProximityFilter("all");
                            setLogisticsCapacityFilter("all");
                          }}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>

                  {filteredLogisticsProviders.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      No commercial trucks currently available nearby. You can choose Self-Delivery or try again shortly.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {filteredLogisticsProviders.map((provider) => {
                        const providerLocation = provider.location || "Regional Operating Hub";
                        const truckCount = provider.vehicles?.length || 0;

                        return (
                          <div
                            key={provider.id}
                            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                          >
                            {/* Logistics Carrier Company Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-teal-500/15 to-emerald-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0 border border-indigo-500/20 shadow-xs">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                      {provider.company_name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      Verified Logistics Partner
                                    </span>
                                  </div>

                                  {/* Exact Location & Contact of the Logistics Carrier */}
                                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap font-medium">
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Carrier Location:</span>
                                      <strong className="text-slate-900 dark:text-white">
                                        {providerLocation}
                                      </strong>
                                    </span>
                                    {provider.phone && (
                                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{provider.phone}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {provider.distance_km !== null && (
                                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                    <Navigation className="w-3 h-3 text-indigo-500" />
                                    {provider.distance_km} km from farm
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                                  {truckCount} {truckCount === 1 ? "Truck" : "Trucks"} in Fleet
                                </span>
                              </div>
                            </div>

                            {/* Under each Logistics Carrier: Their Specific Trucks */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                                Select Truck from {provider.company_name} Fleet:
                              </span>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {provider.vehicles?.map((veh) => {
                                  const isSelected =
                                    selectedLogistics.provider_id === provider.id &&
                                    (selectedLogistics.vehicle_id === veh.id || selectedLogistics.vehicle_id === veh.vehicle_id);

                                  const vehTons = parseFloat(veh.max_tons || 0);
                                  const trips = vehTons > 0 ? Math.max(1, Math.ceil(batchMt / vehTons)) : 1;
                                  const vehImgKey = `veh_${veh.id || veh.vehicle_id}`;
                                  const primaryImage = veh.image || (Array.isArray(veh.images) && veh.images[0]);
                                  const showImg = primaryImage && !failedImages[vehImgKey];
                                  const exactTruckLocation = veh.base_location || provider.location || "Carrier Operating Depot";

                                  // Calculate estimated cost for this specific truck
                                  const tripDistance = veh.distance_km ?? provider.distance_km ?? selectedLogistics.distance_km ?? 0;
                                  const singleTrip = tripDistance > 0
                                    ? Math.round((parseFloat(veh.base_amount) || 0) + tripDistance * (parseFloat(veh.rate_amount) || 0))
                                    : Math.round(parseFloat(veh.base_amount) || (parseFloat(veh.rate_amount) || 35000));
                                  const totalCostForThisTruck = (singleTrip > 0 ? singleTrip : 35000) * trips;

                                  return (
                                    <div
                                      key={veh.id || veh.vehicle_id}
                                      onClick={() => {
                                        setSelectedLogistics((prev) => ({
                                          ...prev,
                                          provider_id: provider.id,
                                          provider_name: provider.company_name,
                                          provider_location: provider.location,
                                          vehicle_id: veh.vehicle_id || veh.id,
                                          vehicle_title: veh.title,
                                          vehicle_location: exactTruckLocation,
                                          vehicle_plate: veh.license_plate,
                                          vehicle_image: primaryImage,
                                          max_tons: vehTons || 0,
                                          base_amount: parseFloat(veh.base_amount) || 0,
                                          rate_amount: parseFloat(veh.rate_amount) || 0,
                                          distance_km: veh.distance_km ?? provider.distance_km ?? null,
                                        }));
                                      }}
                                      className={`group rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                                        isSelected
                                          ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/25"
                                          : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/60 dark:bg-slate-950/60 hover:shadow-sm"
                                      }`}
                                    >
                                      {/* Top Badge on Selection */}
                                      {isSelected && (
                                        <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 flex items-center justify-between">
                                          <span className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            Selected Truck For Haulage
                                          </span>
                                          <span className="text-[9px] bg-emerald-700/80 px-2 py-0.5 rounded font-black">
                                            Active Choice
                                          </span>
                                        </div>
                                      )}

                                      <div className="p-3.5 space-y-3">
                                        {/* Truck Photo & Specs */}
                                        <div className="flex gap-3 items-start">
                                          {/* Truck Image Container (Clickable for full zoom) */}
                                          <div
                                            onClick={(e) => {
                                              if (showImg) {
                                                e.stopPropagation();
                                                setZoomImage({
                                                  url: primaryImage,
                                                  title: veh.title,
                                                  plate: veh.license_plate,
                                                  carrier: provider.company_name,
                                                  location: exactTruckLocation,
                                                  type: veh.vehicle_type,
                                                  capacity: `${vehTons} MT`,
                                                });
                                              }
                                            }}
                                            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative flex items-center justify-center ${
                                              showImg ? "cursor-zoom-in group/img hover:ring-2 hover:ring-emerald-500 transition-all" : ""
                                            }`}
                                            title={showImg ? "Click to view full photo & specs" : undefined}
                                          >
                                            {showImg ? (
                                              <>
                                                <img
                                                  src={primaryImage}
                                                  alt={veh.title || "Haulage Truck"}
                                                  onError={() => setFailedImages((prev) => ({ ...prev, [vehImgKey]: true }))}
                                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                  <span className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-md">
                                                    <ZoomIn className="w-4 h-4" />
                                                  </span>
                                                </div>
                                              </>
                                            ) : (
                                              <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                                                <Truck className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                                  Truck Photo
                                                </span>
                                              </div>
                                            )}
                                            {veh.vehicle_type && (
                                              <span className="absolute bottom-1 left-1 right-1 text-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/75 text-white backdrop-blur-xs truncate">
                                                {veh.vehicle_type.replace(/_/g, " ")}
                                              </span>
                                            )}
                                          </div>

                                          {/* Truck Details & Exact Location */}
                                          <div className="min-w-0 flex-1 space-y-1.5">
                                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                              <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                                                {veh.title}
                                              </h4>
                                              {veh.license_plate && (
                                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                                  {veh.license_plate}
                                                </span>
                                              )}
                                            </div>

                                            {/* Exact Location of THIS Truck */}
                                            <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                              <span className="leading-tight">
                                                <span className="text-slate-400 block text-[9px] uppercase font-bold">
                                                  Exact Truck Station / Base:
                                                </span>
                                                <strong className="text-slate-900 dark:text-white font-bold">
                                                  {exactTruckLocation}
                                                </strong>
                                              </span>
                                            </div>

                                            {/* Capacity & Trips Calculation */}
                                            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                                              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                                                <Scale className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Capacity: <strong>{vehTons} MT</strong></span>
                                                <span className="text-slate-400 text-[10px]">
                                                  (~{Math.round(vehTons * 20)} Bags)
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                                {trips} {trips > 1 ? "round trips required" : "single trip required"} for {batchMt} MT
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Pricing & Selection Footer inside Card */}
                                        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                                          <div>
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                              Estimated Cost
                                            </span>
                                            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                              ₦{totalCostForThisTruck.toLocaleString()}
                                            </span>
                                            {veh.rate_amount > 0 && (
                                              <span className="text-[9px] text-slate-400 block">
                                                (₦{Number(veh.rate_amount).toLocaleString()}/km)
                                              </span>
                                            )}
                                          </div>

                                          <button
                                            type="button"
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                                              isSelected
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                                            }`}
                                          >
                                            {isSelected ? (
                                              <>
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                <span>Selected</span>
                                              </>
                                            ) : (
                                              <span>Select Truck</span>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Total Comprehensive Cost Summary */}
              <div className="bg-slate-100/80 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Warehouse Storage Fee ({storageMonths} {storageMonths > 1 ? "months" : "month"}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₦{totalStorageFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Transportation ({transportMethod === "self_delivery" ? "Self-Delivery" : "Platform Truck"}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {transportMethod === "self_delivery" ? "₦0 (Free Direct Drop-Off)" : `₦${totalLogisticsFee.toLocaleString()}`}
                  </span>
                </div>
                {transportMethod === "platform_truck" && selectedLogistics.vehicle_title && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate text-slate-600 dark:text-slate-300">
                        Selected: <strong className="text-slate-900 dark:text-white">{selectedLogistics.vehicle_title}</strong> • Carrier: {selectedLogistics.provider_name}
                      </span>
                    </div>
                    {selectedLogistics.vehicle_location && (
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline text-[10px] font-medium">
                        📍 Stationed: {selectedLogistics.vehicle_location}
                      </span>
                    )}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Total Estimated Intake Commitment:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                    ₦{totalIntegratedFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer (Step 2) */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {transportMethod === "self_delivery"
                    ? "Generates an electronic Warehouse Intake Gate Pass for direct drop-off."
                    : "Dispatches GPS-tracked fleet and notifies certified warehouse of arrival."}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {type !== "logistics" && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || (transportMethod === "platform_truck" && !selectedLogistics.provider_id)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{submitting ? "Processing..." : "Confirm Intake & Reservation"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Truck Photo Zoom Lightbox Modal */}
      {zoomImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Top Bar with Title & Close button */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl flex items-center justify-between pb-3 text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/10 text-emerald-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base leading-tight">
                  {zoomImage.title || "Haulage Truck"}
                </h3>
                <p className="text-xs text-slate-300">
                  {zoomImage.carrier} {zoomImage.plate ? `• Plate: ${zoomImage.plate}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* High-Resolution Centered Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[75vh] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl"
          >
            <img
              src={zoomImage.url}
              alt={zoomImage.title || "Truck zoom view"}
              className="max-h-[75vh] w-auto max-w-full object-contain select-none"
            />
          </div>

          {/* Bottom Specs Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl mt-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Base Station:</span>
              <strong className="text-white">{zoomImage.location}</strong>
            </div>

            <div className="flex items-center gap-3">
              {zoomImage.capacity && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Capacity: {zoomImage.capacity}
                </span>
              )}
              {zoomImage.type && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase">
                  {zoomImage.type.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
