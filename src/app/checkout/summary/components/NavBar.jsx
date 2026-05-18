"use client";

import { Wheat } from "lucide-react";
import { MdPermPhoneMsg } from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FaArrowsRotate } from "react-icons/fa6";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function NavBar() {
   const [menuOpen, setMenuOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   const handleMenuClick = () => {
      setMenuOpen((open) => !open);
   };

   // Sticky header logic
   useEffect(() => {
      const handleScroll = () => {
         const header = document.querySelector("header");
         if (header) {
            const isSticky = window.scrollY > 100;
            header.classList.toggle("sticky", isSticky);
         }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   // Handle mobile/desktop detection + resize behavior
   useEffect(() => {
      const handleResize = () => {
         const mobile = window.innerWidth < 991;
         setIsMobile(mobile);

         // If resizing from mobile → desktop, close the menu
         if (!mobile) {
            setMenuOpen(false);
         }
      };

      handleResize(); // Run on mount
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
   }, []);

   return (
      <header className="flex items-center justify-between px-4 py-3 border border-stone-200 m-2 rounded-full bg-(--gray-color) text-(--foreground) dark:bg-(--card-dark) dark:border-(--card-dark)">
         <div>
            <Link href="/" className="flex items-center gap-2">
               <Wheat className="h-8 w-8 text-(--greenish-color)" />
               <h1 className="text-2xl font-bold text-foreground">AgriConnect</h1>
            </Link>
         </div>

         <div className="text-lg font-medium">Place your order</div>

         {/* MENU */}
         <div
            className={`space-y-4 lg:space-y-0
               fixed lg:relative transition-all duration-300
               ${menuOpen && isMobile ? "top-18 right-4 p-4 rounded bg-neutral-300 w-48 shadow-md" : "-right-[100%]"}
               lg:right-0 lg:flex lg:items-center gap-8
               [&>*]:hover:text-gray-600
            `}
         >
            <Link href="#" className="flex items-center gap-2 text-sm">
               <MdPermPhoneMsg className="h-5 w-5" />
               <div className="flex gap-2 lg:gap-0 lg:flex-col">
                  <div className="font-medium">Need Help?</div>
                  <div>Contact us</div>
               </div>
            </Link>

            <Link href="#" className="flex items-center gap-2 text-sm">
               <FaArrowsRotate className="w-5 h-5" />
               <div className="flex gap-2 lg:gap-0 lg:flex-col">
                  <div className="font-medium">Easy</div>
                  <div>Returns</div>
               </div>
            </Link>

            <Link href="#" className="flex items-center gap-2 text-sm">
               <RiSecurePaymentLine className="w-5 h-5" />
               <div className="flex gap-2 lg:gap-0 lg:flex-col">
                  <div className="font-medium">Secure</div>
                  <div>Payments</div>
               </div>
            </Link>
         </div>

         {/* MOBILE MENU ICON */}
         <div aria-label="Open menu" onClick={handleMenuClick} className="lg:hidden p-2 rounded shadow-md bg-black dark:bg-white cursor-pointer">
            {menuOpen ? <X className="text-white dark:text-black" /> : <Menu className="text-white dark:text-black" />}
         </div>
      </header>
   );
}
