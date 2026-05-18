import { verifyBuyerSession } from "@/actions/session";
import { CheckoutSummaryPage } from "@/app/checkout/summary/components/CheckoutSummaryPage";
import { redirect } from "next/navigation";
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
         return data;
      }
   } catch (error) {
      return { hasItems: false };
   }
}

export default async function Summary() {
   const user = await verifyBuyerSession();

   if (!user?.authenticated && user.account_type !== "Buyer") {
      redirect("/auth/identification/signin?return=/checkout/summary");
   }

   try {
      const result = await getBuyerCheckoutData(user.buyerId);
      // Redirect to cart if no items or error
      if (!result.hasItems) {
         redirect("/cart");
      }

      const { buyer, items, vendors } = result;
      return (
         <>
            <NavBar />
            <CheckoutSummaryPage buyer_id={buyer} cart={items} vendors={vendors} />
         </>
      );
   } catch (err) {
      return redirect("/cart");
   }
}
