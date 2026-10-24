"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  LogOut,
  LayoutDashboard,
  UserCog,
  Settings,
  ShieldCheck,
  Wallet,
  Users,
  BarChart3,
  MapPin,
} from "lucide-react";
import { FaSeedling } from "react-icons/fa6";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { NotificationProvider, useNotifications } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";

function SuperAdminLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useState(pathname);
  const { unreadCount, toggleDrawer } = useNotifications();

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
        toast.error("Signout failed. Try again later.");
        return;
      }
      router.refresh();
      router.push("/");
    } catch {
      toast.error("Signout failed. Try again later.");
    }
  };

  const navMenu = useMemo(
    () => [
      {
        label: "Overview",
        href: "/dashboard/super-admin",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Platform Wallet",
        href: "/dashboard/super-admin/wallet",
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        label: "Ecosystem Buyers",
        href: "/dashboard/super-admin/ecosystem-buyers",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "User Management",
        href: "/dashboard/super-admin/users",
        icon: <UserCog className="w-4 h-4" />,
      },
      {
        label: "Field Operations",
        href: "/dashboard/super-admin/field-operations",
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        label: "System Analytics",
        href: "/dashboard/super-admin/analytics",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        label: "Audit Logs",
        href: "/dashboard/super-admin/logs",
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
        label: "Settings",
        href: "/dashboard/super-admin/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ],
    []
  );

  const activeTarget = optimisticPath || pathname;
  const isNavigating = Boolean(optimisticPath && optimisticPath !== pathname);
  const targetMenuItem = navMenu.find((item) =>
    item.href === "/dashboard/super-admin"
      ? optimisticPath === item.href
      : optimisticPath?.startsWith(item.href)
  );

  const isLinkActive = (path) => {
    if (path === "/dashboard/super-admin") {
      return activeTarget === path;
    }
    return activeTarget.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-(--background)">
      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-slate-200/80 dark:border-gray-800 shadow-sm flex flex-col transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & Super Admin Badge Header */}
        <div className="p-6 border-b border-slate-100 dark:border-gray-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xs">
              <FaSeedling className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900 dark:text-white tracking-tight">Agri-Noria</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-1">
            Governance & Controls
          </p>
          {navMenu.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setOptimisticPath(item.href);
                  setMenuOpen(false);
                }}
                onMouseEnter={() => {
                  try {
                    router.prefetch(item.href);
                  } catch {}
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-75 ${
                  active
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-l-4 border-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100/70 dark:hover:bg-gray-900"
                }`}
              >
                <span className={active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 group-hover:text-emerald-600"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Anchored Logout Container */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-900 shrink-0 bg-white dark:bg-gray-950">
          <button
            onClick={handleSignout}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <EcosystemHeader
          title="Super Admin Console"
          portalName="Super Admin"
          role="super_admin"
          onMenuToggle={handleMenuClick}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {isNavigating ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 shadow-xs">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                Opening {targetMenuItem?.label || "Module"}...
              </p>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Slide-over Notification Drawer */}
        <NotificationDrawer />
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }) {
  return (
    <NotificationProvider role="super_admin">
      <SuperAdminLayoutInner>{children}</SuperAdminLayoutInner>
    </NotificationProvider>
  );
}
