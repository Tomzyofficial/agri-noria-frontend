"use client";

import { useMemo, useState } from "react";
import { DroneCard } from "./DroneCard";
import { DroneAdShowcase } from "./DroneAdShowcase";
import { Input } from "@/components/ui/Input";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { ErrorUi } from "@/components/ui/Error";

const FILTERS = [
   { value: "all", label: "All" },
   { value: "sale", label: "Sale" },
   { value: "rent", label: "Rent" },
   { value: "both", label: "Sale & rent" },
];

export function DroneMarketplacePage({ listings = [], campaigns = [], total, error }) {
   const [searchTerm, setSearchTerm] = useState("");
   const [filterType, setFilterType] = useState("all");

   const filteredListings = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      return listings.filter((listing) => {
         const fields = [listing.listing_name, listing.manufacturer, listing.model, listing.category, listing.location].filter(Boolean).join(" ").toLowerCase();
         const matchesSearch = !term || fields.includes(term);
         const matchesFilter = filterType === "all" || listing.listing_type === filterType || (filterType === "sale" && listing.listing_type === "both") || (filterType === "rent" && listing.listing_type === "both");
         return matchesSearch && matchesFilter;
      });
   }, [filterType, listings, searchTerm]);

   return (
      <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
         <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
               <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">Drone marketplace</p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Agricultural drones for sale, rental, and field operations</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Compare crop-spraying, mapping, surveillance, and payload drones from verified marketplace vendors.</p>
               </div>
               {/* <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div>
                     <p className="text-xs uppercase text-slate-500">Active listings</p>
                     <p className="mt-1 text-2xl font-bold">{total || listings.length}</p>
                  </div>
                  <div>
                     <p className="text-xs uppercase text-slate-500">Sponsored</p>
                     <p className="mt-1 text-2xl font-bold">{campaigns.length}</p>
                  </div>
               </div> */}
            </header>

            <DroneAdShowcase campaigns={campaigns} />

            <section className="space-y-5">
               <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-end">
                  <div className="min-w-0 flex-1">
                     <label htmlFor="drone-search" className="text-xs font-semibold uppercase text-slate-500">
                        Search inventory
                     </label>
                     <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                           id="drone-search"
                           type="search"
                           placeholder="Search name, manufacturer, model, category, or location"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950"
                        />
                     </div>
                  </div>
                  <div className="lg:w-64">
                     <label htmlFor="drone-filter" className="text-xs font-semibold uppercase text-slate-500">
                        Listing type
                     </label>
                     <div className="relative mt-1">
                        <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select id="drone-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950">
                           {FILTERS.map((filter) => (
                              <option key={filter.value} value={filter.value}>
                                 {filter.label}
                              </option>
                           ))}
                        </select>
                     </div>
                  </div>
               </div>

               {error ? (
                  <ErrorUi />
               ) : filteredListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-4 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                     <PackageSearch className="h-10 w-10 text-slate-400" />
                     <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">No drone listings match your filters.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     {filteredListings.map((listing) => (
                        <DroneCard key={listing.id} listing={listing} sponsored={false} campaignId={null} />
                     ))}
                  </div>
               )}
            </section>
         </div>
      </main>
   );
}
