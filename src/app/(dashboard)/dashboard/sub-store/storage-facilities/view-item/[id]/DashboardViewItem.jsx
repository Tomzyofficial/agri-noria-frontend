"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import {
   Edit,
   Trash2,
   X,
   ZoomIn,
   MapPin,
   Check,
   Calendar,
   CheckCircle2,
   Clock,
   Info,
   Warehouse,
   Thermometer,
   Ruler,
   Box,
} from "lucide-react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";

export function ViewItem({ storage }) {
   const router = useRouter();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   if (!storage) {
      return (
         <div className="py-12 text-center">
            <Warehouse className="h-16 w-16 mx-auto text-stone-400 mb-4" />
            <p className="text-(--foreground) text-lg font-medium">Storage facility not found</p>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
               The storage facility you're looking for doesn't exist or has been removed.
            </p>
         </div>
      );
   }

   // Format price
   const formatPrice = (price) => {
      return new Intl.NumberFormat("en-NG", {
         style: "currency",
         currency: "NGN",
      }).format(price);
   };

   // Format date
   const formatDate = (dateString) => {
      if (!dateString) return "Not specified";
      return new Date(dateString).toLocaleDateString("en-US", {
         year: "numeric",
         month: "long",
         day: "numeric",
      });
   };

   // Handle delete
   const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this storage facility? This action cannot be undone.")) {
         return;
      }

      setIsDeleting(true);
      try {
         const res = await fetch(`/api/proxy/vendor/storage/delete-item/${storage.id}`, {
            method: "DELETE",
         });

         const data = await res.json();

         if (!res.ok || !data.success) {
            toast.error(data.error || "Failed to delete storage facility");
            return;
         }

         toast.success("Storage facility deleted successfully");
         router.push("/dashboard/sub-store/storage-facilities");
      } catch (error) {
         toast.error("Failed to delete storage facility");
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <div className="py-6 space-y-6">
         {/* Action Bar */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-(--foreground)">Storage Facility Details</h1>
               <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  View and manage your storage facility information
               </p>
            </div>
            <div className="flex gap-3">
               <Link href={`/dashboard/sub-store/storage-facilities/edit-item/${storage.id}`}>
                  <Button className="cursor-pointer flex items-center gap-2 bg-(--greenish-color) hover:bg-(--dark-green-color) text-white px-4 py-2 rounded-lg">
                     <Edit className="h-4 w-4" />
                     Edit Facility
                  </Button>
               </Link>
               <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="cursor-pointer flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isDeleting ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {isDeleting ? "Deleting..." : "Delete"}
               </Button>
            </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image Section */}
            <div className="lg:col-span-2 space-y-6">
               {/* Facility Image */}
               <Card className="overflow-hidden">
                  <CardContent className="p-0">
                     <div
                        onClick={() => setIsModalOpen(true)}
                        className="relative w-full h-[300px] bg-stone-100 dark:bg-stone-800 group cursor-zoom-in"
                     >
                        <Image
                           src={storage.storage_image}
                           fill
                           alt={`{${storage.storage_name} facility} image storage facility `}
                           className="object-cover transition-transform duration-300 group-hover:scale-105"
                           priority
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                           <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Facility Information */}
               <Card>
                  <CardHeader>
                     <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2 p-2">
                        <Info className="h-5 w-5 text-(--greenish-color)" />
                        Storage Information
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <h2 className="text-2xl font-bold text-(--foreground)">
                           {storage?.storage_name
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                        </h2>
                        <p className="text-stone-600 dark:text-stone-300 mt-2">
                           {storage.description || "No description provided."}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t border-stone-200 dark:border-stone-700">
                        <DetailItem
                           icon={<Warehouse className="h-5 w-5" />}
                           label="Storage Type"
                           value={storage.storage_type || "Not specified"}
                        />
                        <DetailItem
                           icon={<Thermometer className="h-5 w-5" />}
                           label="Temperature Control"
                           value={storage.temperature ? `${storage.temperature}°C` : "Not temperature controlled"}
                        />
                        <DetailItem
                           icon={<Ruler className="h-5 w-5" />}
                           label="Capacity"
                           value={storage.capacity ? `${storage.capacity} sq ft` : "Not specified"}
                        />
                        <DetailItem
                           icon={<Box className="h-5 w-5" />}
                           label="Available Space"
                           value={storage.available ? `${storage.available} sq ft available` : "Not specified"}
                        />
                        <DetailItem
                           icon={<MapPin className="h-5 w-5" />}
                           label="Location"
                           value={`${storage.location}`}
                        />
                        <DetailItem
                           icon={<FaRegMoneyBill1 className="h-5 w-5" />}
                           label="Price"
                           value={new Intl.NumberFormat(`en-${storage.country_code}`, {
                              style: "currency",
                              currency: storage.currency,
                              currencyDisplay: "narrowSymbol",
                           }).format(storage.price)}
                        />
                     </div>

                     {/* Features */}
                     {storage.features && storage.features.length > 0 && (
                        <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                           <h3 className="font-medium text-(--foreground) mb-3">Storage Features</h3>
                           <div className="p-2 flex flex-wrap gap-2">
                              {storage.features.map((feature, index) => (
                                 <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                 >
                                    <Check className="h-4 w-4 mr-1" />
                                    {feature}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* Right Column - Status & Actions */}
            <div className="space-y-6">
               {/* Status Card */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-(--greenish-color)" />
                        Status & Actions
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="font-medium">Current Status:</span>
                        <span
                           className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              storage.status === "active"
                                 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                 : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                           }`}
                        >
                           {storage.status === "active" ? "Active" : "Inactive"}
                        </span>
                     </div>

                     <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                        <h4 className="font-medium mb-2">Quick Actions</h4>
                        <div className="space-y-2">
                           <Button variant="outline" className="w-full justify-start">
                              View Bookings
                           </Button>
                           <Button variant="outline" className="w-full justify-start">
                              Update Availability
                           </Button>
                           <Button variant="outline" className="w-full justify-start text-red-500">
                              Report an Issue
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Metadata */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-stone-500" />
                        Timeline
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <DetailItem
                        icon={<Calendar className="h-4 w-4" />}
                        label="Created"
                        value={formatDate(storage.created_at)}
                     />
                     <DetailItem
                        icon={<Calendar className="h-4 w-4" />}
                        label="Last Updated"
                        value={formatDate(storage.updated_at)}
                     />
                  </CardContent>
               </Card>
            </div>
         </div>

         {/* Image Modal */}
         {isModalOpen && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4 animate-in fade-in duration-200"
               onClick={() => setIsModalOpen(false)}
            >
               <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                  <Button
                     onClick={() => setIsModalOpen(false)}
                     className="absolute -top-5 right-0 text-white bg-stone-800/80 hover:bg-stone-700 rounded-full p-2 z-10"
                     aria-label="Close modal"
                  >
                     <X className="h-5 w-5" />
                  </Button>
                  <div className="relative w-full rounded-lg overflow-hidden bg-stone-900">
                     <Image
                        src={storage.storage_image}
                        alt={`${storage.storage_name} - Enlarged Image View`}
                        width={1200}
                        height={1200}
                        className="object-contain w-full h-auto max-h-[90vh]"
                        priority
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

// Helper component for detail items
function DetailItem({ icon, label, value, className = "" }) {
   return (
      <div className={`flex items-start gap-3 ${className}`}>
         <div className="text-stone-500 dark:text-stone-400 mt-0.5">{icon}</div>
         <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
            <p className="font-medium text-(--foreground)">{value || "Not specified"}</p>
         </div>
      </div>
   );
}
