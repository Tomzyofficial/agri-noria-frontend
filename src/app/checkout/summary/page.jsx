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
            Cookie: cookieHeader,
         },
         body: JSON.stringify({ buyerId }),
      });

      const data = await res.json();

      if (!res.ok) {
         return {
            success: false,
            data: null,
         };
      }

      return {
         success: true,
         data,
      };
   } catch (error) {
      return { data: null };
   }
}

export default async function Summary() {
   const session = await verifyBuyerSession();

   if (!session.authenticated) {
      console.log("false redirecting");
      redirect("/auth/identification/signin?return=/checkout/summary");
   }

   try {
      const result = await getBuyerCheckoutData(session.buyerId);
      if (!result.data.hasItems) {
         redirect("/cart");
      }

      const { buyer, vendors } = result.data;

      const cart = vendors.flatMap((v) => v);

      return (
         <>
            <NavBar />
            <Suspense fallback={<p className="p-6 text-center">Loading checkout...</p>}>
               <CheckoutSummaryPage buyer={buyer} cart={cart} vendors={vendors} />
            </Suspense>
         </>
      );
   } catch {
      return redirect("/cart");
   }
}
