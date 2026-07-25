import { verifyBuyerSession } from "@/actions/session";
import { CheckoutSummaryPage } from "@/app/checkout/summary/components/CheckoutSummaryPage";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import NavBar from "@/app/checkout/summary/components/NavBar";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";

async function getBuyerCheckoutData(buyerId) {
   const cookieHeader = await cookieStoreFnc();
   try {
      const res = await fetch(apiUrl("api/summary/checkout"), {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
         },
         body: JSON.stringify({ buyerId }),
      });

      const data = await res.json();

      if (res.ok) {
         return { data };
      }
   } catch (error) {
      return { data: null };
   }
}

export default async function Summary() {
   const user = await verifyBuyerSession();

   if (!user?.authenticated) {
      redirect("/auth/identification/signin?return=/checkout/summary");
   }

   try {
      const result = await getBuyerCheckoutData(user.buyerId);
      if (!result.data.hasItems) {
         redirect("/cart");
      }

      const { buyer, items, vendors } = result.data;

      return (
         <>
            <NavBar />
            <Suspense fallback={<p className="p-6 text-center">Loading checkout...</p>}>
               <CheckoutSummaryPage buyer={buyer} cart={items} vendors={vendors} />
            </Suspense>
         </>
      );
   } catch (err) {
      return redirect("/cart");
   }
}
