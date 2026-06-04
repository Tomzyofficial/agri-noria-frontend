"use client";

import { useState } from "react";
import MaterialCard from "./MaterialCard";
import { Search, Funnel, X, Video, Image, FileText } from "lucide-react";
import { ErrorUi } from "@/components/ui/Error";

const FILE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "video", label: "Video", Icon: Video },
  { value: "pdf", label: "PDF", Icon: FileText },
  { value: "image", label: "Image", Icon: Image },
];

const STAT_CARDS = [
  { key: "total", label: "Total Resources" },
  { key: "video", label: "Video Courses" },
  { key: "pdf", label: "PDF Guides" },
  { key: "image", label: "Visual Diagrams" },
];

export function TrainingPage({ materials, error }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  //  const materials = materials ?? [];
  const filteredMaterials = materials.filter((material) => {
    const matchesType =
      typeFilter === "all" ||
      material.file_type?.toLowerCase().includes(typeFilter);

    const matchesCategory =
      categoryFilter === "all" || material.category === categoryFilter;

    const matchesSearch =
      !searchQuery ||
      material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCategory && matchesSearch;
  });

  const all = materials ?? [];
  const uniqueCategory = [...new Set(all.map((item) => item.category))];
  const CATEGORIES = ["all", ...uniqueCategory];

  const stats = {
    total: all.length,
    video: all.filter((m) => m.file_type.includes("video")).length,
    pdf: all.filter((m) => m.file_type.includes("pdf")).length,
    image: all.filter((m) => m.file_type.includes("image")).length,
  };

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

  const hasActiveFilters =
    typeFilter !== "all" || categoryFilter !== "all" || searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#2D4A3E" }}
      >
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "#8CC9AE" }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: "#8CC9AE" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#8CC9AE" }}
          >
            Vendor Training Library
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{
              fontFamily: "'DM Serif Display', serif",
              letterSpacing: "-0.5px",
            }}
          >
            Learn from the{" "}
            <em className="italic" style={{ color: "#8CC9AE" }}>
              best.
            </em>
          </h1>
          <p
            className="text-base max-w-lg mb-10"
            style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}
          >
            Browse curated training materials — videos, guides, and visual
            references — sourced from our certified vendor partners.
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
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-20 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
              <Search size={16} />
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
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full">
            {FILE_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  typeFilter === value
                    ? { background: "#2D4A3E", color: "#fff" }
                    : { color: "#78716c" }
                }
              >
                {Icon && <Icon size={13} />}
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-stone-500">
            <Funnel size={14} />
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
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <ErrorUi />
          </div>
        )}

        {!error && filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "#E8F0EC" }}
            >
              <Search />
            </div>
            <p
              className="font-semibold text-stone-800"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "18px",
              }}
            >
              No materials found
            </p>
            <p className="text-sm text-stone-500 max-w-xs">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80"
              style={{ background: "#2D4A3E" }}
            >
              Reset filters
            </button>
          </div>
        )}

        {filteredMaterials.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-background lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-stone-400">
            © {new Date().getFullYear()} Training Hub. Agri-Noria. All rights
            reserved.
          </span>
          <span className="text-xs text-stone-400">
            Content provided by certified vendor partners
          </span>
        </div>
      </footer>
    </div>
  );
}
