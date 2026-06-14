import EditServiceListing from "./EditForm";
import { apiUrl } from "@/_lib/api";
import axios from "axios";

export default async function Page({ params }) {
  const { id } = await params;
  let listing = null;
  try {
    const { data } = await axios.get(apiUrl(`/api/farm-development/listing/${id}`));
    console.log(data);
    listing = data.data;
  } catch {}

  return <EditServiceListing listing={listing} />;
}
