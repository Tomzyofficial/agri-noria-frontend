import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { OrdersList } from "@/components/dashboard/orders/OrdersList";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Store Orders",
   description: "Orders assigned to your store",
};

export default async function StoreOrdersPage() {
   const session = await verifyVendorSession();

   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "store")) {
      return <Unauthorized />;
   }

   return <OrdersList />;
}
