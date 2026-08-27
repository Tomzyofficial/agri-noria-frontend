import NavBar from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer";
import { ContactUsPage } from "./contact-page";

export default function Page() {
   return (
      <>
         <NavBar />
         <ContactUsPage />
         <Footer />
      </>
   );
}
