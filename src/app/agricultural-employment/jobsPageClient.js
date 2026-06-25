"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoIosFunnel } from "react-icons/io";
import Link from "next/link";
import { useSearchParams } from "node_modules/next/navigation";
import { useState } from "react";
import { NoSearchResults } from "./components/NoSearchResult";
import { NoJobsAvailable } from "./components/NoJobsAvailable";
import { useRouter } from "next/navigation";
import { formatLabel } from "@/utils/otherUtils";

export function JobsPageClient({ jobs }) {
  const [typeFilter, setTypeFilter] = useState("All");
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("job");
  const selectedJob = jobs.find((job) => String(job.id) === selectedId) || jobs[0];
  const router = useRouter();

  const JOBTYPE = ["All", "Full Time", "Part Time", "Contract", "Internship"];

  const filtered = jobs.filter((c) => {
    const matchesType = typeFilter === "All" || c.employment_type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesType;
  });

  return (
    <>
      <header className="bg-gradient-to-r from-[#1a481e] via-[#113211] to-[#364511] h-[80dvh] w-full text-start px-8 py-25 text-[#fbf9ed]">
        <span className="border border-gray-200 uppercase leading-6 p-2 rounded-full text-md">Jobs across the value chain</span>
        <div className="py-5">
          <h1 className="text-5xl">
            Work the land. <span className="text-[#f7a020]">Move the harvest.</span>
          </h1>
          <p className="max-w-4xl text-2xl">Verified roles posted directly by farmers, cooperatives, sellers and distributors. Apply in minutes with your CV — no account required.</p>
        </div>
        <form className="flex w-[80%] job-search-form">
          <div className="relative w-[40%] h-10">
            <IoSearch className="absolute left-2 top-1/2 -translate-y-1/2" />
            <Input name="search" type="search" placeholder="Search title, category, or employer" className="rounded-l-full w-full h-full pl-8 pr-3 border border-gray-100 outline-none" />
          </div>
          <div className="relative h-10 w-[30%]">
            <FaLocationDot className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input name="location" type="search" placeholder="City, state, country" className="w-full h-full pl-8 border border-gray-100 outline-none" />
          </div>
          <Button type="submit" className="hover:bg-[#364511] transition-colors bg-transparent border border-gray-100 cursor-pointer text-center text-lg rounded-r-full w-[10%] h-10">
            Search
          </Button>
        </form>
        <div className="flex gap-6 mt-2 text-sm text-gray-50">
          <p className="flex items-center gap-1">
            <span>
              <FaRegCheckCircle />
            </span>
            Verified vendors
          </p>
          <p className="flex items-center gap-1">
            <span>
              <FaRegCheckCircle />
            </span>
            No account needed to apply
          </p>
          <p className="flex items-center gap-1">
            <span>
              <FaRegCheckCircle />
            </span>
            CV upload up to 10 MB
          </p>
        </div>
      </header>
      <section>
        <div className="flex items-center gap-4 bg-white p-2 h-15">
          <span className="inline-flex items-center">
            <IoIosFunnel />
            TYPE
          </span>
          {JOBTYPE.map((type) => (
            <Button key={type} className={`border border-gray-500 px-4 py-1 rounded-full ${typeFilter === type ? "bg-[#1a481e] text-white" : "bg-gray-200"}`} onClick={() => setTypeFilter(type)}>
              {type}
            </Button>
          ))}
        </div>
      </section>
      <main>
        <div>
          {jobs.length === 0 && !typeFilter ? (
            <NoJobsAvailable />
          ) : filtered.length === 0 && typeFilter ? (
            <NoSearchResults />
          ) : (
            <div className="flex h-[calc(100vh-80px)] gap-3 w-[100%] mt-10 mx-2">
              <aside className="w-[35%] overflow-y-auto divide-y divide-gray-300">
                {filtered.map((job) => (
                  <div key={job.id} className={`${selectedJob?.id === job.id ? "bg-gray-200 border border-gray-300 rounded-lg" : ""} p-2 hover:bg-gray-200`}>
                    <Link href={`/agricultural-employment?job=${job.id}`} scroll={false}>
                      <h3 className="font-semibold">{formatLabel(job.title)}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatLabel(job.city)}, {formatLabel(job.state)}
                      </p>
                      <p className="mt-2 text-sm">{formatLabel(job.employment_type)}</p>
                    </Link>
                  </div>
                ))}
              </aside>

              {/* right side */}
              <section className="overflow-y-auto bg-gray-100 p-2 w-[65%]">
                {selectedJob && (
                  <>
                    <div className="sticky top-0 bg-gray-200 rounded-lg p-4">
                      <h1>{selectedJob.business_name}</h1>
                      <h1 className="text-3xl font-bold">{selectedJob.title}</h1>
                      <p className="mt-2 text-muted-foreground">
                        {selectedJob.city}, {selectedJob.state}
                      </p>
                    </div>

                    <section className="mt-8">
                      <h2 className="font-semibold">Description</h2>

                      <p className="mt-3 whitespace-pre-wrap">{selectedJob.description}</p>
                    </section>

                    <section className="mt-8">
                      <h2 className="font-semibold">Requirements</h2>

                      <p className="mt-3 whitespace-pre-wrap">{selectedJob.requirements}</p>
                    </section>

                    <section className="mt-8">
                      <h2 className="font-semibold">Benefits</h2>

                      <p className="mt-3 whitespace-pre-wrap">{selectedJob.benefits}</p>
                    </section>

                    <Button className="mt-10 rounded-lg bg-(--greenish-color) text-white cursor-pointer hover:bg-(--dark-green-color) transition-colors px-5 py-3" onClick={() => router.push(`/agricultural-employment/${selectedJob.id}/apply`)}>
                      Apply Now
                    </Button>
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
