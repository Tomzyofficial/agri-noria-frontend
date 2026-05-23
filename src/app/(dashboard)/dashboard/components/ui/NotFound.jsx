"use client";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function NoProductsFound({ searchTerm, href }) {
  return (
    <div className="text-center col-span-full py-12">
      <Package className="h-12 w-12 text-gray-800 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Nothing found here!</h3>
      <p className="text-gray-400 dark:text-gray-800 mb-4">
        {searchTerm
          ? "Try adjusting your search or filter criteria"
          : "Start by adding your first"}
      </p>
      <Link href={href} className="flex justify-center">
        <Button className="cursor-pointer bg-(--greenish-color) p-2 rounded-md text-(--background) flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Your First
        </Button>
      </Link>
    </div>
  );
}
