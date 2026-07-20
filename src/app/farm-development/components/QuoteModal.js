"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatLabel } from "@/utils/otherUtils";
import { IoIosClose } from "react-icons/io";

export default function QuoteModal({ provider, service, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    client_email: "",
    phone: "",
    client_organization: "",
    additional_info: "",
    land_size: "",
    land_size_unit: "hectares",
    location: "",
    budget_range: "",
    timeline: "",
    additional_notes: "",
    quote_type: "Farm-development",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: undefined }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`/api/proxy/farm-development/public/booking-request/${service.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const fieldErrors = {};
          data.details.forEach((d) => {
            fieldErrors[d.path[0]] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ _general: data.error });
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("error", err);
      setErrors({ _general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${errors[field] ? "#E53E3E" : "#D6C9B8"}`,
    borderRadius: "8px",
    fontSize: "14px",
    color: "#2C1A0E",
    background: "#FAFAF8",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
  });

  const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#5C3D1E", marginBottom: "4px" };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,26,14,0.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#FFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(44,26,14,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #F0E8DC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "sticky",
            top: 0,
            background: "#FFF",
            zIndex: 1,
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", color: "#2C1A0E" }}>Request a Quote</h2>
            <p style={{ fontSize: "13px", color: "#8B5E3C", marginTop: "2px" }}>
              {provider.business_name}
              {service ? ` · ${formatLabel(service.title)}` : ""}
            </p>
          </div>
          <Button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid #E0D4C4",
              background: "transparent",
              cursor: "pointer",
              fontSize: "18px",
              color: "#8B5E3C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IoIosClose size={160} />
          </Button>
        </div>

        {success ? (
          <div style={{ padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🌱</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", color: "#2C1A0E", marginBottom: "8px" }}>Quote Request Sent!</h3>
            <p style={{ color: "#5C3D1E", marginBottom: "24px" }}>{provider.business_name} will review your request and get back to you within 48 hours.</p>
            <Button
              onClick={onClose}
              style={{
                background: "#3D6B45",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 28px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <div style={{ padding: "24px 28px" }}>
            {errors._general && <div style={{ background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#C53030", fontSize: "13px" }}>{errors._general}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle("full_name")} placeholder="Your full name" />
                {errors.full_name && <p style={{ color: "#E53E3E", fontSize: "11px", marginTop: "4px" }}>{errors.full_name}</p>}
              </div>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input name="client_email" type="email" value={form.client_email} onChange={handleChange} style={inputStyle("client_email")} placeholder="you@company.com" />
                {errors.client_email && <p style={{ color: "#E53E3E", fontSize: "11px", marginTop: "4px" }}>{errors.client_email}</p>}
              </div>
              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input name="phone" value={form.client_phone} onChange={handleChange} style={inputStyle("phone")} placeholder="+234 800 000 0000" />
              </div>
              {/* Organization */}
              <div>
                <label style={labelStyle}>Organization</label>
                <input name="client_organization" value={form.client_organization} onChange={handleChange} style={inputStyle("client_organization")} placeholder="Company or farm name" />
              </div>
            </div>

            {/* Project description */}
            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle}>Project Description *</label>
              <textarea name="additional_info" value={form.additional_info} onChange={handleChange} style={{ ...inputStyle("additional_info"), minHeight: "100px", resize: "vertical" }} placeholder="Describe your project — what crops, type of services needed, land status, goals..." />
              {errors.additional_info && <p style={{ color: "#E53E3E", fontSize: "11px", marginTop: "4px" }}>{errors.additional_info}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
              {/* Land size */}
              <div>
                <label style={labelStyle}>Land Size</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input name="land_size" type="number" value={form.land_size} onChange={handleChange} style={{ ...inputStyle("land_size"), flex: 1 }} placeholder="e.g. 500" />
                  <select name="land_size_unit" value={form.land_size_unit} onChange={handleChange} style={{ ...inputStyle("land_size_unit"), width: "auto", paddingRight: "8px" }}>
                    <option value="hectares">ha</option>
                    <option value="acres">acres</option>
                  </select>
                </div>
              </div>
              {/* Location */}
              <div>
                <label style={labelStyle}>Project Location</label>
                <input name="location" value={form.location} onChange={handleChange} style={inputStyle("location")} placeholder="State, Region" />
              </div>
              {/* Budget */}
              <div>
                <label style={labelStyle}>Budget Range</label>
                <select name="budget_range" value={form.budget_range} onChange={handleChange} style={inputStyle("budget_range")}>
                  <option value="">Select range</option>
                  <option value="Under ₦10M">Under ₦10M</option>
                  <option value="₦10M – ₦50M">₦10M – ₦50M</option>
                  <option value="₦50M – ₦200M">₦50M – ₦200M</option>
                  <option value="₦200M – ₦1B">₦200M – ₦1B</option>
                  <option value="Above ₦1B">Above ₦1B</option>
                </select>
              </div>
              {/* Timeline */}
              <div>
                <label style={labelStyle}>Desired Timeline</label>
                <select name="timeline" value={form.timeline} onChange={handleChange} style={inputStyle("timeline")}>
                  <option value="">Select timeline</option>
                  <option value="ASAP (within 1 month)">ASAP (within 1 month)</option>
                  <option value="1 – 3 months">1 – 3 months</option>
                  <option value="3 – 6 months">3 – 6 months</option>
                  <option value="6 – 12 months">6 – 12 months</option>
                  <option value="More than 12 months">More than 12 months</option>
                </select>
              </div>
            </div>

            {/* Additional notes */}
            {/* <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Additional Notes</label>
              <textarea name="additional_notes" value={form.additional_notes} onChange={handleChange}
                style={{ ...inputStyle('additional_notes'), minHeight: '72px', resize: 'vertical' }}
                placeholder="Any other details, specific requirements, or questions..." />
            </div> */}

            <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
              <Button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "13px",
                  border: "1px solid #D6C9B8",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "#5C3D1E",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "13px",
                  border: "none",
                  borderRadius: "10px",
                  background: loading ? "#9DC07A" : "linear-gradient(135deg, #3D6B45, #6A9B5F)",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
