import NavBar from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SafetyGuidelinesPage } from "./safety-guidelines";

export default function Page() {
   return (
      <>
         <NavBar />
         <SafetyGuidelinesPage />
         <Footer />
      </>
   );
}
