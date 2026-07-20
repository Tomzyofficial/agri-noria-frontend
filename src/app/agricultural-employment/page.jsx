import { JobsPageClient } from "./components/jobsPageClient";
import { apiUrl } from "@/_lib/api";
import NavBar from "@/components/ui/NavBar/NavBar";

export const metadata = {
  title: "Agricultural employment",
  description: "Browse agricultural job openings across the globe. Agriculture, logistics, storage and more.",
  keywords: ["agricultural employment", "jobs", "agriculture", "logistics", "storage"],
};

async function getJobs(searchParams = {}) {
  const query = new URLSearchParams();

  if (searchParams.search) {
    query.set("search", searchParams.search);
  }

  if (searchParams.category) {
    query.set("category", searchParams.category);
  }

  if (searchParams.location) {
    query.set("location", searchParams.location);
  }

  const response = await fetch(apiUrl(`/jobs?${query.toString()}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data;
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const jobs = await getJobs(sp);
  return (
    <>
      <NavBar />
      <JobsPageClient jobs={jobs} />
    </>
  );
}
