import { notFound } from "next/navigation";
import ProviderDetailClient from "./ProviderDetailClient";
import { apiUrl } from "@/_lib/api";

async function getProvider(businessName) {
  const res = await fetch(apiUrl(`/api/farm-development/public/providers/${businessName}`), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { businessName } = await params;
  const provider = await getProvider(businessName);
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: `${provider.name} | FarmLink`,
    description: provider.tagline || provider.description?.substring(0, 160),
  };
}

export default async function ProviderDetailPage({ params }) {
  const { businessName } = await params;
  const provider = await getProvider(businessName);
  if (!provider) notFound();
  //   console.log("res", provider);
  return <ProviderDetailClient provider={provider} />;
}
