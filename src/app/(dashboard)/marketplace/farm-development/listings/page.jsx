import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import ListingsPage from "@/app/(dashboard)/marketplace/farm-development/components/ListingsPage";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Service listings",
   description: "Mangge list of vendor curated service listings.",
};

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }

   return <ListingsPage />;
}
