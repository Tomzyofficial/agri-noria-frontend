"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatLabel } from "@/utils/otherUtils";
import { StatCard } from "@/app/(dashboard)/dashboard/components/ui/StatCard";
import useSWR from "swr";
import { fetcher } from "@/utils/otherUtils";
import { FaBriefcase } from "react-icons/fa";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { FaEye } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { VscGitStashApply } from "react-icons/vsc";
import { useState } from "react";

export default function JobsPage({ createHref, role }) {
  const [isDeleting, setIsDeleting] = useState(null);
  const { isLoading, data, error, mutate } = useSWR("/api/proxy/vendor/jobs/get-all", fetcher);
  const jobs = data?.jobs;
  const stats = data?.stats;

  const handleDeleteJOb = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return;
    }
    try {
      setIsDeleting(jobId);
      const res = await fetch(`/api/proxy/vendor/jobs/delete/${jobId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete job");
      }
      toast.success("Job deleted successfully.");
      mutate();
    } catch (error) {
      toast.error(error.message || "Internal server error. Try again later.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage vacancies and review applicants.</p>
        </div>

        <Link href={createHref} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          <Plus className="h-4 w-4" />
          Create Job
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard isLoading={isLoading} error={false} title="Total Jobs" value={stats?.total_jobs || 0} icon={FaBriefcase} />
        <StatCard isLoading={isLoading} error={false} title="Total Applicants" value={stats?.total_applicants || 0} icon={VscGitStashApply} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-(--gray-color)">
        <div className="border-b border-slate-400 p-4">
          <h2 className="font-semibold">Job Listings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm">
                <th className="p-4">Job Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
                <th className="p-4">Posted</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <tbody>
                <tr className="text-center">
                  <td colSpan={6} className="text-red-200">
                    Error occurred while loading jobs
                  </td>
                </tr>
              </tbody>
            ) : jobs?.length === 0 ? (
              <tbody>
                <tr className="text-center">
                  <td colSpan={6} className="p-4">
                    You haven&apos;t created your first job yet
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {jobs &&
                  jobs.length > 0 &&
                  jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="p-4">{formatLabel(job.title)}</td>
                      <td className="p-4">
                        {formatLabel(job.state)} {formatLabel(job.city)}
                      </td>
                      <td className="p-4">{job.applicants_count}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs">Active</span>
                      </td>
                      <td className="p-4">{formatDate(job.created_at)}</td>

                      <td className="p-4 flex items-center gap-6">
                        <Link href={`/marketplace/${role}/job-management/${job.id}/applicants`} className="font-medium text-primary">
                          <FaEye />
                        </Link>
                        <Button disabled={isDeleting === job.id} className="cursor-pointer" onClick={() => handleDeleteJOb(job.id)}>
                          {isDeleting === job.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
