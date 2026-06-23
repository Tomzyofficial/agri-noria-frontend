import { Suspense } from "react";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { OrdersList } from "@/app/(dashboard)/dashboard/components/orders/OrdersList";

export const metadata = {
  title: "Logistics Orders",
  description: "Orders assigned to your logistics vehicles",
};

export default async function LogisticsOrdersPage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated || session.workspace !== "marketplace" || (session.role !== "farmer" && session.role !== "seller")) {
    return <Unauthorized />;
  }

  return (
    <Suspense fallback={<p className="p-6 text-center text-gray-500">Loading orders...</p>}>
      <OrdersList />
    </Suspense>
  );
}
