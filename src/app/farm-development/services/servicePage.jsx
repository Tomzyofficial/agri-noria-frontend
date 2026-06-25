"use client";
import { apiUrl } from "@/_lib/api";
import { ServiceCard } from "../components/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

async function getData(searchParams) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "12");

  const serviceRes = await fetch(apiUrl(`/api/farm-development/public/service-list?${params}`), { cache: "no-store" });
  if (!serviceRes.ok) {
    console.error("Error with servies", serviceRes.status, serviceRes.statusText);
  }

  const services = await serviceRes.json();
  return services;
}

export default function ServicesPage({ services }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimerRef = useRef(null);
  //   const sp =  useSearchParams();
  //   const services = getData(sp);

  const filteredServices = services.services.filter((service) => {
    const matchesSearch = !searchQuery || service.title?.toLowerCase().includes(searchQuery.toLowerCase()) || service.min_budget?.includes(searchQuery) || service.max_budget?.includes(searchQuery);

    return matchesSearch;
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 350);
  };
  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 0" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 44px)", color: "#2C1A0E", marginBottom: "10px" }}>Farming Services</h1>
        <p style={{ color: "#8B5E3C", fontSize: "16px" }}>Browse {services?.services.length || 0} available services from verified farming providers</p>
      </div>

      <div>
        {/* Search area */}
        <div className="relative w-full md:w-1/2 mb-10">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <Search size={16} />
          </span>
          <Input type="text" ref={searchTimerRef} value={searchInput} onChange={handleSearchChange} placeholder="Search by title, price range..." className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 border border-stone-200 rounded-full outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:bg-white" />
          {searchInput && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div>
          {filteredServices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", color: "#2C1A0E", marginBottom: "8px" }}>No services found</h3>
              <p style={{ color: "#8B5E3C" }}>Try a different search term</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {filteredServices.map((s) => (
                <ServiceCard key={s.id} service={s} showProvider={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
