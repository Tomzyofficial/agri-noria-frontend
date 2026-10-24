"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Mail,
  Phone,
  KeyRound,
  X,
} from "lucide-react";
import { NotificationProvider } from "@/hooks/useNotificationContext";

const DEFAULT_ECOSYSTEM_SETTINGS = {
  platformName: "AgriNoria",
  platformEmail: "support@agrinoria.com",
  supportPhone: "+234 800 2474 66742",
  currency: "NGN (₦)",
  maintenanceMode: false,
  maxLoginAttempts: 5,
  sessionTimeout: 60,
  allowNewRegistrations: true,
  emailVerificationRequired: true,
  maxUploadSize: 50,
  allowedDocumentTypes: "pdf, jpg, jpeg, png, webp",
  requireGeotaggedIntake: true,
  enableAuditLogs: true,
  platformFeePercent: 2.5,
};

const EcosystemSettingsContext = createContext({
  settings: DEFAULT_ECOSYSTEM_SETTINGS,
  refreshSettings: async () => {},
  emailVerified: true,
  openEmailVerifyModal: () => {},
});

export const useEcosystemSettings = () => useContext(EcosystemSettingsContext);

export default function EcosystemEnforcementLayout({ children }) {
  const router = useRouter();
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined" && window.__ECOSYSTEM_SETTINGS__) {
      return { ...DEFAULT_ECOSYSTEM_SETTINGS, ...window.__ECOSYSTEM_SETTINGS__ };
    }
    return DEFAULT_ECOSYSTEM_SETTINGS;
  });
  const [checkingMaintenance, setCheckingMaintenance] = useState(false);

  // Email verification state (Menu 2: emailVerificationRequired)
  const [emailStatus, setEmailStatus] = useState({
    checked: false,
    email: "",
    email_verified: true,
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const lastActivityRef = useRef(Date.now());

  const fetchEcosystemSettings = useCallback(async (showFeedback = false) => {
    if (showFeedback) setCheckingMaintenance(true);
    try {
      const rawFetch = (typeof window !== "undefined" && window.__ORIGINAL_FETCH__) || fetch;
      const res = await rawFetch("/api/proxy/ecosystem/settings", {
        cache: "no-store",
        headers: { "x-active-workspace": "ecosystem" },
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const next = { ...DEFAULT_ECOSYSTEM_SETTINGS, ...json.data };
          settingsRef.current = next;
          setSettings(next);
          if (typeof window !== "undefined") {
            window.__ECOSYSTEM_SETTINGS__ = next;
            localStorage.setItem("ecosystem_currency", String(next.currency || "NGN (₦)"));
            localStorage.setItem("ecosystem_platform_name", String(next.platformName || "AgriNoria"));
          }
          if (showFeedback) {
            setTimeout(() => {
              if (!next.maintenanceMode) {
                toast.success("Ecosystem is back online!");
              } else {
                toast.warning("Emergency Maintenance Mode is still active.");
              }
            }, 0);
          }
        }
      } else if (res.status === 503) {
        const next = { ...settingsRef.current, maintenanceMode: true };
        settingsRef.current = next;
        setSettings(next);
      }
    } catch (err) {
      console.warn("[EcosystemSettings] Error fetching settings:", err);
    } finally {
      if (showFeedback) setCheckingMaintenance(false);
    }
  }, []);

  // Fetch Email Verification Status for the logged-in Ecosystem user
  const fetchEmailVerificationStatus = useCallback(async () => {
    try {
      const rawFetch = (typeof window !== "undefined" && window.__ORIGINAL_FETCH__) || fetch;
      const res = await rawFetch("/api/proxy/email-verification/status", {
        cache: "no-store",
        headers: { "x-active-workspace": "ecosystem" },
      });
      if (res.ok) {
        const data = await res.json();
        setEmailStatus({
          checked: true,
          email: data.email || "",
          email_verified: Boolean(data.email_verified),
        });
      }
    } catch {
      // Ignore if not logged in or endpoint unreachable
    }
  }, []);

  // 1. Initial Fetch + Socket.IO Real-Time Subscription + Periodic Sync
  useEffect(() => {
    fetchEcosystemSettings(false);
    fetchEmailVerificationStatus();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("settings_updated", (updated) => {
      if (updated && typeof updated === "object") {
        const prev = settingsRef.current;
        const merged = { ...prev, ...updated };
        settingsRef.current = merged;

        if (typeof window !== "undefined") {
          window.__ECOSYSTEM_SETTINGS__ = merged;
          localStorage.setItem("ecosystem_currency", String(merged.currency || "NGN (₦)"));
          localStorage.setItem("ecosystem_platform_name", String(merged.platformName || "AgriNoria"));
        }

        setSettings(merged);

        // Call toast outside of setSettings state updater to avoid React setState-in-render error
        if (!prev.maintenanceMode && merged.maintenanceMode) {
          setTimeout(() => {
            toast.error("Emergency Maintenance Mode activated by Super Admin.");
          }, 0);
        } else if (prev.maintenanceMode && !merged.maintenanceMode) {
          setTimeout(() => {
            toast.success("Maintenance completed! Ecosystem operations restored.");
          }, 0);
        }
      }
    });

    const interval = setInterval(() => {
      fetchEcosystemSettings(false);
    }, 25000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchEcosystemSettings, fetchEmailVerificationStatus]);

  // 2. Menu 1 (General & Branding): Sync Document Title & Global Brand Variables
  useEffect(() => {
    if (typeof document !== "undefined" && settings.platformName) {
      const baseTitle = document.title.replace(/^.*?\|\s*/, "");
      document.title = `${settings.platformName} Ecosystem | ${baseTitle || "Portal"}`;
    }
  }, [settings.platformName]);

  // 3. Menu 2 (Security: Session Timeout): Active Idle Session Enforcer in Ecosystem
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));

    const timer = setInterval(async () => {
      const timeoutMins = Math.max(5, Number(settingsRef.current.sessionTimeout) || 60);
      const maxIdleMs = timeoutMins * 60 * 1000;
      if (Date.now() - lastActivityRef.current > maxIdleMs) {
        clearInterval(timer);
        try {
          const rawFetch = window.__ORIGINAL_FETCH__ || fetch;
          await rawFetch("/api/proxy/vendor/logout", { method: "POST" });
        } catch {}
        setTimeout(() => {
          toast.warning(`Session expired after ${timeoutMins} minutes of inactivity.`);
        }, 0);
        router.push("/auth/signin?reason=session_timeout");
      }
    }, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
      clearInterval(timer);
    };
  }, [router]);

  // 4. Menu 3 (Storage & Documents): Enforce maxUploadSize & allowedDocumentTypes on all <input type="file"> in Ecosystem
  useEffect(() => {
    const handleFileInputChange = (e) => {
      const target = e.target;
      if (!target || target.tagName !== "INPUT" || target.type !== "file") return;
      const files = target.files;
      if (!files || files.length === 0) return;

      const currentSettings = settingsRef.current;
      const maxMb = Math.max(1, Number(currentSettings.maxUploadSize) || 50);
      const maxBytes = maxMb * 1024 * 1024;
      const allowedExtensions = String(currentSettings.allowedDocumentTypes || "pdf, jpg, jpeg, png, webp")
        .split(",")
        .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
        .filter(Boolean);

      const acceptsVideo = String(target.accept || "").toLowerCase().includes("video");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxBytes) {
          const fileMb = (file.size / (1024 * 1024)).toFixed(2);
          target.value = "";
          e.stopPropagation();
          e.preventDefault();
          setTimeout(() => {
            toast.error(
              `Upload Blocked: "${file.name}" (${fileMb}MB) exceeds the ${maxMb}MB Ecosystem storage ceiling.`
            );
          }, 0);
          return;
        }

        const parts = file.name.split(".");
        const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
        const isVideoExt = ["mp4", "mov", "webm", "avi", "mkv"].includes(ext);

        if (allowedExtensions.length > 0 && !(acceptsVideo && isVideoExt)) {
          if (!ext || !allowedExtensions.includes(ext)) {
            target.value = "";
            e.stopPropagation();
            e.preventDefault();
            setTimeout(() => {
              toast.error(
                `File Format Blocked: ".${ext || "unknown"}" is not permitted. Allowed Ecosystem formats: ${allowedExtensions.join(", ")}`
              );
            }, 0);
            return;
          }
        }
      }
    };

    document.addEventListener("change", handleFileInputChange, true);
    return () => {
      document.removeEventListener("change", handleFileInputChange, true);
    };
  }, []);

  // 5. Intercept window.fetch inside Ecosystem to enforce 503 Maintenance, 403 Email Verification, 400 Geotag, & FormData upload checks
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.__ORIGINAL_FETCH__) {
      window.__ORIGINAL_FETCH__ = window.fetch.bind(window);
    }
    const originalFetch = window.__ORIGINAL_FETCH__;

    window.fetch = async (input, init = {}) => {
      const urlStr = typeof input === "string" ? input : input?.url || "";

      let nextInit = { ...init };
      if (urlStr.includes("/api/proxy")) {
        const headers = new Headers(init.headers || {});
        if (!headers.has("x-active-workspace")) {
          headers.set("x-active-workspace", "ecosystem");
        }
        nextInit.headers = headers;

        if (init.body instanceof FormData) {
          const currentSettings = settingsRef.current;
          const maxMb = Math.max(1, Number(currentSettings.maxUploadSize) || 50);
          const maxBytes = maxMb * 1024 * 1024;
          const allowedExtensions = String(currentSettings.allowedDocumentTypes || "pdf, jpg, jpeg, png, webp")
            .split(",")
            .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
            .filter(Boolean);

          for (const [, value] of init.body.entries()) {
            if (typeof File !== "undefined" && value instanceof File && value.size > 0) {
              if (value.size > maxBytes) {
                const msg = `Upload Blocked: "${value.name}" exceeds the ${maxMb}MB Ecosystem ceiling.`;
                setTimeout(() => toast.error(msg), 0);
                return new Response(JSON.stringify({ success: false, error: msg }), {
                  status: 413,
                  headers: { "Content-Type": "application/json" },
                });
              }
              const parts = value.name.split(".");
              const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
              const isVideoRoute = urlStr.includes("upload-video");
              if (!isVideoRoute && allowedExtensions.length > 0 && (!ext || !allowedExtensions.includes(ext))) {
                const msg = `File Format Blocked: ".${ext}" is not permitted. Allowed formats: ${allowedExtensions.join(", ")}`;
                setTimeout(() => toast.error(msg), 0);
                return new Response(JSON.stringify({ success: false, error: msg }), {
                  status: 415,
                  headers: { "Content-Type": "application/json" },
                });
              }
            }
          }
        }
      }

      const response = await originalFetch(input, nextInit);

      if (urlStr.includes("/api/proxy") && !urlStr.includes("/api/proxy/ecosystem/settings")) {
        if (response.status === 503) {
          const next = { ...settingsRef.current, maintenanceMode: true };
          settingsRef.current = next;
          setSettings(next);
        } else if (response.status === 403 || response.status === 400) {
          try {
            const clone = response.clone();
            const data = await clone.json();
            if (data?.maintenance) {
              const next = { ...settingsRef.current, maintenanceMode: true };
              settingsRef.current = next;
              setSettings(next);
            } else if (data?.emailVerificationRequired) {
              setTimeout(() => {
                toast.warning(data.error || "Email verification is required to perform this Ecosystem action.");
              }, 0);
              setEmailStatus((prev) => ({ ...prev, email_verified: false }));
              setShowVerifyModal(true);
            } else if (data?.requireGeotaggedIntake) {
              setTimeout(() => {
                toast.error(data.error || "GPS Geotagged Evidence is required by Ecosystem Governance settings.");
              }, 0);
            }
          } catch {}
        }
      }

      return response;
    };

    return () => {
      if (window.__ORIGINAL_FETCH__) {
        window.fetch = window.__ORIGINAL_FETCH__;
      }
    };
  }, []);

  // Handlers for Menu 2 Email Verification OTP Modal
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const rawFetch = window.__ORIGINAL_FETCH__ || fetch;
      const res = await rawFetch("/api/proxy/email-verification/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-active-workspace": "ecosystem" },
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast.success(data.message || "Verification code sent to your email!");
      } else {
        toast.error(data.error || "Failed to send verification code.");
      }
    } catch {
      toast.error("Network error sending verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setVerifyingOtp(true);
    try {
      const rawFetch = window.__ORIGINAL_FETCH__ || fetch;
      const res = await rawFetch("/api/proxy/email-verification/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-active-workspace": "ecosystem" },
        body: JSON.stringify({ otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.email_verified) {
        setEmailStatus((prev) => ({ ...prev, email_verified: true }));
        setShowVerifyModal(false);
        setOtpCode("");
        toast.success("Email verified! All Ecosystem actions are now unlocked.");
      } else {
        toast.error(data.error || "Invalid or expired verification code.");
      }
    } catch {
      toast.error("Error verifying code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // MENU 2 ENFORCEMENT: EMERGENCY MAINTENANCE MODE (503 ACTIVE)
  if (settings.maintenanceMode) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 text-center relative z-10 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-black uppercase tracking-widest">
            <AlertTriangle size={14} className="animate-pulse" />
            <span>HTTP 503 • Emergency Maintenance Mode Active</span>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <ShieldAlert size={40} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {settings.platformName} Ecosystem Under Maintenance
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              All Ecosystem portals, institutional directories, warehouse receipts, and pipeline settlements are temporarily paused by Platform Governance. Your data and ledgers remain safely locked.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Support Email</p>
                <a href={`mailto:${settings.platformEmail}`} className="font-bold text-slate-200 hover:text-emerald-400 truncate block">
                  {settings.platformEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Phone size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Support Hotline</p>
                <a href={`tel:${settings.supportPhone}`} className="font-bold text-slate-200 hover:text-emerald-400 truncate block">
                  {settings.supportPhone}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fetchEcosystemSettings(true)}
              disabled={checkingMaintenance}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={checkingMaintenance ? "animate-spin" : ""} />
              <span>{checkingMaintenance ? "Checking Status..." : "Check System Status"}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            This screen automatically restores your Ecosystem workspace the moment Super Admin disables Maintenance Mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EcosystemSettingsContext.Provider
      value={{
        settings,
        refreshSettings: fetchEcosystemSettings,
        emailVerified: emailStatus.email_verified,
        openEmailVerifyModal: () => setShowVerifyModal(true),
      }}
    >
      {/* Menu 2 Enforcement Banner: Email Verification Required (Left-to-Right Marquee Ticker) */}
      {settings.emailVerificationRequired && emailStatus.checked && !emailStatus.email_verified && (
        <div className="lg:ml-64 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between gap-4 relative z-30 overflow-hidden backdrop-blur-md">
          <style>{`
            @keyframes agriMarqueeLTR {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            }
            .agri-marquee-ltr {
              display: flex;
              width: max-content;
              animation: agriMarqueeLTR 22s linear infinite;
            }
            .agri-marquee-ltr:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Left Security Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider shrink-0 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <Mail size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Security Alert</span>
          </div>

          {/* Smooth Horizontal Left-to-Right Ticker Viewport */}
          <div className="flex-1 overflow-hidden relative">
            <div className="agri-marquee-ltr items-center text-amber-900 dark:text-amber-200 font-semibold">
              {[0, 1].map((idx) => (
                <div key={idx} className="flex items-center gap-8 pr-12 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <Mail size={14} className="text-amber-600 dark:text-amber-400 shrink-0 sm:hidden" />
                    <strong className="font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                      {settings.platformName} Security Policy:
                    </strong>
                    <span>
                      Email verification is required before executing commodity trades, warehouse intake, or logistics dispatches.
                    </span>
                  </span>
                  <span className="text-amber-500/70 font-black">•</span>
                  <span className="inline-flex items-center gap-2">
                    <strong className="font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                      Action Required:
                    </strong>
                    <span>
                      Click &ldquo;Verify Email Now&rdquo; to receive your instant 6-digit OTP security code and unlock full Ecosystem operations.
                    </span>
                  </span>
                  <span className="text-amber-500/70 font-black">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pinned Action Button */}
          <button
            type="button"
            onClick={() => setShowVerifyModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 z-10"
          >
            Verify Email Now
          </button>
        </div>
      )}

      <NotificationProvider>
        {children}
      </NotificationProvider>

      {/* Menu 2 Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-fade-in">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Verify Your Ecosystem Email
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enforced by {settings.platformName} Security Governance
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Send a 6-digit verification code to{" "}
              <strong className="font-bold text-gray-900 dark:text-white">
                {emailStatus.email || "your registered email"}
              </strong>{" "}
              to unlock commodity intake, dispatches, and settlements.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
              >
                {sendingOtp ? "Sending Verification Code..." : otpSent ? "Resend 6-Digit Code" : "Send 6-Digit Verification Code"}
              </button>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center text-base font-black tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.trim().length < 4}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {verifyingOtp ? "Verifying..." : "Verify & Unlock Operations"}
                </button>
              </form>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span>Need help? {settings.platformEmail}</span>
              <span>{settings.supportPhone}</span>
            </div>
          </div>
        </div>
      )}
    </EcosystemSettingsContext.Provider>
  );
}
