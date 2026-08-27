import CreateListingForm from "../../components/CreateListingForm";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";

export default async function Page() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }
   return <CreateListingForm />;
}
