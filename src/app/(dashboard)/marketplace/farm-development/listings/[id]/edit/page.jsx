import EditServiceListing from "@/app/(dashboard)/marketplace/farm-development/components/EditServiceListingForm";
import { apiUrl } from "@/_lib/api";
import axios from "axios";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page({ params }) {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }
   const { id } = await params;
   let listing = null;
   try {
      const { data } = await axios.get(apiUrl(`/api/farm-development/listing/${id}`));
      listing = data.data;
   } catch {
      console.error("Error fetching listing");
      return;
   }

   return <EditServiceListing listing={listing} />;
}
