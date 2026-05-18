import StoragePage from "@/app/(subsidiaries)/(storage)/storage/storage";
import NavBar from "@/app/(subsidiaries)/components/ui/Navbar";
import { getMarketplaceListedStorage } from "@/_lib/data";

export const metadata = {
   title: "Storage",
   description:
      "Storage facilities for agricultural products and all kinds of business needs. You can book with us today!",
};
export default async function Page() {
   const response = await getMarketplaceListedStorage();
   const storage = response?.error ? [] : response || [];
   const error = response?.error || null;
   return (
      <>
         <NavBar />
         <StoragePage storage={storage} error={error} />
      </>
   );
}
