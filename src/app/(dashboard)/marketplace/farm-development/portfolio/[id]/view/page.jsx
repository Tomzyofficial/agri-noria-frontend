import axios from "axios";
import { apiUrl } from "@/_lib/api";
import ViewPortfolioPage from "@/app/(dashboard)/marketplace/farm-development/components/viewPortfolioPage";
import { Unauthorized } from "@/components/dashboard/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import { isAllowedMarketplaceRole } from "@/utils/roleHelper";

export default async function Page({ params }) {
   const session = await verifyVendorSession();
   if (!session?.authenticated || !isAllowedMarketplaceRole(session.role, "farm development")) {
      return <Unauthorized />;
   }
   const { id } = await params;
   let project = null;

   try {
      const { data } = await axios.get(apiUrl(`/api/farm-development/portfolio/${id}`));
      project = data.data;
   } catch {}

   return <ViewPortfolioPage project={project} />;
}
