"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Phone } from "lucide-react";
import { formatDate } from "@/utils/otherUtils";

export const quoteRequestDetails = (req) => {
  const initials =
    req?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  const handleContactClick = async () => {
    if (!req.phone) return;

    const res = await fetch(
      `/api/proxy/vendor/storage/quote-requests/${req.quote_request_id}/update-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();
    if (!res.ok || !data.success) {
      return;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header — avatar + name + phone */}
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {req?.full_name || "N/A"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {req?.phone || "No phone on record"}
          </p>
        </div>
      </div>

      {/* Commodity — full width, prominent */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          Commodity
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {req?.metadata.commodity || "N/A"}
        </p>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Quantity
          </p>
          <p className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-100">
            {req?.metadata.quantity
              ? Number(req.metadata.quantity).toLocaleString()
              : "0"}{" "}
            <span className="font-sans font-normal text-gray-500 dark:text-gray-400">
              {req?.metadata.unit || ""}
            </span>
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Duration
          </p>
          <p className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-100">
            {req?.metadata.duration || "N/A"}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Storage type
          </p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            {req?.metadata.storage_type || "N/A"}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Start date
          </p>
          <p className="text-sm font-semibold font-mono text-gray-900 dark:text-gray-100">
            {formatDate(req.metadata.start_date) || "N/A"}
          </p>
        </div>

        <div className="rounded-lg col-span-2 bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            Additional info
          </p>
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium">
            {req?.additional_info || "N/A"}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2">
        <Link href={`tel:${req?.phone}`} className="block">
          <Button
            onClick={handleContactClick}
            className="cursor-pointer w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contact Customer
          </Button>
        </Link>
      </div>
    </div>
  );
};
