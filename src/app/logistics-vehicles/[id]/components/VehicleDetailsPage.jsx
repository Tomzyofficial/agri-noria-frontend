import { VehicleImages } from "@/app/logistics-vehicles/[id]/components/VehicleImages";
import { VehicleSpecifications } from "@/app/logistics-vehicles/[id]/components/VehicleSpecifications";
import { LogisticsProviderCard } from "@/app/logistics-vehicles/[id]/components/LogisticsProviderCard";
import { VehicleActions } from "@/app/logistics-vehicles/[id]/components/VehicleActions";

export function VehicleDetail({ vehicle }) {
  return (
    <section className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-background dark:bg-(--card-dark) border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Home
            </a>
            <span className="text-gray-400">/</span>
            <a
              href="/logistics-vehicles"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logistics Vehicles
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{vehicle.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              vehicle.status === "available"
                ? "bg-green-100 text-green-800"
                : vehicle.status === "in_transit"
                  ? "bg-blue-100 text-blue-800"
                  : vehicle.status === "maintenance"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {vehicle.status === "available"
              ? "✓ Available"
              : vehicle.status === "in_transit"
                ? "⚡ In Transit"
                : vehicle.status === "maintenance"
                  ? "🔧 Under Maintenance"
                  : "Unknown"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Images */}
            <VehicleImages images={vehicle.images} title={vehicle.title} />

            {/* Vehicle Specifications */}
            <VehicleSpecifications vehicle={vehicle} />
          </div>

          {/* Right Column - Provider and Actions */}
          <div className="space-y-6">
            {/* Logistics Provider Card */}
            <LogisticsProviderCard vehicle={vehicle} />

            {/* Quick Actions */}
            <VehicleActions vehicle={vehicle} />
          </div>
        </div>
      </div>
    </section>
  );
}
