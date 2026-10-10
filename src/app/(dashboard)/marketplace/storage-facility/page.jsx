import { DashboardOverview } from "@/app/(dashboard)/marketplace/storage-facility/components/DashboardOverview";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Dashboard Overview",
   description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "storage")) {
      return <Unauthorized />;
   }

   return <DashboardOverview user={session.fname} />;
}
