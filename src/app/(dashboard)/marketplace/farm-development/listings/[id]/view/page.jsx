import axios from "axios";
import { ViewListingPage } from "@/app/(dashboard)/marketplace/farm-development/components/viewItem";
import { apiUrl } from "@/_lib/api";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export const metadata = {
  title: "Service listings view",
  description: "Mangge list of vendor curated service listings.",
};

export default async function Page({ params }) {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  const { id } = await params;
  let listing = null;

  try {
    const { data } = await axios.get(apiUrl(`/api/farm-development/listing/${id}`));
    listing = data.data;
    console.log(listing.featured_image);
  } catch {}

  return <ViewListingPage listing={listing} />;
}
