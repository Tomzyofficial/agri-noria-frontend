import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import PortfolioOverview from "@/app/(dashboard)/marketplace/farm-development/components/PortfolioOverview";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }

   return <PortfolioOverview />;
}
