import NavBar from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer";
import { HelpCenterPage } from "./help-center";

export default function Page() {
   return (
      <>
         <NavBar />
         <HelpCenterPage />
         <Footer />
      </>
   );
}
