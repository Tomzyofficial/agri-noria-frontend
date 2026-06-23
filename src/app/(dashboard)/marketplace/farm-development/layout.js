"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X, Menu, CreditCard, UserPen, ShoppingCart, BarChart3, LayoutDashboard, Settings } from "lucide-react";
import { toast } from "react-toastify";
import { IoBriefcaseOutline } from "react-icons/io5";
import { VerifyNotiBanner } from "@/app/(dashboard)/dashboard/components/VerifyNotiBanner";
import { signoutBridge } from "@/actions/authActions";

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [verified, setVerified] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick = () => {
    setMenuOpen((open) => !open);
  };

  // Close menu on route change (using pathname as dependency)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // When user in payload doesn't exist in, db bounce em back
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const response = await fetch("/api/proxy/auth/existing-user", {
          method: "GET",
        });
        if (response.status !== 500 && response.status !== 200) {
          const data = await response.json();
          if (data?.existing === false) {
            await handleSignout();
          }
        }
      } catch {
        return;
      }
    };
    checkExistingUser();

    const interval = setInterval(() => {
      checkExistingUser();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  // Check if vendor is verified
  useEffect(() => {
    const checkVendorVerification = async () => {
      const res = await fetch("/api/proxy/vendor/verification", {
        method: "GET",
      });

      const result = await res.json();
      if (!res.ok) {
        return;
      }

      const isVerified = result.data;

      setVerified(isVerified);
    };
    checkVendorVerification();

    // Restore short-lived dismissal for this session
    const dismissedFlag = typeof window !== "undefined" && sessionStorage.getItem("dismiss_verify_banner");
    if (dismissedFlag) setDismissed(true);
  }, [verified, dismissed]);

  // Signout
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
      label: "Overview",
      href: "/marketplace/farm-development",
      icon: LayoutDashboard,
    },
    {
      label: "Listings",
      href: "/marketplace/farm-development/listings",
      icon: ShoppingCart,
    },
    {
      label: "Portfolio",
      href: "/marketplace/farm-development/portfolio",
      icon: IoBriefcaseOutline,
    },
    {
      label: "Profile",
      href: "/marketplace/farm-development/profile",
      icon: UserPen,
    },
    {
      label: "Job Management",
      href: "/marketplace/farm-development/job-management",
      icon: IoBriefcaseOutline,
    },
    {
      label: "Billing",
      href: "/marketplace/farm-development/billing",
      icon: CreditCard,
    },
  ];

  const navLinksStyle = (path) => {
    return path === pathname ? "bg-gray-200 dark:bg-(--card-dark) p-2 rounded" : "hover:bg-gray-200 dark:hover:bg-(--card-dark) dark:focus:bg-(--card-dark) p-2 focus:bg-gray-200 rounded transition delay-50 duration-150 ease-in-out";
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside>
        {/* Sidebar menu toggler */}
        <div aria-label="Open menu" onClick={handleMenuClick} className="lg:hidden fixed z-50 bg-black dark:bg-white right-4 top-4 cursor-pointer shadow-md p-2 rounded">
          {menuOpen ? <X className="text-white dark:text-black" /> : <Menu className="text-white dark:text-black" />}
        </div>

        <div className={`${menuOpen && "left-0 w-64 h-full bg-[#fafafa] shadow shadow-md"} transition-all duration-300 fixed z-1 -left-64 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-(--card-dark) dark:text-(--foreground) lg:bg-[#fafafa] lg:shadow lg:shadow-md p-2`}>
          <nav
            className={`
                  ${menuOpen ? "flex flex-col" : "hidden"} lg:flex lg:flex-col space-y-2
               `}
          >
            {navMenu.map((item) => (
              <Link key={item.label} href={item.href} className={`flex items-center gap-2 ${navLinksStyle(item.href)}`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ))}

            <Button onClick={handleSignout} type="submit" className="absolute cursor-pointer flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors w-[calc(100%-2rem)] justify-start gap-2 bg-transparent bottom-6">
              <span>
                <LogOut className="w-4 mr-1" />
              </span>
              Sign out
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 w-full lg:p-8 p-4">
        {children}
        {verified !== null && !verified && !dismissed && <VerifyNotiBanner setDismissed={setDismissed} />}
      </main>
    </div>
  );
}
