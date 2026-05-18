"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { Package } from "lucide-react";
import { sidebarMenu } from "@/utils/homeSideMenu";
import { ErrorUi } from "@/components/ui/Error";
import { formatPrice } from "../utils/formatPrice";
import { EcosystemPopup } from "@/components/ui/EcosystemPopup";

export function HomePage({ marketPlace, error }) {
   const [activeParent, setActiveParent] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");

   // Side memu navigation
   const menu = sidebarMenu;

   const filteredProducts = marketPlace.filter((listing) => {
      const matchesSearch =
         listing.listing_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         listing.price?.toString().includes(searchTerm) ||
         listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
   });

   return (
      <div>
         {/* Hero Section */}
         <section>
            <div className="relative min-h-[250px] bg-(--greenish-color) rounded-bl-2xl rounded-br-2xl flex justify-center items-center">
               <div className="w-90 sm:w-100 md:w-1/2">
                  <p className="text-(--white-fff) dark:text-[#171717] font-medium text-md md:text-lg mb-5 ml-5">
                     What are you looking for?
                  </p>
                  <div className="relative flex items-center">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                     <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="I am looking for..."
                        className="bg-(--background) rounded-md pl-10 py-3 focus:outline-none shadow-md w-full"
                        type="text"
                     />
                     {/* <Button
                        type="submit"
                        className="bg-[var(--dark-green-color)] text-white rounded-r-lg py-3 px-6 cursor-pointer"
                     >
                        Search
                     </Button> */}
                  </div>
               </div>
            </div>
         </section>

         <div className="px-2 md:px-6 my-5 text-(--foreground) flex flex-col lg:flex-row gap-8">
            {/* <div className="overscroll-contain">A</div> */}
            <aside className="relative lg:sticky lg:top-20">
               {/* SIDE MENU */}
               <ul
                  className={`${
                     activeParent ? "hidden lg:block" : "grid grid-cols-4 sm:grid-cols-5 lg:block"
                  } space-y-0.5`}
               >
                  {menu.map((item, index) => (
                     <li
                        key={item.href}
                        className={`relative group bg-transparent lg:bg-(--white-fff) lg:dark:bg-(--card-dark) lg:shadow-lg lg:p-1 lg:rounded lg:w-full ${
                           index === 0 ? "lg:mb-4 lg:border-b-2 lg:border-blue-500/20 pb-2" : ""
                        }`}
                     >
                        <Link
                           href={index === 0 ? "/onboarding" : `/${item.href}`}
                           className={`menu-parent-link text-sm flex justify-center lg:justify-between items-center lg:py-1 lg:px-2 lg:transition lg:hover:bg-slate-200 lg:hover:text-orange-400 lg:hover:rounded ${
                              index === 0 ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 font-bold" : ""
                           }`}
                           onClick={(e) => {
                              if (window.innerWidth < 1024) {
                                 e.preventDefault();
                                 if (index === 0) {
                                    window.location.href = "/onboarding";
                                 } else {
                                    setActiveParent(item.href);
                                 }
                              }
                           }}
                        >
                           <span className="flex items-center gap-2 lg:flex-row flex-col text-center lg:text-left">
                              <span className={`lg:bg-transparent lg:p-0 p-4 rounded-xl ${index === 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-200"}`}>{item.icon}</span>
                              <span>{item.title}</span>
                           </span>
                           {index === 0 && <span className="hidden lg:block text-[8px] bg-blue-600 text-white px-1 rounded ml-2 uppercase tracking-tighter">Enter</span>}
                        </Link>

                        {/* CHILDREN ON DESKTOP */}
                        {/*   <ul className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-0 z-5 w-64 lg:bg-(--white-fff) lg:dark:bg-neutral-700 rounded shadow-lg transition-opacity duration-200 hidden lg:block">
                           {item.children.map((child) => (
                              <li key={child.id} className="lg:p-1">
                                 <Link
                                    href={`/${child.id}`}
                                    className="flex items-center gap-2 transition hover:bg-slate-200 lg:py-1 lg:px-2 lg:hover:bg-slate-200 lg:hover:text-orange-400 lg:hover:rounded text-sm"
                                 >
                                    {child.icon}
                                    <span>{child.title}</span>
                                 </Link>
                              </li>
                           ))}
                        </ul> */}
                     </li>
                  ))}
               </ul>

               {/* MOBILE FULL-SCREEN CHILDREN MENU */}
               {/*  {activeParent && (
                  <div className="fixed inset-0 bg-white dark:bg-(--background) z-50 p-4 overflow-y-auto transition-all duration-300">
                     <button
                        onClick={() => setActiveParent(null)}
                        className="cursor-pointer flex items-center gap-2 mb-4 text-sm font-medium text-gray-600 dark:text-(--foreground)"
                     >
                        <ArrowLeft className="h-4 w-4" /> Back
                     </button>

                     <h2 className="text-lg font-semibold mb-3">
                        {menu.find((item) => item.id === activeParent)?.title}
                     </h2>

                     <ul className="space-y-2">
                        {menu
                           .find((item) => item.id === activeParent)
                           ?.children.map((child) => (
                              <li key={child.id}>
                                 <Link
                                    href={`#${child.id}`}
                                    className="flex items-center gap-3 py-3 px-4 border rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-(--card-dark) transition"
                                    onClick={() => setActiveParent(null)}
                                 >
                                    {child.icon}
                                    <span>{child.title}</span>
                                 </Link>
                              </li>
                           ))}
                     </ul>
                  </div>
               )} */}
            </aside>

            {/* Marketplace Preview Right side */}
            <main className="flex-1 flex flex-col">
               <div>
                  <h2 className="text-xl font-semibold mb-4">Verified ads</h2>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {error ? (
                     <ErrorUi />
                  ) : filteredProducts.length === 0 ? (
                     <div className="flex flex-col items-center justify-center col-span-full py-12">
                        <Package className="h-12 w-12 text-(--foreground) mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-center">No ads found </h3>
                     </div>
                  ) : (
                     filteredProducts.length > 0 &&
                     filteredProducts.map((prod) => (
                        <Link href={`/products/${prod.id}`} key={prod.id}>
                           <div className="rounded-lg bg-(--gray-color) shadow hover:shadow-lg h-70 transition dark:bg-(--card-dark)">
                              <Image
                                 priority
                                 src={prod.product_image}
                                 alt={`${prod.listing_name} Image`}
                                 width={300}
                                 height={200}
                                 className="object-cover shrink-0 w-full h-40 rounded-t-lg"
                              />
                              <div className="p-2 space-y-2">
                                 <p className="text-green-700 font-bold">
                                    {formatPrice(prod.price, prod.country_code, prod.currency)}
                                 </p>
                                 <p className="font-semibold">
                                    {prod.listing_name
                                       ? prod.listing_name.charAt(0).toUpperCase() + prod.listing_name.slice(1)
                                       : ""}
                                 </p>
                                 <p className="line-clamp-2 text-pretty text-gray-500 dark:text-gray-300 leading-4">
                                    {prod.description}
                                 </p>
                              </div>
                           </div>
                        </Link>
                     ))
                  )}
               </div>
            </main>
         </div>
         <EcosystemPopup />
      </div>
   );
}
