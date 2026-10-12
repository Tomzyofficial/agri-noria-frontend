import { apiUrl } from "@/_lib/api";
import NavBar from "@/components/ui/NavBar/NavBar";
import { formatLabel } from "@/utils/otherUtils";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, GraduationCap, MapPin, Users } from "lucide-react";
import Link from "next/link";
// import {formatDate} from
import { notFound } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import Breadcrumbs from "@/components/dashboard/BreadCrumbs";
import { Footer } from "@/components/ui/Footer";

async function getJob(id) {
   const response = await fetch(apiUrl(`/jobs/${encodeURIComponent(id)}`), {
      cache: "no-store",
   });

   if (response.status === 404) return null;
   if (!response.ok) {
      throw new Error(`Failed to fetch job details (${response.status})`);
   }

   const result = await response.json();
   if (!result.success) {
      throw new Error(result.message || "Failed to fetch job details");
   }

   return result.data;
}

function formatDate(value) {
   if (!value) return "Not specified";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return "Not specified";

   return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function formatSalary(job) {
   const hasMinimum = job.salary_min !== null && job.salary_min !== undefined && job.salary_min !== "";
   const hasMaximum = job.salary_max !== null && job.salary_max !== undefined && job.salary_max !== "";

   if (!hasMinimum && !hasMaximum) return "Salary not disclosed";

   const range = hasMinimum && hasMaximum ? `${formatPrice(job.salary_min, job.country_code, job.currency)} - ${formatPrice(job.salary_max, job.country_code, job.currency)}` : hasMinimum ? `From ${formatPrice(job.salary_min, job.country_code, job.currency)}` : `Up to ${formatPrice(job.salary_max, job.country_code, job.currency)}`;

   return job.salary_type ? `${range} / ${formatLabel(job.salary_type)}` : range;
}

function DetailItem({ label, value }) {
   return (
      <div className="space-y-1">
         <dt className="text-sm text-muted-foreground">{label}</dt>
         <dd className="font-medium">{value || "Not specified"}</dd>
      </div>
   );
}

function JobSection({ title, content }) {
   if (!content) return null;

   return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#20241d] md:p-8">
         <h2 className="text-2xl font-semibold">{title}</h2>
         <div className="mt-4 whitespace-pre-wrap leading-7 text-muted-foreground">{content}</div>
      </section>
   );
}

export default async function JobPage({ params }) {
   const { id } = await params;
   const job = await getJob(id);

   if (!job) notFound();

   const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
   const category = job.custom_category || job.category;

   return (
      <>
         <NavBar />
         <main className="min-h-screen pb-16">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
               <Breadcrumbs
                  breadcrumbs={[
                     { label: "Home", href: "/" },
                     { label: "Agricultural Employment", href: "/agricultural-employment" },
                     { label: job.title, href: `/agricultural-employment/${job.id}`, active: true },
                  ]}
               />

               <header className="overflow-hidden rounded-3xl bg-[#173d2b] px-6 py-8 text-white shadow-lg md:px-10 md:py-10">
                  <div className="flex flex-wrap gap-2">
                     {category && <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{formatLabel(category)}</span>}
                     {job.employment_type && <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{formatLabel(job.employment_type)}</span>}
                     {job.location_type && <span className="rounded-full bg-white/15 px-3 py-1 text-sm">{formatLabel(job.location_type)}</span>}
                  </div>

                  <h1 className="mt-5 max-w-4xl text-3xl leading-tight md:text-5xl">{formatLabel(job.title)}</h1>
                  <p className="mt-3 text-lg text-white/80">
                     {formatLabel(job.business_name) || "Employer"}
                     {location ? ` · ${location}` : ""}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/85">
                     <span className="inline-flex items-center gap-2">
                        <MapPin size={17} aria-hidden="true" />
                        {location || "Location not specified"}
                     </span>
                     {job.openings !== null && job.openings !== undefined && (
                        <span className="inline-flex items-center gap-2">
                           <Users size={17} aria-hidden="true" />
                           {job.openings} {Number(job.openings) === 1 ? "opening" : "openings"}
                        </span>
                     )}
                     {job.created_at && (
                        <span className="inline-flex items-center gap-2">
                           <CalendarDays size={17} aria-hidden="true" />
                           Posted {formatDate(job.created_at)}
                        </span>
                     )}
                  </div>
               </header>

               <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
                  <div className="space-y-6">
                     <JobSection title="About the role" content={job.description} />
                     <JobSection title="Responsibilities" content={job.responsibilities} />
                     <JobSection title="Requirements" content={job.requirements} />
                     <JobSection title="Benefits" content={job.benefits} />

                     <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#20241d] md:p-8">
                        <h2 className="text-2xl font-semibold">Job details</h2>
                        <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                           <DetailItem label="Employer" value={job.business_name} />
                           <DetailItem label="Category" value={category ? formatLabel(category) : null} />
                           <DetailItem label="Employment type" value={formatLabel(job.employment_type)} />
                           <DetailItem label="Work arrangement" value={formatLabel(job.location_type)} />
                           <DetailItem label="Location" value={location} />
                           <DetailItem label="Compensation" value={formatSalary(job)} />
                           <DetailItem label="Experience level" value={formatLabel(job.experience_level)} />
                           <DetailItem label="Education level" value={formatLabel(job.education_level)} />
                           <DetailItem label="Application deadline" value={formatDate(job.application_deadline)} />
                        </dl>
                     </section>
                  </div>

                  <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-[#20241d] lg:sticky lg:top-24">
                     <div className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-xl bg-[#edf4e8] text-[#315d32] dark:bg-[#2a3928] dark:text-green-300">
                           <BriefcaseBusiness size={21} aria-hidden="true" />
                        </span>
                        <div>
                           <p className="text-sm text-muted-foreground">Compensation</p>
                           <p className="font-semibold">{formatSalary(job)}</p>
                        </div>
                     </div>

                     <Link
                        href={`/agricultural-employment/${job.id}/apply`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 block rounded-xl bg-[#315d32] px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-[#254a27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315d32]"
                     >
                        Apply for this job
                     </Link>

                     <p className="mt-4 text-center text-sm text-muted-foreground">Applications are submitted directly for this role.</p>

                     <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                           <GraduationCap size={19} className="mt-0.5 shrink-0 text-[#315d32] dark:text-green-300" aria-hidden="true" />
                           <div>
                              <p className="text-sm text-muted-foreground">Education</p>
                              <p className="mt-1 font-medium">{formatLabel(job.education_level)}</p>
                           </div>
                        </div>
                     </div>
                  </aside>
               </div>
            </div>
         </main>
         <Footer />
      </>
   );
}
