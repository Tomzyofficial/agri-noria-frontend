"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  X,
  Menu,
  LayoutDashboard,
  Truck,
  Globe,
  Settings,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";
import { FaChartLine, FaWallet } from "react-icons/fa6";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

function DistributorLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [activeMenuHref, setActiveMenuHref] = useState(pathname);

  const handleMenuClick = () => setMenuOpen((open) => !open);

  useEffect(() => {
    setMenuOpen(false);
    setActiveMenuHref(pathname);
  }, [pathname]);

  const handleSignout = async () => {
    try {
      toast.info("Signing out...", { autoClose: 2000, toastId: "signout" });
      const res = await signoutBridge();
      if (!res) {
        toast.error("Signout failed. Try again later.");
        return;
      }
      router.refresh();
      router.push("/");
    } catch {
      toast.error("Signout failed. Try again later.");
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
      } catch (e) {
        console.warn("Session check in distributor layout:", e?.message);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
  }, [pathname]);

  // If on onboarding route, render cleanly full width
  if (pathname?.includes("/onboarding")) {
    return <div className="min-h-screen bg-(--background)">{children}</div>;
  }

  const navMenu = [
    {
      label: "Deliveries & Orders",
      href: "/ecosystem/distributor",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      label: "My Wallet & Escrow",
      href: "/ecosystem/distributor/wallet",
      icon: <FaWallet className="w-4 h-4" />,
    },
    {
      label: "Performance Analytics",
      href: "/ecosystem/distributor/analytics",
      icon: <FaChartLine className="w-4 h-4" />,
    },
    {
      label: "KYC & Catalog Profile",
      href: "/ecosystem/distributor/onboarding",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/ecosystem/distributor/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-(--background)">
      <aside>
        <div
          aria-label="Open menu"
          onClick={handleMenuClick}
          className="lg:hidden fixed z-50 bg-black dark:bg-white right-4 top-4 cursor-pointer shadow-md p-2 rounded-xl"
        >
          {menuOpen ? (
            <X className="text-white dark:text-black" />
          ) : (
            <Menu className="text-white dark:text-black" />
          )}
        </div>
        <div
          className={`${menuOpen ? "left-0" : "-left-64"} w-64 h-full bg-white dark:bg-(--card-dark) border-r border-slate-200/80 dark:border-slate-800 shadow-xl transition-all duration-300 fixed z-30 top-0 lg:left-0 lg:w-64 lg:h-screen p-5 flex flex-col justify-between`}
        >
          <div>
            <div className="mb-6 px-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-black text-amber-600 tracking-tighter uppercase">
                  Agri-Noria
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                  SUPPLY
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Truck className="text-white w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-xs text-gray-900 dark:text-white tracking-tight truncate">
                    Agro-Distributor
                  </h2>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {isApproved ? "Certified Partner" : "Pending Review"}
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace Switcher */}
            <div className="mb-4">
              <WorkspaceSwitcher currentWorkspace="ecosystem" role="distributor" session={sessionData} />
            </div>

            <nav className="space-y-1.5">
              <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Distribution Console
              </div>
              {navMenu.map((item) => {
                const currentTarget = activeMenuHref || pathname;
                const isActive = item.href === "/ecosystem/distributor"
                  ? (currentTarget === "/ecosystem/distributor" || currentTarget === "/ecosystem/distributor/")
                  : (currentTarget === item.href || currentTarget.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveMenuHref(item.href);
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
                    <div className="flex items-center gap-2.5">
                      <div className={isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400"}>
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

          <div>
            <Button
              onClick={handleSignout}
              type="button"
              className="w-full cursor-pointer flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl transition-colors justify-start gap-2 bg-transparent text-xs font-bold"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 w-full flex-1 flex flex-col min-h-screen">
        <EcosystemHeader
          roleTitle="Agro-Input Distribution Portal"
          roleBadge="Distributor Gateway"
        />

        {/* Global Verification Alert Banner if Pending Approval */}
        {!isLoadingSession && sessionData && !isApproved && (
          <div className="mx-4 sm:mx-8 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Dealership Accreditation Pending SuperAdmin Approval
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                  Your enterprise details and stocked materials are currently under review by Platform Administration.
                </p>
              </div>
            </div>
            <Link
              href="/ecosystem/distributor/onboarding"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 hover:bg-amber-700 transition"
            >
              <span>View Submitted Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-8">{children}</div>
      </main>

      <NotificationDrawer />
    </div>
  );
}

export default function DistributorLayout({ children }) {
  return (
    <NotificationProvider>
      <DistributorLayoutInner>{children}</DistributorLayoutInner>
    </NotificationProvider>
  );
}
