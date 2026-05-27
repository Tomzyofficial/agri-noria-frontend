import { Suspense } from "react";
import { verifyBuyerSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { BuyerOverview } from "./components/BuyerOverview";

export const metadata = {
  title: "Buyer Dashboard",
  description: "Overview of your buyer activities",
};

export default async function BuyerDashboardPage() {
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
      <BuyerOverview />
    </Suspense>
  );
}
