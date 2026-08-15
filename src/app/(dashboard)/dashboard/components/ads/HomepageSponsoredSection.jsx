"use client";

import { useEffect, useState } from "react";
import { fetchActiveAdsPublic } from "@/not-in-useyet-lib/adsApi";
import { SponsoredProductCard } from "./SponsoredProductCard";
import { FeaturedVendorCard } from "./FeaturedVendorCard";
import { PromotedTrainingCard } from "./PromotedTrainingCard";

export function HomepageSponsoredSection({ campaigns, campaignError }) {
   if (campaignError) {
      return <section className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">{campaignError}</section>;
   }

   if (!campaigns.length) {
      return null;
   }

   return (
      <section className="space-y-4">
         <div className="flex items-end justify-between gap-4">
            <div>
               <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Featured on Agri-Connect</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Sponsored picks tailored to your region.</p>
            </div>
         </div>
         <div className="flex gap-2 w-full">
            {campaigns.map((campaign) => {
               const cid = campaign?.campaign_id;
               return <SponsoredProductCard key={cid} listing={campaign} campaignId={cid} href={`/products/${campaign.id}`} />;
               //  if (campaign.targetType === "PRODUCT" && creative) {
               //    return (
               //      <SponsoredProductCard
               //        key={cid}
               //        listing={creative}
               //        campaignId={cid}
               //        currency={creative.currency ? `${creative.currency} ` : ""}
               //        href={`/products/${creative.id}`}
               //      />
               //    );
               //  }
               //  if (campaign.targetType === "VENDOR" && creative) {
               //    return (
               //      <FeaturedVendorCard
               //        key={cid}
               //        vendor={creative}
               //        campaignId={cid}
               //        href={`/products`}
               //      />
               //    );
               //  }
               //  if (campaign.targetType === "TRAINING" && creative) {
               //    return (
               //      <PromotedTrainingCard
               //        key={cid}
               //        training={creative}
               //        campaignId={cid}
               //        href={`/dashboard/training/live/${creative.id}`}
               //      />
               //    );
               //  }
               //  return null;
            })}
         </div>
      </section>
   );
}
