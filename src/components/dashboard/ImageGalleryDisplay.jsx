"use client";
import { useState } from "react";
import Image from "next/image";

export function ImageGalleryDisplay({ image, listingName }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const gallery = image;
   const active = gallery[activeIndex];
   return (
      <>
         <div className="w-full">
            <Image src={active} alt={`${listingName} Image`} width={400} height={400} className="object-cover w-full h-[400px] rounded-t-md" />
         </div>

         {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`${listingName} photos`}>
               {gallery.map((img, index) => (
                  <div
                     key={index}
                     role="tab"
                     aria-selected={index === activeIndex}
                     onClick={() => setActiveIndex(index)}
                     className={`relative h-24 w-24 flex-shrink-0 overflow-hidden border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14171A] ${index === activeIndex ? "border-[#14171A]" : "border-[#E2E4E3] opacity-70 hover:opacity-100"}`}
                  >
                     <Image src={img} alt={listingName} fill sizes="80px" className="object-cover" />
                  </div>
               ))}
            </div>
         )}
      </>
   );
}
