"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Skeleton from "@/components/ui/LoadingSkeleton";
import { ErrorUi } from "@/components/ui/Error";
import { NoProductsFound } from "@/app/(dashboard)/dashboard/components/ui/NotFound";
import { formatPrice } from "@/utils/formatPrice";

/* ── tiny helpers ─────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    available: {
      bg: "#EAF3DE",
      color: "#27500A",
      dot: "#3B6D11",
      border: "#C0DD97",
      label: "Available",
    },
    "in-transit": {
      bg: "#FCEBEB",
      color: "#501313",
      dot: "#A32D2D",
      border: "#F7C1C1",
      label: "In transit",
    },
    maintenance: {
      bg: "#FAEEDA",
      color: "#412402",
      dot: "#854F0B",
      border: "#FAC775",
      label: "Maintenance",
    },
  };
  const s = map[status?.toLowerCase()];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        border: `0.5px solid ${s.border}`,
        whiteSpace: "nowrap",
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

function CargoBadge({ type }) {
  const label = type?.replace(/_/g, " ") ?? "—";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 6,
        background: "#E6F1FB",
        color: "#0C447C",
        border: "0.5px solid #B5D4F4",
        whiteSpace: "nowrap",
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}

function IconBtn({ href, onClick, disabled, title, danger, children }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 6,
    cursor: "pointer",
    border: "0.5px solid #d0d0d0",
    background: "transparent",
    color: danger ? "#A32D2D" : "#666",
    transition: "background 0.15s",
    flexShrink: 0,
  };
  if (href)
    return (
      <Link href={href} title={title} style={base}>
        {children}
      </Link>
    );
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...base, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

/* ── main component ───────────────────────────────────── */

export function VehicleManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState({});
  const { refresh } = useRouter();

  const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.success)
      throw new Error(data?.error || "Failed to fetch vehicles");
    return data;
  };

  const {
    data: vehicleData,
    error,
    isLoading,
  } = useSWR("/api/proxy/vendor/logistics/vehicles", fetcher);

  const vehicles = vehicleData?.data || [];
  const filtered = vehicles.filter((v) =>
    v.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id) => {
    if (!confirm("Delete this vehicle?")) return;
    setIsDeleting((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/proxy/vendor/logistics/vehicles/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Delete failed");
      toast.success("Vehicle deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <div style={{ margin: "2.5rem 0" }}>
      {/* HEADER */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>
            Vehicle Management
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Manage your logistics fleet
          </p>
        </div>
        <Link
          href="/dashboard/logistics/vehicles/add-new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 14px",
            borderRadius: 8,
            border: "0.5px solid #d0d0d0",
            background: "#fff",
            color: "#111",
            textDecoration: "none",
          }}
        >
          <Plus size={15} /> Add vehicle
        </Link>
      </div>

      {/* SEARCH */}
      <div
        style={{ position: "relative", marginBottom: "1.25rem", maxWidth: 320 }}
      >
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        />
        <Input
          style={{ paddingLeft: 32, fontSize: 13 }}
          placeholder="Search vehicles…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* STATES */}
      {isLoading && <Skeleton />}
      {error && <ErrorUi />}
      {!isLoading && !error && filtered.length === 0 && (
        <NoProductsFound searchTerm={searchTerm} />
      )}

      {/* ─── DESKTOP TABLE ──────────────────────────────── */}
      {!isLoading && !error && filtered.length > 0 && (
        <div
          className="hidden md:block"
          style={{
            border: "0.5px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "0.5px solid #e5e7eb",
                  }}
                >
                  {[
                    "Vehicle",
                    "Type",
                    "Cargo type",
                    "Max weight",
                    "Volume (m³)",
                    "Location",
                    "Pricing",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 14px",
                        textAlign:
                          i >= 3 && i <= 4
                            ? "right"
                            : i === 8
                              ? "right"
                              : "left",
                        fontWeight: 500,
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                        fontSize: 12,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: "0.5px solid #f3f4f6",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Vehicle */}
                    <td style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            overflow: "hidden",
                            flexShrink: 0,
                            border: "0.5px solid #e5e7eb",
                          }}
                        >
                          <Image
                            src={v.images[0]}
                            alt={v.title}
                            width={44}
                            height={44}
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontWeight: 600,
                              margin: "0 0 2px",
                              color: "#111",
                            }}
                          >
                            {v.title}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            {v.license_plate?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td
                      style={{
                        padding: "12px 14px",
                        textTransform: "capitalize",
                        color: "#374151",
                      }}
                    >
                      {v.vehicle_type}
                    </td>

                    {/* Cargo */}
                    <td style={{ padding: "12px 14px" }}>
                      <CargoBadge type={v.cargo_type} />
                    </td>

                    {/* Max weight */}
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "right",
                        color: "#374151",
                      }}
                    >
                      {Number(v.max_weight_kg).toLocaleString()} kg
                    </td>

                    {/* Volume */}
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "right",
                        color: "#374151",
                      }}
                    >
                      {Number(v.volume_cubic_meters).toFixed(2)}
                    </td>

                    {/* Location */}
                    <td style={{ padding: "12px 14px", color: "#374151" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MapPin
                          size={12}
                          style={{ color: "#9ca3af", flexShrink: 0 }}
                        />
                        <span>{v.base_location}</span>
                        {v.operating_regions?.length > 0 && (
                          <>
                            <ArrowRight
                              size={11}
                              style={{ color: "#d1d5db" }}
                            />
                            <span style={{ color: "#9ca3af", fontSize: 11 }}>
                              {v.operating_regions.join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td style={{ padding: "12px 14px" }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          textTransform: "capitalize",
                          color: "#374151",
                        }}
                      >
                        {v.pricing_model?.replace(/_/g, " ")}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
                        {formatPrice(v.rate_amount, v.country_code, v.currency)}
                      </p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 4,
                        }}
                      >
                        <IconBtn
                          href={`/dashboard/logistics/vehicles/view/${v.id}`}
                          title="View"
                        >
                          <Eye size={14} />
                        </IconBtn>
                        <IconBtn
                          href={`/dashboard/logistics/vehicles/edit/${v.id}`}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleDelete(v.id)}
                          disabled={isDeleting[v.id]}
                          title="Delete"
                          danger
                        >
                          {isDeleting[v.id] ? (
                            <FaSpinner size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderTop: "0.5px solid #f3f4f6",
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            Showing {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ─── MOBILE CARDS ───────────────────────────────── */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-3 md:hidden">
          {filtered.map((v) => (
            <Card
              key={v.id}
              style={{
                padding: "12px",
                border: "0.5px solid #e5e7eb",
                borderRadius: 12,
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "0.5px solid #e5e7eb",
                  }}
                >
                  <Image
                    src={v.images[0]}
                    alt={v.title}
                    width={60}
                    height={60}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      margin: "0 0 2px",
                      color: "#111",
                      fontSize: 14,
                    }}
                  >
                    {v.title}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      margin: "0 0 4px",
                      textTransform: "capitalize",
                    }}
                  >
                    {v.vehicle_type} · {v.license_plate?.toUpperCase()}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <StatusBadge status={v.status} />
                    <CargoBadge type={v.cargo_type} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "0.5px solid #f3f4f6",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px 12px",
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: "#9ca3af" }}>Max weight</span>
                  <br />
                  <strong>{Number(v.max_weight_kg).toLocaleString()} kg</strong>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Volume</span>
                  <br />
                  <strong>{Number(v.volume_cubic_meters).toFixed(2)} m³</strong>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Base location</span>
                  <br />
                  <strong>{v.base_location}</strong>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Regions</span>
                  <br />
                  <strong>{v.operating_regions?.join(", ") || "—"}</strong>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Pricing</span>
                  <br />
                  <strong style={{ textTransform: "capitalize" }}>
                    {v.pricing_model?.replace(/_/g, " ")}
                  </strong>
                  <span style={{ color: "#6b7280" }}>
                    {" "}
                    · {formatPrice(v.rate_amount, v.country_code, v.currency)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: "0.5px solid #f3f4f6",
                  display: "flex",
                  gap: 8,
                }}
              >
                <Link
                  href={`/dashboard/logistics/vehicles/view/${v.id}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    fontSize: 12,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "0.5px solid #e5e7eb",
                    color: "#374151",
                    textDecoration: "none",
                  }}
                >
                  <Eye size={13} /> View
                </Link>
                <Link
                  href={`/dashboard/logistics/vehicles/edit/${v.id}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    fontSize: 12,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "0.5px solid #e5e7eb",
                    color: "#374151",
                    textDecoration: "none",
                  }}
                >
                  <Edit size={13} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={isDeleting[v.id]}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    fontSize: 12,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "0.5px solid #fecaca",
                    color: "#A32D2D",
                    background: "transparent",
                    cursor: "pointer",
                    opacity: isDeleting[v.id] ? 0.5 : 1,
                  }}
                >
                  {isDeleting[v.id] ? (
                    <FaSpinner size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
