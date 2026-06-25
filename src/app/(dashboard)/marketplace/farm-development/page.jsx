import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import DashboardOverview from "./components/DashboardOverview";

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  return <DashboardOverview />;
}
