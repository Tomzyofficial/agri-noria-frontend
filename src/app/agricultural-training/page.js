"use client";

import { useState } from "react";
import { useMaterials } from "./lib/useMaterials";
import MaterialCard from "./components/MaterialCard";
import SkeletonCard from "./components/SkeletonCard";
import { IconSearch, IconFilter, IconX, IconVideo, IconDocument, IconImage } from "./components/Icons";

const FILE_TYPES = [
   { value: "all", label: "All Types" },
   { value: "video", label: "Video", Icon: IconVideo },
   { value: "pdf", label: "PDF", Icon: IconDocument },
   { value: "image", label: "Image", Icon: IconImage },
];

const CATEGORIES = ["all", "Cloud", "Security", "Engineering", "Management", "Compliance"];

const STAT_CARDS = [
   { key: "total", label: "Total Resources" },
   { key: "video", label: "Video Courses" },
   { key: "pdf", label: "PDF Guides" },
   { key: "image", label: "Visual Diagrams" },
];

export default function TrainingPage() {
   const [typeFilter, setTypeFilter] = useState("all");
   const [categoryFilter, setCategoryFilter] = useState("all");
   const [searchInput, setSearchInput] = useState("");
   const [searchQuery, setSearchQuery] = useState("");

   const { materials, loading, error, stats, refetch } = useMaterials({
      type: typeFilter,
      category: categoryFilter,
      search: searchQuery,
   });

   const handleSearchChange = (e) => {
      const val = e.target.value;
      setSearchInput(val);
      clearTimeout(window.__searchTimer);
      window.__searchTimer = setTimeout(() => setSearchQuery(val), 350);
   };

   const clearSearch = () => {
      setSearchInput("");
      setSearchQuery("");
   };

   const clearAllFilters = () => {
      setTypeFilter("all");
      setCategoryFilter("all");
      clearSearch();
   };

   const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || searchQuery;

   return (
      <div className="min-h-screen" style={{ background: "#F6F4EF", fontFamily: "'DM Sans', sans-serif" }}>
         {/* Header */}
         <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span
                     className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                     style={{ background: "#2D4A3E" }}
                  >
                     T
                  </span>
                  <span
                     className="font-semibold text-stone-800 text-[15px]"
                     style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                     Training Hub
                  </span>
               </div>
               <nav className="hidden md:flex items-center gap-1">
                  {["Materials", "Vendors", "My Progress", "Certifications"].map((item, i) => (
                     <a
                        key={item}
                        href="#"
                        className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                           color: i === 0 ? "#2D4A3E" : "#78716c",
                           background: i === 0 ? "#E8F0EC" : "transparent",
                        }}
                     >
                        {item}
                     </a>
                  ))}
               </nav>
               <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: "#2D4A3E" }}
               >
                  JD
               </div>
            </div>
         </header>

         {/* Hero */}
         <section className="relative overflow-hidden" style={{ background: "#2D4A3E" }}>
            <div
               className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
               style={{ background: "#8CC9AE" }}
            />
            <div
               className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
               style={{ background: "#8CC9AE" }}
            />
            <div className="relative max-w-7xl mx-auto px-6 py-16">
               <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#8CC9AE" }}>
                  Vendor Training Library
               </p>
               <h1
                  className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}
               >
                  Learn from the{" "}
                  <em className="italic" style={{ color: "#8CC9AE" }}>
                     best.
                  </em>
               </h1>
               <p className="text-base max-w-lg mb-10" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                  Browse curated training materials — videos, guides, and visual references — sourced from our certified
                  vendor partners.
               </p>
               <div className="flex flex-wrap gap-3">
                  {STAT_CARDS.map(({ key, label }) => (
                     <div
                        key={key}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                        style={{
                           background: "rgba(255,255,255,0.1)",
                           backdropFilter: "blur(8px)",
                           border: "1px solid rgba(255,255,255,0.15)",
                        }}
                     >
                        <span
                           className="text-2xl font-bold text-white"
                           style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                           {stats[key]}
                        </span>
                        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                           {label}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Controls */}
         <div className="sticky top-16 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
               <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                     <IconSearch size={16} />
                  </span>
                  <input
                     type="text"
                     value={searchInput}
                     onChange={handleSearchChange}
                     placeholder="Search materials…"
                     className="w-full pl-9 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-full outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:bg-white"
                  />
                  {searchInput && (
                     <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                     >
                        <IconX size={14} />
                     </button>
                  )}
               </div>

               <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full">
                  {FILE_TYPES.map(({ value, label, Icon }) => (
                     <button
                        key={value}
                        onClick={() => setTypeFilter(value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={typeFilter === value ? { background: "#2D4A3E", color: "#fff" } : { color: "#78716c" }}
                     >
                        {Icon && <Icon size={13} />}
                        {label}
                     </button>
                  ))}
               </div>

               <div className="flex items-center gap-1.5 text-stone-500">
                  <IconFilter size={14} />
                  <select
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                     className="text-sm bg-transparent border-none outline-none cursor-pointer font-medium text-stone-700 pr-1"
                  >
                     {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                           {c === "all" ? "All Categories" : c}
                        </option>
                     ))}
                  </select>
               </div>

               {hasActiveFilters && (
                  <button
                     onClick={clearAllFilters}
                     className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                     style={{ background: "#FFF3E8", color: "#B84A2E" }}
                  >
                     <IconX size={12} />
                     Clear filters
                  </button>
               )}

               {!loading && (
                  <span className="ml-auto text-xs text-stone-400 font-medium hidden sm:block">
                     {materials.length} {materials.length === 1 ? "result" : "results"}
                  </span>
               )}
            </div>
         </div>

         {/* Main */}
         <main className="max-w-7xl mx-auto px-6 py-10">
            {error && (
               <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div
                     className="w-14 h-14 rounded-2xl flex items-center justify-center"
                     style={{ background: "#FFF3E8" }}
                  >
                     <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="font-semibold text-stone-800">Failed to load materials</p>
                  <p className="text-sm text-stone-500">{error}</p>
                  <button
                     onClick={() => refetch()}
                     className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80"
                     style={{ background: "#2D4A3E" }}
                  >
                     Try again
                  </button>
               </div>
            )}

            {loading && !error && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <SkeletonCard key={i} />
                  ))}
               </div>
            )}

            {!loading && !error && materials.length === 0 && (
               <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div
                     className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                     style={{ background: "#E8F0EC" }}
                  >
                     🔍
                  </div>
                  <p
                     className="font-semibold text-stone-800"
                     style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}
                  >
                     No materials found
                  </p>
                  <p className="text-sm text-stone-500 max-w-xs">Try adjusting your filters or search query.</p>
                  <button
                     onClick={clearAllFilters}
                     className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80"
                     style={{ background: "#2D4A3E" }}
                  >
                     Reset filters
                  </button>
               </div>
            )}

            {!loading && !error && materials.length > 0 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.map((material) => (
                     <MaterialCard key={material.id} material={material} />
                  ))}
               </div>
            )}
         </main>

         <footer className="border-t border-stone-200 mt-10">
            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
               <span className="text-sm text-stone-400">
                  © {new Date().getFullYear()} Training Hub. All rights reserved.
               </span>
               <span className="text-xs text-stone-400">Content provided by certified vendor partners</span>
            </div>
         </footer>
      </div>
   );
}
