/************* Imports ***********/
import { redirect } from "next/navigation";
import { verifyBuyerSession } from "@/actions/session";
import { BuyerDashboardOverview } from "@/app/(dashboard)/buyer/components/BuyerDashboardOverview";
export default async function BuyerDashboard() {
   const user = await verifyBuyerSession();
   if (!user || !user.authenticated) {
      redirect("/");
   }

   return (
      <main>
         <BuyerDashboardOverview user={user} />
      </main>
   );
}
