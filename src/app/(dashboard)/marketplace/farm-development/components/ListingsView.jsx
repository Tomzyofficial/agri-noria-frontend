// components/marketplace/ListingsTable.jsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Ellipsis } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FaEye } from "react-icons/fa6";
import {Card} from "@/components/ui/Card"


export default function ListingsTable({ listings, isDeleting, onDelete, viewHref, editHref }) {
  return (
    <div className="hidden lg:block overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400 w-14">Image</th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400 max-w-xs">Description</th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
            <th className="px-4 py-3 text-right font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} isDeleting={isDeleting} onDelete={onDelete} viewHref={viewHref} editHref={editHref} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListingRow({ listing, isDeleting, onDelete, viewHref, editHref }) {
  const title = listing.title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const status = listing.status.charAt(0).toUpperCase() + listing.status.slice(1);

  return (
    <tr className="bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <td className="px-4 py-3">
        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
          <Image src={listing.featured_image} alt={`${title} thumbnail`} width={48} height={48} className="h-full w-full object-cover" />
        </div>
      </td>

      <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100 whitespace-nowrap">{title}</td>

      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 max-w-xs">
        <p className="line-clamp-1">{listing.description}</p>
      </td>

      <td className="px-4 py-3">
        <Badge className="text-green-700 bg-green-100 dark:bg-(--darker-green-color) dark:text-(--background) py-0 px-2 rounded text-xs font-medium">{status}</Badge>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link href={viewHref(listing.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--greenish-color) hover:text-(--background) transition-colors">
            <FaEye className="h-3.5 w-3.5" />
            View
          </Link>

          <Link href={editHref(listing.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--greenish-color) hover:text-(--background) transition-colors">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>

          <Button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors h-auto" onClick={() => onDelete(listing.id)} disabled={isDeleting[listing.id]}>
            {isDeleting[listing.id] ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function ListingsMobile({ listings, isDeleting, handleActionClick, openActionId, onDelete, viewHref, editHref }) {
  return (
    <div>
      {listings.map((listing) => (
        <Card key={listing.id} className="block max-w-2xl min-h-70 lg:hidden">
          <div className="aspect-square rounded-t-lg ">
            <Image src={listing.featured_image} alt={`${listing.title} Image`} width={500} height={500} className="rounded-t-lg w-full h-full object-cover" />
          </div>

          <div className="p-2 relative">
            <div className="flex items-center justify-between">
              <Badge className="text-green-700 bg-green-100 dark:bg-(--darker-green-color) dark:text-(--background) py-0 px-1 rounded">{listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</Badge>
              <Button className="hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) p-1 text-neutral-500" onClick={() => handleActionClick(listing.id)}>
                <Ellipsis />
              </Button>
            </div>

            <div className="text-start space-y-2">
              <h2 className="text-md font-semibold">
                {listing.title
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h2>
              <p className="text-sm line-clamp-1">{listing.description}</p>
              {/* <p className="text-(--greenish-color) font-semibold">{formatPrice(listing.price, listing.country_code, listing.currency)}</p> */}
            </div>

            <div className={`${openActionId === listing.id ? "absolute rounded right-0 top-10 bg-(--background) w-1/2 p-1 space-y-2" : "hidden"}`}>
              {/* <Link href={`/marketplace/farm-development/listings/${listing.id}/view`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                <Eye className="h-4 w-4" />
                View
              </Link> */}

              <Link href={viewHref(listing.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--greenish-color) hover:text-(--background) transition-colors">
                <FaEye className="h-3.5 w-3.5" />
                View
              </Link>

              <Link href={editHref(listing.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-(--greenish-color) hover:text-(--background) transition-colors">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
              <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => onDelete(listing.id)} disabled={isDeleting[listing.id]}>
                {isDeleting[listing.id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
