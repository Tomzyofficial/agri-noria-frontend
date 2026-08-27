import { TermsOfServicePage } from "./terms-of-service";
import { Footer } from "@/components/ui/Footer";
import NavBar from "@/components/ui/NavBar/NavBar";

export default function Page() {
   return (
      <>
         <NavBar />
         <TermsOfServicePage />
         <Footer />
      </>
   );
}
