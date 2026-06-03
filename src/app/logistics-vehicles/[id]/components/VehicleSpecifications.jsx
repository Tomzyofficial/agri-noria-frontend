import { formatLabel } from "@/utils/otherUtils";
import { formatPrice } from "@/utils/formatPrice";

export function VehicleSpecifications({ vehicle }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const specifications = [
    {
      category: "Vehicle Information",
      items: [
        {
          label: "Vehicle Type",
          value: formatLabel(vehicle.vehicle_type) || "N/A",
        },
        {
          label: "Cargo Type",
          value: formatLabel(vehicle.cargo_type) || "N/A",
        },
        { label: "Title", value: formatLabel(vehicle.title) || "N/A" },
      ],
    },
    {
      category: "Capacity & Dimensions",
      items: [
        {
          label: "Max Weight Capacity",
          value: vehicle.max_weight_kg ? `${vehicle.max_weight_kg} kg` : "N/A",
        },
        {
          label: "Volume Capacity",
          value: vehicle.volume_cubic_meters
            ? `${vehicle.volume_cubic_meters} m³`
            : "N/A",
        },
      ],
    },
    {
      category: "Service Information",
      items: [
        { label: "Base Location", value: vehicle.base_location || "N/A" },
        {
          label: "Operating Regions",
          value: vehicle.operating_regions
            ? vehicle.operating_regions
                .map((region) => region.trim())
                .join(", ")
            : "N/A",
        },
      ],
    },
    {
      category: "Pricing",
      items: [
        { label: "Pricing Model", value: vehicle.pricing_model || "N/A" },
        {
          label: "Rate Amount",
          value: vehicle.rate_amount
            ? formatPrice(
                vehicle.rate_amount,
                vehicle.country_code,
                vehicle.currency,
              )
            : "N/A",
        },
      ],
    },
  ];

  return (
    <div className="">
      {specifications.map((spec) => (
        <div
          key={spec.category}
          className="bg-white dark:bg-(--card-dark) rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {spec.category}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {spec.items.map((item) => (
                <div key={item.label} className="">
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    {item.label}
                  </dt>
                  <dd className="text-base font-semibold text-gray-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}

      {/* Description if available */}
      {/* {vehicle.description && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-3">
            <h3 className="text-lg font-semibold text-white">Description</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">
              {vehicle.description}
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
}
