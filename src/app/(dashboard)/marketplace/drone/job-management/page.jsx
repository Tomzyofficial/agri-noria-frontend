import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "drone")) {
      return <Unauthorized />;
   }

   return (
      <>
         <JobsPage createHref="/marketplace/drone/job-management/create" role={session.role} />;
      </>
   );
}
