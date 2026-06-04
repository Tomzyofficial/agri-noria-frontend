"use client";

import Link from "next/link";
import Image from "next/image";
import { Download, Eye, Play, UserStar } from "lucide-react";

export function formatFileSize(bytes) {
  if (!bytes) return "Unknown";
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

/* ── Media preview area — varies by file_type ── */
function MediaPreview({ material }) {
  const { file_type, title } = material;

  if (file_type.includes("video")) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-xl bg-slate-900"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            src={material.file_path}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (file_type.includes("image")) {
    return (
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "16/9" }}
      >
        <Image
          src={material.file_path}
          alt={title}
          width={500}
          height={500}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  // PDF — no thumbnail; show a styled placeholder
  // return (
  //    <div
  //       className="w-full rounded-xl flex items-center justify-center relative overflow-hidden"
  //       style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #fff5f0 0%, #ffe8de 100%)" }}
  //    >
  //       {/* Decorative lines mimicking document pages */}
  //       <div className="absolute inset-0 flex flex-col justify-center px-8 gap-2 opacity-25 pointer-events-none">
  //          {[100, 85, 92, 70, 80].map((w, i) => (
  //             <div key={i} className="h-1.5 rounded-full bg-orange-300" style={{ width: `${w}%` }} />
  //          ))}
  //       </div>
  //       <div className="relative flex flex-col items-center gap-2">
  //          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#B84A2E" }}>
  //             <IconDocument size={28} className="text-white" />
  //          </div>
  //          {material.pages && (
  //             <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#B84A2E" }}>
  //                <IconPages size={12} />
  //                {material.pages} pages
  //             </span>
  //          )}
  //       </div>
  //    </div>
  // );
}

export default function MaterialCard({ material }) {
  const { title, description, file_type, file_size, category } = material;

  return (
    <article
      className="group flex flex-col bg-white dark:bg-black rounded-2xl overflow-hidden border border-stone-100 dark:border-none transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Media region */}
      <div className="p-3 pb-0">
        <MediaPreview material={material} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-stone-400 font-medium ml-auto">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-semibold text-stone-900 dark:text-gray-400 leading-snug text-[15px] group-hover:text-emerald-800 transition-colors line-clamp-2"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
          <span className="flex items-center gap-1.5 text-stone-400 text-xs">
            <UserStar size={13} />
            {material.fname || "Anonymous"} {material.lname || "Anonymous"}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">
              {formatFileSize(file_size)}
            </span>
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
