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
  ShoppingCart,
  Package,
  Truck,
  Handshake,
  FileText,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";
import { BuyerDataProvider } from "./useBuyerData";

export default function BuyerPartnerLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const navMenu = [
    {
      label: "Overview",
      href: "/ecosystem/buyer-partner",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Market Matching",
      href: "/ecosystem/buyer-partner/matching",
      icon: <Handshake className="w-4 h-4" />,
    },
    {
      label: "My Orders",
      href: "/ecosystem/buyer-partner/orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      label: "Inventory",
      href: "/ecosystem/buyer-partner/inventory",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: "Logistics",
      href: "/ecosystem/buyer-partner/logistics",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      label: "Contracts",
      href: "/ecosystem/buyer-partner/contracts",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/ecosystem/buyer-partner/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const navLinksStyle = (path) => {
    const isActive = pathname === path;
    return isActive
      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 p-3 rounded-xl shadow-sm border-l-4 border-indigo-600"
      : "hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-xl transition-all duration-200 ml-1 text-gray-500 dark:text-gray-400";
  };

  return (
    <BuyerDataProvider>
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
            className={`${menuOpen ? "left-0 w-64 h-full bg-white shadow-xl" : "-left-64"} transition-all duration-300 fixed z-40 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-gray-950 dark:text-(--foreground) lg:bg-white lg:shadow-md p-4 flex flex-col border-r border-gray-100 dark:border-gray-800`}
          >
            <div className="mb-8 px-2">
              <h2 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase">
                Agri-Noria
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                Ecosystem Buyer
              </p>
            </div>

            <nav className="flex flex-col space-y-1 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {navMenu.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 font-bold text-sm ${navLinksStyle(item.href)}`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}

              <Button
                onClick={handleSignout}
                className="mt-8 cursor-pointer flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-3 rounded-xl transition-all font-black text-xs tracking-widest"
              >
                <LogOut className="w-4 mr-2" />
                Sign out
              </Button>
            </nav>
          </div>
        </aside>
        <main className="lg:ml-64 w-full lg:p-10 p-4 bg-gray-50 dark:bg-black/20 min-h-screen">
          {children}
        </main>
      </div>
    </BuyerDataProvider>
  );
}
