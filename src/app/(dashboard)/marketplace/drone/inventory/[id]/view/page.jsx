import { verifyVendorSession } from "@/actions/session";
import { ViewListingPage } from "../../../components/ListingView";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { apiUrl } from "@/_lib/api";
import axios from "axios";
import { cookieStoreFnc } from "@/actions/session";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page({ params }) {
   const cookieHeader = await cookieStoreFnc();
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "drone")) {
      return <Unauthorized />;
   }

   const { id } = await params;

   const res = await axios.get(apiUrl(`/api/vendor/drone/get-inventory/${id}`), {
      headers: {
         Cookie: cookieHeader,
      },
   });

   return <ViewListingPage listing={res.data.data} />;
}
