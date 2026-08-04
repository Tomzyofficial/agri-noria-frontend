import { QuoteRequestPage } from "../components/QuoteRequestPage";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

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
