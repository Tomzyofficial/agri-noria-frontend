import { ServiceCard } from "../components/farming/Cards";
import Link from "next/link";

async function getData(searchParams) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category_slug", searchParams.category);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "12");

  const [servicesRes, categoriesRes] = await Promise.all([
    fetch(`${base}/api/proxy/farming/services?${params}`, {
      cache: "no-store",
    }),
    fetch(`${base}/api/proxy/farming/categories`, { cache: "no-store" }),
  ]);

  const [services, categories] = await Promise.all([
    servicesRes.ok ? servicesRes.json() : { services: [] },
    categoriesRes.ok ? categoriesRes.json() : { categories: [] },
  ]);

  return { services, categories };
}

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

export default async function ServicesPage({ searchParams }) {
  const sp = await searchParams;
  const { services, categories } = await getData(sp);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            color: "#2C1A0E",
            marginBottom: "10px",
          }}
        >
          Farming Services
        </h1>
        <p style={{ color: "#8B5E3C", fontSize: "16px" }}>
          Browse {services.services?.length || 0} available services from
          verified farming providers
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* Sidebar filters */}
        <aside>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E8DDD0",
              padding: "20px",
              position: "sticky",
              top: "80px",
            }}
          >
            <h3
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "17px",
                color: "#2C1A0E",
                marginBottom: "16px",
              }}
            >
              Filter Services
            </h3>

            {/* Search */}
            <form>
              <input
                name="category"
                type="hidden"
                defaultValue={sp.category || ""}
              />
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#8B5E3C",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Search
                </label>
                <input
                  name="search"
                  defaultValue={sp.search || ""}
                  placeholder="Service keyword..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #D6C9B8",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#2C1A0E",
                    background: "#FAFAF8",
                    outline: "none",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "#3D6B45",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  marginBottom: "8px",
                }}
              >
                Search
              </button>
            </form>

            {/* Categories */}
            <div
              style={{
                borderTop: "1px solid #F0E8DC",
                paddingTop: "16px",
                marginTop: "8px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#8B5E3C",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Category
              </label>
              <Link
                href={`/field-operations/services${sp.search ? `?search=${sp.search}` : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  background: !sp.category ? "#EBF5EB" : "transparent",
                  color: !sp.category ? "#3D6B45" : "#5C3D1E",
                  fontWeight: !sp.category ? "600" : "400",
                  marginBottom: "2px",
                }}
              >
                🌾 All Categories
              </Link>
              {(categories.categories || []).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/field-operations/services?category=${cat.slug}${sp.search ? `&search=${sp.search}` : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "13px",
                    background:
                      sp.category === cat.slug ? "#EBF5EB" : "transparent",
                    color: sp.category === cat.slug ? "#3D6B45" : "#5C3D1E",
                    fontWeight: sp.category === cat.slug ? "600" : "400",
                    marginBottom: "2px",
                    transition: "background 0.15s",
                  }}
                >
                  {categoryIcons[cat.slug] || "🌱"} {cat.name}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      color: "#9DC07A",
                    }}
                  >
                    {cat.service_count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Services grid */}
        <div>
          {services.services?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "22px",
                  color: "#2C1A0E",
                  marginBottom: "8px",
                }}
              >
                No services found
              </h3>
              <p style={{ color: "#8B5E3C" }}>
                Try a different category or search term
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {services.services.map((s) => (
                <ServiceCard key={s.id} service={s} showProvider={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
