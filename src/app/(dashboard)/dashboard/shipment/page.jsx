import { redirect } from "next/navigation";

/** Redirect legacy path to logistics shipments dashboard */
export default function ShipmentRedirectPage() {
  redirect("/dashboard/logistics/shipments");
}
