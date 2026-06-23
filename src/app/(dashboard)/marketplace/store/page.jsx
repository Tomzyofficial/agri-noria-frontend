import { verifyVendorSession } from "@/actions/session";
import { DashboardOverview } from "./components/DashboardOverview";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Overview",
  description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.workspace !== "marketplace" || (session.role !== "farmer" && session.role !== "seller")) {
    return <Unauthorized />;
  }

  return <DashboardOverview user={session} />;
}
