import { StorageFacility } from "@/app/(dashboard)/marketplace/storage-facility/storage-facilities/DashboardStorageFacility";
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
    session.role !== "storage facility" ||
    session.workspace !== "marketplace"
  ) {
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
