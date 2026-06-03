export function LogisticsProviderCard({ vehicle }) {
  const companyName =
    vehicle.business_name ||
    `${vehicle.fname || ""} ${vehicle.lname || ""}`.trim();
  const providerName =
    `${vehicle.fname || ""} ${vehicle.lname || ""}`.trim() || companyName;

  return (
    <div className="bg-background dark:bg-(--card-dark) rounded-lg shadow-sm overflow-hidden sticky top-4">
      {/* Provider Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 dark:bg-gradient-to-r dark:from-gray-500 dark:to-gray-600">
        <h3 className="text-lg font-semibold text-white">Logistics Provider</h3>
      </div>

      {/* Provider Info */}
      <div className="p-6 space-y-4">
        {/* Provider Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {companyName}
            </h4>
            <p className="text-xs text-gray-500">Active Logistics Provider</p>
          </div>
        </div>

        {/* Provider Details */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Contact Person</span>
            <span className="font-semibold text-gray-900">{providerName}</span>
          </div>

          {vehicle.base_location && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600">Base Location</span>
              <span className="font-semibold text-gray-900 text-right">
                {vehicle.base_location}
              </span>
            </div>
          )}
        </div>

        {/* Trust Badge */}
        <div className="bg-green-50 dark:bg-gray-600 rounded-lg p-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✓</span>
            <p className="text-xs text-gray-700">
              <strong>Verified Provider</strong> - Active on our platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
