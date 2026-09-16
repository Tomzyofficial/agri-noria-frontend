"use client";
import { Button } from "@/components/ui/Button";
import { formatDate, formatLabel } from "@/utils/otherUtils";
import Link from "next/link";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

const thStyle = "p-3 font-medium text-gray-600 text-sm";
export default function JobApplicantsPage({ data }) {
   const [selectedApplicant, setSelectedApplicant] = useState(null);
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold">Interested Applicants</h1>

            <p className="text-foreground">Review and manage job applications.</p>
         </div>

         <div className="rounded-xl border overflow-x-auto">
            <table className="w-full border-collapse table-auto">
               <thead>
                  <tr className="border-b text-left bg-gray-50">
                     <th className={thStyle}>Full name</th>
                     <th className={thStyle}>Email</th>
                     {/* <th className={thStyle}>Phone</th> */}
                     {/* <th className={thStyle}>Location</th> */}
                     {/* <th className={thStyle}>Experience level</th> */}
                     <th className={thStyle}>Applied Date</th>
                     <th className={thStyle}>Status</th>
                     <th className={thStyle}>Actions</th>
                  </tr>
               </thead>

               {data.length === 0 && (
                  <tbody>
                     <tr>
                        <td colSpan={12} className="p-8 text-center text-gray-400 text-sm">
                           No applicants yet
                        </td>
                     </tr>
                  </tbody>
               )}

               {data.length > 0 && (
                  <tbody className="divide-y divide-gray-100">
                     {data.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
                           <td className="p-2 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold uppercase">{applicant.full_name?.charAt(0) || "?"}</div>
                                 <span className="text-gray-600">{formatLabel(applicant.full_name)}</span>
                              </div>
                           </td>
                           <td className="p-2 text-gray-600 whitespace-nowrap">{applicant.email}</td>
                           <td className="p-2 text-gray-500 text-sm whitespace-nowrap">{formatDate(applicant.created_at)}</td>
                           <td className="p-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicant.status === "approved" ? "bg-green-50 text-green-700" : applicant.status === "rejected" ? "bg-red-50 text-red-700" : applicant.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-gray-300 text-gray-500"}`}>
                                 {formatLabel(applicant.status)}
                              </span>
                           </td>
                           <td className="p-4 whitespace-nowrap">
                              <Link target="_blank" href={applicant.cv_file} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                                 Download CV
                              </Link>
                              <Button className="text-gray-500 hover:text-gray-600 ml-2 text-sm bg-gray-300 p-1 rounded-full" onClick={() => setSelectedApplicant(applicant)}>
                                 View more
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               )}
            </table>
         </div>
         {selectedApplicant && (
            <div className={`transform w-full md:w-[400px] max-h-screen overflow-y-auto p-4 bg-background rounded-lg border border-slate-700 shadow-md right-0 top-0 z-1 fixed overflow-y-auto`}>
               <div className="overflow-y-auto pb-10 space-y-10">
                  <Button className="flex place-self-start bg-gray-100 dark:bg-gray-700 p-2 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedApplicant(null)}>
                     <IoClose size={18} />
                  </Button>
                  <div>
                     <h2 className="text-lg font-semibold mb-2">Applicant Fullname: {selectedApplicant.full_name}</h2>
                     <p>Email: {selectedApplicant.email}</p>
                     <p>Phone: {selectedApplicant.phone}</p>
                     <p>State: {formatLabel(selectedApplicant.state)}</p>
                     <p>City: {formatLabel(selectedApplicant.city)}</p>
                     <p>Created At: {formatDate(selectedApplicant.created_at)}</p>
                     <p>Status: {formatLabel(selectedApplicant.status)}</p>
                     <p>Experience Level: {formatLabel(selectedApplicant.experience_level)}</p>
                     <p>Education Level: {formatLabel(selectedApplicant.education_level)}</p>
                     <p className="whitespace-pre-wrap">Cover Letter: {selectedApplicant.cover_letter}</p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
