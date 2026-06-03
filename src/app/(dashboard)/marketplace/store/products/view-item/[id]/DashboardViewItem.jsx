"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ImageEnlargementModal } from "@/components/ui/ImageEnlargementModal";
import {
  Edit,
  Trash2,
  X,
  ZoomIn,
  Package,
  MapPin,
  Tag,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/formatPrice";

export function ViewItem({ result }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!result) {
    return (
      <div className="py-12">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-stone-400 mb-4" />
          <p className="text-(--foreground) text-lg font-medium">
            No product to display
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse attributes if it's a string
  let parsedAttributes = result?.attributes;
  if (typeof parsedAttributes === "string") {
    try {
      parsedAttributes = JSON.parse(parsedAttributes);
    } catch (e) {
      console.error("Failed to parse attributes:", e);
      parsedAttributes = {};
    }
  }

  const mappedObj = parsedAttributes
    ? Object.entries(parsedAttributes)
        .filter(([key, value]) => key && value && value !== "")
        .map(([key, value]) => ({
          key: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          value: key.includes("date")
            ? formatDate(value)
            : value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        }))
    : [];

  // Prevent background scrolling when image modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/proxy/vendor/products/delete-item/${result.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res?.ok || !data?.success) {
        toast.error(data?.error || "Failed to delete product");
        return;
      }

      toast.success(data.message || "Product deleted successfully");
      router.refresh();
      router.push("/dashboard/store/products");
    } catch (error) {
      toast.error(error?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">
            Product Details
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            View and manage your product information
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/store/products/edit-item/${result.id}`}>
            <Button className="flex items-center gap-2 bg-(--greenish-color) hover:bg-(--dark-green-color) text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Edit className="h-4 w-4" />
              Edit Product
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                onClick={() => setIsModalOpen(true)}
                className="relative w-full h-[300px] bg-stone-100 dark:bg-stone-800 group cursor-zoom-in"
              >
                <Image
                  src={result.product_image}
                  fill
                  alt={`${result.listing_name} image`}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-stone-900/90 rounded-full p-3">
                    <ZoomIn className="h-6 w-6 text-(--foreground)" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information Card */}
          <Card className="p-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2 p-2">
                <Info className="h-5 w-5 text-(--greenish-color)" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-(--foreground) mb-2">
                  {" "}
                  {result.listing_name.charAt(0).toUpperCase() +
                    result.listing_name.slice(1)}
                </h2>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {result.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-t border-stone-200 dark:border-stone-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-(--greenish-color)/10 dark:bg-(--greenish-color)/20 rounded-lg">
                    <Package className="h-5 w-5 text-(--greenish-color)" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                      Quantity
                    </p>
                    <p className="text-lg font-semibold text-(--foreground)">
                      {result.quantity_value} {result.quantity_unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                      Location
                    </p>
                    <p className="text-lg font-semibold text-(--foreground)">
                      {result.location}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type-Specific Details Card */}
          <Card className="p-2">
            <CardHeader className="p-2">
              <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2">
                Product Attributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mappedObj.map(
                  (attr, index) =>
                    attr.key &&
                    attr.value && (
                      <DetailItem
                        key={index}
                        icon={<Tag className="h-4 w-4" />}
                        label={attr.key}
                        value={attr.value}
                      />
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing & Metadata */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="p-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2">
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                  Price
                </p>
                <p className="text-3xl font-bold text-(--foreground)">
                  {formatPrice(
                    result.price,
                    result.country_code,
                    result.currency,
                  )}
                </p>
              </div>

              {result.discount && parseFloat(result.discount) > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Discount
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat("en-US").format(result.discount)}%
                      OFF
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Save{" "}
                    {formatPrice(
                      (result.price * result.discount) / 100,
                      result.country_code,
                      result.currency,
                    )}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-(--foreground)">
                    prod Status
                  </span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card className="p-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-(--foreground) flex items-center gap-2">
                <Clock className="h-4 w-4 text-stone-500" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Created
                </p>
                <p className="text-sm font-medium text-(--foreground)">
                  {formatDate(result.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Last Updated
                </p>
                <p className="text-sm font-medium text-(--foreground)">
                  {formatDate(result.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Large Image Modal */}
      <ImageEnlargementModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        name={result?.listing_name}
        src={result?.product_image}
      />
    </div>
  );
}

// Helper component for product attributes
function DetailItem({ icon, label, value, className = "" }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg ${className}`}
    >
      <div className="p-1.5 text-stone-600 dark:text-stone-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-(--foreground) break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
