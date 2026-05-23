import { ProductDetail } from "@/app/products/[id]/components/productDetailsPage";
import { Footer } from "@/components/ui/Footer";
import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let data;
  try {
    const cookieHeader = await cookieStoreFnc();
    const res = await fetch(apiUrl(`/api/marketplace/${id}`), {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }
    data = await res.json();
  } catch (err) {
    console.error("Error fetching product:", err);
  }

  const product = data || null;

  // Fetch reviews summary
  let result;
  try {
    const cookieHeader = await cookieStoreFnc();
    const res = await fetch(apiUrl(`/api/marketplace/${id}/reviews`), {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    });
    const data = await res.json();
    result = data || {};
  } catch (err) {
    console.error("Error fetching reviews summary:", err.message);
    result = {};
  }

  return (
    <>
      <ProductDetail product={product} summary={result.summary ?? {}} />
      <Footer />
    </>
  );
}
