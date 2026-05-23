import { Suspense } from "react";
import { verifyBuyerSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { BuyerOrdersList } from "../components/BuyerOrdersList";

export const metadata = {
  title: "Logistics Orders",
  description: "Orders assigned to your logistics vehicles",
};

export default async function LogisticsOrdersPage() {
  const session = await verifyBuyerSession();

  if (!session?.authenticated || !session?.buyerId) {
    return <Unauthorized />;
  }

  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-gray-500">Loading orders...</p>
      }
    >
      <BuyerOrdersList />
    </Suspense>
  );
}
