import { DashboardOverview } from "@/app/(dashboard)/marketplace/storage-facility/DashboardOverview";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Overview",
  description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    session.workspace !== "marketplace" ||
    session.role !== "storage facility"
  ) {
    return <Unauthorized />;
  }

  return <DashboardOverview user={session.fname} />;
}
