"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { IoIosFunnel } from "react-icons/io";
import Link from "next/link";
import { useState } from "react";
import { NoJobsAvailable } from "./NoJobsAvailable";
import { useSearchParams } from "next/navigation";
import { formatLabel } from "@/utils/otherUtils";
import { FaBriefcase } from "react-icons/fa";
import { Landmark, Share2 } from "lucide-react";
import { NoSearchResults } from "./NoSearchResult";
import { Footer } from "@/components/ui/Footer";

export function JobsPageClient({ jobs }) {
   const [typeFilter, setTypeFilter] = useState("All");
   const JOBTYPE = ["All", "Full Time", "Part Time", "Contract", "Internship"];

   const filtered = jobs.filter((c) => {
      const matchesType = typeFilter === "All" || c.employment_type.toLowerCase().includes(typeFilter.toLowerCase());
      return matchesType;
   });

   return (
      <>
         <header className="text-start px-4 mt-12 text-foreground md:px-8 md:mt-25">
            <span className="border dark:border-gray-200 border-gray-700 uppercase leading-6 p-2 rounded-full text-[10px] md:text-[16px]">Jobs across the value chain</span>
            <div className="py-5">
               <h1 className="text-3xl md:text-5xl">
                  Work the land. <span className="text-(--greenish-color)">Move the harvest.</span>
               </h1>
               <p className="text-lg md:text-xl md:max-w-3xl md:text-2xl">Verified roles posted directly by farmers, cooperatives, sellers and distributors. Apply in minutes with your CV — no account required.</p>
            </div>
            <form className="grid grid-cols-2 md:grid-cols-3 max-w-full job-search-form md:max-w-5xl">
               <div className="relative h-10">
                  <IoSearch className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <Input name="search" type="search" placeholder="Search title, category, or employer" className="rounded-l-full w-full h-full pl-8 pr-3 border border-gray-700 dark:border-gray-100 outline-none" />
               </div>
               <div className="relative h-10">
                  <FaLocationDot className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input name="location" type="search" placeholder="City, state, country" className="w-full h-full pl-8 border border-gray-700 dark:border-gray-100 outline-none rounded-r-full md:rounded-none" />
               </div>
               <Button type="submit" className="mt-2 md:mt-0 hover:bg-(--dark-green-color) hover:text-white transition-colors bg-transparent border border-gray-700 dark:border-gray-100 cursor-pointer text-center text-lg md:rounded-r-full max-w-30 h-10 rounded-lg">
                  Search
               </Button>
            </form>
         </header>
         <section>
            <div className="flex items-center gap-2 p-4 overflow-x-auto">
               <span className="inline-flex items-center">
                  <IoIosFunnel />
                  TYPE
               </span>
               {JOBTYPE.map((type) => (
                  <Button key={type} className={`w-auto shrink-0 whitespace-nowrap rounded-full border border-gray-500 px-2.5 py-1 text-sm ${typeFilter === type ? "bg-[#1a481e] text-white" : "bg-gray-200 dark:bg-(--card-dark)"}`} onClick={() => setTypeFilter(type)}>
                     {type}
                  </Button>
               ))}
            </div>
         </section>
         <main>
            {jobs.length === 0 && !typeFilter ? (
               <NoJobsAvailable />
            ) : filtered.length === 0 && typeFilter ? (
               <NoSearchResults />
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mt-4 md:mt-16 md:p-8">
                  {filtered.map((job) => (
                     <div key={job.id} className={`p-4 rounded-lg border border-gray-400 hover:border-gray-700 transition-colors`}>
                        <div className="flex justify-between items-center">
                           <h3 className="font-semibold">{formatLabel(job.title)}</h3>
                           <span onClick={() => navigator.canShare && navigator.share({ title: job.title, url: `${window.location.origin}/agricultural-employment/${job.id}` })} className="text-sm cursor-pointer flex items-center gap-1">
                              <Share2 />
                           </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                           <p className="bg-gray-400 dark:bg-gray-900 p-1 md:p-2 rounded flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <FaBriefcase /> {formatLabel(job.employment_type)}
                           </p>
                           <p className="bg-gray-400 dark:bg-gray-900 p-1 md:p-2 rounded flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <FaLocationDot /> {formatLabel(job.location_type)}
                           </p>
                           <p className="bg-gray-400 dark:bg-gray-900 p-1 md:p-2 rounded flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Landmark /> {job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : "Salary not disclosed"}
                           </p>
                        </div>

                        <Link href={`/agricultural-employment/${job.id}`} className="mt-4 inline-flex items-center text-sm md:text-md border border-gray-400 dark:border-gray-700 rounded p-2">
                           View job
                        </Link>
                     </div>
                  ))}
               </div>
            )}
         </main>
         <Footer />
      </>
   );
}
