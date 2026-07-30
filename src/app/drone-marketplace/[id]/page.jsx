import { apiUrl } from "@/_lib/api";
import { ProductInfo } from "../components/sale-component/ProductInfo";
import NavBar from "@/components/ui/NavBar/NavBar";

export default async function Page({ params }) {
   const { id } = await params;
   let productData = null;

   try {
      const res = await fetch(apiUrl(`/api/drone-marketplace/public/listings/${id}`), { cache: 'no-store' });
      if (res.ok) {
         const data = await res.json();
         if (data?.data) {
            productData = data.data;
         }
      }
   } catch (error) {
      console.error("Build fetch error for drone listing:", error);
   }

   if (!productData) {
      return (
         <>
            <NavBar />
            <div className="p-10 text-center text-gray-500">Product not found</div>
         </>
      );
   }

   return (
      <>
         <NavBar />
         <section className="m-4 md:m-10 mb-10 flex flex-col lg:flex-row gap-4">
            <ProductInfo product={productData} />
         </section>
      </>
   );
}
