import { ProductManagement } from "@/app/(dashboard)/marketplace/store/products/DashboardProductManagement";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Product Management",
  description: "Manage your products",
};

export default async function ProductsPage() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    (session.role !== "farmer" && session.role !== "seller")
  ) {
    return <Unauthorized />;
  }

  return (
    <div>
      <ProductManagement user={session} />
    </div>
  );
}
