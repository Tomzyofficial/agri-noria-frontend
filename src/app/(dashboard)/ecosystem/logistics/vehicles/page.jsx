"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Search, Truck, MapPin, Gauge, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EcosystemVehiclesPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { data, error, isLoading, mutate } = useSWR("/api/proxy/vendor/logistics/vehicles", fetcher);

  const listings = data?.listings || [];

  const filteredVehicles = listings.filter((veh) => {
    const matchesSearch = 
      veh.title?.toLowerCase().includes(search.toLowerCase()) ||
      veh.base_location?.toLowerCase().includes(search.toLowerCase()) ||
      veh.license_plate?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || veh.vehicle_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalTons = listings.reduce((sum, v) => sum + (parseFloat(v.max_tons) || (v.max_weight_kg ? parseFloat(v.max_weight_kg) / 1000 : 0)), 0);
  const availableCount = listings.filter((v) => (v.status || "available") === "available").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Fleet Asset Registry
            </span>
            <span className="text-xs text-gray-400 font-semibold">• Live Carrier Roster</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Truck className="w-7 h-7 text-emerald-600" />
            Logistics Fleet & Vehicles
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage your transport fleet, vehicle capacities, tonnage limits, and base trip pricing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => mutate()}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
            title="Refresh Fleet"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Sync Fleet</span>
          </button>
          <Link
            href="/ecosystem/logistics/vehicles/add-new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Fleet
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{listings.length}</div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck size={13} /> Registered Carrier Vehicles
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Payload Capacity
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Gauge size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {totalTons.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-base font-bold text-gray-400">MT</span>
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2">
              Combined Haulage Across Fleet
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Operational Status
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {availableCount} <span className="text-base font-bold text-gray-400">Available</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
              {listings.length - availableCount} Currently In Transit / Assigned
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/90 dark:bg-gray-900/90 p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, base station, license plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 text-xs font-bold bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Vehicle Types</option>
            <option value="flatbed">Flatbed</option>
            <option value="enclosed_box">Enclosed Box Truck</option>
            <option value="refrigerated">Refrigerated Truck</option>
            <option value="10_ton_truck">10-Ton Truck</option>
            <option value="5_ton_truck">5-Ton Truck</option>
            <option value="3_ton_truck">3-Ton Truck</option>
            <option value="mini_van">Mini-Van / Wagon</option>
          </select>
        </div>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FaSpinner className="animate-spin text-3xl text-emerald-600" />
          <span className="text-xs font-bold text-gray-400">Loading Fleet Registry...</span>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Truck size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Vehicles Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
            {search ? "No vehicles match your current search filters." : "You have not registered any fleet vehicles yet. Add your trucks so farmers and clusters can request your services."}
          </p>
          <Link
            href="/ecosystem/logistics/vehicles/add-new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500"
          >
            <Plus className="w-4 h-4" /> Add First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((veh) => {
            const tons = parseFloat(veh.max_tons) || (veh.max_weight_kg ? parseFloat(veh.max_weight_kg) / 1000 : 0);
            const status = (veh.status || "available").toLowerCase();
            const baseAmount = parseFloat(veh.base_amount) || parseFloat(veh.rate_amount) || 0;

            return (
              <div
                key={veh.id}
                className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image or Vehicle Icon header */}
                  <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center overflow-hidden">
                    {veh.image ? (
                      <img
                        src={veh.image}
                        alt={veh.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Truck className="w-12 h-12 mb-1 stroke-1" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Standard Haulage</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs backdrop-blur-md ${
                        status === "available"
                          ? "bg-emerald-500/90 text-white"
                          : status === "in_transit"
                          ? "bg-blue-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-base text-gray-900 dark:text-white leading-tight">
                        {veh.title || "Carrier Truck"}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase tracking-widest shrink-0 border border-gray-200 dark:border-gray-700">
                        {veh.license_plate || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Payload Capacity</span>
                        <span className="font-black text-gray-900 dark:text-white text-sm">
                          {tons} MT
                        </span>
                        <span className="text-gray-400 text-[10px] block">({Number(veh.max_weight_kg || tons * 1000).toLocaleString()} kg)</span>
                      </div>

                      <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Base Fee / Rate</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ₦{baseAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-[10px] block capitalize">{veh.pricing_model?.replace("_", " ") || "per trip"}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{veh.base_location || "Regional Station"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <span className="font-bold">Cargo:</span>
                        <span className="capitalize">{veh.cargo_type?.replace("_", " ") || "Agricultural Produce"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Type: {veh.vehicle_type?.replace(/_/g, " ") || "Truck"}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      Active In Requests
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
