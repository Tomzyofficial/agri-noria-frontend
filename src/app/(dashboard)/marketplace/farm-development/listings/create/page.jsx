import CreateListingForm from "../../components/CreateListingForm";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }
   return <CreateListingForm />;
}
