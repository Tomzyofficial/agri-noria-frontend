import Link from "next/link";
import {
  ProviderCard,
  ServiceCard,
  StatBadge,
} from "./components/farming/Cards";

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const [featuredRes, statsRes, servicesRes, categoriesRes] = await Promise.all(
    [
      fetch(`${base}/api/proxy/farming/providers?featured=true&limit=3`, {
        cache: "no-store",
      }),
      fetch(`${base}/api/proxy/farming/stats`, { cache: "no-store" }),
      fetch(`${base}/api/proxy/farming/services?limit=4`, {
        cache: "no-store",
      }),
      fetch(`${base}/api/proxy/farming/categories`, { cache: "no-store" }),
    ],
  );

  const [featured, stats, services, categories] = await Promise.all([
    featuredRes.ok ? featuredRes.json() : { providers: [] },
    statsRes.ok ? statsRes.json() : {},
    servicesRes.ok ? servicesRes.json() : { services: [] },
    categoriesRes.ok ? categoriesRes.json() : { categories: [] },
  ]);

  return { featured, stats, services, categories };
}

export default async function FarmingPage() {
  const { featured, stats, services, categories } = await getData();

  const categoryIcons = {
    "farm-design": "📐",
    "land-clearing": "🌳",
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
          background:
            "linear-gradient(160deg, #2C1A0E 0%, #3D6B45 50%, #5C3D1E 100%)",
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
            backgroundImage:
              "radial-gradient(circle, #F2D078 1px, transparent 1px)",
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

        <div
          style={{
            position: "relative",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
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
              <span
                style={{
                  color: "#F2D078",
                  fontSize: "13px",
                  fontWeight: "600",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Large-Scale Farming & Farm Development
              </span>
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
              Connect with Nigeria's top verified providers for farm design,
              land preparation, irrigation systems, greenhouse construction, and
              full-scale crop production services.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link
                href="/farming/providers"
                style={{
                  background: "#E8A84C",
                  color: "#2C1A0E",
                  textDecoration: "none",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "transform 0.2s",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Browse Providers →
              </Link>
              <Link
                href="/field-operations/services"
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

      {/* Stats */}
      <section
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E8DDD0",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
              textAlign: "center",
            }}
          >
            <StatBadge
              value={stats.verified_providers || 0}
              label="Verified Providers"
              icon="✅"
            />
            <StatBadge
              value={stats.active_services || 0}
              label="Active Services"
              icon="📋"
            />
            <StatBadge
              value={stats.portfolio_projects || 0}
              label="Completed Projects"
              icon="🏆"
            />
            <StatBadge
              value={stats.quote_requests || 0}
              label="Quotes Requested"
              icon="📩"
            />
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section
        style={{ padding: "72px 24px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "#2C1A0E",
              marginBottom: "12px",
            }}
          >
            Service Categories
          </h2>
          <p
            style={{
              color: "#8B5E3C",
              fontSize: "16px",
              maxWidth: "560px",
              margin: "0 auto",
            }}
          >
            From drawing board to harvest — find providers for every phase of
            large-scale farm development
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {(categories.categories || []).map((cat, i) => (
            <Link
              key={cat.id}
              href={`/farming/services?category=${cat.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "24px",
                  border: "1px solid #E8DDD0",
                  textAlign: "center",
                  transition: "all 0.25s",
                  cursor: "pointer",
                  animationDelay: `${i * 0.07}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "#9DC07A";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(61,107,69,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#E8DDD0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                  {categoryIcons[cat.slug] || "🌱"}
                </div>
                <h3
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#2C1A0E",
                    marginBottom: "6px",
                  }}
                >
                  {cat.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#8B5E3C" }}>
                  {cat.service_count} service
                  {cat.service_count !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      {featured.providers?.length > 0 && (
        <section style={{ background: "#FFFFFF", padding: "72px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "40px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: "clamp(28px, 4vw, 40px)",
                    color: "#2C1A0E",
                    marginBottom: "8px",
                  }}
                >
                  Featured Providers
                </h2>
                <p style={{ color: "#8B5E3C", fontSize: "15px" }}>
                  Verified, top-rated farming service companies
                </p>
              </div>
              <Link
                href="/farming/providers"
                style={{
                  color: "#3D6B45",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  border: "1px solid #9DC07A",
                  padding: "8px 18px",
                  borderRadius: "8px",
                }}
              >
                View all →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {featured.providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent services */}
      {services.services?.length > 0 && (
        <section
          style={{ padding: "72px 24px", maxWidth: "1200px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "40px",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  color: "#2C1A0E",
                  marginBottom: "8px",
                }}
              >
                Recent Services
              </h2>
              <p style={{ color: "#8B5E3C", fontSize: "15px" }}>
                Latest offerings from our provider network
              </p>
            </div>
            <Link
              href="/farming/services"
              style={{
                color: "#3D6B45",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                border: "1px solid #9DC07A",
                padding: "8px 18px",
                borderRadius: "8px",
              }}
            >
              Browse all →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {services.services.map((s) => (
              <ServiceCard key={s.id} service={s} showProvider={true} />
            ))}
          </div>
        </section>
      )}

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
          <p
            style={{
              color: "rgba(250,245,236,0.8)",
              fontSize: "16px",
              marginBottom: "32px",
            }}
          >
            Browse our network of verified farming service providers and request
            a custom quote today.
          </p>
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
