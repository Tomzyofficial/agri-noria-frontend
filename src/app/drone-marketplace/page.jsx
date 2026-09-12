import { apiUrl } from "@/_lib/api";
import { getDroneAdCampaigns, utils } from "@/_lib/data";
import { DroneMarketplacePage } from "./components/DroneMarketplacePage";
import NavBar from "@/components/ui/NavBar/NavBar";

export const dynamic = "force-dynamic";

export default async function Page() {
   const { query } = await utils();
   const country = query.includes("?") ? query.replace("?", "&") : "";
   const campaigns = await getDroneAdCampaigns();
   let listings = [];
   let total = 0;
   let error = null;
   let pageNum = 1;

   try {
      const res = await fetch(apiUrl(`/api/drone-marketplace/public/listings?page=1&limit=24&${country}`));
      if (!res.ok) {
         error = "Error";
      } else {
         const data = await res.json();
         if (data?.data) {
            listings = data.data.listings || [];
            total = data.data.total || 0;
            pageNum = data.data.page || 1;
         }
      }
   } catch {
      listings = [];
   }

   // try {
   //    const [res, sponsored] = await Promise.all([fetch(apiUrl(`/api/drone-marketplace/public/listings?page=1&limit=24`), { cache: "no-store" }), getDroneAdCampaigns()]);
   //    if (!res.ok) {
   //       error = "Error";
   //    } else {
   //       const data = await res.json();
   //       if (data?.data) {
   //          listings = data.data.listings || [];
   //          total = data.data.total || 0;
   //          pageNum = data.data.page || 1;
   //       }
   //    }
   //    campaigns = Array.isArray(sponsored) ? sponsored : [];
   // } catch (error) {
   //    console.error("Build fetch error for drone marketplace:", error);
   //    error = "Error";
   // }

   return (
      <>
         <NavBar />
         <DroneMarketplacePage listings={listings} campaigns={campaigns} total={total} page={pageNum} error={error} />
      </>
   );
}
