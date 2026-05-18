import { DashboardOverview } from "@/app/(dashboard)/dashboard/sub-store/DashboardOverview";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
   title: "Dashboard Overview",
   description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.account_type !== "Storage_Facility") {
      return <Unauthorized />;
   }

   return <DashboardOverview user={session.fname} />;
}
