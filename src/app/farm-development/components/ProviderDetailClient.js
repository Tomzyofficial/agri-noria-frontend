"use client";
import { useState } from "react";
import QuoteModal from "./QuoteModal";
import { ServiceCard } from "./Cards";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { CiClock2 } from "react-icons/ci";
import Link from "next/link";
import { formatDate } from "@/utils/otherUtils";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function ProviderDetailClient({ provider }) {
   const [activeTab, setActiveTab] = useState("services");
   const [quoteOpen, setQuoteOpen] = useState(false);
   const [selectedService, setSelectedService] = useState(null);
   console.log("selected", selectedService);

   const tabs = [
      { key: "services", label: `Services (${provider.services?.length || 0})` },
      { key: "portfolio", label: `Portfolio (${provider.portfolio?.length || 0})` },
   ];

   const formatPrice = (min, max, unit, currency) => {
      if (!min && !max) return "Request quote";
      const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(n);
      if (min && max) return `${fmt(min)} – ${fmt(max)} ${unit || ""}`;
      if (min) return `From ${fmt(min)} ${unit || ""}`;
      return `Up to ${fmt(max)} ${unit || ""}`;
   };

   return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
         {/* Back */}
         <Link
            href="/farm-development/services"
            style={{
               color: "#6A9B5F",
               textDecoration: "none",
               fontSize: "14px",
               fontWeight: "500",
               display: "inline-flex",
               alignItems: "center",
               gap: "6px",
               marginBottom: "32px",
            }}
         >
            <FaLongArrowAltLeft size="13" /> Back
         </Link>

         {/* Provider header */}
         <div
            style={{
               background: "#FFFFFF",
               borderRadius: "20px",
               border: "1px solid #E8DDD0",
               overflow: "hidden",
               marginBottom: "32px",
               boxShadow: "0 4px 16px rgba(44,26,14,0.06)",
            }}
         >
            {/* Cover gradient */}
            <div
               style={{
                  height: "160px",
                  background: "linear-gradient(135deg, #2C1A0E 0%, #3D6B45 50%, #8B5E3C 100%)",
                  position: "relative",
               }}
            >
               <div
                  style={{
                     position: "absolute",
                     inset: 0,
                     opacity: 0.1,
                     backgroundImage: "radial-gradient(circle, #F2D078 1px, transparent 1px)",
                     backgroundSize: "30px 30px",
                  }}
               />
            </div>

            <div style={{ padding: "0 32px 32px" }}>
               {/* Avatar & badges */}
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-40px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div
                     style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #3D6B45, #6A9B5F)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFF",
                        fontSize: "32px",
                        fontWeight: "700",
                        fontFamily: "Playfair Display, serif",
                        border: "4px solid #FFFFFF",
                        flexShrink: 0,
                     }}
                  >
                     {provider.business_name?.charAt(0)}
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                     {provider.is_verified && (
                        <span
                           style={{
                              background: "#EBF5EB",
                              color: "#3D6B45",
                              fontSize: "13px",
                              fontWeight: "600",
                              padding: "6px 14px",
                              borderRadius: "99px",
                              border: "1px solid #9DC07A",
                           }}
                        >
                           ✓ Verified Provider
                        </span>
                     )}
                  </div>
               </div>

               <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(24px, 4vw, 36px)", color: "#2C1A0E", marginBottom: "6px" }}>{provider.business_name}</h1>

               {/* Meta */}
               <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {[
                     { icon: <FaLocationDot />, text: provider.address || "N/A" },
                     { icon: <CiClock2 />, text: "Within 24 hours" },
                  ].map(
                     (m) =>
                        m.text && (
                           <span key={m.text} style={{ fontSize: "13px", color: "#8B5E3C", display: "flex", alignItems: "center", gap: "5px" }}>
                              {m.icon} {m.text}
                           </span>
                        )
                  )}
               </div>

               <p className="text-md leading-7 max-w-2xl text-gray-400">{provider.business_desc}</p>
               {/* Rating */}
               <div
                  style={{
                     marginTop: "20px",
                     display: "inline-flex",
                     alignItems: "center",
                     gap: "10px",
                     background: "#FAF5EC",
                     padding: "8px 16px",
                     borderRadius: "99px",
                  }}
               >
                  <span style={{ color: "#E8A84C" }}>★★★★★</span>
                  <span style={{ fontWeight: "700", color: "#2C1A0E" }}>{Number(provider.rating || 0).toFixed(1)}</span>
                  <span style={{ color: "#8B5E3C", fontSize: "13px" }}>({provider.review_count} reviews)</span>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div
            style={{
               display: "flex",
               gap: "4px",
               background: "#FFFFFF",
               borderRadius: "12px",
               padding: "6px",
               border: "1px solid #E8DDD0",
               marginBottom: "28px",
               width: "fit-content",
            }}
         >
            {tabs.map((t) => (
               <Button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                     padding: "8px 20px",
                     borderRadius: "8px",
                     border: "none",
                     background: activeTab === t.key ? "#3D6B45" : "transparent",
                     color: activeTab === t.key ? "#FFF" : "#5C3D1E",
                     fontWeight: "600",
                     fontSize: "14px",
                     cursor: "pointer",
                     transition: "all 0.2s",
                     fontFamily: "DM Sans, sans-serif",
                  }}
               >
                  {t.label}
               </Button>
            ))}
         </div>

         {/* Services tab */}
         {activeTab === "services" && (
            <div>
               {provider.services?.length === 0 ? (
                  <p style={{ color: "#8B5E3C", textAlign: "center", padding: "48px" }}>No services listed yet.</p>
               ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                     {provider.services?.map((s) => (
                        <div key={s.id}>
                           <ServiceCard service={s} showProvider={false} />
                           <Button
                              onClick={() => {
                                 setSelectedService(s);
                                 setQuoteOpen(true);
                              }}
                              style={{
                                 width: "100%",
                                 marginTop: "8px",
                                 padding: "10px",
                                 background: "#EBF5EB",
                                 color: "#3D6B45",
                                 border: "1px solid #9DC07A",
                                 borderRadius: "8px",
                                 fontWeight: "600",
                                 fontSize: "13px",
                                 cursor: "pointer",
                                 fontFamily: "DM Sans, sans-serif",
                              }}
                           >
                              Request Quote for This Service
                           </Button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* Portfolio tab */}
         {activeTab === "portfolio" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {provider.portfolio?.length === 0 ? (
                  <p style={{ color: "#8B5E3C", textAlign: "center", padding: "48px" }}>No portfolio projects listed yet.</p>
               ) : (
                  provider.portfolio?.map((project) => (
                     <div key={project.id} className="bg-white rounded-lg border border-[#E8DDD0] p-7">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                           <div>
                              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", color: "#2C1A0E", marginBottom: "4px" }}>{project.title}</h3>
                              <p style={{ fontSize: "13px", color: "#8B5E3C" }}>
                                 {project.location} · {formatDate(project.completion_date)}
                              </p>
                           </div>
                        </div>

                        {project.client_type && (
                           <p style={{ fontSize: "13px", color: "#8B5E3C", marginBottom: "10px" }}>
                              Client: <strong style={{ color: "#5C3D1E" }}>{project.client_type}</strong>
                           </p>
                        )}

                        {project.project_duration && (
                           <p style={{ fontSize: "13px", color: "#8B5E3C", marginBottom: "10px" }}>
                              Project Duration: <strong style={{ color: "#5C3D1E" }}>{project.project_duration}</strong>
                           </p>
                        )}

                        <p className="text-sm leading-6 text-[#5C3D1E] mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-3 overflow-x-auto">{project.gallery_images?.length > 0 && project.gallery_images.map((image, index) => <Image key={index} width={300} height={300} src={image} alt={`Project image ${index + 1}`} className="w-40 h-40 object-cover rounded-lg mb-3" />)}</div>
                     </div>
                  ))
               )}
            </div>
         )}

         {quoteOpen && (
            <QuoteModal
               provider={provider}
               service={selectedService}
               onClose={() => {
                  setQuoteOpen(false);
                  setSelectedService(null);
               }}
            />
         )}
      </div>
   );
}
