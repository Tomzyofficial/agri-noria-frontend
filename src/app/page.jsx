import { getMarketplaceProducts, getHomeSponsoredProducts } from "@/_lib/data";
import { HomePage } from "@/app/HomePage.jsx";
import { Footer } from "@/components/ui/Footer";
import NavBar from "../components/ui/NavBar/NavBar";
import { headers } from "next/headers";
import { apiUrl } from "@/_lib/api";

// const Campagins = async () => {
//    const headerStore = await headers();
//    const countryCode = headerStore.get("x-user-country");
//    const res = await fetch(apiUrl(`/api/public/campaigns?country=${countryCode}`), {
//       method: "GET",

//    });
//    const body = await res.json();
//    return body;
// }

export default async function Page() {
   const campaigns = await getHomeSponsoredProducts();
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
