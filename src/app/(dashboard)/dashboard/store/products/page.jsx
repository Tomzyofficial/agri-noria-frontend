import { ProductManagement } from "@/app/(dashboard)/dashboard/store/products/DashboardProductManagement";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
   title: "Dashboard Product Management",
   description: "Manage your products",
};

export default async function ProductsPage() {
   const session = await verifyVendorSession();
   if (!session?.authenticated || (session.account_type !== "Farmer" && session.account_type !== "Seller")) {
      return <Unauthorized />;
   }

   return (
      <div>
         <ProductManagement user={session} />
      </div>
   );
}
