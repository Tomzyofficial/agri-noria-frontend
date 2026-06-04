import BillingPage from "@/app/(dashboard)/dashboard/components/Billing/BillingPage";
import { verifyVendorSession } from "@/actions/session";
import { apiUrl } from "@/_lib/api";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Dashboard Billing",
  description: "Billing page. This page is used to manage billing information",
};

export async function GetPlans() {
  const res = await fetch(apiUrl("api/vendor/subscription/plans"), {
    method: "GET",
    cache: "force-cache",
  });

  if (!res.ok) {
    console.error("Failed to fetch plans", res);
    return null;
  }

  const plans = await res.json();
  return plans.data;
}

export default async function Page() {
  const session = await verifyVendorSession();
  if (
    !session?.authenticated ||
    (session.role !== "farmer" && session.role !== "seller")
  ) {
    return <Unauthorized />;
  }

  const plans = await GetPlans();
  return (
    <div className="my-25 lg:my-5">
      <h1 className="mb-6 text-xl md:text-2xl text-(--foreground)">
        Manage Billing
      </h1>
      <BillingPage
        plans={plans}
        user={{
          email: session.email,
          userid: session.userId,
        }}
      />
    </div>
  );
}
