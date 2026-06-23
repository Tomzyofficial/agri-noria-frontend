import { verifyVendorSession, cookieStoreFnc } from "@/actions/session";
import { EditItem } from "@/app/(dashboard)/marketplace/store/components/EditProduct/EditProductForm";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { apiUrl } from "@/_lib/api";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { toast } from "react-toastify";

export const metadata = {
  title: "Edit Item",
  description: "Edit item and make it public for marketplace",
};

export default async function EditProductPage({ params }) {
  const session = await verifyVendorSession();

  if (!session?.authenticated || (session.role !== "farmer" && session.role !== "seller")) {
    return <Unauthorized />;
  }

  const { id } = await params;

  if (!id) {
    return (
      <div className="m-10 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <p>Oops! This product does not exist.</p>
      </div>
    );
  }

  try {
    const cookieHeader = await cookieStoreFnc();
    const res = await fetch(apiUrl(`/api/vendor/products/view-item/${id}`), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      toast.error(`Failed to fetch product details`);
    }
    const product = data?.product;

    if (!product) {
      return (
        <div className="m-10 text-center">
          <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
          <p>Oops! This product does not exist.</p>
        </div>
      );
    }
    return (
      <div className="my-10 lg:my-5">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Products", href: "/marketplace/store/products" },
            {
              label: "Edit Item",
              href: `/marketplace/store/products/edit-item/${id}`,
              active: true,
            },
          ]}
        />
        <EditItem product={product} />
      </div>
    );
  } catch (error) {
    return (
      <div className="m-10 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p>{error.message || "An error occurred while loading the product."}</p>
      </div>
    );
  }
}
