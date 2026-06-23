import { apiUrl } from "@/_lib/api";
import { notFound } from "next/navigation";

async function getJob(slug) {
  const response = await fetch(apiUrl(`/jobs/${slug}`), {
    cache: "no-store",
  });

  const result = await response.json();

  return result.data;
}

export default async function JobPage({ params }) {
  const job = await getJob(params.slug);

  if (!job) notFound();

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-4xl font-bold">{job.title}</h1>

          <p className="mt-3 text-muted-foreground">
            {job.city}, {job.state}
          </p>

          <section className="mt-8">
            <h2 className="font-semibold">Description</h2>

            <div className="mt-3 whitespace-pre-wrap">{job.description}</div>
          </section>

          <section className="mt-8">
            <h2 className="font-semibold">Responsibilities</h2>

            <div className="mt-3 whitespace-pre-wrap">{job.responsibilities}</div>
          </section>

          <section className="mt-8">
            <h2 className="font-semibold">Requirements</h2>

            <div className="mt-3 whitespace-pre-wrap">{job.requirements}</div>
          </section>
        </div>

        <aside className="sticky top-24 h-fit rounded-xl border p-5">
          <a href={`/jobs/${job.slug}/apply`} className="block rounded-lg bg-primary px-4 py-3 text-center text-primary-foreground">
            Apply Now
          </a>
        </aside>
      </div>
    </div>
  );
}
