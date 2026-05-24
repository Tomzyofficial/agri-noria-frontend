"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { User, Bell } from "lucide-react";
import { MdAddShoppingCart } from "react-icons/md";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { LuPackage2 } from "react-icons/lu";
import { RiUserFollowLine } from "react-icons/ri";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { buyerSignoutBridge, signoutBridge } from "@/actions/authActions";
import { motion } from "motion/react";

export default function NavBarClient({ user, initialCartCount }) {
  const [openMenu, setOpenMenu] = useState(false);
  const router = useRouter();

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

  const handleVendorSignout = async () => {
    try {
      const res = await signoutBridge();
      if (!res) {
        throw new Error("Signout failed");
      }
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Signout failed. Please try again.");
    }
  };

  return (
    <header className="bg-(--greenish-color) border-b border-(--dark-green-color) px-4 py-3">
      <div className="flex items-center justify-between text-(--foreground)">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-15 h-15">
            <Image
              src="/favicon.ico"
              alt="Logo image GreenOria Holdings"
              width={200}
              height={200}
            />
          </div>
        </Link>
        <div className="flex items-center md:gap-4 gap-6">
          <Link
            href="/auth/signin"
            className="bg-(--dark-green-color) py-1.5 px-4 rounded text-(--white-fff) hover:scale-105 transition"
          >
            Sign in
          </Link>

          <div className="relative text-white">
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
                  {openMenu ? (
                    <FaChevronUp className="w-2 h-2" />
                  ) : (
                    <FaChevronDown className="w-2 h-2" />
                  )}
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

                  {user?.authenticated && user?.isVendor && (
                    <li>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      >
                        <User className="h-3 w-3" /> Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      href={user?.isVendor ? "/dashboard" : "/dashboard/buyer"}
                      className="flex items-center gap-2"
                    >
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
                      onClick={
                        user?.isVendor ? handleVendorSignout : handleSignout
                      }
                    >
                      Sign out
                    </Button>
                  </span>
                )}
              </span>
            )}
          </div>

          <Link
            href="/news"
            className="flex items-center gap-1 text-(--white-fff)"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden md:block font-medium">News</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-1 font-medium text-(--white-fff)"
          >
            <MdAddShoppingCart className="h-4 w-4" />
            {initialCartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 md:-right-1 h-5 w-5 flex items-center justify-center 
                                 bg-orange-500 text-white text-xs font-bold rounded-full border-2 border-white"
                aria-label={`${initialCartCount} items in cart`}
              >
                {initialCartCount}
              </span>
            )}
            <span className="hidden md:block">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
