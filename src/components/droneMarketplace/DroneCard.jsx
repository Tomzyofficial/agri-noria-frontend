"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/utils/formatPrice";
import { MapPin, Package } from "lucide-react";
import { formatLabel } from "@/utils/otherUtils";

export function DroneCard({ listing }) {
   if (!listing) return null;

   const { id, listing_name, manufacturer, model, listing_type, location, quantity, unit, sale_price, rental_price, rental_period, condition, image, country_code, currency } = listing;

   const mainImage = image && image.length > 0 ? image[0] : null;
   const isSale = listing_type === "sale" || listing_type === "both";
   const isRent = listing_type === "rent" || listing_type === "both";

   return (
      <Link href={`/drone-marketplace/${id}`}>
         <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-0">
               <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  {mainImage ? (
                     <Image src={mainImage} alt={listing_name} fill className="object-cover" />
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        <Package className="h-12 w-12" />
                     </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                     <Badge className="bg-green-600 text-white px-2 py-1 rounded-md">{listing_type === "both" ? "Sale & Rent" : formatLabel(listing_type)}</Badge>
                  </div>
               </div>

               <div className="p-4 space-y-3">
                  <div>
                     <h3 className="font-semibold text-lg text-(--foreground) line-clamp-1">{listing_name}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {manufacturer} {model}
                     </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <MapPin className="h-4 w-4" />
                     <span className="truncate">{location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                     <Package className="h-4 w-4" />
                     <span>
                        {quantity} {unit} available
                     </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                     {isSale && (
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600 dark:text-gray-400">Sale Price:</span>
                           <span className="font-semibold text-(--foreground)">
                              {formatPrice(sale_price, country_code, currency)}
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
