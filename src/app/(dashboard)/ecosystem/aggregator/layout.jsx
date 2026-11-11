"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Wallet,
  Package,
  Lock,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

function AggregatorLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [activeMenuHref, setActiveMenuHref] = useState(pathname);
  const [navigatingHref, setNavigatingHref] = useState(null);

  const handleMenuClick = () => {
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
    setActiveMenuHref(pathname);
    setNavigatingHref(null);
    setMenuOpen(false);
  }, [pathname]);

  // Timeout guard for navigating state
  useEffect(() => {
    if (navigatingHref) {
      const timer = setTimeout(() => setNavigatingHref(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [navigatingHref]);

  const handleSignout = async () => {
    try {
      toast.info("Signing out...", { autoClose: 2000, toastId: "signout" });
      const res = await signoutBridge();
      if (!res) {
        toast.error("Signout failed. Try again.");
        return;
      }
      window.location.href = "/";
    } catch (error) {
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
          if (res.ok) {
            session = await res.json();
          } else {
            session = await verifyVendorSession();
          }
        } catch {
          session = await verifyVendorSession();
        }
        if (!session || session?.networkError || session?.authenticated === false) {
          return;
        }
        setSessionData(session);
        const approved = session?.approval_status === "approved";
        setIsApproved(approved);

        // Block restricted operational sub-routes if unapproved
        const operationalRestrictedRoutes = [
          "/ecosystem/aggregator/buyers",
          "/ecosystem/aggregator/clusters",
          "/ecosystem/aggregator/financing",
          "/ecosystem/aggregator/produce",
          "/ecosystem/aggregator/marketplace",
          "/ecosystem/aggregator/wallet",
        ];

        if (!approved && operationalRestrictedRoutes.some((route) => pathname.startsWith(route))) {
          toast.warning("🔒 Aggregator Operations Locked: Your enterprise is pending SuperAdmin approval.");
          router.replace("/ecosystem/aggregator");
          return;
        }
      } catch (e) {
        console.warn("Session check in aggregator layout:", e?.message);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  const isPendingKyc =
    (!sessionData ||
      !sessionData.onboarding_status ||
      sessionData.onboarding_status === "pending" ||
      sessionData.onboarding_status === "incomplete") &&
    sessionData?.approval_status !== "approved";

  const sidebarNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/aggregator",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Buyer Management",
      href: "/ecosystem/aggregator/buyers",
      icon: <Users className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Cluster Management",
      href: "/ecosystem/aggregator/clusters",
      icon: <Users className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Financing & Escrow",
      href: "/ecosystem/aggregator/financing",
      icon: <CreditCard className="w-4 h-4" />,
      restricted: true,
    },
    /*
    {
      label: "Produce Aggregation",
      href: "/ecosystem/aggregator/produce",
      icon: <Package className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Marketplace & Demand",
      href: "/ecosystem/aggregator/marketplace",
      icon: <BarChart3 className="w-4 h-4" />,
      restricted: true,
    },
    */
    {
      label: "My Wallet",
      href: "/ecosystem/aggregator/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "KYC Dossier",
      href: "/ecosystem/aggregator/onboarding",
      icon: <FileText className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Settings",
      href: "/ecosystem/aggregator/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  // Prefetch routes for instantaneous navigation
  useEffect(() => {
    sidebarNavMenu.forEach((item) => {
      if (item.href) {
        try {
          router.prefetch(item.href);
        } catch {}
      }
    });
  }, [router]);

  // If on onboarding route, render cleanly full width
  if (pathname?.includes("/onboarding")) {
    return <div className="min-h-screen bg-(--background)">{children}</div>;
  }

  const navigatingItem = sidebarNavMenu.find((m) => m.href === navigatingHref);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
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
            menuOpen ? "left-0 w-64 h-full shadow-2xl" : "-left-64"
          } transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between`}
        >
          <div>
            <div className="mb-4 px-2">
              <h2 className="text-xl font-black text-green-600 uppercase tracking-tight">
                Agri-Noria
              </h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Aggregator Portal
                </p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isApproved ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {isApproved ? "Accredited" : "Pending Review"}
                </p>
              </div>
            </div>

            {/* Workspace Switcher */}
            <div className="mb-4">
              <WorkspaceSwitcher currentWorkspace="ecosystem" role="aggregator" session={sessionData} />
            </div>

            <nav className="flex flex-col space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Aggregator Operations
              </div>
              {sidebarNavMenu.map((item) => {
                const isLocked = item.restricted && !isApproved;
                const currentTarget = activeMenuHref || pathname;
                const isActive =
                  item.href === "/ecosystem/aggregator"
                    ? currentTarget === "/ecosystem/aggregator" || currentTarget === "/ecosystem/aggregator/"
                    : currentTarget === item.href || currentTarget.startsWith(item.href + "/");

                if (isLocked) {
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        toast.warning(
                          isPendingKyc
                            ? "⚠️ KYC Required: Complete your enterprise onboarding to unlock aggregator operations."
                            : "⏳ Pending Approval: Operational features are locked until SuperAdmin verifies your enterprise accreditation."
                        );
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed select-none hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-gray-400 dark:text-gray-500">{item.icon}</div>
                        <span>{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Locked pending SuperAdmin approval" />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveMenuHref(item.href);
                      if (item.href !== pathname) {
                        setNavigatingHref(item.href);
                      }
                    }}
                    onMouseEnter={() => {
                      if (item.href) {
                        try {
                          router.prefetch(item.href);
                        } catch {}
                      }
                    }}
                    className={`flex items-center justify-between font-medium cursor-pointer transition-colors duration-75 px-3 py-2.5 rounded-xl text-xs ${
                      isActive
                        ? "bg-green-50 dark:bg-green-900/25 text-green-700 dark:text-green-400 shadow-xs border-l-4 border-green-600 font-bold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div>{item.icon}</div>
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-600 shadow-xs" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-900">
            <Button
              onClick={handleSignout}
              className="w-full cursor-pointer flex items-center justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2.5 rounded-xl transition text-xs font-bold"
              variant="ghost"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title="Aggregator Operations"
          portalName="Aggregator"
          role="aggregator"
          onMenuToggle={handleMenuClick}
        />

        {/* Global Verification Alert Banner if Pending Approval */}
        {!isLoadingSession && sessionData && !isApproved && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Aggregator Accreditation Pending SuperAdmin Approval
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                  Your enterprise KYC dossier and warehouse details are currently under review by Platform Administration.
                </p>
              </div>
            </div>
            <Link
              href="/ecosystem/aggregator/onboarding"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 transition shadow-xs"
            >
              <span>View Submitted Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <main className="w-full flex-1 lg:p-8 p-4">
          {navigatingHref && navigatingHref !== pathname ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 flex items-center justify-center shadow-xs">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Opening {navigatingItem?.label || "Section"}...
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

export default function AggregatorLayout({ children }) {
  return (
    <NotificationProvider role="aggregator">
      <AggregatorLayoutInner>{children}</AggregatorLayoutInner>
    </NotificationProvider>
  );
}
