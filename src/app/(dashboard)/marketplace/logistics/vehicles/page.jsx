import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { VehicleManagement } from "../components/DashboardVehicleMngment";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Dashboard Vehicle Management",
   description: "Manage your products",
};

export default async function ProductsPage() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "logistics")) {
      return <Unauthorized />;
   }

   return (
      <div>
         <VehicleManagement />
      </div>
   );
}
