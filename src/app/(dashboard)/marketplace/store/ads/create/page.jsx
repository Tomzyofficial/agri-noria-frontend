import { VendorAdsCreateForm } from "@/components/dashboard/ads/VendorAdsCreateForm";

export default function DashboardAdsCreatePage() {
   return <VendorAdsCreateForm backHref="/marketplace/store/ads" allowedSurface="Home" allowedTargetType="Product" />;
}
