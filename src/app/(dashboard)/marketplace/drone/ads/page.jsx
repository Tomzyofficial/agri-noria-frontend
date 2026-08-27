import { VendorAdsManager } from "@/components/dashboard/ads/VendorAdsManager";

export default function DroneAdsPage() {
   return <VendorAdsManager basePath="/marketplace/drone/ads" title="Drone ads & campaigns" description="Promote active drone listings across the public drone marketplace with banner and sponsored placements." emptyCopy="No drone campaigns yet. Create one to promote an active drone listing." />;
}
