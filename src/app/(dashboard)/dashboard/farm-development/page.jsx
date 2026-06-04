import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { FarmDevelopmentDashboardOverview } from "./FarmDevelopmentDashboardOverview";

export const metadata = {
  title: "Farm Development Dashboard",
  description: "Vendor dashboard for farm development services.",
};

export default async function FarmDevelopmentPage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated) {
    return <Unauthorized />;
  }

  return <FarmDevelopmentDashboardOverview user={session} />;
}
