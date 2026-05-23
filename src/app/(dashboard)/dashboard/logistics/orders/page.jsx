import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { LogisticsOrdersList } from "../components/LogisticsOrdersList";

export const metadata = {
  title: "Logistics Orders",
  description: "Orders assigned to your logistics vehicles",
};

export default async function LogisticsOrdersPage() {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    session.account_type !== "Logistics_Partner"
  ) {
    return <Unauthorized />;
  }

  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-gray-500">Loading orders...</p>
      }
    >
      <LogisticsOrdersList />
    </Suspense>
  );
}
