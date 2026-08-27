import { verifyBuyerSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { BuyerOrdersList } from "../components/BuyerOrdersList";

export const metadata = {
   title: "Buyer Orders",
   description: "Orders placed by you",
};

export default async function LogisticsOrdersPage() {
   const session = await verifyBuyerSession();

   if (!session?.authenticated || !session?.buyerId) {
      return <Unauthorized />;
   }

   return <BuyerOrdersList />;
}
