"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
/*********** Lucid icon***********/
import {
  LogOut,
  X,
  Menu,
  LayoutDashboard,
  Heart,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { buyerSignoutBridge } from "@/actions/authActions";

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = () => {
    setMenuOpen((open) => !open);
  };

  // Close menu on route change (using pathname as dependency)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Signout
  const handleSignout = async () => {
    try {
      const res = await buyerSignoutBridge();

      if (!res) {
        throw new Error("Signout failed");
      }
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Signout failed. Please try again.");
    }
  };

  const navMenu = [
    {
      label: "Overview",
      href: "/dashboard/buyer",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Orders",
      href: "/dashboard/buyer/orders",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      label: "Settings",
      href: "/dashboard/buyer/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const navLinksStyle = (path) => {
    return path === pathname
      ? "bg-gray-200 dark:bg-(--card-dark) p-2 rounded"
      : "hover:bg-gray-200 dark:hover:bg-(--card-dark) dark:focus:bg-(--card-dark) p-2 focus:bg-gray-200 rounded transition delay-50 duration-150 ease-in-out";
  };

  return (
    <div className="flex min-h-screen bg-(--background)">
      {/* Sidebar */}
      <aside>
        {/* Sidebar menu toggler */}
        <div
          aria-label="Open menu"
          onClick={handleMenuClick}
          className="lg:hidden fixed bg-black dark:bg-white right-4 top-4 cursor-pointer shadow-md p-2 rounded"
        >
          {menuOpen ? (
            <X className="text-white dark:text-black" />
          ) : (
            <Menu className="text-white dark:text-black" />
          )}
        </div>

        <div
          className={`${
            menuOpen && "left-0 w-64 h-full bg-[#fafafa] shadow shadow-md"
          } transition-all duration-300 fixed z-1 -left-64 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-(--card-dark) dark:text-(--foreground) lg:bg-[#fafafa] lg:shadow lg:shadow-md p-2`}
        >
          <nav
            className={`
                  ${menuOpen ? "flex flex-col" : "hidden"} lg:flex lg:flex-col space-y-2
               `}
          >
            {navMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 ${navLinksStyle(item.href)}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <Button
              onClick={handleSignout}
              type="submit"
              className="absolute cursor-pointer flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors w-[calc(100%-2rem)] justify-start gap-2 bg-transparent bottom-6"
            >
              <span>
                <LogOut className="w-4 mr-1" />
              </span>
              Sign out
            </Button>
          </nav>
        </div>
      </aside>
      <main className="lg:ml-64 w-full lg:p-8 p-4">{children}</main>
    </div>
  );
}
