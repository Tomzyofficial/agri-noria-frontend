import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "storage facility" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   return <JobsPage createHref="/marketplace/store/job-management/create" role={session.role} />;
}
