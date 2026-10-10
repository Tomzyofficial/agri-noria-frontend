import { verifyVendorSession } from "@/actions/session";
import JobsPage from "@/components/dashboard/jobs/Jobspage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "store")) {
      return <Unauthorized />;
   }
   const role = session.role === "farmer" || session.role === "seller" ? "store" : "";
   return <JobsPage createHref="/marketplace/store/job-management/create" role={role} />;
}
