import { getMarketplaceProducts } from "@/_lib/data";
import { HomePage } from "@/app/HomePage.jsx";
import { Footer } from "@/components/ui/Footer";
import NavBar from "@/components/ui/NavBar/NavBar";
import { verifyVendorSession } from "@/actions/session";
import { redirect } from "next/navigation";

export default async function Page() {
  // If vendor is already logged in, send them straight to their dashboard
  const vendorSession = await verifyVendorSession();
  if (vendorSession?.authenticated) {
    redirect("/dashboard");
  }

  let marketplace = [];
  let error = null;

  try {
    const data = await getMarketplaceProducts();
    if (data?.error) {
      // API returned an error — treat as empty marketplace
      marketplace = [];
    } else if (Array.isArray(data)) {
      marketplace = data;
    } else {
      marketplace = [];
    }
  } catch {
    // Fetch failed entirely — show empty marketplace, not an error
    marketplace = [];
  }

  return (
    <>
      <NavBar />
      <HomePage marketPlace={marketplace} error={error} />
      <Footer />
    </>
  );
}
