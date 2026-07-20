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
  Landmark,
  Activity,
  ShieldAlert,
  Coins,
  Settings,
  Globe,
  Wallet,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";

export default function InstitutionLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountType, setAccountType] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = () => setMenuOpen((open) => !open);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignout = async () => {
    try {
      const res = await signoutBridge();
      if (!res) {
        toast.error("Signout failed. Try again.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Signout failed");
    }
  };

  // Auto-verify session
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const response = await fetch("/api/proxy/auth/verify-vendor");
        if (response.ok) {
          const data = await response.json();
          if (data?.authenticated) {
            setAccountType(data.role?.toLowerCase() || "");
          } else {
            await handleSignout();
          }
        } else if (response.status !== 500) {
          await handleSignout();
        }
      } catch {
        return;
      }
    };
    checkExistingUser();
    const interval = setInterval(checkExistingUser, 30000);
    return () => clearInterval(interval);
  }, []);

  let navMenu = [];

  switch (accountType) {
    case "government":
      navMenu = [
        { label: "National Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Farmer Registry", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
        { label: "Programme Management", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
        { label: "Monitoring", href: "/ecosystem/institution/monitoring", icon: <Activity className="w-4 h-4" /> },
      ];
      break;
    case "finance":
      navMenu = [
        { label: "Financial Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Approvals Center", href: "/ecosystem/institution/approvals", icon: <Coins className="w-4 h-4" /> },
      ];
      break;
    case "bank":
      navMenu = [
        { label: "Portfolio", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Farmer Profiles", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
        { label: "Lending", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
        { label: "Escrow", href: "/ecosystem/institution/escrow", icon: <Wallet className="w-4 h-4" /> },
      ];
      break;
    case "commodity board":
      navMenu = [
        { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Farmer View", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
        { label: "Procurement", href: "/ecosystem/institution/procurement", icon: <Landmark className="w-4 h-4" /> },
        { label: "Traceability", href: "/ecosystem/institution/traceability", icon: <Activity className="w-4 h-4" /> },
      ];
      break;
    case "dfi":
      navMenu = [
        { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Projects", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
        { label: "Monitoring", href: "/ecosystem/institution/monitoring", icon: <Activity className="w-4 h-4" /> },
        { label: "Reports", href: "/ecosystem/institution/reports", icon: <Globe className="w-4 h-4" /> },
      ];
      break;
    case "ngo":
      navMenu = [
        { label: "Dashboard", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Beneficiaries", href: "/ecosystem/institution/farmers", icon: <Globe className="w-4 h-4" /> },
        { label: "Projects", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
        { label: "Extension Services", href: "/ecosystem/institution/extension", icon: <Activity className="w-4 h-4" /> },
        { label: "Distribution", href: "/ecosystem/institution/ngo-distribution", icon: <Truck className="w-4 h-4" /> },
      ];
      break;
    default:
      // Fallback or generic institution menu
      navMenu = [
        { label: "Overview", href: "/ecosystem/institution", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Programs", href: "/ecosystem/institution/programs", icon: <Landmark className="w-4 h-4" /> },
      ];
  }

  navMenu.push({
    label: "Settings",
    href: "/ecosystem/institution/settings",
    icon: <Settings className="w-4 h-4" />,
  });

  const navLinksStyle = (path) => {
    return path === pathname
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded shadow-sm border-l-4 border-blue-600"
      : "hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-all duration-200 ml-1";
  };

  return (
    <div className="flex min-h-screen bg-(--background)">
      <aside>
        <div
          aria-label="Open menu"
          onClick={handleMenuClick}
          className="lg:hidden fixed z-50 bg-black dark:bg-white right-4 top-4 cursor-pointer shadow-md p-2 rounded"
        >
          {menuOpen ? (
            <X className="text-white dark:text-black" />
          ) : (
            <Menu className="text-white dark:text-black" />
          )}
        </div>

        <div
          className={`${menuOpen ? "left-0 w-64 h-full bg-white shadow-xl" : "-left-64"} transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-gray-950 dark:text-(--foreground) lg:bg-white lg:shadow-md p-4 flex flex-col`}
        >
          <div className="mb-8 px-2">
            <h2 className="text-xl font-black text-blue-600 tracking-tighter uppercase">
              Agri-Noria
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Institutional Portal
            </p>
          </div>

          <nav className="flex flex-col space-y-2 flex-grow">
            {navMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 font-semibold text-sm ${navLinksStyle(item.href)}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {/* <div className="my-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                     
                  </div> */}

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
      <main className="lg:ml-64 w-full lg:p-8 p-4 bg-gray-50 dark:bg-(--background)">
        {children}
      </main>
    </div>
  );
}
