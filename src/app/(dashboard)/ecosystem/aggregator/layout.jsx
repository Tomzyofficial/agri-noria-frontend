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
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { NotificationProvider } from "@/hooks/useNotificationContext";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import EcosystemHeader from "@/components/dashboard/EcosystemHeader";

function AggregatorLayoutInner({ children }) {
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
      try {
        const response = await fetch("/api/proxy/auth/existing-user", {
          method: "GET",
        });
        if (response.status !== 500 && response.status !== 200) {
          const data = await response.json();
          if (data?.existing === false) await handleSignout();
        }
      } catch {
        return;
      }
    };
    checkExistingUser();
    const interval = setInterval(checkExistingUser, 30000);
    return () => clearInterval(interval);
  }, []);

  const sidebarNavMenu = [
    {
      label: "Overview",
      href: "/ecosystem/aggregator",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Buyer Management",
      href: "/ecosystem/aggregator/buyers",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Cluster Management",
      href: "/ecosystem/aggregator/clusters",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Financing & Escrow",
      href: "/ecosystem/aggregator/financing",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      label: "Produce Aggregation",
      href: "/ecosystem/aggregator/produce",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: "Marketplace & Demand",
      href: "/ecosystem/aggregator/marketplace",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "My Wallet",
      href: "/ecosystem/aggregator/wallet",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/ecosystem/aggregator/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const navLinksStyle = (itemHref) => {
    const isActive = pathname === itemHref;

    return isActive
      ? "bg-green-50 dark:bg-green-900/20 text-green-600 p-3 rounded-xl shadow-sm border-l-4 border-green-600 font-bold transition-all"
      : "hover:bg-gray-100 dark:hover:bg-gray-800/50 p-3 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 font-medium";
  };

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
          } transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col`}
        >
          <div className="mb-8 px-2">
            <h2 className="text-xl font-black text-green-600 uppercase tracking-tight">
              Agri-Noria
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Aggregator Portal
            </p>
          </div>

          <nav className="flex flex-col space-y-2">
            {sidebarNavMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 font-medium ${navLinksStyle(item.href)}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            <Button
              onClick={handleSignout}
              className="mt-auto cursor-pointer flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded transition"
              variant="ghost"
            >
              <LogOut className="w-4 mr-2" />
              Sign out
            </Button>
          </nav>
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
        <main className="w-full flex-1 lg:p-8 p-4">{children}</main>
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
