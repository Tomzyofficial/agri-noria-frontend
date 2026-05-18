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
   Satellite,
   ShieldCheck,
   FileSearch,
   LineChart,
   Settings,
   Globe,
   Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";

export default function IntelligenceLayout({ children }) {
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
         const res = await signoutBridge();
         if (!res) {
            toast.error("Signout failed. Try again.");
            return;
         }
         router.push("/");
         router.refresh();
      } catch (error) {
         toast.error("Signout failed");
      }
   };

   // Auto-verify session
   useEffect(() => {
      const checkExistingUser = async () => {
         try {
            const response = await fetch("/api/proxy/auth/existing-user", { method: "GET" });
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
         href: "/dashboard/intelligence-&-monitoring",
         icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
         label: "Surveillance",
         href: "/dashboard/intelligence-&-monitoring/surveillance",
         icon: <Satellite className="w-4 h-4" />,
      },
      {
         label: "Field Audits",
         href: "/dashboard/intelligence-&-monitoring/field-audits",
         icon: <FileSearch className="w-4 h-4" />,
      },
      {
         label: "Risk Reports",
         href: "/dashboard/intelligence-&-monitoring/risk-reports",
         icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
         label: "Data Explorer",
         href: "/dashboard/intelligence-&-monitoring/data-explorer",
         icon: <LineChart className="w-4 h-4" />,
      },
      { label: "My Wallet", href: "/dashboard/intelligence-&-monitoring/wallet", icon: <Wallet className="w-4 h-4" /> },
      {
         label: "Settings",
         href: "/dashboard/intelligence-&-monitoring/settings",
         icon: <Settings className="w-4 h-4" />,
      },
   ];

   const navLinksStyle = (path) => {
      return path === pathname
         ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 p-2 rounded shadow-sm border-l-4 border-purple-600"
         : "hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-all duration-200 ml-1";
   };

   return (
      <div className="flex min-h-screen bg-(--background)">
         {/* Sidebar */}
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
                  <h2 className="text-xl font-black text-purple-600 tracking-tighter uppercase">AgriNoria</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                     Intelligence Center
                  </p>
               </div>

               <nav className="flex flex-col space-y-2 flex-grow">
                  {sidebarNavMenu.map((item) => (
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

         {/* Main content */}
         <main className="lg:ml-64 w-full lg:p-8 p-4 bg-gray-50 dark:bg-(--background)">{children}</main>
      </div>
   );
}
