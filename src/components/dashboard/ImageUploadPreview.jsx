"use client";
import Image from "next/image";

export default function ImageUploadPreview({
   handleChange,
   preview,
   loading,
   inputProps = {},
   text = "Upload Image",
   id,
   name,
}) {
   const inputId = inputProps.id || id || "image";
   const inputName = inputProps.name || name || "image";

   const previewList = Array.isArray(preview)
      ? preview
      : typeof preview === "string" && preview.trim().length > 0
      ? [preview]
      : [];

   return (
      <div className="w-full text-left">
         <label
            htmlFor={inputId}
            className={`inline-block cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-black dark:hover:bg-black/40 border px-4 py-2 rounded-md text-sm font-medium ${
               loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
         >
            {text}
         </label>
         <input
            {...inputProps}
            type="file"
            name={inputName}
            className="hidden"
            id={inputId}
            onChange={handleChange}
            accept="image/*"
            disabled={loading}
         />
         {previewList.length > 0 && (
            <div className="my-4 flex w-full justify-start gap-4 flex-wrap rounded-md">
               {previewList.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded border overflow-hidden">
                     <Image
                        src={src}
                        fill
                        className="object-cover"
                        alt={`preview-${idx}`}
                        unoptimized
                     />
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
