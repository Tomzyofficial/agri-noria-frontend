import ServicesPage from "./servicePage";
import { apiUrl } from "@/_lib/api";

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.category) params.set("category", sp.category);
  if (sp.search) params.set("search", sp.search);
  if (sp.page) params.set("page", sp.page);
  params.set("limit", "12");

  const serviceRes = await fetch(apiUrl(`/api/farm-development/public/service-list?${params}`), { cache: "no-store" });
  if (!serviceRes.ok) {
    console.error("Error with servies", serviceRes.status, serviceRes.statusText);
  }

  const services = await serviceRes.json();
  return <ServicesPage services={services} />;
}
