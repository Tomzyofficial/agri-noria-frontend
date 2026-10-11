import { DashboardOverview } from "@/app/(dashboard)/marketplace/storage/components/DashboardOverview";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";

export const metadata = {
   title: "Dashboard Overview",
   description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.workspace !== "marketplace" || session.role !== "storage") {
      return <Unauthorized />;
   }

   return <DashboardOverview user={session.fname} />;
}
