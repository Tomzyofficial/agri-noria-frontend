import { DashboardOverview } from "./components/DashboardOverView";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "../../../../components/dashboard/Unauthorized";

export default async function Page() {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.workspace !== "marketplace" || session.role !== "trainer") {
      return <Unauthorized />;
   }

   return <DashboardOverview />;
}
