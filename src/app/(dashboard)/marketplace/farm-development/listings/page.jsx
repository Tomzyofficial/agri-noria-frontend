"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { FaSpinner } from "react-icons/fa";
import { Eye, Edit, Trash2, Plus, Search, Ellipsis } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Skeleton from "@/components/ui/LoadingSkeleton";
import { NoProductsFound } from "../../../dashboard/components/ui/NotFound";
import useSWR from "swr";
import { fetcher } from "@/utils/otherUtils";
import Image from "next/image";
import { toast } from "react-toastify";
export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openActionId, setOpenActionId] = useState(null);
  const [openActionListView, setOpenActionListView] = useState(null);
  const [isDeleting, setIsDeleting] = useState({});

  const { data: listingsData, error: listingsError, isLoading: listingsLoading, mutate } = useSWR("/api/proxy/farm-development/get-listings", fetcher);

  const listingsArray = Array.isArray(listingsData) ? listingsData : Array.isArray(listingsData?.data) ? listingsData.data : [];

  const filteredListings = listingsArray.filter((listing) => {
    const title = String(listing?.title || "").toLowerCase();
    const description = String(listing?.description || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return title.includes(term) || description.includes(term);
  });

  const handleActionClick = (id) => {
    setOpenActionId(openActionId === id ? null : id);
  };

  const handleActionListView = (id) => {
    setOpenActionListView(openActionListView === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setIsDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      await axios.delete(`/api/proxy/farm-development/listing/delete/${id}`);
      toast.success("Service listing deleted successfully");
      mutate();
    } catch (error) {
      console.error("Service listing delete failed:", error);
      toast.error("Failed to delete service listing");
    } finally {
      setIsDeleting({});
    }
  };

  return (
    <div className="my-25 lg:my-5">
      <div className="mb-8">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-(--foreground)"> Service listings</h1>
        <p className="text-(--foreground)">Manage your service listings</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row w-full items-start lg:items-center mb-6 gap-4">
        <div className="relative w-full lg:w-1/2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
          <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 pr-4 bg-gray-100 shadow-sm dark:bg-(--card-dark) outline-none rounded-md w-full h-10 border-2 border-transparent focus:border-(--greenish-color) dark:focus:border-gray-700 transition transition-border" />
        </div>
        <Link href="/marketplace/farm-development/listings/create">
          <Button className="cursor-pointer bg-(--greenish-color) text-white dark:text-gray-200 hover:bg-(--darker-green-color) transition transition-background text-sm py-2 px-2 rounded flex items-center gap-2">
            <Plus size={10} />
            Add a new listing
          </Button>
        </Link>
      </div>

      {/* Products List */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        {/* Grid view  */}
        <TabsContent value="grid">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 overflow-auto relative">
            {listingsLoading ? (
              <Skeleton />
            ) : listingsError ? (
              <ErrorUi />
            ) : filteredListings.length === 0 ? (
              <NoProductsFound searchTerm={searchTerm} href="/marketplace/farm-development/create-listing" />
            ) : (
              filteredListings.length > 0 &&
              filteredListings.map((listing) => (
                <Card key={listing.id} className="max-w-2xl min-h-70">
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
                      <Link href={`/marketplace/farm-development/listings/${listing.id}/view`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link href={`/marketplace/farm-development/listings/${listing.id}/edit`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => handleDelete(listing.id)} disabled={isDeleting[listing.id]}>
                        {isDeleting[listing.id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* List view */}
        <TabsContent value="list">
          <div className="space-y-4">
            {listingsError ? (
              <ErrorUi />
            ) : filteredListings?.length === 0 ? (
              <NoProductsFound searchTerm={searchTerm} href="/marketplace/farm-development/listings/create" />
            ) : (
              filteredListings?.length > 0 &&
              filteredListings.map((listing) => (
                <Card key={listing.id} className="flex justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-25 h-25 rounded-lg flex-shrink-0">
                      <Image width={150} height={150} src={listing.featured_image} alt={`${listing.title} Image`} className="rounded w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col items-center gap-1" style={{ placeItems: "start" }}>
                      <h4 className="font-semibold text-lg">{listing.title}</h4>
                      <p className="line-clamp-1">{listing.description}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div>
                      <Button className="bg-gray-200 p-1 px-2 text-neutral-500 transition transition-background hover:bg-(--greenish-color) hover:text-(--background) font-normal rounded" onClick={() => handleActionListView(listing.id)}>
                        Actions
                      </Button>
                    </div>

                    <div className={`${openActionListView === listing.id ? "absolute rounded right-0 top-10 bg-(--background) w-34 p-1 space-y-2" : "hidden"}`}>
                      <Link href={`/marketplace/farm-development/listings/${listing.id}/view`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      <Link href={`/marketplace/farm-development/listings/${listing.id}/edit`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => handleDelete(listing.id)} disabled={isDeleting[listing.id]}>
                        {isDeleting[listing.id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
