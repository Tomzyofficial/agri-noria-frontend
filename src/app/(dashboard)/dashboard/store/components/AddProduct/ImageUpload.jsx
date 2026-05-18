"use client";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Upload } from "lucide-react";

export default function ImageUpload({ preview, loading, handleChange }) {
   return (
      <section>
         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Product Image
         </h2>

         <div className="flex items-center gap-6">
            {preview ? (
               <Image
                  src={preview}
                  alt="Image Preview"
                  width={200}
                  height={200}
                  className={`w-40 h-40 rounded-lg object-cover ${loading && "opacity-50"}`}
               />
            ) : (
               <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400">
                  No Image
               </div>
            )}

            <div>
               <Label
                  htmlFor="product_image"
                  className={`cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-black dark:hover:bg-black/40 border px-4 py-2 rounded-md ${
                     loading && "opacity-50"
                  }`}
               >
                  Upload Image
               </Label>

               <Input
                  type="file"
                  id="product_image"
                  name="product_image"
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
