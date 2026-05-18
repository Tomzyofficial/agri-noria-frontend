import { verifyVendorSession } from "@/actions/session";
import { DashboardOverview } from "@/app/(dashboard)/dashboard/store/DashboardOverview";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
   title: "Dashboard Overview",
   description: "Vendor personalized Dashboard",
};

export default async function Dashboard() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || (session.account_type !== "Farmer" && session.account_type !== "Seller")) {
      return <Unauthorized />;
   }

   return <DashboardOverview user={session} />;
}
