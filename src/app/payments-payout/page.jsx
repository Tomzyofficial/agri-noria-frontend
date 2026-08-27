import NavBar from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer";
import { PaymentsPayoutPage } from "./payments-payout";

export default function Page() {
   return (
      <>
         <NavBar />
         <PaymentsPayoutPage />
         <Footer />
      </>
   );
}
