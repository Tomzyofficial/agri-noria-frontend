"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Truck, MapPin, Gauge, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

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
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-(--greenish-color)" />
            Logistics Fleet & Vehicles
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Manage your transport fleet, vehicle capacities, tonnage limits, and base pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer"
            title="Refresh Fleet"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/ecosystem/logistics/vehicles/add-new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-(--greenish-color) hover:opacity-95 text-white font-bold text-sm shadow-md shadow-green-900/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Fleet</span>
            <Truck className="w-5 h-5 text-(--greenish-color)" />
          </div>
          <div className="text-3xl font-black text-(--foreground)">{listings.length}</div>
          <p className="text-xs text-gray-400 mt-1">Registered carrier vehicles</p>
        </div>

        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Payload Capacity</span>
            <Gauge className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-(--foreground)">
            {totalTons.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-semibold text-gray-500">MT</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Across all active trucks</p>
        </div>

        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Operational Status</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {availableCount} <span className="text-sm font-semibold text-gray-500">Available</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{listings.length - availableCount} In Transit / Maintenance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-(--background) p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by title, location, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-(--greenish-color)"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold cursor-pointer"
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
        <div className="flex items-center justify-center py-24">
          <FaSpinner className="animate-spin text-3xl text-(--greenish-color)" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-(--background) rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 p-8">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Vehicles Found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
            {search ? "No vehicles match your current search filters." : "You have not registered any fleet vehicles yet. Add your trucks so farmers and clusters can request your services."}
          </p>
          <Link
            href="/ecosystem/logistics/vehicles/add-new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--greenish-color) text-white font-bold text-sm shadow-md hover:opacity-90"
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
                className="bg-white dark:bg-(--background) rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image or Vehicle Icon header */}
                  <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {veh.image ? (
                      <img
                        src={veh.image}
                        alt={veh.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Truck className="w-12 h-12 mb-1 stroke-1" />
                        <span className="text-xs uppercase tracking-wider font-bold">Standard Haulage</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                        status === "available"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                          : status === "in_transit"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300"
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
                      <span className="px-2 py-0.5 text-[10px] font-black rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase tracking-widest shrink-0">
                        {veh.license_plate || "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Payload Capacity</span>
                        <span className="font-extrabold text-gray-800 dark:text-gray-100 text-sm">
                          {tons} MT
                        </span>
                        <span className="text-gray-400 text-[10px] block">({Number(veh.max_weight_kg || tons * 1000).toLocaleString()} kg)</span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Base Fee / Rate</span>
                        <span className="font-extrabold text-emerald-600 text-sm">
                          ₦{baseAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-[10px] block capitalize">{veh.pricing_model?.replace("_", " ") || "per trip"}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-(--greenish-color)" />
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
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Type: {veh.vehicle_type?.replace(/_/g, " ") || "Truck"}</span>
                    <span className="text-(--greenish-color) font-bold flex items-center gap-1">
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
