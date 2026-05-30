import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ecosystemRoleRoutes = {
  government: "/ecosystem/institution",
  bank: "/ecosystem/institution",
  ngo: "/ecosystem/institution",
  dfi: "/ecosystem/institution",
  "insurance firm": "/ecosystem/institution",
  "commodity board": "/ecosystem/institution",
  finance: "/ecosystem/institution",
  distributor: "/ecosystem/distributor",

  "program director": "/ecosystem/program-management",
  "regional manager": "/ecosystem/program-management",
  "cluster supervisor": "/ecosystem/program-management",

  "field officer": "/ecosystem/field-operations",
  agronomist: "/ecosystem/field-operations",
  inspector: "/ecosystem/field-operations",
  enumerator: "/ecosystem/field-operations",

  farmer: "/ecosystem/farmer",

  exporter: "/ecosystem/buyer-partner",
  "off-taker": "/ecosystem/buyer-partner",
  "warehouse buyer": "/ecosystem/buyer-partner",
  processor: "/ecosystem/buyer-partner",
  "logistics partner": "/ecosystem/buyer-partner",

  aggregator: "/ecosystem/aggregator",

  "sales manager": "/ecosystem/sales-&-distribution",
  "logistics coordinator": "/ecosystem/sales-&-distribution",
  "warehouse supervisor": "/ecosystem/sales-&-distribution",

  "data analyst": "/ecosystem/intelligence-&-monitoring",
  "satellite monitor": "/ecosystem/intelligence-&-monitoring",
  "field auditor": "/ecosystem/intelligence-&-monitoring",

  "super admin": "/dashboard/super-admin",
  admin: "/dashboard/super-admin",
};

const marketplaceRoleRoutes = {
  seller: "/marketplace/store",
  farmer: "/marketplace/store",
  logistics: "/marketplace/logistics",
  "logistics partner": "/marketplace/logistics",
  "logistics_partner": "/marketplace/logistics",
  "storage facility": "/marketplace/storage-facility",
  "storage_facility": "/marketplace/storage-facility",
  trainer: "/marketplace/trainer",
};

export default async function DashboardRouterPage() {
  const session = await verifyVendorSession();

  if (!session?.authenticated) {
    redirect("/auth/signin");
  }

  const workspace = session.workspace?.toLowerCase();
  const role = session.role?.toLowerCase() || session.account_type?.toLowerCase();

  if (workspace === "marketplace") {
    redirect(marketplaceRoleRoutes[role] || "/marketplace/store");
  }

  if (
    workspace === "ecosystem" &&
    session.onboarding_status !== "completed" &&
    session.onboarding_status !== "verified" &&
    role !== "super admin" &&
    role !== "admin"
  ) {
    redirect("/onboarding");
  }

  redirect(ecosystemRoleRoutes[role] || "/onboarding");
}
