import { ViewItem } from "@/app/(dashboard)/dashboard/store/products/view-item/[id]/DashboardViewItem";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc, verifyVendorSession } from "@/actions/session";

import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export default async function ViewPage({ params }) {
   const session = await verifyVendorSession();

   if (!session.authenticated || (session.account_type !== "Farmer" && session.account_type !== "Seller")) {
      return <Unauthorized />;
   }
   const { id } = await params;

   if (!id) {
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
            <p>Oops&#33; seems that product doesn&apos;t exist.</p>
         </div>
      );
   }

   try {
      const cookieHeader = await cookieStoreFnc();
      const res = await fetch(apiUrl(`/api/vendor/products/view-item/${id}`), {
         method: "GET",
         cache: "no-store",
         headers: {
            Cookie: cookieHeader,
         },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
         throw new Error(data?.error || `Failed to fetch product details`);
      }

      const prod = data?.product;
      return (
         <div className="my-25 lg:my-5">
            <Breadcrumbs
               breadcrumbs={[
                  { label: "Products", href: "/dashboard/store/products" },
                  { label: "View Item", href: `/dashboard/store/products/view-item/${id}`, active: true },
               ]}
            />
            <ViewItem prod={prod} />
         </div>
      );
   } catch (error) {
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error.message}</p>
         </div>
      );
   }
}
