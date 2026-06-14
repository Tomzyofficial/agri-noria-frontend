import { VehicleManagement } from "./DashboardVehicleMngmennt";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Vehicle Management",
  description: "Manage your products",
};

export default async function ProductsPage() {
  const session = await verifyVendorSession();
  if (!session?.authenticated && session.role !== "Logistics_Partner") {
    return <Unauthorized />;
  }

  return (
    <div>
      <VehicleManagement />
    </div>
  );
}
