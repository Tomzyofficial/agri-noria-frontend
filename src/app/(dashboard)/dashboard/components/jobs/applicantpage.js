"use client";
import { Button } from "@/components/ui/Button";
import { formatDate, formatLabel } from "@/utils/otherUtils";
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
              <th className={thStyle}>Phone</th>
              <th className={thStyle}>Location</th>
              <th className={thStyle}>Experience level</th>
              <th className={thStyle}>Educational Level</th>
              <th className={thStyle}>Cover letter</th>
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold uppercase">{applicant.full_name?.charAt(0) || "?"}</div>
                      <span className="text-gray-600">{formatLabel(applicant.full_name)}</span>
                    </div>
                  </td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{applicant.email}</td>
                  <td className="p-2 text-gray-600 font-mono text-sm whitespace-nowrap">{applicant.phone}</td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">
                    {formatLabel(applicant.state)}, {formatLabel(applicant.country)}
                  </td>
                  <td className="p-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{formatLabel(applicant.experience_level)}</span>
                  </td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{formatLabel(applicant.education_level)}</td>
                  <td className="p-2 text-gray-600 max-w-xs truncate">{applicant.cover_letter}</td>
                  <td className="p-2 text-gray-500 text-sm whitespace-nowrap">{formatDate(applicant.created_at)}</td>
                  <td className="p-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicant.status === "approved" ? "bg-green-50 text-green-700" : applicant.status === "rejected" ? "bg-red-50 text-red-700" : applicant.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {formatLabel(applicant.status)}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <a target="_blank" href={applicant.cv_file} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                      Download CV
                    </a>
                    <Button className="text-gray-400 hover:text-gray-600 ml-2 text-sm bg-gray-100 p-1 rounded-full" onClick={() => setSelectedApplicant(applicant)}>
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
        <div className={`transform max-w-2xl max-h-screen overflow-y-auto -translate-y-70 p-4 border border-gray-300 bg-white rounded-lg right-0 z-10 fixed overflow-y-auto`}>
          <div className="overflow-y-auto pb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold mb-2">Selected Applicant: {selectedApplicant.full_name}</h2>

              <Button className="bg-gray-100 p-2 transition-colors rounded-full hover:bg-gray-200" onClick={() => setSelectedApplicant(null)}>
                <IoClose size={18} />
              </Button>
            </div>
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
      )}
    </div>
  );
}
