import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

const accountTypeRoutes = {
  // Institution
  government: "/dashboard/institution",
  bank: "/dashboard/institution",
  ngo: "/dashboard/institution",
  dfi: "/dashboard/institution",
  "insurance firm": "/dashboard/institution",
  "commodity board": "/dashboard/institution",
  finance: "/dashboard/institution",

  // Program Management
  "program director": "/dashboard/program-management",
  "regional manager": "/dashboard/program-management",
  "cluster supervisor": "/dashboard/program-management",

  // Field Operations
  "field officer": "/dashboard/field-operations",
  agronomist: "/dashboard/field-operations",
  inspector: "/dashboard/field-operations",
  enumerator: "/dashboard/field-operations",

  // Farmer
  farmer: "/dashboard/farmer",

  // Buyer / Partner
  exporter: "/dashboard/buyer-partner",
  "off-taker": "/dashboard/buyer-partner",
  "warehouse buyer": "/dashboard/buyer-partner",
  processor: "/dashboard/buyer-partner",
  "logistics partner": "/dashboard/buyer-partner",
  seller: "/dashboard/buyer-partner",
  logistics: "/dashboard/buyer-partner",
  storage_facility: "/dashboard/buyer-partner",

  // Super Admin
  "super admin": "/dashboard/super-admin",
  admin: "/dashboard/super-admin",

  // Distributor
  distributor: "/dashboard/distributor",

  // Aggregator
  aggregator: "/dashboard/aggregator",
};

export default async function Dashboard() {
  const session = await verifyVendorSession();
  if (!session?.authenticated) {
    return redirect("/");
  }

  const accountType = session.account_type?.toLowerCase();

  // 1. Determine if this is a legacy role that should bypass industrial onboarding
  const isLegacyRole = [
    "seller",
    "vendor",
    "store",
    "Training_Partner",
  ].includes(accountType);

  // Special case for Farmer: Check if they've joined the industrial ecosystem
  const isIndustrialFarmer =
    accountType === "farmer" &&
    (session.onboarding_status === "completed" ||
      session.onboarding_status === "verified");

  const isNormalFarmer = accountType === "farmer" && !isIndustrialFarmer;

  // 2. Redirect legacy users to the store dashboard immediately
  if (isLegacyRole || isNormalFarmer) {
    return redirect("/dashboard/store");
  }

  // 3. Force Industrial Onboarding for all other ecosystem roles if not completed
  if (
    session.onboarding_status !== "completed" &&
    session.onboarding_status !== "verified"
  ) {
    // Only redirect to onboarding if NOT an admin
    if (accountType !== "super admin" && accountType !== "admin") {
      return redirect("/onboarding");
    }
  }

  // 4. Map industrial roles to their specialized dashboards
  const targetRoute = accountTypeRoutes[accountType];

  if (!targetRoute) {
    // Fallback for unidentified roles
    return redirect("/dashboard/store");
  }

  return redirect(targetRoute);
}
