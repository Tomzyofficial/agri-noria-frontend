"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Edit, Trash2, X, ZoomIn, Calendar, CheckCircle2, Clock, Info } from "lucide-react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";
import { formatDate } from "@/utils/otherUtils";
import { BiMoney } from "react-icons/bi";
import { formatPrice } from "@/utils/formatPrice";
import { ImageEnlargementModal } from "@/components/ui/ImageEnlargementModal";

export function ViewListingPage({ listing }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!listing) {
    return (
      <div className="py-12 text-center">
        {/* <Warehouse className="h-16 w-16 mx-auto text-stone-400 mb-4" /> */}
        <p className="text-(--foreground) text-lg font-medium">Listing service not found</p>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">The listing service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this storage facility? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/proxy/farm-development/listings/delete/${listing.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to delete service listing");
        return;
      }

      toast.success("Service listing deleted successfully");
      router.push("/marketplace/farm-development/listings");
    } catch (error) {
      toast.error("Failed to delete service listing");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">Service listing Details</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">View and manage your service listing information</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/marketplace/farm-development/listings/${listing.id}/edit`}>
            <Button className="cursor-pointer flex items-center gap-2 bg-(--greenish-color) hover:bg-(--dark-green-color) text-white px-4 py-2 rounded-lg">
              <Edit className="h-4 w-4" />
              Edit listing
            </Button>
          </Link>
          <Button onClick={handleDelete} disabled={isDeleting} className="cursor-pointer flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isDeleting ? <FaSpinner className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div onClick={() => setIsModalOpen(true)} className="relative w-full h-[300px] bg-stone-100 dark:bg-stone-800 group cursor-zoom-in">
                <Image src={listing.featured_image} fill alt={`${listing.title} service image`} className="object-cover transition-transform duration-300 group-hover:scale-105" priority />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto p-2">
                {listing.gallery_images.length > 0 &&
                  listing.gallery_images.map((src) => (
                    <div key={src}>
                      <Image src={src} width={200} height={200} alt={`Gallery images for ${listing.title}`} className="rounded-md w-[120px] h-[120px] object-fill" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2 p-2">
                <Info className="h-5 w-5 text-(--greenish-color)" />
                Listing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-200 text-start">
              <div>
                <span>Title</span>
                <p className="text-md text-(--foreground)">
                  {listing?.title
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
              <div>
                <span>Category</span>
                <p> {listing.category}</p>
              </div>
              <div>
                <span>Location</span>
                <p>{listing.location}</p>
              </div>
              <div>
                <span>Scope</span>

                {listing.scope && listing.scope.length > 0 ? (
                  <ul>
                    {listing.scope.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Not specified</p>
                )}
              </div>
              <div>
                <span>Duration</span>
                <p>{listing.duration}</p>
              </div>
              <div>
                <span>Description</span>
                <p>{listing.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-(--greenish-color)" />
                Status & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 text-start gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Current Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${listing.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>{listing.status === "active" ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accrued Views</span>
                  <span>{listing.views_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inquiries Count</span>
                  <span>{listing.inquiries_count}</span>
                </div>
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

          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-stone-500" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Created" value={formatDate(listing.created_at)} />
              <DetailItem icon={<Calendar className="h-4 w-4" />} label="Last Updated" value={formatDate(listing.updated_at)} />
            </CardContent>
          </Card>
          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-stone-500" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem icon={<BiMoney className="h-4 w-4" />} label="Minimum Budget" value={formatPrice(listing.min_budget, listing.country_code, listing.currency)} />
              <DetailItem icon={<BiMoney className="h-4 w-4" />} label="Maximum Budget" value={formatPrice(listing.max_budget, listing.country_code, listing.currency)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image enlargement Modal */}
      {isModalOpen && <ImageEnlargementModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} name={`${listing.title} - Enlarged Image View`} src={listing.featured_image} />}
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
