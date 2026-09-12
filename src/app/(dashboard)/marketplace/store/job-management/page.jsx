import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || (session.role !== "farmer" && session.role !== "seller")) {
      return <Unauthorized />;
   }
   const role = session.role === "farmer" || session.role === "seller" ? "store" : "";
   return <JobsPage createHref="/marketplace/store/job-management/create" role={role} />;
}
