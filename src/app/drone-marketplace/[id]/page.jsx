import DroneListingDetail from "../components/detail-component/DroneListingDetail";
import { notFound } from "next/navigation";
import { apiUrl } from "@/_lib/api";
import NavBar from "@/components/ui/NavBar/NavBar";

async function getListing(id) {
   const response = await fetch(apiUrl(`/api/drone-marketplace/public/listings/${id}`), {
      cache: "no-store",
   });

   if (response.status === 404) return null;
   if (!response.ok) throw new Error("Couldn't load this listing.");

   return response.json();
}

export default async function ListingPage({ params }) {
   const { id } = await params;
   const listing = await getListing(id);
   if (!listing) notFound();

   return (
      <>
         <NavBar />
         <section className="m-4 md:m-10 mb-10 flex flex-col lg:flex-row gap-4">
            <DroneListingDetail listing={listing?.data} />
         </section>
      </>
   );
}
