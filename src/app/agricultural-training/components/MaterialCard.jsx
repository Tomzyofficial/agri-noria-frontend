"use client";

import { FILE_TYPE_META, LEVEL_META, formatFileSize } from "../lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
   IconVideo,
   IconDocument,
   IconImage,
   IconPlay,
   IconDownload,
   IconClock,
   IconPages,
   IconDimensions,
   IconBuilding,
} from "../components/Icons";
import { Download, Eye, Play } from "lucide-react";

// function TypeBadge({ fileType }) {
//    const meta = FILE_TYPE_META[fileType] || FILE_TYPE_META.pdf;
//    const icons = { video: IconVideo, pdf: IconDocument, image: IconImage };
//    const Icon = icons[fileType] || IconDocument;
//    return (
//       <span
//          style={{ color: meta.color, background: meta.bg }}
//          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
//       >
//          <Icon size={12} />
//          {meta.label}
//       </span>
//    );
// }

/* function LevelBadge({ level }) {
   const meta = LEVEL_META[level];
   if (!meta) return null;
   return (
      <span
         style={{ color: meta.color, background: meta.bg }}
         className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      >
         {level}
      </span>
   );
} */

/* ── Media preview area — varies by file_type ── */
function MediaPreview({ material }) {
   const { file_type, thumbnail, title } = material;

   if (file_type.includes("video")) {
      return (
         <div className="relative w-full overflow-hidden rounded-xl bg-slate-900" style={{ aspectRatio: "16/9" }}>
            {/*   {thumbnail ? (
               <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-80" />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900" />
            )} */}
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
               <video src={material.file_path} controls className="w-full h-full object-cover" />
               {/* <button
                  aria-label={`Play ${title}`}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
                  style={{
                     background: "rgba(255,255,255,0.18)",
                     backdropFilter: "blur(8px)",
                     border: "1.5px solid rgba(255,255,255,0.3)",
                  }}
               >
                  <IconPlay size={22} />
               </button> */}
            </div>
            {/* Duration chip */}
            {/*  {material.duration && (
               <span
                  className="absolute bottom-2.5 right-3 flex items-center gap-1 text-white text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
               >
                  <IconClock size={11} />
                  {material.duration}
               </span>
            )} */}
         </div>
      );
   }

   if (file_type.includes("image")) {
      return (
         <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16/9" }}>
            <Image
               src={material.file_path}
               alt={title}
               width={500}
               height={500}
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/*   {material.dimensions && (
               <span
                  className="absolute bottom-2.5 right-3 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(0,0,0,0.5)", color: "#fff", backdropFilter: "blur(4px)" }}
               >
                  <IconDimensions size={11} />
                  {material.dimensions}
               </span>
            )} */}
         </div>
      );
   }

   // PDF — no thumbnail; show a styled placeholder
   return (
      <div
         className="w-full rounded-xl flex items-center justify-center relative overflow-hidden"
         style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #fff5f0 0%, #ffe8de 100%)" }}
      >
         {/* Decorative lines mimicking document pages */}
         <div className="absolute inset-0 flex flex-col justify-center px-8 gap-2 opacity-25 pointer-events-none">
            {[100, 85, 92, 70, 80].map((w, i) => (
               <div key={i} className="h-1.5 rounded-full bg-orange-300" style={{ width: `${w}%` }} />
            ))}
         </div>
         <div className="relative flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#B84A2E" }}>
               <IconDocument size={28} className="text-white" />
            </div>
            {material.pages && (
               <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#B84A2E" }}>
                  <IconPages size={12} />
                  {material.pages} pages
               </span>
            )}
         </div>
      </div>
   );
}

export default function MaterialCard({ material }) {
   const { title, description, file_type, file_size, vendor, category } = material;

   return (
      <article
         className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
         style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}
      >
         {/* Media region */}
         <div className="p-3 pb-0">
            <MediaPreview material={material} />
         </div>

         {/* Content */}
         <div className="flex flex-col flex-1 p-4 gap-3">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
               {/* <TypeBadge fileType={file_type} /> */}
               {/* <LevelBadge level={level} /> */}
               <span className="text-xs text-stone-400 font-medium ml-auto">{category}</span>
            </div>

            {/* Title */}
            <h3
               className="font-semibold text-stone-900 leading-snug text-[15px] group-hover:text-emerald-800 transition-colors line-clamp-2"
               style={{ fontFamily: "'DM Serif Display', serif" }}
            >
               {title}
            </h3>

            {/* Description */}
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1">{description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
               <span className="flex items-center gap-1.5 text-stone-400 text-xs">
                  <IconBuilding size={13} />
                  {vendor || ""}Anonymous
               </span>
               <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">{formatFileSize(file_size)}</span>
                  {file_type.includes("pdf") ? (
                     <Link
                        href={material.file_path || "#"}
                        aria-label={`Download ${title}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
                        style={{ background: "#2D4A3E", color: "#fff" }}
                        target="_blank"
                        download
                     >
                        <Download size={13} />
                        Download
                     </Link>
                  ) : file_type.includes("video") ? (
                     <Link
                        href={material.file_path || "#"}
                        aria-label={`Watch ${title}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
                        style={{ background: "#2D4A3E", color: "#fff" }}
                        target="_blank"
                     >
                        <Play size={13} />
                        Watch
                     </Link>
                  ) : file_type.includes("image") ? (
                     <Link
                        href={material.file_path || "#"}
                        aria-label={`View ${title}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
                        style={{ background: "#2D4A3E", color: "#fff" }}
                        target="_blank"
                     >
                        <Eye size={13} />
                        View
                     </Link>
                  ) : null}
               </div>
            </div>
         </div>
      </article>
   );
}
