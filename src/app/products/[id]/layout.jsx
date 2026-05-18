import NavBar from "@/components/ui/NavBar/NavBar";
import { apiUrl } from "@/_lib/api";

export async function generateMetadata({ params }) {
   try {
      const resolvedParam = await params;
      const { id } = resolvedParam;

      if (!id) {
         return {
            title: "404 - Page Not Found",
            description: "The requested product could not be found.",
         };
      }

      const res = await fetch(apiUrl(`/api/marketplace/${id}`, { cache: "no-store" }));

      if (!res.ok) {
         return {
            title: "Error ",
            description: "The requested product could not be found.",
         };
      }
      const data = await res.json();
      const product = data || null;

      if (!product) {
         return {
            title: "404 - Product Not Found",
            description: "The requested product could not be found.",
         };
      }

      return {
         title: `${product.listing_name || "Product Details"}`,
         description: product.description || "View product details. High quality farm produce and farm equipment.",
         openGraph: {
            title: product.listing_name || "Product Details",
            description: product.description || "View product details. High quality farm produce and farm equipment.",
            images: product.listing_product_image ? [product.listing_product_image] : [],
            type: "website",
         },
         twitter: {
            card: "summary_large_image",
            title: product.listing_name || "Product Details",
            description: product.description || "View product details. High quality farm produce and farm equipment.",
            images: product.listing_product_image ? [product.listing_product_image] : [],
         },
      };
   } catch {
      return {
         title: "Error",
         description: "An error occurred while loading the product details.",
      };
   }
}

export default function ProductLayout({ children }) {
   return (
      <>
         <NavBar />
         <main>{children}</main>
      </>
   );
}
