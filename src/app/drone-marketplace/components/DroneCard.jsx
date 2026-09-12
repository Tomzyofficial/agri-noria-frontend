"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/utils/formatPrice";
import { MapPin, Package, RadioTower } from "lucide-react";
import { formatLabel } from "@/utils/otherUtils";
import { trackAdClick, useViewableAdImpression } from "@/components/dashboard/ads/adTracking";

export function DroneCard({ listing, campaignId = listing?.campaign_id, sponsored = Boolean(listing?.campaign_id), impressionRootRef, featured = false }) {
   const cardRef = useRef(null);
   useViewableAdImpression(cardRef, campaignId, impressionRootRef);

   if (!listing) return null;

   const { id, listing_name, manufacturer, model, listing_type, location, available_quantity, unit, price, rental_price, rental_period, condition, image, country_code, currency } = listing;

   const mainImage = image && image.length > 0 ? image[0] : null;
   const isSale = listing_type === "sale" || listing_type === "both";
   const isRent = listing_type === "rent" || listing_type === "both";

   const handleClick = () => {
      if (!campaignId) return;
      trackAdClick(campaignId).catch((err) => console.error("Failed to track click:", err));
   };

   return (
      <Link ref={cardRef} href={`/drone-marketplace/${id}`} onClick={handleClick}>
         <Card className={`overflow-hidden cursor-pointer h-full text-left transition ${featured ? "hover:shadow-xl" : "hover:shadow-lg"} ${sponsored ? "ring-1 ring-emerald-500/25" : ""}`}>
            <CardContent className="p-0">
               <div className={`relative bg-gray-100 dark:bg-gray-800 ${featured ? "h-72" : "h-48"}`}>
                  {mainImage ? (
                     <Image src={mainImage} alt={listing_name} fill className="object-cover" />
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="h-12 w-12" />
                     </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                     {sponsored ? (
                        <Badge className="inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                           <RadioTower className="h-3 w-3" />
                           Sponsored
                        </Badge>
                     ) : null}
                     <Badge className="bg-green-600 text-white px-2 py-1 rounded-md">{listing_type === "both" ? "Sale & Rent" : formatLabel(listing_type)}</Badge>
                  </div>
               </div>

               <div className="p-4 space-y-3">
                  <div>
                     <h3 className={`${featured ? "text-xl" : "text-lg"} font-semibold text-(--foreground) line-clamp-1`}>{formatLabel(listing_name)}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatLabel(manufacturer)} {formatLabel(model)}
                     </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <MapPin className="h-4 w-4" />
                     <span className="truncate">{location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <Package className="h-4 w-4" />
                     <span>
                        {available_quantity} {unit} available
                     </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                     {isSale && (
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600 dark:text-gray-400">Sale Price:</span>
                           <span className="font-semibold text-(--foreground)">
                              {formatPrice(price, country_code, currency)}
                              {condition && <span className="text-xs text-gray-500 ml-1">({condition})</span>}
                           </span>
                        </div>
                     )}
                     {isRent && (
                        <div className={`flex items-center justify-between ${isSale ? "mt-1" : ""}`}>
                           <span className="text-sm text-gray-600 dark:text-gray-400">Rental Price:</span>
                           <span className="font-semibold text-(--foreground)">
                              {formatPrice(rental_price, country_code, currency)}/{rental_period?.replace("per_", "")}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>
      </Link>
   );
}
