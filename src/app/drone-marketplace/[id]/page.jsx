import { apiUrl } from "@/_lib/api";
import { ProductInfo } from "../components/sale-component/ProductInfo";
import NavBar from "@/components/ui/NavBar/NavBar";

export default async function Page({ params }) {
   const { id } = await params;
   console.log("from client", id);
   const res = await fetch(apiUrl(`/api/drone-marketplace/public/listings/${id}`));
   if (!res.ok) {
      console.log("Error");
   }
   {
      /* {data.data.listing_type === "sale" ? <p>Sale</p> : data.data.listing_type === "rent" ? <p>rent</p> : <p>both</p>} */
   }
   const data = await res.json();
   return (
      <>
         <NavBar />
         <section className="m-4 md:m-10 mb-10 flex flex-col lg:flex-row gap-4">
            <ProductInfo product={data.data} />
         </section>
      </>
   );
}
