import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import DashboardOverview from "./components/DashboardOverview";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Dashboard Overview",
};

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }
   return <DashboardOverview />;
}
