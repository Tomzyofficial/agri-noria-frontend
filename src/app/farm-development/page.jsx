import Link from "next/link";
import { apiUrl } from "@/_lib/api";
import { formatLabel } from "@/utils/otherUtils";

export async function getData() {
  const response = await fetch(apiUrl("/api/farm-development/public/service-list"));
  const data = await response.json();
  return data;
}

export default async function FarmingPage() {
  const service = await getData();

  const categoryIcons = {
    "fish-farm-design": "📐",
    "poultry-farm-construction": "🌳",
    irrigation: "💧",
    "crop-production": "🌽",
    "farm-construction": "🏗️",
    consultancy: "💼",
    mechanized: "🚜",
    "soil-management": "🧪",
  };

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #2C1A0E 0%, #3D6B45 50%, #5C3D1E 100%)",
          padding: "100px 24px",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Decorative patterns */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: "radial-gradient(circle, #F2D078 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(200,135,58,0.15)",
            filter: "blur(60px)",
          }}
        />

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ maxWidth: "680px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(232,168,76,0.2)",
                border: "1px solid rgba(232,168,76,0.4)",
                borderRadius: "99px",
                padding: "6px 16px",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "14px" }}>🌾</span>
              <span style={{ color: "#F2D078", fontSize: "13px", fontWeight: "600", fontFamily: "DM Sans, sans-serif" }}>Large-Scale Farming & Farm Development</span>
            </div>

            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(40px, 6vw, 68px)",
                fontWeight: "900",
                color: "#FAF5EC",
                lineHeight: 1.1,
                marginBottom: "20px",
              }}
            >
              Where Great Farms
              <br />
              <span style={{ color: "#F2D078" }}>Are Built</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "rgba(250,245,236,0.8)",
                lineHeight: 1.7,
                marginBottom: "36px",
                maxWidth: "560px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Connect with Nigeria's top verified providers for farm design, land preparation, irrigation systems, greenhouse construction, and full-scale crop production services.
            </p>

            <div>
              <Link
                href="/farming/services"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#FAF5EC",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section style={{ padding: "72px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#2C1A0E", marginBottom: "12px" }}>Service Categories</h2>
          <p style={{ color: "#8B5E3C", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>From drawing board to harvest — find providers for every phase of large-scale farm development</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {(service.serviceCategoryCard || []).map((cat, i) => (
            <Link key={cat.category} href={`/farm-development/services?category=${cat.category}`} style={{ textDecoration: "none" }}>
              <div className="bg-white rounded-lg p-[24px] h-40 border border-gray-200 text-center transition transition-all duration-250 hover:translate-y-[-3px] hover:border-[#9DC07A] hover:shadow-[0_8px_24px_rgba(61,107,69,0.12)]">
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{categoryIcons[cat.slug] || "🌱"}</div>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "15px", fontWeight: "700", color: "#2C1A0E", marginBottom: "6px" }}>{formatLabel(cat.category)}</h3>
                <p style={{ fontSize: "12px", color: "#8B5E3C" }}>
                  {cat.service_count} service{cat.service_count !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #2C1A0E, #3D6B45)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#FAF5EC",
              marginBottom: "16px",
            }}
          >
            Ready to Start Your Farm Project?
          </h2>
          <p style={{ color: "rgba(250,245,236,0.8)", fontSize: "16px", marginBottom: "32px" }}>Browse our network of verified farming service providers and request a custom quote today.</p>
          <Link
            href="/farming/providers"
            style={{
              background: "#E8A84C",
              color: "#2C1A0E",
              textDecoration: "none",
              padding: "15px 36px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            Find a Provider →
          </Link>
        </div>
      </section>
    </div>
  );
}
