"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SponsoredProductCard } from "./SponsoredProductCard";

export function SponsoredProductsRow({ listing = [] }) {
   const scrollRef = useRef(null);
   const [canScrollLeft, setCanScrollLeft] = useState(false);
   const [canScrollRight, setCanScrollRight] = useState(false);

   const updateScrollState = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
   }, []);

   useEffect(() => {
      updateScrollState();
      const el = scrollRef.current;
      if (!el) return;
      el.addEventListener("scroll", updateScrollState, { passive: true });
      window.addEventListener("resize", updateScrollState);
      return () => {
         el.removeEventListener("scroll", updateScrollState);
         window.removeEventListener("resize", updateScrollState);
      };
   }, [updateScrollState, listing.length]);

   const scrollByCards = (direction) => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector("a")?.offsetWidth || 200;
      el.scrollBy({ left: direction * (cardWidth + 12) * 2, behavior: "smooth" });
   };

   if (listing.length === 0) return null;

   return (
      <section className="bg-white dark:bg-(--card-dark) p-3 rounded-lg">
         <h2 className="text-sm font-mono uppercase tracking-wide text-(--ink)/50 mb-3">Sponsored products</h2>

         <div className="relative group">
            {canScrollLeft && <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white dark:from-(--card-dark) to-transparent z-10" />}
            {canScrollRight && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white dark:from-(--card-dark) to-transparent z-10" />}

            {canScrollLeft && (
               <button type="button" onClick={() => scrollByCards(-1)} aria-label="Scroll left" className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition dark:bg-slate-800 dark:border-slate-600">
                  <ChevronLeft className="h-4 w-4" />
               </button>
            )}
            {canScrollRight && (
               <button type="button" onClick={() => scrollByCards(1)} aria-label="Scroll right" className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition dark:bg-slate-800 dark:border-slate-600">
                  <ChevronRight className="h-4 w-4" />
               </button>
            )}

            <div ref={scrollRef} className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory">
               {listing.map((product) => (
                  <SponsoredProductCard key={product.campaign_id} product={product} containerRef={scrollRef} />
               ))}
            </div>
         </div>
      </section>
   );
}
