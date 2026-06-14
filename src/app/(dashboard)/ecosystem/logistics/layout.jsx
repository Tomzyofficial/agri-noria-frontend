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
  Wallet,
  Settings,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";

export default function LogisticsLayout({ children }) {
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
      label: "Dashboard",
      href: "/ecosystem/logistics",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    // {
    //   label: "Commodity Movement",
    //   href: "/ecosystem/logistics/commodity-movement",
    //   icon: <Activity className="w-4 h-4" />,
    // },
    {
      label: "My Wallet",
      href: "/ecosystem/logistics/wallet",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/ecosystem/logistics/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 md:flex-row">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-(--background) border-b md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-(--greenish-color) rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LG</span>
          </div>
          <span className="font-bold text-lg text-(--foreground)">
            Agri-Noria
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleMenuClick}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      <aside
        className={`fixed md:static inset-0 z-50 transform ${menuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-white dark:bg-(--background) border-r flex flex-col`}
      >
        <div className="p-6 border-b flex justify-between items-center hidden md:flex">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-(--greenish-color) rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
              <span className="text-white font-black text-xl">LG</span>
            </div>
            <div>
              <h2 className="font-black text-xl text-(--foreground) tracking-tight">
                Agri-Noria
              </h2>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logistics Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-(--greenish-color) text-white shadow-md shadow-green-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <div
                  className={`${isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-(--greenish-color)"
                    } transition-colors`}
                >
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl"
            onClick={handleSignout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 w-full overflow-hidden flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}
