import { verifyVendorSession } from "@/actions/session";
import { AddStorageForm } from "@/app/(dashboard)/marketplace/storage-facility/components/AddStorage/AddStorageForm";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Add New Storage Facility",
  description: "Add new storage facility and make it public for marketplace",
};

export default async function AddProducePage() {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    session.role !== "storage facility" ||
    session.workspace !== "marketplace"
  ) {
    return <Unauthorized />;
  }

  return (
    <div className="my-25 lg:my-5">
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Storage Facilities",
            href: "/marketplace/storage-facility/storage-facilities",
          },

          {
            label: "New storage facility",
            href: "/marketplace/storage-facility/storage-facilities/add-new",
            active: true,
          },
        ]}
      />
      <AddStorageForm />
    </div>
  );
}
