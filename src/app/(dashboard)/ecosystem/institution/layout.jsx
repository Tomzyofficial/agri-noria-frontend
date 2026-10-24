"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  LogOut,
  X,
  Menu,
  LayoutDashboard,
  Landmark,
  Activity,
  ShieldAlert,
  Coins,
  Settings,
  Globe,
  Wallet,
  Truck,
  Banknote,
  Users,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";

function InstitutionLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountType, setAccountType] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("institution_account_type") || "";
    }
    return "";
  });
  const [notifications, setNotifications] = useState([]);
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

  // Auto-verify session and fetch notifications
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const [response, notifRes] = await Promise.all([
          fetch("/api/proxy/auth/verify-vendor"),
          fetch("/api/proxy/programs/notifications").catch(() => null)
        ]);
        if (response.ok) {
          const data = await response.json();
          if (data?.authenticated) {
            const role = data.role?.toLowerCase() || "";
            setAccountType(role);
            if (typeof window !== "undefined" && role) {
              localStorage.setItem("institution_account_type", role);
            }
          } else {
            await handleSignout();
          }
        } else if (response.status !== 500) {
          await handleSignout();
        }

        if (notifRes && notifRes.ok) {
          const notifData = await notifRes.json().catch(() => null);
          if (notifData?.success && Array.isArray(notifData.data)) {
            const savedDismissed = typeof window !== "undefined"
              ? JSON.parse(sessionStorage.getItem("dismissed_notification_ids") || "[]")
              : [];
            const active = notifData.data.filter(n => !savedDismissed.includes(n.id));
            setNotifications(active);
          }
        }
      } catch {
        return;
      }
    };
    checkExistingUser();
    const interval = setInterval(checkExistingUser, 30000);
    return () => clearInterval(interval);
  }, []);

  const navMenu = useMemo(() => {
    let items = [];

    switch (accountType) {
      case "government":
        items = [
          { label: "National Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Farmer Registry", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
          { label: "Programme Management", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Monitoring", href: "/ecosystem/institution/monitoring", icon: <Activity className="w-4 h-4" /> },
        ];
        break;
      case "finance":
        items = [
          { label: "Financial Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Active Programmes", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Approvals Center", href: "/ecosystem/institution/approvals", icon: <Coins className="w-4 h-4" /> },
          { label: "Treasury Ledger", href: "/ecosystem/institution/treasury", icon: <Banknote className="w-4 h-4" /> },
        ];
        break;
      case "bank":
        items = [
          { label: "Portfolio", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Farmer Profiles", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
          { label: "Lending", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Escrow", href: "/ecosystem/institution/escrow", icon: <Wallet className="w-4 h-4" /> },
        ];
        break;
      case "commodity board":
        items = [
          { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Farmer View", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
          { label: "Procurement", href: "/ecosystem/institution/procurement", icon: <Landmark className="w-4 h-4" /> },
          { label: "Traceability", href: "/ecosystem/institution/traceability", icon: <Activity className="w-4 h-4" /> },
        ];
        break;
      case "dfi":
        items = [
          { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Projects", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Monitoring", href: "/ecosystem/institution/monitoring", icon: <Activity className="w-4 h-4" /> },
          { label: "Reports", href: "/ecosystem/institution/reports", icon: <Globe className="w-4 h-4" /> },
        ];
        break;
      case "ngo":
        items = [
          { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Beneficiaries", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
          { label: "Projects", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Extension Services", href: "/ecosystem/institution/extension", icon: <Activity className="w-4 h-4" /> },
          { label: "Distribution", href: "/ecosystem/institution/ngo-distribution", icon: <Truck className="w-4 h-4" /> },
        ];
        break;
      case "producer association":
        items = [
          { label: "Overview", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Producers", href: "/ecosystem/institution/farmers", icon: <Users className="w-4 h-4" /> },
          { label: "Member Cooperatives", href: "/ecosystem/institution/cooperatives", icon: <Globe className="w-4 h-4" /> },
          { label: "Producer Groups", href: "/ecosystem/institution/producer-groups", icon: <Activity className="w-4 h-4" /> },
          { label: "Programmes", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Commodity Intelligence", href: "/ecosystem/institution/traceability", icon: <Activity className="w-4 h-4" /> },
          { label: "Reports", href: "/ecosystem/institution/reports", icon: <FileText className="w-4 h-4" /> },
        ];
        break;
      case "cooperative":
        items = [
          { label: "Overview", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Members", href: "/ecosystem/institution/farmers", icon: <Users className="w-4 h-4" /> },
          { label: "Member Clusters", href: "/ecosystem/institution/member-clusters", icon: <Activity className="w-4 h-4" /> },
          { label: "Farms", href: "/ecosystem/institution/farms", icon: <Globe className="w-4 h-4" /> },
          { label: "Programmes", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
          { label: "Financing & Inputs", href: "/ecosystem/institution/approvals", icon: <Coins className="w-4 h-4" /> },
          { label: "Reports", href: "/ecosystem/institution/reports", icon: <FileText className="w-4 h-4" /> },
        ];
        break;
      case "research institution":
        items = [
          { label: "Research Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Research Projects", href: "/ecosystem/institution/research-projects", icon: <FileText className="w-4 h-4" /> },
          { label: "Participating Farmers", href: "/ecosystem/institution/farmers", icon: <Users className="w-4 h-4" /> },
          { label: "Trial Plots", href: "/ecosystem/institution/trial-plots", icon: <Activity className="w-4 h-4" /> },
          { label: "Publications", href: "/ecosystem/institution/publications", icon: <Globe className="w-4 h-4" /> },
          { label: "Alerts & Advisories", href: "/ecosystem/institution/advisories", icon: <ShieldAlert className="w-4 h-4" /> },
        ];
        break;
      default:
        items = [
          { label: "Overview", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Programs", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
        ];
    }

    items.push({
      label: "Wallet",
      href: "/ecosystem/institution/wallet",
      icon: <Wallet className="w-4 h-4" />,
    });

    items.push({
      label: "Settings",
      href: "/ecosystem/institution/settings",
      icon: <Settings className="w-4 h-4" />,
    });

    return items;
  }, [accountType]);

  const activeTarget = optimisticPath || pathname;
  const isNavigating = Boolean(optimisticPath && optimisticPath !== pathname);
  const targetMenuItem = navMenu.find((item) => item.href === optimisticPath);
  const navLinksStyle = (path) => {
    const isActive = path === "/ecosystem/institution"
      ? activeTarget === "/ecosystem/institution"
      : activeTarget === path || activeTarget.startsWith(`${path}/`);

    return isActive
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded shadow-sm border-l-4 border-blue-600"
      : "hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-75 ml-1";
  };

  const handleDismissNotification = async (notifId) => {
    // 1. Remove from local display immediately
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));

    // 2. Persist in session storage so polling ignores it
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(sessionStorage.getItem("dismissed_notification_ids") || "[]");
        if (!saved.includes(notifId)) {
          saved.push(notifId);
          sessionStorage.setItem("dismissed_notification_ids", JSON.stringify(saved));
        }
      } catch (e) {
        console.error("Storage error:", e);
      }
    }

    // 3. Mark as read on the backend database
    try {
      await fetch("/api/proxy/programs/notifications/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notifId }),
      });
    } catch (e) {
      console.error("Failed to dismiss on backend:", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-(--background)">
      <aside>
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div
          className={`${menuOpen ? "left-0 w-64 h-full bg-white shadow-xl" : "-left-64"} transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-gray-950 dark:text-(--foreground) lg:bg-white lg:shadow-md p-4 flex flex-col border-r border-gray-100 dark:border-gray-800`}
        >
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-black text-blue-600 tracking-tighter uppercase">
              Agri-Noria
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Institutional Portal
            </p>
          </div>

          <nav className="flex flex-col space-y-1 flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {navMenu.map((item) => (
              <Link
                key={item.label}
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
                className={`flex items-center gap-3 font-semibold text-sm cursor-pointer ${navLinksStyle(item.href)}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            <Button
              onClick={handleSignout}
              className="mt-auto cursor-pointer flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl transition-all font-bold"
              variant="ghost"
            >
              <LogOut className="w-4 mr-2" />
              Sign out
            </Button>
          </nav>
        </div>
      </aside>
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title={`${accountType ? accountType.charAt(0).toUpperCase() + accountType.slice(1) : "Institutional"} Gateway`}
          portalName="Institution"
          role={accountType || "institution"}
          onMenuToggle={handleMenuClick}
        />
        <main className="w-full flex-1 lg:p-8 p-4 bg-gray-50 dark:bg-(--background) transition-all duration-200">
          {notifications.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 shadow-sm flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500 text-white shadow-sm">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="font-black text-red-900 dark:text-red-300 text-sm uppercase tracking-wide">
                    {notifications[0].title || "Programme Attention Required"}
                  </p>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mt-0.5">
                    {notifications[0].message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  href="/ecosystem/institution/programs" 
                  prefetch={true}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shadow-sm"
                >
                  Fund Programme
                </Link>
                <button
                  onClick={() => handleDismissNotification(notifications[0].id)}
                  className="p-1.5 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-200 rounded-xl transition-all cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {isNavigating ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Opening {targetMenuItem?.label || "Section"}...
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

export default function InstitutionLayout({ children }) {
  return (
    <NotificationProvider role="institution">
      <InstitutionLayoutInner>{children}</InstitutionLayoutInner>
    </NotificationProvider>
  );
}
