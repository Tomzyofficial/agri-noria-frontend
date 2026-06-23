import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import PortfolioOverview from "@/app/(dashboard)/marketplace/farm-development/components/PortfolioOverview";

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }

  return <PortfolioOverview />;
}
