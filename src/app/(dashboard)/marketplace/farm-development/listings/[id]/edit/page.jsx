import EditServiceListing from "@/app/(dashboard)/marketplace/farm-development/components/EditServiceListingForm";
import { apiUrl } from "@/_lib/api";
import axios from "axios";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";
import { verifyVendorSession } from "@/actions/session";

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
  } catch {
    console.error("Error fetching listing");
    return;
  }

  return <EditServiceListing listing={listing} />;
}
