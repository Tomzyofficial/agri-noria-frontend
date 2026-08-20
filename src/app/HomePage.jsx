"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { Package } from "lucide-react";
import { sidebarMenu } from "@/utils/homeSideMenu";
import { ErrorUi } from "@/components/ui/Error";
import { formatPrice } from "../utils/formatPrice";
import { EcosystemPopup } from "@/components/ui/EcosystemPopup";
import { BannerProductCard } from "./(dashboard)/dashboard/components/ads/BannerProductCard";
import { SponsoredProductsRow } from "./(dashboard)/dashboard/components/ads/SponsoredProductRow";

export function HomePage({ marketPlace, error, campaigns, campaignError }) {
   const [searchTerm, setSearchTerm] = useState("");
   const menu = sidebarMenu;

   const filteredProducts = marketPlace.filter((listing) => {
      const term = searchTerm.toLowerCase();
      return listing.listing_name?.toLowerCase().includes(term) || listing.price?.toString().includes(searchTerm) || listing.description?.toLowerCase().includes(term);
   });

   // Split campaigns: banner ads sit above the fold, sponsored_product ads
   // sit in a row above the organic grid. Anything unmatched falls back into "sponsored".
   const { bannerCampaigns, sponsoredProductCampaigns } = useMemo(() => {
      const banners = [];
      const sponsoredProducts = [];
      (campaigns || []).forEach((c) => {
         if (c.placement === "Banner") banners.push(c);
         else sponsoredProducts.push(c);
      });
      return { bannerCampaigns: banners, sponsoredProductCampaigns: sponsoredProducts };
   }, [campaigns]);

   return (
      <div>
         {/* Sidebar + Search — side by side */}
         <section className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start px-2 md:px-6 pt-4">
            <aside className="w-full lg:w-64 shrink-0">
               <ul className="grid grid-cols-4 sm:grid-cols-5 lg:flex lg:flex-col gap-0.5">
                  {menu.map((item, index) => (
                     <li key={item.href} className={`relative group bg-transparent lg:bg-(--white-fff) lg:dark:bg-(--card-dark) lg:shadow-lg lg:p-1 lg:rounded lg:w-full ${index === 0 ? "lg:mb-4 lg:border-b-2 lg:border-blue-500/20 pb-2" : ""}`}>
                        <Link href={item.href} className={`menu-parent-link text-sm flex justify-center lg:justify-between items-center lg:py-1 lg:px-2 lg:transition lg:hover:bg-slate-200 lg:hover:text-orange-400 lg:hover:rounded ${index === 0 ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 font-bold" : ""}`}>
                           <span className="flex items-center gap-2 lg:flex-row flex-col text-center lg:text-left">
                              <span className={`lg:bg-transparent lg:p-0 p-4 rounded-xl ${index === 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-200"}`}>{item.icon}</span>
                              <span>{item.title}</span>
                           </span>
                           {index === 0 && <span className="hidden lg:block text-[8px] bg-blue-600 text-white px-1 rounded ml-2 uppercase tracking-tighter">Enter</span>}
                        </Link>
                     </li>
                  ))}
               </ul>
            </aside>

            <div className="flex-1 w-full space-y-4">
               <div className="relative flex items-center">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="I am looking for..." className="bg-white dark:bg-(--card-dark) rounded-md pl-10 py-3 focus:outline-none shadow-md w-full" type="text" />
               </div>
               {/* Banner ads — top placement, full width */}
               {bannerCampaigns.length > 0 && <BannerProductCard listing={bannerCampaigns} campaignError="" />}
            </div>
         </section>

         <div className="px-2 md:px-6 my-5 text-(--foreground) flex flex-col gap-8">
            <main className="flex-1 flex flex-col gap-8">
               {/* Sponsored product ads — sit above the organic grid */}
               {sponsoredProductCampaigns.length > 0 && <SponsoredProductsRow listing={sponsoredProductCampaigns} />}

               {/* Organic listings */}
               <section className="bg-white dark:bg-(--card-dark) h-fit p-2">
                  <h2 className="text-lg md:text-xl font-semibold mb-4">Verified listings</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                     {error ? (
                        <ErrorUi />
                     ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center col-span-full py-12">
                           <Package className="h-12 w-12 text-(--foreground) mb-4" />
                           <h3 className="text-lg font-semibold mb-2 text-center">No listings found</h3>
                        </div>
                     ) : (
                        filteredProducts.map((prod) => (
                           <Link href={`/products/${prod.id}`} key={prod.id}>
                              <div className="rounded-md hover:shadow-lg h-70 transition bg-white dark:bg-(--card-dark)">
                                 <Image priority src={prod.image[0]} alt={`${prod.listing_name} Image`} width={200} height={200} className="object-cover shrink-0 h-40 w-full rounded-t-lg" />
                                 <div className="p-2 space-y-2">
                                    <p className="text-green-700 font-bold">{formatPrice(prod.price || prod.rental_price, prod.country_code, prod.currency)}</p>
                                    <p className="font-semibold">{prod.listing_name ? prod.listing_name.charAt(0).toUpperCase() + prod.listing_name.slice(1) : ""}</p>
                                    <p className="line-clamp-2 text-pretty text-gray-500 dark:text-gray-300 leading-4">{prod.description}</p>
                                 </div>
                              </div>
                           </Link>
                        ))
                     )}
                  </div>
               </section>
            </main>
         </div>
         <EcosystemPopup />
      </div>
   );
}
