import { TrainingPartnerDashboard } from "./DashboardOverView";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "../components/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.account_type !== "Training_Partner") {
      return <Unauthorized />;
   }

   return <TrainingPartnerDashboard />;
}
