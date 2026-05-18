import { ViewItem } from "./DashboardViewItem";
import { apiUrl } from "@/_lib/api";
import { verifyVendorSession } from "@/actions/session";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { cookieStoreFnc } from "@/actions/session";

export default async function ViewPage({ params }) {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.account_type !== "Storage_Facility") {
      return <Unauthorized />;
   }

   const resolved = await params;
   const id = resolved.id;

   if (!id) {
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Storage Facility Not Found</h2>
            <p>Oops! It seems that storage facility doesn't exist.</p>
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
         throw new Error(data.error);
      }

      const storage = data.storage;

      if (!storage) {
         return (
            <div className="m-10 text-center">
               <h2 className="text-xl font-bold mb-4">Storage Not Found</h2>
               <p>Oops&#33; seems that storage doesn&apos;t exist.</p>
            </div>
         );
      }

      return (
         <div className="my-25 lg:my-5">
            <Breadcrumbs
               breadcrumbs={[
                  { label: "Storage Facilities", href: "/dashboard/sub-store/storage-facilities" },
                  {
                     label: "View Facility",
                     href: `/dashboard/sub-store/storage-facilities/view/${id}`,
                     active: true,
                  },
               ]}
            />
            <ViewItem storage={storage} />
         </div>
      );
   } catch (error) {
      console.error("Error in ViewPage:", error);
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error.message || "An error occurred while loading the storage facility."}</p>
         </div>
      );
   }
}
