"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { toast } from "react-toastify";
import useSWR from "swr";
import { Search, Edit, Trash2, Eye, Ellipsis } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/ui/LoadingSkeleton";
import { ErrorUi } from "@/components/ui/Error";
import { NoProductsFound } from "../../../dashboard/components/ui/NotFound";
import { Badge } from "@/components/ui/Badge";
import { FaSpinner } from "react-icons/fa";
import { formatPrice } from "@/utils/formatPrice";
import { fetcher } from "@/utils/otherUtils";

export function InventoryManagement({ inventoryUrl, deleteUrl, addNewHref, viewHref, editHref }) {
   const [searchTerm, setSearchTerm] = useState("");
   const [isDeleting, setIsDeleting] = useState({});
   const [openActionId, setOpenActionId] = useState(null);
   const [openActionListView, setOpenActionListView] = useState(null);

   const handleActionClick = (id) => {
      setOpenActionId(openActionId === id ? null : id);
   };

   const handleActionListView = (id) => {
      setOpenActionListView(openActionListView === id ? null : id);
   };

   const { data: productsData, mutate, error: productsError, isLoading: productsLoading } = useSWR(inventoryUrl, fetcher);

   const productsDataArray = productsData?.data?.listings || [];
   console.log("productsDataArray", productsData ? productsData : "nothing");

   const filteredProducts = productsDataArray.filter((product) => {
      const matchesSearch = product.listing_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
   });

   const handleDelete = async (productId) => {
      if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
         return;
      }

      setIsDeleting((prev) => ({ ...prev, [productId]: true }));

      try {
         const res = await fetch(`${deleteUrl}/${productId}`, {
            method: "DELETE",
         });

         const data = await res.json();

         if (!res?.ok || !data?.success) {
            toast.error(data?.error || "Failed to delete product");
            return;
         }

         toast.success(data.message || "Product deleted successfully");
         mutate();
      } catch (error) {
         toast.error(error?.body?.error || error.message || "Failed to delete product");
      } finally {
         setIsDeleting((prev) => ({ ...prev, [productId]: false }));
      }
   };

   return (
      <div className="my-25 lg:my-5">
         <div className="mb-8">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-(--foreground)">Product Management</h1>
            <p className="text-(--foreground)">Manage your product listings and inventory</p>
         </div>

         {/* Filters and Search */}
         <div className="relative mb-6 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500  " />
            <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 pr-4 bg-gray-100 shadow-sm dark:bg-(--card-dark) outline-none rounded-md w-full h-10 lg:w-2/5 border-2 border-transparent focus:border-(--greenish-color) dark:focus:border-gray-700 transition transition-border" />
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
                  {productsLoading ? (
                     <Skeleton />
                  ) : productsError ? (
                     // <div>{productsError.message}</div>
                     <ErrorUi />
                  ) : filteredProducts.length === 0 ? (
                     <NoProductsFound searchTerm={searchTerm} href={addNewHref} />
                  ) : (
                     filteredProducts.length > 0 &&
                     filteredProducts.map((product) => {
                        const src = product.image[0];
                        return (
                           <Card key={product.id} className="max-w-2xl min-h-70">
                              <div className="aspect-square rounded-t-lg ">
                                 <Image src={src} alt={`${product.listing_name} Image`} width={500} priority sizes="(max-width: 1200px) 100vw" height={500} className="rounded-t-lg w-full h-full object-cover" />
                              </div>

                              <div className="p-2 relative">
                                 <div className="flex items-center justify-between">
                                    <Badge className="text-green-700 bg-green-100 dark:bg-(--darker-green-color) dark:text-(--background) py-0 px-1 rounded">{product.status.charAt(0).toUpperCase() + product.status.slice(1)}</Badge>
                                    <Button className="hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) p-1 text-neutral-500" onClick={() => handleActionClick(product.id)}>
                                       <Ellipsis />
                                    </Button>
                                 </div>

                                 <div className="text-start space-y-2">
                                    <h2 className="text-md font-semibold">{product.listing_name.charAt(0).toUpperCase() + product.listing_name.slice(1)}</h2>
                                    <p className="text-sm line-clamp-1">{product.description}</p>
                                    <p className="text-(--greenish-color) font-semibold">{formatPrice(product.sale_price || product.rental_price, product.country_code, product.currency)}</p>
                                 </div>

                                 <div className={`${openActionId === product.id ? "absolute rounded right-0 top-10 bg-(--background) w-1/2 p-1 space-y-2" : "hidden"}`}>
                                    <Link href={`${viewHref}/${product.id}/view`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                                       <Eye className="h-4 w-4" />
                                       View
                                    </Link>
                                    <Link href={`${editHref}/${product.id}/edit`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                                       <Edit className="h-4 w-4" />
                                       Edit
                                    </Link>
                                    <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => handleDelete(product.id)} disabled={isDeleting[product.id]}>
                                       {isDeleting[product.id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                       Delete
                                    </Button>
                                 </div>
                              </div>
                           </Card>
                        );
                     })
                  )}
               </div>
            </TabsContent>

            {/* List view */}
            {/* <TabsContent value="list">
               <div className="space-y-4">
                  {productsError ? (
                     <ErrorUi />
                  ) : filteredProducts.length === 0 ? (
                     <NoProductsFound searchTerm={searchTerm} href="/marketplace/store/products/add-new" />
                  ) : (
                     filteredProducts.length > 0 &&
                     filteredProducts.map((product) => (
                        <Card key={product.id} className="flex justify-between px-2">
                           <div className="flex items-center gap-2">
                              <div className="w-25 h-25 rounded-lg flex-shrink-0">
                                 <Image width={150} height={150} priority sizes="(max-width: 1200px), 100vw" src={product.product_image} alt={`${product.listing_name} Image`} className="rounded w-full h-full object-cover" />
                              </div>

                              <div className="flex flex-col items-center gap-1" style={{ placeItems: "start" }}>
                                 <h4 className="font-semibold text-lg">{product.listing_name}</h4>
                                 <p>{product.description}</p>
                                 <p className="text-(--greenish-color) font-semibold">{formatPrice(product.price, product.country_code, product.currency)}</p>
                              </div>
                           </div>

                           <div className="relative">
                              <div>
                                 <Button className="bg-gray-200 p-1 px-2 text-neutral-500 transition transition-background hover:bg-(--greenish-color) hover:text-(--background) font-normal rounded" onClick={() => handleActionListView(product.id)}>
                                    Actions
                                 </Button>
                              </div>

                              <div className={`${openActionListView === product.id ? "absolute rounded right-0 top-10 bg-(--background) w-34 p-1 space-y-2" : "hidden"}`}>
                                 <Link href={`/marketplace/store/products/${product.id}/view-item`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                                    <Eye className="h-4 w-4" />
                                    View
                                 </Link>
                                 <Link href={`/marketplace/store/products/${product.id}/edit-item`} className="px-1 flex items-center gap-2 hover:bg-(--greenish-color) transition transition-background rounded hover:text-(--background) text-sm">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                 </Link>
                                 <Button className="w-full px-1 flex items-center gap-2 hover:bg-red-300 cursor-pointer transition transition-background rounded hover:text-red-700 text-sm" onClick={() => handleDelete(product.id)} disabled={isDeleting[product.id]}>
                                    {isDeleting[product.id] ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    Delete
                                 </Button>
                              </div>
                           </div>
                        </Card>
                     ))
                  )}
               </div>
            </TabsContent> */}
         </Tabs>
      </div>
   );
}
