import JobApplicantsPage from "@/components/dashboard/jobs/applicantpage.jsx";

import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import Breadcrumbs from "@/components/dashboard/BreadCrumbs";

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
   if (!session?.authenticated || session.role !== "drone" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   const { jobId } = await params;
   const data = await getData(jobId);
   return (
      <>
         {/* <Breadcrumbs
            breadcrumbs={[
               { label: "Jobs Management", href: "/marketplace/drone/job-management" },

               {
                  label: "Applicants",
                  href: "/marketplace/drone/job-management/create",
                  active: true,
               },
            ]}
         /> */}
         <JobApplicantsPage data={data} />
      </>
   );
}
