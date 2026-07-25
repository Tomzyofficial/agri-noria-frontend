"use client";

import { useState } from "react";
import Image from "next/image";
import DroneStatusPlate from "./DroneStatusPlate";

export default function DroneImageGallery({ images, listingName, listingType, quantity }) {
   const gallery = images && images.length > 0 ? images : null;
   const [activeIndex, setActiveIndex] = useState(0);
   const active = gallery[activeIndex];

   return (
      <div className="flex flex-col gap-3">
         <div className="relative aspect-[4/3] overflow-hidden border border-[#E2E4E3] bg-white rounded-md">
            <DroneStatusPlate listingType={listingType} quantity={quantity} />
            <Image src={active} alt={listingName} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover rounded-md" priority />
         </div>

         {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`${listingName} photos`}>
               {gallery.map((img, index) => (
                  <button
                     key={index}
                     type="button"
                     role="tab"
                     aria-selected={index === activeIndex}
                     onClick={() => setActiveIndex(index)}
                     className={`relative h-16 w-16 flex-shrink-0 overflow-hidden border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A] ${index === activeIndex ? "border-[#14171A]" : "border-[#E2E4E3] opacity-70 hover:opacity-100"}`}
                  >
                     <Image src={img} alt={listingName} fill sizes="64px" className="object-cover" />
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}
