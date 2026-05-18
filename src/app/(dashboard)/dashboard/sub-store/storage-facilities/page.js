import { StorageFacility } from "@/app/(dashboard)/dashboard/sub-store/storage-facilities/DashboardStorageFacility";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
   title: "Dashboard Product Management",
   description: "Manage your products",
};

export default async function ProductsPage() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || session.account_type !== "Storage_Facility") {
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
