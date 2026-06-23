"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { FaSearch } from "react-icons/fa";
import { IoFunnel } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/Button";

export default function FarmDevelopmentMarketplace({ services }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimerRef = useRef(null);
  //   const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = services.filter((service) => {
    const matchesSearch = !searchQuery || service.title.toLowerCase().includes(searchQuery.toLowerCase());
    // const matchesCategory = categoryFilter === "all" || service.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && true;
  });

  //   const all = services ?? [];
  //   const uniqueCategory = [...new Set(all.map((item) => item.category))];
  //   const CATEGORIES = ["all", ...uniqueCategory];

  const clearAllFilters = () => {
    //  setCategoryFilter("all");
    setSearchQuery("");
    setSearchInput("");
  };
  const hasActiveFilters = false || searchQuery;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 350);
  };
  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  return (
    <main>
      {/* <section
        style={{
          minHeight: 520,
          display: "flex",
          alignItems: "center",
          backgroundImage: "linear-gradient(90deg, rgba(17,34,24,.88), rgba(17,34,24,.55)), url('/images/gettyimages.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          padding: "72px 24px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontWeight: 800, color: "#f0c46c", marginBottom: 12 }}>Farm Development Marketplace</p>
            <h1
              style={{
                fontSize: "clamp(38px, 6vw, 70px)",
                lineHeight: 1.02,
                marginBottom: 18,
                fontWeight: 900,
              }}
            >
              Find the companies that build working farms.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, maxWidth: 580 }}>Browse verified providers for farm design, construction, irrigation, fencing, land preparation, greenhouses, livestock housing, and agricultural infrastructure.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <Link href="/farm-development/providers">Browse Providers</Link>
              <Link href="/farm-development/services">View Services</Link>
            </div>
          </div>
        </div>
      </section> */}

      <section className="px-5 py-10">
        <div className="text-foreground">
          <h2>Service Categories</h2>
          <p>From drawing board to harvest</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-1/2">
            <span className="absolute left-3 top-[11px] text-stone-400 pointer-events-none">
              <FaSearch size={16} />
            </span>
            <Input ref={searchTimerRef} className="w-full pl-9 pr-8 py-2 text-sm bg-stone-50 border border-stone-200 rounded-full outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:bg-white" placeholder="Search services..." value={searchInput} onChange={handleSearchChange} />
          </div>
          {/* <div className="flex items-center gap-1.5 text-stone-500">
            <IoFunnel size={14} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-sm bg-transparent border-none outline-none cursor-pointer font-medium text-stone-700 pr-1">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div> */}
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} className="flex bg-[#FFF3E8] text-[#B84A2E] items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:opacity-80">
              <IoMdClose size={12} />
              Clear filters
            </Button>
          )}
        </div>
        <div className="my-10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#E8F0EC" }}>
                <FaSearch />
              </div>
              <p
                className="font-semibold text-stone-800"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "18px",
                }}
              >
                No services found
              </p>
              <p className="text-sm text-stone-500 max-w-xs">Try adjusting your filters or search query.</p>
              <button onClick={clearAllFilters} className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80" style={{ background: "#2D4A3E" }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {filtered.map((service) => (
                <Link key={service.id} href={`/farm-development/services/${service.slug}/${service.id}`} style={{ textDecoration: "none" }}>
                  <div className="rounded-md border border-gray-200 bg-white transition duration-360 hover:translate-y-2">
                    <div className="w-full h-full">
                      <Image src={service.featured_image} alt={service.title} width={150} height={150} className="aspect-square object-cover w-full h-full rounded-t-md" />
                    </div>
                    <div className="p-2">
                      <div>
                        <p>{service.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
