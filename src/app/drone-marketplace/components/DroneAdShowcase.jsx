"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DroneCard } from "./DroneCard";

const ROTATION_INTERVAL_MS = 6000;

export function DroneAdShowcase({ campaigns = [] }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const sponsoredRef = useRef(null);

   const { bannerCampaigns, sponsoredCampaigns } = useMemo(() => {
      return campaigns.reduce(
         (acc, campaign) => {
            if (campaign.placement === "Banner") acc.bannerCampaigns.push(campaign);
            else acc.sponsoredCampaigns.push(campaign);
            return acc;
         },
         { bannerCampaigns: [], sponsoredCampaigns: [] },
      );
   }, [campaigns]);

   useEffect(() => {
      setActiveIndex(0);
   }, [bannerCampaigns.length]);

   useEffect(() => {
      if (bannerCampaigns.length <= 1) return undefined;
      const timer = window.setInterval(() => {
         setActiveIndex((prev) => (prev + 1) % bannerCampaigns.length);
      }, ROTATION_INTERVAL_MS);
      return () => window.clearInterval(timer);
   }, [bannerCampaigns.length]);

   const activeBanner = bannerCampaigns[activeIndex];

   const scrollSponsored = (direction) => {
      const el = sponsoredRef.current;
      if (!el) return;
      const cardWidth = el.querySelector("a")?.offsetWidth || 280;
      el.scrollBy({ left: direction * (cardWidth + 16) * 2, behavior: "smooth" });
   };

   if (!activeBanner && sponsoredCampaigns.length === 0) return null;

   return (
      <section className="space-y-5">
         {activeBanner ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-stretch">
               <div className="flex min-h-72 flex-col justify-between rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-sm dark:border-slate-800">
                  <div>
                     <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Featured placement</p>
                     <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">{activeBanner.listing_name}</h1>
                     <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{activeBanner.description}</p>
                  </div>
                  {bannerCampaigns.length > 1 ? (
                     <div className="mt-6 flex items-center gap-2">
                        {bannerCampaigns.map((campaign, index) => (
                           <button key={campaign.campaign_id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show featured drone ${index + 1}`} className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-8 bg-emerald-400" : "w-2 bg-white/35"}`} />
                        ))}
                     </div>
                  ) : null}
               </div>
               <DroneCard listing={activeBanner} campaignId={activeBanner.campaign_id} sponsored featured />
            </div>
         ) : null}

         {sponsoredCampaigns.length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
               <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                     <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Sponsored drones</p>
                     <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Promoted equipment</h2>
                  </div>
                  <div className="hidden gap-2 md:flex">
                     <button type="button" onClick={() => scrollSponsored(-1)} aria-label="Scroll sponsored drones left" className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                        <ChevronLeft className="h-4 w-4" />
                     </button>
                     <button type="button" onClick={() => scrollSponsored(1)} aria-label="Scroll sponsored drones right" className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                        <ChevronRight className="h-4 w-4" />
                     </button>
                  </div>
               </div>
               <div ref={sponsoredRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth">
                  {sponsoredCampaigns.map((campaign) => (
                     <div key={campaign.campaign_id} className="w-72 shrink-0 snap-start">
                        <DroneCard listing={campaign} campaignId={campaign.campaign_id} sponsored impressionRootRef={sponsoredRef} />
                     </div>
                  ))}
               </div>
            </div>
         ) : null}
      </section>
   );
}
