import JobApplicantsPage from "@/app/(dashboard)/dashboard/components/jobs/applicantpage";

import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

async function getData(jobId) {
  const cookieHeader = await cookieStoreFnc();

  const res = await fetch(apiUrl(`/api/vendor/jobs/get-applicants/${jobId}`), {
    headers: {
      Cookie: cookieHeader,
    },
  });
  if (!res.ok) {
    console.log("Failed to fetch applicants");
  } else {
    const data = await res.json();
    return data.data;
  }
}
export default async function page({ params }) {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "storage facility" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  const { jobId } = await params;
  const data = await getData(jobId);
  return <JobApplicantsPage data={data} />;
}
