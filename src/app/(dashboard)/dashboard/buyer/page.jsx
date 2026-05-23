import { Suspense } from "react";
import { verifyBuyerSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { LogisticsOverview } from "./components/BuyerOverview";

export const metadata = {
  title: "Logistics Dashboard",
  description: "Overview of orders assigned to your logistics fleet",
};

export default async function LogisticsDashboardPage() {
  const session = await verifyBuyerSession();
  if (!session?.authenticated || !session?.buyerId) {
    return <Unauthorized />;
  }

  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-gray-500">Loading overview...</p>
      }
    >
      <LogisticsOverview />
    </Suspense>
  );
}
