"use client";
import { useState } from "react";
import QuoteModal from "../../components/farming/QuoteModal";
import { ServiceCard } from "../../components/farming/Cards";
import Link from "next/link";

export default function ProviderDetailClient({ provider }) {
  const [activeTab, setActiveTab] = useState("services");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const tabs = [
    { key: "services", label: `Services (${provider.services?.length || 0})` },
    {
      key: "portfolio",
      label: `Portfolio (${provider.portfolio?.length || 0})`,
    },
    {
      key: "certifications",
      label: `Certifications (${provider.certifications?.length || 0})`,
    },
  ];

  const formatPrice = (min, max, unit, currency) => {
    if (!min && !max) return "Request quote";
    const fmt = (n) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency || "NGN",
        maximumFractionDigits: 0,
      }).format(n);
    if (min && max) return `${fmt(min)} – ${fmt(max)} ${unit || ""}`;
    if (min) return `From ${fmt(min)} ${unit || ""}`;
    return `Up to ${fmt(max)} ${unit || ""}`;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Back */}
      <Link
        href="/farming/providers"
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
        ← Back to Providers
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
            background:
              "linear-gradient(135deg, #2C1A0E 0%, #3D6B45 50%, #8B5E3C 100%)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              backgroundImage:
                "radial-gradient(circle, #F2D078 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div style={{ padding: "0 32px 32px" }}>
          {/* Avatar & badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "-40px",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
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
              {provider.name.charAt(0)}
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
              <button
                onClick={() => {
                  setSelectedService(null);
                  setQuoteOpen(true);
                }}
                style={{
                  background: "#3D6B45",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 20px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Request Quote
              </button>
            </div>
          </div>

          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "#2C1A0E",
              marginBottom: "6px",
            }}
          >
            {provider.name}
          </h1>
          <p
            style={{
              color: "#C8873A",
              fontSize: "15px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            {provider.tagline}
          </p>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {[
              { icon: "📍", text: provider.location },
              { icon: "📅", text: `Est. ${provider.founded_year}` },
              { icon: "👥", text: `${provider.team_size} staff` },
              { icon: "⏱", text: provider.response_time },
            ].map(
              (m) =>
                m.text && (
                  <span
                    key={m.text}
                    style={{
                      fontSize: "13px",
                      color: "#8B5E3C",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {m.icon} {m.text}
                  </span>
                ),
            )}
          </div>

          <p
            style={{
              fontSize: "15px",
              color: "#5C3D1E",
              lineHeight: 1.7,
              maxWidth: "800px",
            }}
          >
            {provider.description}
          </p>

          {/* Contact */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            {provider.email && (
              <a
                href={`mailto:${provider.email}`}
                style={{
                  fontSize: "13px",
                  color: "#3D6B45",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                ✉ {provider.email}
              </a>
            )}
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                style={{
                  fontSize: "13px",
                  color: "#3D6B45",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                📞 {provider.phone}
              </a>
            )}
          </div>

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
            <span style={{ fontWeight: "700", color: "#2C1A0E" }}>
              {Number(provider.rating || 0).toFixed(1)}
            </span>
            <span style={{ color: "#8B5E3C", fontSize: "13px" }}>
              ({provider.review_count} reviews)
            </span>
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
          <button
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
          </button>
        ))}
      </div>

      {/* Services tab */}
      {activeTab === "services" && (
        <div>
          {provider.services?.length === 0 ? (
            <p
              style={{ color: "#8B5E3C", textAlign: "center", padding: "48px" }}
            >
              No services listed yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {provider.services?.map((s) => (
                <div key={s.id}>
                  <ServiceCard service={s} showProvider={false} />
                  <button
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
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Portfolio tab */}
      {activeTab === "portfolio" && (
        <div style={{ display: "grid", gap: "20px" }}>
          {provider.portfolio?.length === 0 ? (
            <p
              style={{ color: "#8B5E3C", textAlign: "center", padding: "48px" }}
            >
              No portfolio projects listed yet.
            </p>
          ) : (
            provider.portfolio?.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  border: "1px solid #E8DDD0",
                  padding: "28px",
                  boxShadow: "0 2px 8px rgba(44,26,14,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontSize: "20px",
                        color: "#2C1A0E",
                        marginBottom: "4px",
                      }}
                    >
                      {project.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#8B5E3C" }}>
                      📍 {project.location} · {project.project_year}
                      {project.completion_months
                        ? ` · ${project.completion_months} months to complete`
                        : ""}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {project.crop_type && (
                      <span
                        style={{
                          background: "#EBF5EB",
                          color: "#3D6B45",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "4px 10px",
                          borderRadius: "99px",
                        }}
                      >
                        🌱 {project.crop_type}
                      </span>
                    )}
                    {project.acreage && (
                      <span
                        style={{
                          background: "#FDF3E3",
                          color: "#C8873A",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "4px 10px",
                          borderRadius: "99px",
                        }}
                      >
                        {Number(project.acreage).toLocaleString()} ha
                      </span>
                    )}
                  </div>
                </div>

                {project.client_name && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8B5E3C",
                      marginBottom: "10px",
                    }}
                  >
                    Client:{" "}
                    <strong style={{ color: "#5C3D1E" }}>
                      {project.client_name}
                    </strong>
                  </p>
                )}

                <p
                  style={{
                    fontSize: "14px",
                    color: "#5C3D1E",
                    lineHeight: 1.7,
                    marginBottom: "14px",
                  }}
                >
                  {project.description}
                </p>

                {project.outcome && (
                  <div
                    style={{
                      background: "#F0F8F1",
                      borderLeft: "3px solid #3D6B45",
                      borderRadius: "0 10px 10px 0",
                      padding: "14px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#3D6B45",
                        marginBottom: "4px",
                      }}
                    >
                      📊 Outcome
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#5C3D1E",
                        lineHeight: 1.6,
                      }}
                    >
                      {project.outcome}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Certifications tab */}
      {activeTab === "certifications" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {provider.certifications?.length === 0 ? (
            <p
              style={{
                color: "#8B5E3C",
                textAlign: "center",
                padding: "48px",
                gridColumn: "1/-1",
              }}
            >
              No certifications listed yet.
            </p>
          ) : (
            provider.certifications?.map((cert) => (
              <div
                key={cert.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #E8DDD0",
                  padding: "20px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #F2D078, #E8A84C)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  🏅
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "15px",
                      color: "#2C1A0E",
                      marginBottom: "4px",
                    }}
                  >
                    {cert.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8B5E3C",
                      marginBottom: "6px",
                    }}
                  >
                    {cert.issuing_body}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {cert.issued_year && (
                      <span
                        style={{
                          fontSize: "12px",
                          background: "#FAF5EC",
                          color: "#5C3D1E",
                          padding: "2px 8px",
                          borderRadius: "99px",
                        }}
                      >
                        Issued {cert.issued_year}
                      </span>
                    )}
                    {cert.expiry_year && (
                      <span
                        style={{
                          fontSize: "12px",
                          background: "#FAF5EC",
                          color: "#5C3D1E",
                          padding: "2px 8px",
                          borderRadius: "99px",
                        }}
                      >
                        Valid until {cert.expiry_year}
                      </span>
                    )}
                  </div>
                  {cert.certificate_number && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9DC07A",
                        marginTop: "6px",
                        fontFamily: "monospace",
                      }}
                    >
                      #{cert.certificate_number}
                    </p>
                  )}
                </div>
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
