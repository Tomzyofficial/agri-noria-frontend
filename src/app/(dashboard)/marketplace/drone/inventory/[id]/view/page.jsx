import { verifyVendorSession } from "@/actions/session";
import { ViewListingPage } from "../../../components/ListingView";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { apiUrl } from "@/_lib/api";
import axios from "axios";
import { cookieStoreFnc } from "@/actions/session";

export default async function Page({ params }) {
   const cookieHeader = await cookieStoreFnc();
   const session = await verifyVendorSession();
   if (!session.authenticated || session.workspace !== "marketplace" || session.role !== "drone") {
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
