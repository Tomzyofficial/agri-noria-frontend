import { getMarketplaceProducts, getHomeAdCampaigns } from "@/_lib/data";
import { HomePage } from "@/app/HomePage.jsx";
import { Footer } from "@/components/ui/Footer";
import NavBar from "../components/ui/NavBar/NavBar";

export default async function Page() {
   const campaigns = await getHomeAdCampaigns();
   let marketplace = [];
   let error = null;

   try {
      const data = await getMarketplaceProducts();
      if (data?.error) {
         error = data.error;
      } else if (Array.isArray(data) && data.length > 0) {
         marketplace = data;
      } else {
         marketplace = [];
      }
   } catch {
      marketplace = [];
   }

   return (
      <>
         <NavBar />
         <HomePage marketPlace={marketplace} error={error} campaigns={campaigns} campaignError={campaigns?.error} />
         <Footer />
      </>
   );
}
