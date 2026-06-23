import axios from "axios";
import { apiUrl } from "@/_lib/api";
import ViewPortfolioPage from "@/app/(dashboard)/marketplace/farm-development/components/viewPortfolioPage";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { verifyVendorSession } from "@/actions/session";

export default async function Page({ params }) {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  const { id } = await params;
  let project = null;

  try {
    const { data } = await axios.get(apiUrl(`/api/farm-development/portfolio/${id}`));
    project = data.data;
  } catch {}

  return <ViewPortfolioPage project={project} />;
}
