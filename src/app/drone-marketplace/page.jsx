import { apiUrl } from "@/_lib/api";
import { DroneMarketplacePage } from "./components/DroneMarketplacePage";
import NavBar from "@/components/ui/NavBar/NavBar";

export const dynamic = 'force-dynamic';

export default async function Page() {
   let listings = [];
   let total = 0;
   let pageNum = 1;

   try {
      const res = await fetch(apiUrl(`/api/drone-marketplace/public/listings?page=1&limit=12`), { cache: 'no-store' });
      if (res.ok) {
         const data = await res.json();
         if (data?.data) {
            listings = data.data.listings || [];
            total = data.data.total || 0;
            pageNum = data.data.page || 1;
         }
      }
   } catch (error) {
      console.error("Build fetch error for drone marketplace:", error);
   }

   return (
      <>
         <NavBar />
         <DroneMarketplacePage listings={listings} total={total} page={pageNum} />
      </>
   );
}
