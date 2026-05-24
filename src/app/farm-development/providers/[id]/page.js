import { notFound } from "next/navigation";
import ProviderDetailClient from "./ProviderDetailClient";

async function getProvider(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/proxy/farming/providers/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: `${provider.name} | FarmLink`,
    description: provider.tagline || provider.description?.substring(0, 160),
  };
}

export default async function ProviderDetailPage({ params }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();
  return <ProviderDetailClient provider={provider} />;
}
