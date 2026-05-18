"use client";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Upload } from "lucide-react";

export default function ImageUploadPreview({
   text,
   preview,
   previewText = "No Image",
   loading,
   name,
   id,
   handleChange,
   width = 40,
   height = 40,
}) {
   return (
      <section>
         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            {text}
         </h2>

         <div className="flex items-center gap-6">
            {preview ? (
               <Image
                  src={preview}
                  alt="Image Preview"
                  width={150}
                  height={150}
                  className={`w-${width} h-${height} rounded-lg object-cover ${loading && "opacity-50"}`}
               />
            ) : (
               <div
                  className={`w-${width} h-${height} flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400`}
               >
                  {previewText}
               </div>
            )}

            <div>
               <Label
                  htmlFor={id}
                  className={`cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-black dark:hover:bg-black/40 border px-4 py-2 rounded-md ${
                     loading && "opacity-50"
                  }`}
               >
                  Upload Image
               </Label>

               <Input
                  type="file"
                  id={id}
                  name={name}
                  className={`hidden ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                  accept="image/*"
                  onChange={handleChange}
                  disabled={loading}
               />
            </div>
         </div>
      </section>
   );
}
