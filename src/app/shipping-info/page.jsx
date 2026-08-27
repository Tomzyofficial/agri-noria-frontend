import { ShippingInfoPage } from "./shipping-info";
import NavBar from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer";

export default function Page() {
   return (
      <>
         <NavBar />
         <ShippingInfoPage />
         <Footer />
      </>
   );
}
