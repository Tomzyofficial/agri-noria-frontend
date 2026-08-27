import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "logistics" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }

   return <JobsPage createHref="/marketplace/logistics/job-management/create" role={session.role} />;
}
