import StorageDetail from "@/app/(subsidiaries)/(storage)/storage/[href]/storage-details";
import NavBar from "@/app/(subsidiaries)/components/ui/Navbar";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";

export const metadata = {
   title: "Storage Details",
   description: "View details of storage facility",
};

export default async function Page({ params }) {
   const cookieHeader = await cookieStoreFnc();
   const { href } = await params;
   let data;
   let error;
   try {
      const res = await fetch(apiUrl(`/api/marketplace/listed-storage/${href}`), {
         method: "GET",
         headers: {
            Cookie: cookieHeader,
         },
      });

      if (!res.ok) {
         error = "Failed to fetch storage";
      }

      data = await res.json();
   } catch {}
   const storage = data.storage;

   return (
      <>
         <NavBar />
         <StorageDetail storage={storage} error={error} />
      </>
   );
}
