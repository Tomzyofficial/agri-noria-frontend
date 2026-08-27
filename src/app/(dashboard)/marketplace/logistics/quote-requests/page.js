import { QuoteRequestPage } from "../components/QuoteRequestPage";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "logistics" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   return (
      <>
         <QuoteRequestPage />
      </>
   );
}
