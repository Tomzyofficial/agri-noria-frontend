import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { InventoryManagement } from "../../../dashboard/components/InventoryManagement";

export const metadata = {
   title: "Dashboard Product Management",
   description: "Manage your products",
};

export default async function ProductsPage() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || (session.role !== "farmer" && session.role !== "seller")) {
      return <Unauthorized />;
   }

   return <InventoryManagement inventoryUrl="/api/proxy/vendor/products/listed?page=1&limit=10" deleteUrl="/api/proxy/vendor/products/delete-item" addNewHref="/marketplace/store/products/add-new" viewHref="/marketplace/store/products" editHref="/marketplace/store/products" />;
}
