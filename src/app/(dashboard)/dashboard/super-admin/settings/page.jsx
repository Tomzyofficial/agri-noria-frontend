"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Shield, 
  Database, 
  SlidersHorizontal, 
  Save, 
  Lock, 
  Zap, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Phone, 
  DollarSign, 
  UploadCloud, 
  Layers, 
  UserPlus, 
  ShieldAlert, 
  Sparkles,
  Mail,
  MapPin,
  Check
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General
    platformName: "AgriNoria",
    platformEmail: "support@agrinoria.com",
    supportPhone: "+234 800 2474 66742",
    currency: "NGN (₦)",

    // Security & Access (Enforced)
    maintenanceMode: false,
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    allowNewRegistrations: true,
    emailVerificationRequired: true,

    // Storage & Uploads (Enforced)
    maxUploadSize: 50,
    allowedDocumentTypes: "pdf, jpg, jpeg, png, webp",
    requireGeotaggedIntake: true,

    // Governance & Audit (Enforced)
    enableAuditLogs: true,
    platformFeePercent: 2.5
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSettings = async (showToast = false) => {
    try {
      const res = await fetch("/api/proxy/admin/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
          if (showToast) toast.success("Settings synchronized from database");
        }
      } else {
        toast.error("Failed to load platform settings");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Network error while loading settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-persist boolean switches immediately so toggling any policy enforces right away in the Ecosystem
  const handleToggleChange = async (key, checked, label = key) => {
    const updated = { ...settings, [key]: checked };
    setSettings(updated);
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) setSettings((prev) => ({ ...prev, ...data.data }));
        toast.success(`${label}: ${checked ? "ENABLED" : "DISABLED"} & enforced across Ecosystem!`);
      } else {
        toast.error(data.error || `Failed to update ${label}`);
      }
    } catch (err) {
      console.error(`Error toggling ${key}:`, err);
      toast.error(`Network error while enforcing ${label}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) setSettings((prev) => ({ ...prev, ...data.data }));
        toast.success("Platform settings saved and enforced in real-time across the Ecosystem!");
      } else {
        toast.error(data.error || "Failed to update platform settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Branding", icon: Globe, count: "4 controls" },
    { id: "security", label: "Security & Lockouts", icon: Shield, count: "5 enforced" },
    { id: "storage", label: "Storage & Documents", icon: Database, count: "3 enforced" },
    { id: "governance", label: "Governance & Finance", icon: SlidersHorizontal, count: "2 enforced" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 animate-pulse">
          <SlidersHorizontal size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <FaSpinner className="animate-spin text-emerald-600" />
          <span>Loading Global Governance Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Platform Governance
            </span>
            <span className="text-xs text-gray-400 font-semibold">• Global Orchestration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-emerald-600" />
            System Configuration & Enforcement
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">
            Configure system parameters, security policies, storage ceilings, and rate governance enforced in real-time across the platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fetchSettings(true)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className="text-gray-500" />
            <span>Sync Config</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin text-sm" /> : <Save size={14} />}
            <span>{saving ? "Enforcing Updates..." : "Apply & Enforce Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm backdrop-blur-sm space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:shadow-emerald-950/60"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{tab.label}</p>
                      <p className={`text-[10px] ${isActive ? "text-emerald-100" : "text-gray-400 dark:text-gray-500"}`}>
                        {tab.count}
                      </p>
                    </div>
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white shrink-0 mr-1" />}
                </button>
              );
            })}
          </div>

          {/* Ledger Verification Pill Box */}
          <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>Real-Time Enforcement Active</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              Modifications saved here write directly to <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">system_settings</code> and immediately apply to active API middleware, registration endpoints, and uploads.
            </p>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-8">
          {/* TAB 1: GENERAL & BRANDING */}
          {activeTab === "general" && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 md:p-8 space-y-6 backdrop-blur-sm animate-fade-in">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Platform Identity & Communication
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Branding and communication parameters used in transactional emails, headers, and system alerts.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Platform Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Platform Brand Name</span>
                      <span className="text-[10px] text-emerald-600 font-bold lowercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">enforced in emails</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => handleChange("platformName", e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        placeholder="e.g. Agri-Noria"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">Used as the primary brand across emails, notifications, and contracts.</p>
                  </div>

                  {/* Support Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Official Support Email</span>
                      <span className="text-[10px] text-emerald-600 font-bold lowercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">enforced sender</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={settings.platformEmail}
                        onChange={(e) => handleChange("platformEmail", e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        placeholder="support@agrinoria.com"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">Default reply-to for automated verification and transactional messages.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Support Phone Hotline */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-600" />
                      <span>Support Hotline Phone</span>
                    </label>
                    <input
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) => handleChange("supportPhone", e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      placeholder="+234 800 2474 66742"
                    />
                    <p className="text-[11px] text-gray-400">Displayed in farmer help desks and cluster support documents.</p>
                  </div>

                  {/* Operational Currency */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={13} className="text-emerald-600" />
                      <span>Operational Currency</span>
                    </label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      placeholder="NGN (₦)"
                    />
                    <p className="text-[11px] text-gray-400">Default fiat currency for settlements, contracts, and wallet ledgers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & LOCKOUTS */}
          {activeTab === "security" && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 md:p-8 space-y-6 backdrop-blur-sm animate-fade-in">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Access Controls, Lockouts & Maintenance
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Strictly enforced security policies that govern login brute-force defense, session lifetimes, and emergency shutdowns.
                </p>
              </div>

              {/* Critical Maintenance Mode Banner */}
              <div className={`p-5 rounded-3xl border transition-all ${
                settings.maintenanceMode 
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800" 
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-700/80"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${settings.maintenanceMode ? "text-rose-600 animate-pulse" : "text-gray-400"}`} />
                      <h3 className={`text-sm font-black uppercase tracking-wider ${settings.maintenanceMode ? "text-rose-700 dark:text-rose-300" : "text-gray-800 dark:text-gray-200"}`}>
                        Emergency Maintenance Mode
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        settings.maintenanceMode ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {settings.maintenanceMode ? "503 ACTIVE" : "SYSTEM LIVE"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                      When enabled, all public and vendor API endpoints immediately return <strong className="font-bold">503 Service Unavailable</strong>. Super Admin authentication remains accessible to perform recovery.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.maintenanceMode)}
                      onChange={(e) => handleToggleChange("maintenanceMode", e.target.checked, "Emergency Maintenance Mode")}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {/* Numeric Security Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Max Login Attempts */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} className="text-emerald-600" />
                      <span>Max Failed Logins</span>
                    </label>
                    <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      auto-lockout
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value) || 5)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-900 dark:text-white"
                  />
                  <p className="text-[11px] text-gray-400">Consecutive bad passwords trigger a 15-minute lockout on the account.</p>
                </div>

                {/* Session Timeout */}
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={13} className="text-emerald-600" />
                      <span>Session Timeout (Mins)</span>
                    </label>
                    <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      jwt token
                    </span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value) || 60)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-900 dark:text-white"
                  />
                  <p className="text-[11px] text-gray-400">Idle duration before authentication credentials expire and require re-login.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Allow New Registrations */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">Allow Public Registrations</p>
                      <p className="text-[11px] text-gray-500">When disabled, new vendor and farmer signups are blocked at the API layer.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.allowNewRegistrations)}
                      onChange={(e) => handleToggleChange("allowNewRegistrations", e.target.checked, "Ecosystem Public Registrations")}
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                  </label>
                </div>

                {/* Email Verification Required */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">Enforce Email Verification</p>
                      <p className="text-[11px] text-gray-500">Requires verified email address before performing commodity trades or dispatches.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.emailVerificationRequired)}
                      onChange={(e) => handleToggleChange("emailVerificationRequired", e.target.checked, "Email Verification Requirement")}
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & DOCUMENTS */}
          {activeTab === "storage" && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 md:p-8 space-y-6 backdrop-blur-sm animate-fade-in">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Storage Ceilings & Physical Verification
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload file size ceilings enforced at the HTTP gateway and geospatial verification prerequisites.
                </p>
              </div>

              {/* Max Upload Size Slider */}
              <div className="p-6 rounded-3xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <UploadCloud size={14} className="text-emerald-600" />
                      <span>Maximum File Upload Ceiling</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">Enforced on all document, image, and intake proof uploads.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {settings.maxUploadSize} <span className="text-xs font-bold text-gray-400">MB</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={settings.maxUploadSize}
                    onChange={(e) => handleChange("maxUploadSize", parseInt(e.target.value) || 50)}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>5 MB</span>
                    <span>50 MB (Recommended)</span>
                    <span>100 MB</span>
                    <span>200 MB</span>
                  </div>
                </div>
              </div>

              {/* Allowed Document Formats */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Allowed Document File Extensions</span>
                  <span className="text-[10px] text-emerald-600 font-bold lowercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">mime validated</span>
                </label>
                <input
                  type="text"
                  value={settings.allowedDocumentTypes}
                  onChange={(e) => handleChange("allowedDocumentTypes", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  placeholder="pdf, jpg, jpeg, png, webp"
                />
                <p className="text-[11px] text-gray-400">Comma-separated file extensions accepted for KYC documents and intake receipts.</p>
              </div>

              {/* Require Geotagged Intake */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">Enforce GPS Geotagging on Receipts & Deliveries</p>
                    <p className="text-[11px] text-gray-500">Warehouse intake and haulage delivery proof must contain cryptographic coordinates.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(settings.requireGeotaggedIntake)}
                    onChange={(e) => handleToggleChange("requireGeotaggedIntake", e.target.checked, "GPS Geotagged Intake Enforcement")}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: GOVERNANCE & FINANCE */}
          {activeTab === "governance" && (
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 md:p-8 space-y-6 backdrop-blur-sm animate-fade-in">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Governance Rules & Transaction Tariffs
                  </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Commission engine rates and immutable action audit logging requirements.
                </p>
              </div>

              {/* Platform Fee Percentage */}
              <div className="p-6 rounded-3xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} className="text-emerald-600" />
                      <span>Platform Commission Fee (%)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">Standard service tariff applied to completed contracts and warehouse tickets.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {settings.platformFeePercent}%
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={settings.platformFeePercent}
                    onChange={(e) => handleChange("platformFeePercent", parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Enable Audit Logs Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">Real-Time Action Audit Logging</p>
                    <p className="text-[11px] text-gray-500">Record all administrative changes, wallet payouts, and user suspensions to database.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(settings.enableAuditLogs)}
                    onChange={(e) => handleToggleChange("enableAuditLogs", e.target.checked, "Real-Time Action Audit Logging")}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
