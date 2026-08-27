"use client";
import { useState } from "react";
import Image from "next/image";

export function ImageGalleryDisplay({ image, listingName }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const gallery = image;
   const active = gallery[activeIndex];
   return (
      <div>
         <div className="w-full">
            <Image src={active} alt={`${listingName} Image`} width={400} height={400} className="aspect-square object-cover w-full h-[300px] rounded-md" />
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
