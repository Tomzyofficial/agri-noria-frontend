import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { verifyVendorSession } from "@/actions/session";
import CreatePortfolioPage from "@/app/(dashboard)/marketplace/farm-development/components/CreatePortfolioForm";

export default async function Page() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  return <CreatePortfolioPage />;
}
