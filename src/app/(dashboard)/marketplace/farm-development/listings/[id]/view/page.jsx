import axios from "axios";
import { ViewListingPage } from "./viewItem";
import { apiUrl } from "@/_lib/api";

export default async function Page({ params }) {
  const { id } = await params;
  let listing = null;

  try {
    const { data } = await axios.get(apiUrl(`/api/farm-development/listing/${id}`));
    listing = data.data;
    console.log(listing.featured_image);
  } catch {}

  return <ViewListingPage listing={listing} />;
}
