import { apiUrl } from "@/_lib/api";
import { DroneMarketplacePage } from "./components/DroneMarketplacePage";
import NavBar from "@/components/ui/NavBar/NavBar";

export default async function Page() {
   const res = await fetch(apiUrl(`/api/drone-marketplace/public/listings?page=1&limit=12`));
   const data = await res.json();
   return (
      <>
         <NavBar />
         <DroneMarketplacePage listings={data.data.listings} total={data.data.total} page={data.data.page} />
      </>
   );
}
