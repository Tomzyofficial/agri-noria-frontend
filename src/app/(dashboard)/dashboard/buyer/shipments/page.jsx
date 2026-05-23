import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { LogisticsShipmentsList } from "../components/BuyerShipmentsList";

export const metadata = {
  title: "Logistics Shipments",
  description: "Manage accepted orders and start delivery",
};

export default async function LogisticsShipmentsPage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated || session.account_type !== "Logistics_Partner") {
    return <Unauthorized />;
  }

  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-gray-500">Loading shipments...</p>
      }
    >
      <LogisticsShipmentsList />
    </Suspense>
  );
}
