"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, X, Menu, LayoutDashboard, UserCog, Settings, ShieldCheck, Globe, Wallet, Users, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { signoutBridge } from "@/actions/authActions";

export default function SuperAdminLayout({ children }) {
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
      { label: "Overview", href: "/dashboard/super-admin", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Platform Wallet", href: "/dashboard/super-admin/wallet", icon: <Wallet className="w-4 h-4" /> },
      { label: "Ecosystem Buyers", href: "/dashboard/super-admin/ecosystem-buyers", icon: <Users className="w-4 h-4" /> },
      { label: "User Management", href: "/dashboard/super-admin/users", icon: <UserCog className="w-4 h-4" /> },
      { label: "System Analytics", href: "/dashboard/super-admin/analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "Audit Logs", href: "/dashboard/super-admin/logs", icon: <ShieldCheck className="w-4 h-4" /> },
      { label: "Settings", href: "/dashboard/super-admin/settings", icon: <Settings className="w-4 h-4" /> },
   ];

   const navLinksStyle = (path) => {
      return path === pathname
         ? "bg-gray-200 dark:bg-(--card-dark) p-2 rounded"
         : "hover:bg-gray-200 dark:hover:bg-(--card-dark) dark:focus:bg-(--card-dark) p-2 focus:bg-gray-200 rounded transition delay-50 duration-150 ease-in-out";
   };

   return (
      <div className="flex min-h-screen bg-(--background)">
         <aside>
            <div aria-label="Open menu" onClick={handleMenuClick} className="lg:hidden fixed z-50 bg-black dark:bg-white right-4 top-4 cursor-pointer shadow-md p-2 rounded">
               {menuOpen ? <X className="text-white dark:text-black" /> : <Menu className="text-white dark:text-black" />}
            </div>
            <div className={`${menuOpen && "left-0 w-64 h-full bg-[#fafafa] shadow shadow-md"} transition-all duration-300 fixed z-1 -left-64 top-0 lg:left-0 lg:w-64 lg:h-screen dark:bg-(--card-dark) dark:text-(--foreground) lg:bg-[#fafafa] lg:shadow lg:shadow-md p-2`}>
               <nav className={`${menuOpen ? "flex flex-col" : "hidden"} lg:flex lg:flex-col space-y-2`}>
                  <div className="p-4 mb-2">
                     <p className="font-bold text-lg text-red-500">Super Admin</p>
                  </div>
                  {navMenu.map((item) => (
                     <Link key={item.label} href={item.href} className={`flex items-center gap-2 ${navLinksStyle(item.href)}`}>
                        {item.icon} {item.label}
                     </Link>
                  ))}
                  
                  <Button onClick={handleSignout} type="submit" className="absolute bottom-4 cursor-pointer flex items-center text-red-400">
                     <span><LogOut className="w-4 mr-1" /></span> Logout
                  </Button>
               </nav>
            </div>
         </aside>
         <main className="lg:ml-64 w-full lg:p-8 p-4">{children}</main>
      </div>
   );
}
