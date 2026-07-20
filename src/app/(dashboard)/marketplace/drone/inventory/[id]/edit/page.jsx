import { verifyVendorSession, cookieStoreFnc } from "@/actions/session";
import Breadcrumbs from "@/app/(dashboard)/dashboard/components/BreadCrumbs";
import { apiUrl } from "@/_lib/api";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import EditInventoryForm from "../../../components/EditInventoryForm";
import axios from "axios";

export const metadata = {
   title: "Edit Drone Listing",
   description: "Edit drone listing in the marketplace",
};

export default async function EditDroneListingPage({ params }) {
   const session = await verifyVendorSession();

   if (!session?.authenticated || session.workspace !== "marketplace" || session.role !== "drone") {
      return <Unauthorized />;
   }

   const { id } = await params;

   if (!id) {
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Listing Not Found</h2>
            <p>This drone listing does not exist.</p>
         </div>
      );
   }

   try {
      const cookieHeader = await cookieStoreFnc();
      const res = await axios.get(apiUrl(`/api/vendor/drone/get-inventory/${id}`), {
         headers: {
            Cookie: cookieHeader,
         },
      });

      const data = res.data?.data;

      if (!data) {
         return (
            <div className="m-10 text-center">
               <h2 className="text-xl font-bold mb-4">Listing Not Found</h2>
               <p>This drone listing does not exist or you do not have permission to edit it.</p>
            </div>
         );
      }

      return (
         <div className="my-10 lg:my-5">
            <Breadcrumbs
               breadcrumbs={[
                  { label: "Inventory", href: "/marketplace/drone/inventory" },
                  {
                     label: "Edit Listing",
                     href: `/marketplace/drone/inventory/${id}/edit`,
                     active: true,
                  },
               ]}
            />
            <EditInventoryForm inventory={data} />
         </div>
      );
   } catch (error) {
      return (
         <div className="m-10 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error.message || "An error occurred while loading the listing."}</p>
         </div>
      );
   }
}
