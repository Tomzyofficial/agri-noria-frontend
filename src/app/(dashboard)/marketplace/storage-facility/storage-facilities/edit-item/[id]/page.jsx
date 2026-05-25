import { cookieStoreFnc, verifyVendorSession } from "@/actions/session";
import { EditItem } from "@/app/(dashboard)/marketplace/storage-facility/components/EditStorageForm/EditStorageForm";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { apiUrl } from "@/_lib/api";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { toast } from "react-toastify";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Item",
  description: "Edit item and make it public for marketplace",
};

export default async function EditProductPage({ params }) {
  const session = await verifyVendorSession();

  if (
    !session?.authenticated ||
    session.role !== "storage facility" ||
    session.workspace !== "marketplace"
  ) {
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
    const res = await fetch(apiUrl(`/api/vendor/storage/view-item/${id}`), {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error || `Failed to fetch product details`);
    }
    const storage = data?.storage;

    if (!storage) {
      return (
        <div className="m-10 text-center">
          <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
          <p>Oops! This product does not exist.</p>
        </div>
      );
    }

    // Render page
    return (
      <div className="my-10 lg:my-5">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: "Storage Facilities",
              href: "/marketplace/storage-facility/storage-facilities",
            },
            {
              label: "Edit Item",
              href: `/marketplace/storage-facility/storage-facilities/edit-item/${id}`,
              active: true,
            },
          ]}
        />
        <EditItem storage={storage} />
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
