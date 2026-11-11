"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  MapPin,
  Calendar,
  Settings,
  Wallet,
  Lock,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

function FieldOperationsLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const normUserRole = (sessionData?.role || "").toLowerCase().trim();
  const roleDisplayNames = {
    agronomist: "Agronomist",
    inspector: "Field Inspector",
    enumerator: "Field Enumerator",
    "field officer": "Field Officer",
    "field operations supervisor": "Field Operations Supervisor",
  };
  const roleTitle = roleDisplayNames[normUserRole] || "Field Operations";
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = () => setMenuOpen((open) => !open);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignout = async () => {
    try {
      toast.info("Signing out...", { autoClose: 2000, toastId: "signout" });
      const res = await signoutBridge();
      if (!res) {
        toast.error("Signout failed. Try again later.");
        return;
      }
      window.location.href = "/";
    } catch {
      toast.error("Signout failed");
    }
  };

  // Verify session and approval status
  useEffect(() => {
    const fetchSession = async () => {
      try {
        let session;
        try {
          const res = await fetch("/api/auth/session");
          if (res.ok) {
            session = await res.json();
          } else {
            session = await verifyVendorSession();
          }
        } catch {
          session = await verifyVendorSession();
        }

        if (session?.authenticated) {
          setSessionData(session);
          const approved = session?.approval_status === "approved" || session?.is_verified === true || session?.onboarding_status === "verified";
          setIsApproved(approved);

          // If unapproved and trying to access restricted sub-routes directly via URL, redirect to dashboard overview
          const isRestrictedPath =
            pathname?.includes("/inspections") ||
            pathname?.includes("/schedule") ||
            pathname?.includes("/wallet");
          if (!approved && isRestrictedPath) {
            router.replace("/ecosystem/field-operations");
          }

          const hasSubmitted =
            session?.has_onboarded === true ||
            session?.has_draft === true ||
            ["unverified", "submitted", "completed", "verified"].includes(session?.onboarding_status?.toLowerCase()) ||
            session?.approval_status === "approved";

          const isOnboarding = pathname?.includes("/onboarding");
          const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const isDossierView = searchParams?.get("view") === "dossier";

          if (isOnboarding && hasSubmitted && !isDossierView) {
            router.replace("/ecosystem/field-operations");
          }
        } else if (session?.authenticated === false && !session?.networkError) {
          router.replace("/auth/signin");
        }
      } catch (e) {
        console.warn("Failed to check field operations session:", e);
      } finally {
        setIsLoadingSession(false);
      }
    };

    fetchSession();
    const interval = setInterval(fetchSession, 30000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  // If on onboarding route, redirect if approved, otherwise render cleanly full width
  if (pathname?.includes("/onboarding")) {
    if (isApproved) {
      router.replace("/ecosystem/field-operations");
      return null;
    }
    return <div className="min-h-screen bg-(--background)">{children}</div>;
  }

  const navMenu = [
    {
      label: "Overview",
      href: "/ecosystem/field-operations",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Farm Inspections",
      href: "/ecosystem/field-operations/inspections",
      icon: <MapPin className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Visit Schedule",
      href: "/ecosystem/field-operations/schedule",
      icon: <Calendar className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/field-operations/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Settings",
      href: "/ecosystem/field-operations/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-(--background)">
      <aside>
        {/* Backdrop overlay on mobile */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
        )}

        <div
          className={`${
            menuOpen ? "left-0 w-64 h-full bg-white shadow-xl" : "-left-64"
          } transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-gray-950 dark:text-(--foreground) lg:bg-white lg:shadow-md p-4 flex flex-col justify-between`}
        >
          <div>
            <div className="mb-4 px-2">
              <h2 className="text-xl font-black text-lime-600 tracking-tighter uppercase">
                Agri-Noria
              </h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Field Operations
                </p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isLoadingSession
                        ? "bg-slate-400 animate-pulse"
                        : isApproved
                        ? "bg-emerald-500"
                        : "bg-amber-500 animate-pulse"
                    }`}
                  />
                  {isLoadingSession
                    ? "Verifying..."
                    : isApproved
                    ? "Accredited"
                    : "Pending Review"}
                </p>
              </div>
            </div>

            {/* Workspace Switcher */}
            <div className="mb-4">
              <WorkspaceSwitcher
                currentWorkspace="ecosystem"
                role="field_operations"
                session={sessionData}
              />
            </div>

            <nav className="flex flex-col space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Operations
              </div>
              {navMenu.map((item) => {
                const isLocked = !isLoadingSession && item.restricted && !isApproved;
                const isActive = pathname === item.href;

                if (isLocked) {
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        toast.warning(
                          `⏳ Pending Approval: Operational features are locked until SuperAdmin verifies your ${roleTitle} credentials.`
                        );
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed select-none hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-gray-400 dark:text-gray-500">{item.icon}</div>
                        <span>{item.label}</span>
                      </div>
                      <Lock
                        className="w-3.5 h-3.5 text-amber-500 shrink-0"
                        title="Locked pending SuperAdmin approval"
                      />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors duration-75 ${
                      isActive
                        ? "bg-lime-600 text-white shadow-md shadow-lime-600/25"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={handleSignout}
              className="w-full cursor-pointer flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2.5 rounded-xl transition-all font-bold text-xs justify-start gap-2 bg-transparent"
              variant="ghost"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title="Field Operations & Verification"
          portalName="Field Operations"
          role="field_operations"
          onMenuToggle={handleMenuClick}
        />

        {/* Global Verification Alert Banner if Pending Approval */}
        {!isLoadingSession && sessionData && !isApproved && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  {roleTitle} Accreditation Pending SuperAdmin Review
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                  Your {roleTitle.toLowerCase()} credentials, identity details, and assigned operational areas are under review. Operational tools are locked.
                </p>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 text-amber-800 dark:text-amber-300 font-bold text-[11px] shrink-0 flex items-center gap-1.5 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span>Pending Review</span>
            </div>
          </div>
        )}

        <main className="w-full flex-1 lg:p-8 p-4 bg-gray-50 dark:bg-(--background)">
          {children}
        </main>
        <NotificationDrawer />
      </div>
    </div>
  );
}

export default function FieldOperationsLayout({ children }) {
  return (
    <NotificationProvider role="field_operations">
      <FieldOperationsLayoutInner>{children}</FieldOperationsLayoutInner>
    </NotificationProvider>
  );
}
