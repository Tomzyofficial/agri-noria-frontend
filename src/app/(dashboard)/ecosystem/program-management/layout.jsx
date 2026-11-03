"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  BarChart3,
  Users,
  Network,
  Settings,
  Briefcase,
  Wallet,
  Package,
  Layers,
  Lock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";

function ProgramManagementLayoutInner({ children }) {
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

  // Check Session & Approval Status on mount and 30s interval
  useEffect(() => {
    const checkSession = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setIsLoadingSession(false);
        return;
      }
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
          setIsLoadingSession(false);
          return;
        }

        setSessionData(session);
        const approved = session?.approval_status === "approved";
        setIsApproved(approved);
      } catch (e) {
        console.warn("Session check in program management layout:", e?.message);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);

  // Instant in-memory route boundary & permission guard based on active session
  useEffect(() => {
    if (!sessionData) return;

    const roleStr = (sessionData?.role || "").toLowerCase();
    const isSuperv = roleStr.includes("supervisor");
    const isDir = roleStr.includes("director") || (!isSuperv && (roleStr === "program director" || roleStr === "director"));
    const approved = sessionData?.approval_status === "approved";

    // 1. Role boundaries
    // Cluster Supervisors cannot access Director governance areas
    const directorOnlyRoutes = [
      "/ecosystem/program-management/monitoring",
      "/ecosystem/program-management/approvals",
      "/ecosystem/program-management/loop",
      "/ecosystem/program-management/harvest",
    ];
    if (isSuperv && directorOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      toast.error("Access restricted: Programme Monitoring and Directorate governance are reserved for Program Directors.");
      router.replace("/ecosystem/program-management");
      return;
    }

    // Program Directors do not manage field clusters directly (field supervisors do)
    if (isDir && (pathname === "/ecosystem/program-management/clusters" || pathname.startsWith("/ecosystem/program-management/clusters/"))) {
      toast.info("Cluster operations are managed by field Cluster Supervisors. Redirecting to your assigned programs.");
      router.replace("/ecosystem/program-management/programs");
      return;
    }

    // 2. Unapproved account restrictions
    if (!approved) {
      if (isSuperv) {
        const supervisorOperationalRoutes = [
          "/ecosystem/program-management/clusters",
          "/ecosystem/program-management/programs",
          "/ecosystem/program-management/wallet",
        ];
        if (supervisorOperationalRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
          toast.warning("🔒 Supervisor Operations Locked: Your account is pending SuperAdmin approval.");
          router.replace("/ecosystem/program-management");
          return;
        }
      } else if (isDir) {
        const directorOperationalRoutes = [
          "/ecosystem/program-management/programs",
          "/ecosystem/program-management/monitoring",
          "/ecosystem/program-management/approvals",
          "/ecosystem/program-management/loop",
          "/ecosystem/program-management/harvest",
          "/ecosystem/program-management/wallet",
        ];
        if (directorOperationalRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
          toast.warning("🔒 Program Directorate Locked: Your account is pending SuperAdmin approval.");
          router.replace("/ecosystem/program-management");
          return;
        }
      }
    }
  }, [pathname, sessionData, router]);

  // If on onboarding route, render cleanly full width (matching storage & logistics)
  if (pathname?.includes("/onboarding")) {
    return <div className="min-h-screen bg-(--background)">{children}</div>;
  }

  const userRole = (sessionData?.role || "").toLowerCase();
  const isSupervisor = userRole.includes("supervisor");
  const isDirector = userRole.includes("director") || (!isSupervisor && (userRole === "program director" || userRole === "director"));
  const isAdmin = userRole === "super admin" || userRole === "admin";

  // Dedicated navigation menus tailored strictly by role
  const directorNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/program-management",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Ecosystem Programs",
      href: "/ecosystem/program-management/programs",
      icon: <Briefcase className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Programme Monitoring",
      href: "/ecosystem/program-management/monitoring",
      icon: <Layers className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Pending Approvals",
      href: "/ecosystem/program-management/approvals",
      icon: <Network className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Full Loop",
      href: "/ecosystem/program-management/loop",
      icon: <BarChart3 className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Harvest & Operations",
      href: "/ecosystem/program-management/harvest",
      icon: <Package className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/program-management/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Settings",
      href: "/ecosystem/program-management/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  const supervisorNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/program-management",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Cluster Operations",
      href: "/ecosystem/program-management/clusters",
      icon: <Users className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Ecosystem Programs",
      href: "/ecosystem/program-management/programs",
      icon: <Briefcase className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/program-management/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Settings",
      href: "/ecosystem/program-management/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  const fullAdminNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/program-management",
      icon: <LayoutDashboard className="w-4 h-4" />,
      restricted: false,
    },
    {
      label: "Cluster Operations",
      href: "/ecosystem/program-management/clusters",
      icon: <Users className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Ecosystem Programs",
      href: "/ecosystem/program-management/programs",
      icon: <Briefcase className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Programme Monitoring",
      href: "/ecosystem/program-management/monitoring",
      icon: <Layers className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Pending Approvals",
      href: "/ecosystem/program-management/approvals",
      icon: <Network className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Full Loop",
      href: "/ecosystem/program-management/loop",
      icon: <BarChart3 className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Harvest & Operations",
      href: "/ecosystem/program-management/harvest",
      icon: <Package className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/program-management/wallet",
      icon: <Wallet className="w-4 h-4" />,
      restricted: true,
    },
    {
      label: "Settings",
      href: "/ecosystem/program-management/settings",
      icon: <Settings className="w-4 h-4" />,
      restricted: false,
    },
  ];

  const visibleNavMenu = isAdmin
    ? fullAdminNavMenu
    : isSupervisor
    ? supervisorNavMenu
    : directorNavMenu;

  const isPendingKyc =
    (!sessionData?.onboarding_status ||
      sessionData.onboarding_status === "pending" ||
      sessionData.onboarding_status === "incomplete") &&
    sessionData?.approval_status !== "approved";

  const displayName =
    `${sessionData?.fname || ""} ${sessionData?.lname || ""}`.trim() ||
    (isSupervisor ? "Cluster Supervisor" : "Program Director");
  const initialLetter = displayName?.[0]?.toUpperCase() || "P";

  const portalTitle = isSupervisor ? "Cluster Operations & Supervision" : "Program Directorate";
  const portalName = isSupervisor ? "Cluster Supervisor" : "Program Management";

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
          className={`${menuOpen ? "left-0 w-64 h-full bg-white shadow-xl" : "-left-64"} transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-gray-950 dark:text-(--foreground) lg:bg-white lg:shadow-md p-4 flex flex-col justify-between`}
        >
          <div>
            <div className="mb-6 px-2">
              <h2 className="text-xl font-black text-amber-600 tracking-tighter uppercase">
                Agri-Noria
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {portalName}
              </p>
            </div>

            <nav className="flex flex-col space-y-1.5">
              {visibleNavMenu.map((item) => {
                const isLocked = item.restricted && !isApproved;
                const isActive = item.href === "/ecosystem/program-management"
                  ? (optimisticPath === "/ecosystem/program-management" || optimisticPath === "/ecosystem/program-management/")
                  : (optimisticPath === item.href || optimisticPath.startsWith(item.href + "/") || optimisticPath.startsWith(item.href + "?"));

                if (isLocked) {
                  return (
                    <div
                      key={item.href}
                      onClick={() => {
                        toast.warning(
                          isPendingKyc
                            ? "⚠️ KYC Required: Complete your Cluster Supervisor onboarding to unlock operations."
                            : "🔒 Pending Approval: Operational features are locked until SuperAdmin verifies your supervisor account."
                        );
                      }}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed select-none hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 dark:text-gray-600">{item.icon}</div>
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
                    onMouseEnter={() => {
                      if (item.href) try { router.prefetch(item.href); } catch {}
                    }}
                    onFocus={() => {
                      if (item.href) try { router.prefetch(item.href); } catch {}
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors duration-75 group ${
                      isActive
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400"}>
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

          {/* User Card & Sign Out (Matching Storage & Logistics pattern) */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
                {initialLetter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                  {isLoadingSession ? (
                    <span className="w-14 h-2 rounded bg-gray-200 dark:bg-gray-800 animate-pulse inline-block" />
                  ) : isApproved ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block animate-pulse" />
                      Verified {isSupervisor ? "Supervisor" : "Director"}
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

            <Button
              onClick={handleSignout}
              className="w-full cursor-pointer flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-xl transition-all font-bold text-xs"
              variant="ghost"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title={portalTitle}
          portalName={portalName}
          role={userRole || (isSupervisor ? "cluster supervisor" : "program director")}
          onMenuToggle={handleMenuClick}
        />
        {optimisticPath && optimisticPath !== pathname && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 animate-pulse" />
        )}
        <main className="w-full flex-1 lg:p-8 p-4 bg-gray-50 dark:bg-(--background)">
          {children}
        </main>
        <NotificationDrawer />
      </div>
    </div>
  );
}

export default function ProgramManagementLayout({ children }) {
  return (
    <NotificationProvider role="program_director">
      <ProgramManagementLayoutInner>{children}</ProgramManagementLayoutInner>
    </NotificationProvider>
  );
}
