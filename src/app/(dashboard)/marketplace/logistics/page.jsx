import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { LogisticsOverview } from "./components/LogisticsOverview";

export const metadata = {
  title: "Logistics Dashboard",
  description: "Overview of orders assigned to your logistics fleet",
};

export default async function LogisticsDashboardPage() {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    session.workspace !== "marketplace" ||
    session.role !== "logistics"
  ) {
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
