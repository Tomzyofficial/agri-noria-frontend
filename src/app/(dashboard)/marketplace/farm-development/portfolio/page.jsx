"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import useSWR from "swr";
import { formatDate } from "@/utils/otherUtils";
import { Plus, Eye, Edit2, Trash2, Search, FolderKanban, MapPin, Calendar, Clock, Wallet } from "lucide-react";
import { FaBriefcase } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { FaEye } from "react-icons/fa";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { fetcher } from "@/utils/otherUtils";
import { StatCard } from "@/app/(dashboard)/dashboard/components/ui/StatCard";
import { ListingsCard } from "@/app/(dashboard)/dashboard/components/ListingsCard";
import Skeleton from "@/components/ui/LoadingSkeleton";
import { ErrorUi } from "@/components/ui/Error";
import { NoProductsFound } from "@/app/(dashboard)/dashboard/components/ui/NotFound";

export default function PortfolioPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/proxy/farm-development/get-portfolios", fetcher);

  const portfolios = data?.data || [];

  const filteredProjects = useMemo(() => {
    return portfolios.filter((project) => {
      const search = searchTerm.toLowerCase();

      return project.title?.toLowerCase().includes(search) || project.category?.toLowerCase().includes(search) || project.location?.toLowerCase().includes(search);
    });
  }, [portfolios, searchTerm]);

  // Dashboard Stats
  const stats = {
    totalProjects: portfolios.length,

    totalViews: portfolios.reduce((sum, item) => sum + (item.views_count || 0), 0),

    categories: new Set(portfolios.map((item) => item.category)).size,

    latestProject: portfolios.length > 0 ? portfolios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] : null,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Projects</h1>

          <p className="text-muted-foreground mt-1">Showcase your completed agricultural development projects.</p>
        </div>

        <Link href="/marketplace/farm-development/portfolio/create">
          <Button className="bg-(--greenish-color) text-white dark:text-gray-200 hover:bg-(--darker-green-color) transition transition-background text-sm py-2 px-2 rounded flex items-center gap-2">
            <Plus size={12} />
            Add Portfolio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard isLoading={isLoading} error={error} title="Total Portfolio" value={stats.totalProjects} icon={FaBriefcase} />
        <StatCard isLoading={isLoading} error={error} title="Total Views" value={stats.totalViews} icon={FaEye} />
        <StatCard isLoading={isLoading} error={error} title="Categories Covered" value={stats.categories} icon={BiCategoryAlt} />
        <StatCard isLoading={isLoading} error={error} title="Latest Project" value={stats.latestProject?.title || "N/A"} icon={FolderKanban} />
      </div>

      <div className="relative w-full lg:w-1/2">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

        <Input placeholder="Search by title, category or location..." className="pl-8 pr-4 bg-gray-100 shadow-sm dark:bg-(--card-dark) outline-none rounded-md w-full h-10 border-2 border-transparent focus:border-(--greenish-color) dark:focus:border-gray-700 transition transition-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <ErrorUi />
      ) : filteredProjects.length === 0 ? (
        <NoProductsFound searchTerm={searchTerm} href="/marketplace/farm-development/portfolio/create" />
      ) : (
        filteredProjects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 ">
            {filteredProjects.map((listing) => (
              <ListingsCard key={listing.id} id={listing.id} title={listing.title} src={listing.featured_image} url={`/api/proxy/farm-development/portfolio/delete/${listing.id}`} description={listing.description} viewHref={`/marketplace/farm-development/portfolio/${listing.id}/view`} editHref={`/marketplace/farm-development/portfolio/${listing.id}/edit`} status={listing.status} mutate={mutate} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
