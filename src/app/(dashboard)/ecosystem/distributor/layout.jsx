"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, X, Menu, LayoutDashboard, Truck, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";

export default function DistributorLayout({ children }) {
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
        toast.error("Signout failed. Try again later.");
        return;
      }
      router.refresh();
      router.push("/");
    } catch {
      toast.error("Signout failed. Try again later.");
    }
  };

  const navMenu = [
    {
      label: "Deliveries",
      href: "/ecosytem/distributor",
      icon: <Truck className="w-4 h-4" />,
    },
  ];

  const navLinksStyle = (path) => {
    return path === pathname
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 p-2 rounded font-medium"
      : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-300 p-2 rounded transition delay-50 duration-150 ease-in-out";
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
          className={`${menuOpen ? "left-0" : "-left-64"} w-64 h-full bg-[#fafafa] shadow shadow-md transition-all duration-300 fixed z-1 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-(--card-dark) dark:text-(--foreground) lg:bg-[#fafafa] lg:shadow lg:shadow-md p-4`}
        >
          <div className="mb-8 mt-4 px-2">
            <h2 className="text-xl font-black text-blue-600 tracking-tighter uppercase">
              Agri-Noria
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                <Truck className="text-white w-5 h-5" />
              </div>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                Distributor
              </h2>
            </div>
          </div>
          <nav
            className={`${menuOpen ? "flex flex-col" : "hidden"} lg:flex lg:flex-col space-y-2`}
          >
            {navMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 ${navLinksStyle(item.href)}`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            <Button
              onClick={handleSignout}
              type="submit"
              className="absolute bottom-6 cursor-pointer flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors w-[calc(100%-2rem)] justify-start gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </nav>
        </div>
      </aside>
      <main className="lg:ml-64 w-full lg:p-8 p-4">{children}</main>
    </div>
  );
}
