import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/app/(dashboard)/dashboard/components/jobs/Jobspage";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "logistics" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }

  return <JobsPage createHref="/marketplace/logistics/job-management/create" role={session.role} />;
}
