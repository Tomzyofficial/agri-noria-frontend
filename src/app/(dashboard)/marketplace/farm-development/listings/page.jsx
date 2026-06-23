import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import ListingsPage from "@/app/(dashboard)/marketplace/farm-development/components/ListingsPage";

export const metadata = {
  title: "Service listings",
  description: "Mangge list of vendor curated service listings.",
};

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }

  return <ListingsPage />;
}
