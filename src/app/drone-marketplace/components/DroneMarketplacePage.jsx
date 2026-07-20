"use client";

import { useState, useEffect } from "react";
import { DroneCard } from "@/components/droneMarketplace/DroneCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FaSpinner } from "react-icons/fa6";
import { Search, Filter } from "lucide-react";

export function DroneMarketplacePage({ listings, total, page }) {
   const [searchTerm, setSearchTerm] = useState("");
   const [filterType, setFilterType] = useState("all");

   const limit = 12;

   const filteredListings = listings.filter((listing) => {
      const matchesSearch = searchTerm === "" || listing.listing_name.toLowerCase().includes(searchTerm.toLowerCase()) || listing.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) || listing.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterType === "all" || listing.listing_type === filterType;

      return matchesSearch && matchesFilter;
   });

   const totalPages = Math.ceil(total / limit);

   return (
      <div className="min-h-screen p-6">
         <div className="max-w-7xl mx-auto">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-(--foreground)">Drone Marketplace</h1>
               <p className="text-gray-500 mt-2">Browse and purchase or rent agricultural drones from trusted vendors</p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 w-[100%] flex flex-col md:flex-row gap-4">
               <div className="md:w-[80%]">
                  <Label htmlFor="search">Search Drones</Label>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                        id="search"
                        type="text"
                        placeholder="Search by name, manufacturer, or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 border-1 border-transparent ring ring-(--greenish-color) dark:ring-gray-700 outline-none bg-(--gray-color) dark:bg-(--background) focus:border-(--dark-green-color) dark:focus:border-gray-500 rounded p-2 w-full"
                     />
                  </div>
               </div>

               <div className="md:w-[20%]">
                  <Label htmlFor="filter">Filter by Type</Label>
                  <div className="relative">
                     <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <select id="filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="pl-10 border-1 border-transparent ring ring-(--greenish-color) dark:ring-gray-700 outline-none bg-(--gray-color) dark:bg-(--background) focus:border-(--dark-green-color) dark:focus:border-gray-500 rounded p-2 w-full">
                        <option value="all">All Types</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                     </select>
                  </div>
               </div>
            </div>

            {filteredListings.length === 0 ? (
               <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No drone listings found matching your criteria.</p>
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                     {filteredListings.map((listing) => (
                        <DroneCard key={listing.id} listing={listing} />
                     ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex justify-center items-center gap-2">
                        <Button onClick={() => fetchListings(page - 1)} disabled={page === 1} variant="outline" className="cursor-pointer">
                           Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                           Page {page} of {totalPages}
                        </span>
                        <Button onClick={() => fetchListings(page + 1)} disabled={page === totalPages} variant="outline" className="cursor-pointer">
                           Next
                        </Button>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
}
