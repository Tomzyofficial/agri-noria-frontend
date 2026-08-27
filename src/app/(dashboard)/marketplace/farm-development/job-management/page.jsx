import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   const role = session?.role?.replace(/\s+/g, "-");
   return <JobsPage createHref="/marketplace/farm-development/job-management/create" role={role} />;
}
