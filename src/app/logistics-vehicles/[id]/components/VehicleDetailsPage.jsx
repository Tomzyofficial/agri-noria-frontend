import { VehicleImages } from "@/app/logistics-vehicles/[id]/components/VehicleImages";
import { ImageGalleryDisplay } from "@/components/dashboard/ImageGalleryDisplay";
import { VehicleSpecifications } from "@/app/logistics-vehicles/[id]/components/VehicleSpecifications";
import { LogisticsProviderCard } from "@/app/logistics-vehicles/[id]/components/LogisticsProviderCard";
import { VehicleActions } from "@/app/logistics-vehicles/[id]/components/VehicleActions";
import Link from "next/link";
import Breadcrumbs from "@/components/dashboard/BreadCrumbs";

export function VehicleDetail({ vehicle }) {
   return (
      <section className="min-h-screen">
         <div className="px-4 md:px-8 pt-4">
            <Breadcrumbs
               breadcrumbs={[
                  { label: "Home", href: "/" },
                  { label: "Logitics Vehicles", href: "/logistics-vehicles" },
                  { label: vehicle.title, href: "#", active: true },
               ]}
            />
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* <div className="mb-6">
               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${vehicle.status === "available" ? "bg-green-100 text-green-800" : vehicle.status === "in_transit" ? "bg-blue-100 text-blue-800" : vehicle.status === "maintenance" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                  {vehicle.status === "available" ? "✓ Available" : vehicle.status === "in_transit" ? "⚡ In Transit" : vehicle.status === "maintenance" ? "🔧 Under Maintenance" : "Unknown"}
               </span>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <ImageGalleryDisplay image={vehicle?.image} listingName={vehicle?.title} />
                  <VehicleSpecifications vehicle={vehicle} />
               </div>

               <div className="space-y-6">
                  <LogisticsProviderCard vehicle={vehicle} />
                  <VehicleActions vehicle={vehicle} />
               </div>
            </div>
         </div>
      </section>
   );
}
