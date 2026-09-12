import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
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

   return <LogisticsShipmentsList />;
}
