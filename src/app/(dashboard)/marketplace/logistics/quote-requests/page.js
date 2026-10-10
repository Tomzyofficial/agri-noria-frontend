import { QuoteRequestPage } from "../components/QuoteRequestPage";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "logistics")) {
      return <Unauthorized />;
   }
   return (
      <>
         <QuoteRequestPage />
      </>
   );
}
