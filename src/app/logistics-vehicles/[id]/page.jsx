import { VehicleDetail } from "@/app/logistics-vehicles/[id]/components/VehicleDetailsPage";
import { Footer } from "@/components/ui/Footer";
import { notFound } from "next/navigation";
import { apiUrl } from "@/_lib/api";

export default async function Page({ params }) {
  const resolved = await params;
  const { id } = resolved || null;
  let vehicleData = null;
  let error = null;

  const res = await fetch(
    apiUrl(`/api/vendor/logistics/public/vehicles?vehicleId=${id}`),
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    error = `Failed to fetch vehicle data: ${res.statusText}`;
    throw new Error(`Failed to fetch vehicle: ${res.status}`);
  }

  const vehcileResult = await res.json();

  if (!vehcileResult.success) {
    error = vehcileResult.error || "Failed to fetch vehicle data";
    throw new Error(vehcileResult.error || "Failed to fetch vehicle data");
  }
  vehicleData = vehcileResult.vehicleDetails
    ? vehcileResult.vehicleDetails
    : null;

  // Error or Not Found state
  if (error || !vehicleData) {
    notFound();
  }

  // Success - render vehicle details
  return (
    <>
      <VehicleDetail vehicle={vehicleData} />
      <Footer />
    </>
  );
}
