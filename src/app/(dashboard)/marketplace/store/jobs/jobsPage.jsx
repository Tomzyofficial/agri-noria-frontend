import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/utils/otherUtils";

export function JobsPage({ job }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage vacancies and review applicants.</p>
        </div>

        <Link href="/marketplace/store/jobs/create" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          <Plus className="h-4 w-4" />
          Create Job
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
          <h3 className="text-sm text-muted-foreground">Active Jobs</h3>
          <p className="mt-2 text-3xl font-bold">12</p>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="text-sm text-muted-foreground">Total Applicants</h3>
          <p className="mt-2 text-3xl font-bold">235</p>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="text-sm text-muted-foreground">New Applications</h3>
          <p className="mt-2 text-3xl font-bold">14</p>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="text-sm text-muted-foreground">Closed Jobs</h3>
          <p className="mt-2 text-3xl font-bold">3</p>
        </div>
      </section>

      <section className="rounded-xl border bg-background">
        <div className="border-b p-4">
          <h2 className="font-semibold">Job Listings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm">
                <th className="p-4">Job Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
                <th className="p-4">Posted</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            {job.length === 0 ? (
              <tbody>
                <td>Nothing found</td>
              </tbody>
            ) : (
              <tbody>
                {job.length > 0 &&
                  job.map((j) => (
                    <tr className="border-b" key={j.id}>
                      <td className="p-4">{j.title}</td>
                      <td className="p-4">
                        {j.state} {j.city}
                      </td>
                      <td className="p-4">42</td>
                      <td className="p-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs">Active</span>
                      </td>
                      <td className="p-4">{formatDate(j.created_at)}</td>

                      <td className="p-4">
                        <Link href={`/marketplace/store/jobs/${j.id}/applicants`} className="font-medium text-primary">
                          View Applicants
                        </Link>
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
