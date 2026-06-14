"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Edit,
  Trash2,
  ZoomIn,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Wallet,
  Users,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";
import { formatDate } from "@/utils/otherUtils";
import { ImageEnlargementModal } from "@/components/ui/ImageEnlargementModal";

export default function ViewPortfolioPage({ project }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) {
    return (
      <div className="py-12 text-center">
        <p className="text-(--foreground) text-lg font-medium">Portfolio project not found</p>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
          The project you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/marketplace/farm-development/portfolio" className="inline-block mt-6">
          <Button variant="outline">Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  const galleryImages = Array.isArray(project.gallery_images) ? project.gallery_images : [];

  const openImageModal = (src) => {
    setActiveImage(src);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this portfolio project? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/proxy/farm-development/portfolio/delete/${project.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to delete portfolio project");
        return;
      }

      toast.success("Portfolio project deleted successfully");
      router.push("/marketplace/farm-development/portfolio");
    } catch {
      toast.error("Failed to delete portfolio project");
    } finally {
      setIsDeleting(false);
    }
  };

  const titleCase = (text) =>
    text
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">Portfolio Project Details</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            View and manage your completed farm development project
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/marketplace/farm-development/portfolio/${project.id}/edit`}>
            <Button className="cursor-pointer flex items-center gap-2 bg-(--greenish-color) hover:bg-(--dark-green-color) text-white px-4 py-2 rounded-lg">
              <Edit className="h-4 w-4" />
              Edit Project
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                onClick={() => openImageModal(project.featured_image)}
                className="relative w-full h-[300px] sm:h-[400px] bg-stone-100 dark:bg-stone-800 group cursor-zoom-in"
              >
                <Image
                  src={project.featured_image}
                  fill
                  alt={`${project.title} featured image`}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-3 overflow-x-auto p-4 border-t border-stone-200 dark:border-stone-700">
                  {galleryImages.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => openImageModal(src)}
                      className="relative shrink-0 rounded-md overflow-hidden ring-2 ring-transparent hover:ring-(--greenish-color) transition-all cursor-zoom-in"
                    >
                      <Image
                        src={src}
                        width={120}
                        height={120}
                        alt={`Gallery image for ${project.title}`}
                        className="w-[120px] h-[120px] object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="text-xl font-bold text-(--foreground) flex items-center gap-2 p-2">
                <Info className="h-5 w-5 text-(--greenish-color)" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-200 dark:divide-slate-700 text-start">
              <DetailRow label="Title" value={titleCase(project.title)} />
              <DetailRow label="Category" value={project.category} />
              <DetailRow label="Location" value={project.location || "Not specified"} />
              <DetailRow label="Description" value={project.description} multiline />
              <DetailRow label="Client Type" value={project.client_type || "Not specified"} />
              <DetailRow label="Project Duration" value={project.project_duration || "Not specified"} />
              <DetailRow label="Budget Range" value={project.budget_range || "Not specified"} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-(--greenish-color)" />
                Status & Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 text-start gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {project.status === "active" ? "Active" : project.status || "Inactive"}
                  </span>
                </div>

                {project.is_featured && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Featured</span>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </Badge>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                    <Eye className="h-4 w-4" />
                    Views
                  </span>
                  <span className="font-medium text-(--foreground)">{project.views_count ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-stone-500" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                icon={<Calendar className="h-4 w-4" />}
                label="Completion Date"
                value={project.completion_date ? formatDate(project.completion_date) : "Not specified"}
              />
              <DetailItem icon={<Clock className="h-4 w-4" />} label="Created" value={formatDate(project.created_at)} />
              <DetailItem icon={<Clock className="h-4 w-4" />} label="Last Updated" value={formatDate(project.updated_at)} />
            </CardContent>
          </Card>

          <Card className="p-2">
            <CardHeader className="mb-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-stone-500" />
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="Location" value={project.location || "Not specified"} />
              <DetailItem icon={<Users className="h-4 w-4" />} label="Client Type" value={project.client_type || "Not specified"} />
              <DetailItem icon={<Clock className="h-4 w-4" />} label="Duration" value={project.project_duration || "Not specified"} />
              <DetailItem icon={<Wallet className="h-4 w-4" />} label="Budget" value={project.budget_range || "Not specified"} />
            </CardContent>
          </Card>
        </div>
      </div>

      {isModalOpen && activeImage && (
        <ImageEnlargementModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          name={`${project.title} - Enlarged Image View`}
          src={activeImage}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value, multiline = false }) {
  return (
    <div className="pt-4 first:pt-0">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <p className={`text-md text-(--foreground) mt-1 ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}>
        {value || "Not specified"}
      </p>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-stone-500 dark:text-stone-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
        <p className="font-medium text-(--foreground)">{value || "Not specified"}</p>
      </div>
    </div>
  );
}
