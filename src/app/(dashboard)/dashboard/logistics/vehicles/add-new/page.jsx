import { verifyVendorSession } from "@/actions/session";
import { VehicleForm } from "@/app/(dashboard)/dashboard/logistics/components/VehicleForm";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Add New Vehicle",
  description: "Add new vehicle and make it public for marketplace",
};

export default async function AddNewVehiclePage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated && session.account_type !== "Logistics_Partner") {
    return <Unauthorized />;
  }

  return (
    <div className="my-25 lg:my-5">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Vehicles", href: "/dashboard/logistics/vehicles" },

          {
            label: "Add new vehicle",
            href: "/dashboard/logistics/vehicles/add-new",
            active: true,
          },
        ]}
      />
      <VehicleForm />
    </div>
  );
}
