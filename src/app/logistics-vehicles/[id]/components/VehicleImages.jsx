"use client";

import { useState } from "react";
import Image from "next/image";

export function VehicleImages({ images, title }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Parse images if it's a string
  let imageArray = [];
  if (typeof images === "string") {
    try {
      imageArray = JSON.parse(images);
    } catch {
      imageArray = images ? [images] : [];
    }
  } else if (Array.isArray(images)) {
    imageArray = images;
  }

  const selectedImage = imageArray[selectedImageIndex];

  return (
    <div className="bg-background rounded-lg shadow-sm overflow-hidden">
      {/* Main Image Display */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={`${title} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {imageArray.length > 1 && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-5 gap-3">
            {imageArray.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-green-600 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
