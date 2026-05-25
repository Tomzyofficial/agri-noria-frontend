import { TrainingPartnerDashboard } from "./DashboardOverView";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "../../dashboard/components/Unauthorized";

export default async function Page() {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    session.workspace !== "marketplace" ||
    session.role !== "trainer"
  ) {
    return <Unauthorized />;
  }

  return <TrainingPartnerDashboard />;
}
