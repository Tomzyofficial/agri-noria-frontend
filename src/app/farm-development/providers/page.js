import { ProviderCard } from "../components/farming/Cards";
import Link from "next/link";

async function getProviders(searchParams) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (searchParams.state) params.set("state", searchParams.state);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "9");

  const res = await fetch(`${base}/api/proxy/farming/providers?${params}`, {
    cache: "no-store",
  });
  return res.ok ? res.json() : { providers: [], total: 0 };
}

export default async function ProvidersPage({ searchParams }) {
  const sp = await searchParams;
  const data = await getProviders(sp);
  const { providers = [], total = 0, page = 1, limit = 9 } = data;
  const totalPages = Math.ceil(total / limit);

  const states = [
    "All States",
    "Rivers",
    "Lagos",
    "Abuja",
    "Kaduna",
    "Kano",
    "Benue",
    "Delta",
    "Ogun",
    "Kebbi",
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(30px, 4vw, 48px)",
            color: "#2C1A0E",
            marginBottom: "10px",
          }}
        >
          Farming Service Providers
        </h1>
        <p style={{ color: "#8B5E3C", fontSize: "16px" }}>
          {total} verified provider{total !== 1 ? "s" : ""} offering large-scale
          farming services across Nigeria
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "14px",
          padding: "20px 24px",
          border: "1px solid #E8DDD0",
          marginBottom: "32px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}
        >
          <input
            name="search"
            defaultValue={sp.search}
            placeholder="Search providers..."
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "9px 14px",
              border: "1px solid #D6C9B8",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#2C1A0E",
              background: "#FAFAF8",
              outline: "none",
              fontFamily: "DM Sans, sans-serif",
            }}
          />
          <select
            name="state"
            defaultValue={sp.state || ""}
            style={{
              padding: "9px 14px",
              border: "1px solid #D6C9B8",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#2C1A0E",
              background: "#FAFAF8",
              outline: "none",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <option value="">All States</option>
            {states.slice(1).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: "#3D6B45",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 22px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Search
          </button>
          {(sp.search || sp.state) && (
            <Link
              href="/farming/providers"
              style={{
                padding: "9px 16px",
                border: "1px solid #D6C9B8",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#8B5E3C",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Grid */}
      {providers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "24px",
              color: "#2C1A0E",
              marginBottom: "8px",
            }}
          >
            No providers found
          </h3>
          <p style={{ color: "#8B5E3C" }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/farming/providers?page=${p}${sp.search ? `&search=${sp.search}` : ""}${sp.state ? `&state=${sp.state}` : ""}`}
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                background:
                  parseInt(sp.page || 1) === p ? "#3D6B45" : "#FFFFFF",
                color: parseInt(sp.page || 1) === p ? "#FFF" : "#5C3D1E",
                border: "1px solid #E8DDD0",
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
