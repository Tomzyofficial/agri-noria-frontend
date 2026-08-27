import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { LogisticsOrdersList } from "../components/LogisticsOrdersList";

export const metadata = {
   title: "Logistics Orders",
   description: "Orders assigned to your logistics vehicles",
};

export default async function OrdersPage() {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.role !== "logistics" || session.workspace !== "marketplace") {
      return <Unauthorized />;
   }

   return <LogisticsOrdersList />;
}
