import { VendorAdsCreateForm } from "@/components/dashboard/ads/VendorAdsCreateForm";

export default async function DroneAdsCreatePage() {
   return <VendorAdsCreateForm backHref="/marketplace/drone/ads" allowedSurface="Drone_marketplace" allowedTargetType="Product" />;
}
