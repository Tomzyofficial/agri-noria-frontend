"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { LuPackage2 } from "react-icons/lu";
import { RiUserFollowLine } from "react-icons/ri";
import Image from "next/image";

export default function NavbarClient({ user }) {
   const [openMenu, setOpenMenu] = useState(false);

   // Sticky header effect
   useEffect(() => {
      const handleScroll = () => {
         const header = document.querySelector("header");
         if (!header) return;

         const isSticky = window.scrollY > 10;
         header.classList.toggle("sticky", isSticky);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const handleOpenMenu = () => setOpenMenu(!openMenu);

   return (
      <header className="bg-(--greenish-color) border-b border-(--dark-green-color) px-4 py-3">
         <div className="flex items-center justify-between text-(--foreground)">
            <Link href="/" className="flex items-center gap-2">
               <div className="w-15 h-15">
                  <Image src="/favicon.ico" alt="Logo image GreenOria Holdings" width={200} height={200} />
               </div>
            </Link>
            <div className="flex items-center md:gap-4 gap-6">
               <Link
                  href="/auth/signin"
                  className="bg-(--dark-green-color) py-1.5 px-4 rounded text-(--white-fff) hover:scale-105 transition"
               >
                  Sign in
               </Link>

               {/*  <div className="relative text-white">
                  <Button
                     aria-label="User Account"
                     className="flex gap-1 items-center hover:text-(--white-fff)"
                     onClick={handleOpenMenu}
                  >
                     <User className="h-4 w-4 md:hidden" />

                     <span className="hidden cursor-pointer md:flex md:items-center md:gap-1 font-medium">
                        {user?.authenticated && user?.buyerId ? (
                           <span className="flex items-center gap-1">
                              <RiUserFollowLine />
                              Hi, {user.name?.split(" ")[0] || "User"}
                           </span>
                        ) : (
                           <span className="flex items-center gap-1">
                              <User className="h-4 w-4" /> Account
                           </span>
                        )}
                        <span>
                           {openMenu ? <FaChevronUp className="w-2 h-2" /> : <FaChevronDown className="w-2 h-2" />}
                        </span>
                     </span>
                  </Button>

                  {openMenu && (
                     <span className="w-full min-w-max absolute z-1 bg-(--background) mt-5 shadow-md leading-7 text-sm rounded">
                        <ul className="p-1 [&_li]:text-(--foreground) [&_li]:py-1 [&_li]:px-2 [&_li]:hover:bg-slate-200 [&_li]:hover:text-black [&_li]:hover:rounded dark:[&_li]:hover:bg-(--card-dark)">
                           {!user?.authenticated && (
                              <li className="bg-[var(--greenish-color)] flex justify-center rounded group">
                                 <Link
                                    href="/auth/identification/signin"
                                    className="text-[var(--gray-color)] group-hover:text-black "
                                 >
                                    Sign In
                                 </Link>
                              </li>
                           )}

                           <li>
                              <Link href="/buyer" className="flex items-center gap-2">
                                 <User className="h-3 w-3" /> My Account
                              </Link>
                           </li>

                           <li>
                              <Link href="" className="flex items-center gap-2">
                                 <LuPackage2 className="rotate-180 h-3 w-3" /> Orders
                              </Link>
                           </li>
                        </ul>

                        {user?.authenticated && (
                           <span className="flex justify-center w-full py-4">
                              <Button
                                 className="text-red-400 dark:text-red-300 cursor-pointer hover:bg-red-300 hover:text-red-700 px-4 rounded"
                                 onClick={handleSignout}
                              >
                                 Sign out
                              </Button>
                           </span>
                        )}
                     </span>
                  )}
               </div> */}
            </div>
         </div>
      </header>
   );
}
