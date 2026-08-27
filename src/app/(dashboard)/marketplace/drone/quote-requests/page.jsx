import { QuoteRequestPage } from "../components/QuoteRequestPage";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export const metadata = {
   title: "Quote Requests",
};
export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "drone" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   return (
      <>
         <QuoteRequestPage />
      </>
   );
}
