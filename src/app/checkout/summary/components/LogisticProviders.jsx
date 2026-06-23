import { useEffect, useState, useCallback } from "react";
import { Truck, Calendar, Loader2 } from "lucide-react";

export function LogisticsProviders({ address, onLogisticsSelect }) {
  const [logisticsOptions, setLogisticsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLogistics, setSelectedLogistics] = useState(null);

  // Fetch logistics when address changes
  const fetchLogistics = useCallback(async () => {
    if (!address || address.trim().length < 3) {
      setLogisticsOptions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/proxy/vendor/logistics/near-buyer?address=${encodeURIComponent(address)}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch logistics providers");
      }

      const providers = data.data || [];
      setLogisticsOptions(Array.isArray(providers) ? providers : []);
    } catch (err) {
      console.error("Logistics fetch error:", err);
      setError(err.message || "Could not load delivery options");
      setLogisticsOptions([]);
      return;
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchLogistics();
  }, [fetchLogistics]);

  // Handle selection and notify parent
  const handleSelect = (option) => {
    setSelectedLogistics(option);
    if (onLogisticsSelect) {
      onLogisticsSelect(option);
    }
  };

  return (
    <div>
      {(loading || logisticsOptions.length > 0 || error) && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="font-semibold text-lg">Available Logistics Partners</h3>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              Finding delivery partners near you...
            </div>
          )}

          {error && <div className="text-red-600 bg-red-50 dark:bg-red-950 p-4 rounded-lg">{error}</div>}

          {!loading && logisticsOptions.length > 0 && (
            <div className="space-y-4">
              {logisticsOptions.map((option) => (
                <div key={option.id} onClick={() => handleSelect(option)} className={`border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${selectedLogistics?.id === option.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950" : "border-gray-200 hover:border-gray-300 dark:border-gray-700"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{option?.title?.charAt(0).toUpperCase() + option?.title?.slice(1)}</h4>
                        <div className="flex items-center text-yellow-500">
                          {/* <span>{option.rating || "4.5"}</span> */}
                          {/* <span className="ml-1">★</span> */}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {option?.vehicle_type.charAt(0).toUpperCase() + option?.vehicle_type.slice(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Cargo type:</span>
                          {option?.cargo_type?.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{option.rate_amount ? `₦${Number(option.rate_amount).toLocaleString()}` : "—"}</p>
                      <p className="text-xs text-gray-500">Delivery Fee</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
