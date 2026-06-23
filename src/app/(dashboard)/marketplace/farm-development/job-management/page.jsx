import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/app/(dashboard)/dashboard/components/jobs/Jobspage";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  const role = session?.role?.replace(/\s+/g, "-");
  return <JobsPage createHref="/marketplace/farm-development/job-management/create" role={role} />;
}
