import { verifyVendorSession } from "@/actions/session";
import { AddProductForm } from "@/app/(dashboard)/marketplace/store/components/AddProduct/AddProductForm";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Add New Product",
  description: "Add new product and make it public for marketplace",
};

export default async function AddProducePage() {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    (session.role !== "farmer" && session.role !== "seller")
  ) {
    return <Unauthorized />;
  }

  return (
    <div className="my-25 lg:my-5">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Products", href: "/marketplace/store/products" },

          {
            label: "Create new listing",
            href: "/marketplace/store/products/add-new",
            active: true,
          },
        ]}
      />
      <AddProductForm user={{ account_type: session.account_type }} />
    </div>
  );
}
