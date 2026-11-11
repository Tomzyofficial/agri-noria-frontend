"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  Truck,
  Warehouse,
  BadgePercent,
  Settings,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

function SalesLayoutInner({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = () => {
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
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
    } catch (error) {
      toast.error("Signout failed");
    }
  };

  // Auto-verify session
  useEffect(() => {
    const checkExistingUser = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      try {
        const response = await fetch("/api/proxy/auth/existing-user", {
          method: "GET",
        });
        if (response.status === 401 || response.status === 404) {
          const data = await response.json().catch(() => null);
          if (data?.existing === false && !data?.proxyNetworkError) {
            router.replace("/auth/signin");
          }
        }
      } catch {
        return;
      }
    };
    checkExistingUser();
    const interval = setInterval(checkExistingUser, 30000);
    return () => clearInterval(interval);
  }, [router]);

  // If on onboarding route, render cleanly full width
  if (pathname?.includes("/onboarding")) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  const sidebarNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/sales-&-distribution",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Shipments",
      href: "/ecosystem/sales-&-distribution/shipments",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      label: "Warehouse",
      href: "/ecosystem/sales-&-distribution/warehouse",
      icon: <Warehouse className="w-4 h-4" />,
    },
    {
      label: "Sales Wallet",
      href: "/ecosystem/sales-&-distribution/wallet",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      label: "Sales Analytics",
      href: "/ecosystem/sales-&-distribution/analytics",
      icon: <BadgePercent className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/ecosystem/sales-&-distribution/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Mobile Drawer Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside>
        <div
          className={`${
            menuOpen ? "left-0 w-64 h-full shadow-2xl" : "-left-64"
          } transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between`}
        >
          <div>
            <div className="mb-4 px-2">
              <h2 className="text-xl font-black text-blue-500 uppercase tracking-tight">
                Agri-Noria
              </h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Sales & Distribution
                </p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </p>
              </div>
            </div>

            {/* Workspace Switcher */}
            <div className="mb-4">
              <WorkspaceSwitcher currentWorkspace="ecosystem" role="sales" />
            </div>

            <nav className="flex flex-col space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Operations
              </div>
              {sidebarNavMenu.map((item) => {
                const isActive =
                  item.href === "/ecosystem/sales-&-distribution"
                    ? pathname === "/ecosystem/sales-&-distribution" || pathname === "/ecosystem/sales-&-distribution/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={isActive ? "text-white" : "text-slate-400"}>
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

          <div className="pt-4 border-t border-slate-800/80">
            <Button
              onClick={handleSignout}
              type="button"
              className="w-full cursor-pointer flex items-center text-rose-400 hover:bg-rose-500/10 px-3 py-2.5 rounded-xl transition-colors justify-start gap-2 bg-transparent text-xs font-bold"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 w-full flex-1 flex flex-col min-h-screen">
        <EcosystemHeader
          title="Sales & Distribution Hub"
          portalName="Sales & Distribution"
          role="sales_operations"
          onMenuToggle={handleMenuClick}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function SalesLayout({ children }) {
  return (
    <NotificationProvider>
      <SalesLayoutInner>{children}</SalesLayoutInner>
      <NotificationDrawer />
    </NotificationProvider>
  );
}
