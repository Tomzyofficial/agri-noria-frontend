import { StorageFacility } from "@/app/(dashboard)/marketplace/storage-facility/storage-facilities/DashboardStorageFacility";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export const metadata = {
   title: "Dashboard Product Management",
   description: "Manage your products",
};

export default async function ProductsPage() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "storage")) {
      return <Unauthorized />;
   }

   return (
      <div>
         <div>
            <StorageFacility />
         </div>
      </div>
   );
}
