import { verifyVendorSession } from "@/actions/session";
import { DashboardOverview } from "@/app/(dashboard)/marketplace/store/DashboardOverview";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Overview",
  description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    (session.role !== "farmer" && session.role !== "seller")
  ) {
    return <Unauthorized />;
  }

  return <DashboardOverview user={session} />;
}
