"use client";

import { useState } from "react";
import Image from "next/image";

export function VehicleImages({ image, title }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const gallery = image.length > 0 ? image : [image];

   const selectedImage = gallery[activeIndex];

   return (
      <div className="bg-background rounded-lg shadow-sm overflow-hidden">
         {/* Main Image Display */}
         <div className="relative bg-gray-100 aspect-4/3">
            <Image src={selectedImage} alt={`${title} image`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
         </div>

         {/* Thumbnail Gallery */}
         {gallery.length > 1 && (
            <div className="border-t border-gray-200 p-4">
               <div className="grid grid-cols-5 gap-3">
                  {gallery.map((image, index) => (
                     <button key={index} onClick={() => setActiveIndex(index)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeIndex === index ? "border-green-600 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
                        <Image src={image} alt={`${title} - Thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
