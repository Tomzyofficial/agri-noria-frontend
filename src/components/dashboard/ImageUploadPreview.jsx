"use client";
import Image from "next/image";

export default function ImageUploadPreview({ handleChange, preview, loading, inputProps = {} }) {
   return (
      <div className="w-full text-left">
         <label htmlFor={inputProps.id || "image"} className={`cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-black dark:hover:bg-black/40 border px-4 py-2 rounded-md ${loading && "opacity-50"}`}>
            Upload Image
         </label>
         <input {...inputProps} type="file" name={inputProps.name || "image"} className="hidden" id={inputProps.id || "image"} onChange={handleChange} multiple accept="image/*" disabled={loading} />
         <div className="my-4 flex w-full justify-start gap-4 flex-wrap rounded-md">{preview?.length > 0 && preview?.map((src, idx) => <Image key={idx} src={src} width={100} height={100} alt={`preview-${idx}`} />)}</div>
      </div>
   );
}
