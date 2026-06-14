import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { LogisticsShipmentsList } from "../components/LogisticsShipmentsList";

export const metadata = {
  title: "Shipment Management",
  description: "Start and manage logistics shipments",
};

export default async function ShipmentPage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated || session.role !== "Logistics_Partner") {
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
