"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  Wallet,
  Settings,
  Truck,
  Lock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";

function LogisticsLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useState(pathname);

  const handleMenuClick = () => setMenuOpen((open) => !open);

  useEffect(() => {
    setOptimisticPath(pathname);
    setMenuOpen(false);
  }, [pathname]);

  const handleSignout = async () => {
    try {
      toast.info("Signing out...", { autoClose: 2000, toastId: "signout" });
      const res = await signoutBridge();
      if (!res) {
        toast.error("Signout failed. Try again.");
        return;
      }
      window.location.href = "/";
    } catch {
      toast.error("Signout failed");
    }
  };

  // Verify Session & Approval Status
  useEffect(() => {
    const checkSession = async () => {
      try {
        let session;
        try {
          const res = await fetch("/api/auth/session");
          session = await res.json();
        } catch {
          session = await verifyVendorSession();
        }
        if (session?.authenticated === false) {
          await handleSignout();
          return;
        }
        setSessionData(session);
        const approved = session?.approval_status === "approved";
        setIsApproved(approved);

        // Block restricted operational sub-routes if unapproved
        const operationalRestrictedRoutes = [
          "/ecosystem/logistics/vehicles",
          "/ecosystem/logistics/vehicles/add-new",
          "/ecosystem/logistics/wallet",
          "/ecosystem/logistics/commodity-movement",
        ];

        if (!approved && (operationalRestrictedRoutes.includes(pathname) || pathname.startsWith("/ecosystem/logistics/vehicles"))) {
          toast.warning("🔒 Fleet Operations Locked: Your logistics enterprise is pending SuperAdmin approval.");
          router.replace("/ecosystem/logistics");
          return;
        }
      } catch (e) {
        console.error("Session check error in logistics layout:", e);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  // If on onboarding route, render cleanly full width
  if (pathname === "/ecosystem/logistics/onboarding") {
    return <div className="min-h-screen bg-(--background)">{children}</div>;
  }

  const navMenu = [
    {
      label: "Dashboard",
      href: "/ecosystem/logistics",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Fleet & Vehicles",
      href: "/ecosystem/logistics/vehicles",
      icon: <Truck className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/logistics/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Settings",
      href: "/ecosystem/logistics/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  const isPendingKyc =
    (!sessionData ||
      !sessionData.onboarding_status ||
      sessionData.onboarding_status === "pending" ||
      sessionData.onboarding_status === "incomplete") &&
    sessionData?.approval_status !== "approved";
  const displayName = sessionData?.full_name || sessionData?.company_name || sessionData?.email || "Logistics Operator";
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      {/* Mobile Backdrop Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/80 dark:border-gray-800 flex flex-col justify-between shrink-0 shadow-sm transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/25 text-white">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black text-lg text-gray-900 dark:text-white tracking-tight">Agri-Noria</h2>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">FLEET</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Logistics Portal</p>
              </div>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="px-4 pt-4">
            <WorkspaceSwitcher currentWorkspace="ecosystem" role="logistics" />
          </div>

          {/* Navigation Links */}
          <nav className="py-4 px-3 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Fleet & Haulage Operations
            </div>
            {navMenu.map((item) => {
              const activeTarget = optimisticPath || pathname;
              const isActive = activeTarget === item.href;
              const isLocked = !isApproved && item.restricted;

              if (isLocked) {
                return (
                  <div
                    key={item.href}
                    onClick={() => {
                      toast.warning(
                        isPendingKyc
                          ? "⚠️ KYC Required: Complete your fleet onboarding to unlock operations."
                          : "⏳ Pending Approval: Operational features are locked until SuperAdmin verifies your fleet."
                      );
                    }}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed select-none hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">{item.icon}</div>
                      <span>{item.label}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Locked pending SuperAdmin approval" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    setOptimisticPath(item.href);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors duration-75 group ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 dark:shadow-emerald-950/50"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      } transition-colors`}
                    >
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
              {initialLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                {isLoadingSession ? (
                  <span className="w-16 h-2 rounded bg-gray-200 dark:bg-gray-800 animate-pulse inline-block" />
                ) : isApproved ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block animate-pulse" />
                    Verified Haulage Carrier
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 inline-block animate-pulse" />
                    {isPendingKyc ? "KYC Required" : "Pending Approval"}
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title="Logistics & Dispatch"
          portalName="Logistics"
          role="logistics"
          onMenuToggle={handleMenuClick}
        />

        {/* SuperAdmin Pending Approval Banner */}
        {!isLoadingSession && sessionData && !isApproved && (pathname === "/ecosystem/logistics" || pathname === "/ecosystem/logistics/") && (
          <div className="p-4 md:px-8 pt-6">
            {isPendingKyc ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Fleet KYC Verification Required</h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      Please submit your haulage company details, GIT insurance, fleet size, and live biometric selfie to unlock transit dispatches and vehicle operations.
                    </p>
                  </div>
                </div>
                <Link
                  href="/ecosystem/logistics/onboarding"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow transition-all shrink-0 cursor-pointer"
                >
                  <span>Complete KYC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 text-blue-900 dark:text-blue-200 shadow-xs">
                <Lock className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Account Pending SuperAdmin Approval</h4>
                  <p className="text-xs text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
                    Your logistics enterprise KYC, fleet profile, and biometric selfie have been recorded and are awaiting review by the SuperAdmin. Operational menus (Fleet & Vehicles & Wallet) will unlock automatically once approved.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <main className="flex-1 w-full lg:p-8 p-4">
          {optimisticPath && optimisticPath !== pathname ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Opening {navMenu.find((m) => m.href === optimisticPath)?.label || "Section"}...
              </p>
            </div>
          ) : (
            children
          )}
        </main>
        <NotificationDrawer />
      </div>
    </div>
  );
}

export default function LogisticsLayout({ children }) {
  return (
    <NotificationProvider role="logistics">
      <LogisticsLayoutInner>{children}</LogisticsLayoutInner>
    </NotificationProvider>
  );
}
