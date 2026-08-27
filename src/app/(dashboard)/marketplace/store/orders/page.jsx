import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { OrdersList } from "@/components/dashboard/orders/OrdersList";

export const metadata = {
   title: "Logistics Orders",
   description: "Orders assigned to your logistics vehicles",
};

export default async function LogisticsOrdersPage() {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.workspace !== "marketplace" || (session.role !== "farmer" && session.role !== "seller")) {
      return <Unauthorized />;
   }

   return <OrdersList />;
}
