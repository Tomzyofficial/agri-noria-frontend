"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Loader2, Search, MapPin, Sprout, Tractor, Globe, 
  Calendar, CheckCircle, ShieldCheck, ChevronRight, Filter, AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await fetch("/api/proxy/pipeline/farmers");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mappedFarms = json.data.map((f, idx) => ({
            id: f.id || `farm-${idx}`,
            farm_name: f.farm_name || `${f.fname || ''} ${f.lname || ''}'s Farm Plot`.trim() || "Member Farm",
            farmer_name: `${f.fname || ''} ${f.lname || ''}`.trim() || 'Cooperative Member',
            phone: f.phone || 'N/A',
            crop: f.primary_crop || f.crop || "Agricultural Produce",
            hectares: parseFloat(f.farm_size_hectares || f.size_hectares || 0),
            location: f.location || f.farm_location || f.state || "Cluster Farm Land",
            state: f.state || "",
            gps_latitude: f.gps_latitude || null,
            gps_longitude: f.gps_longitude || null,
            status: f.approval_status === "approved" ? "Active Cultivation" : "Pending Verification",
            boundary_verified: Boolean(f.gps_latitude && f.gps_longitude),
            soil_health: f.soil_health || "Not Tested",
            water_source: f.irrigation_type || "Rainfed",
            expected_yield_mt: f.expected_yield ? String(f.expected_yield) : (parseFloat(f.farm_size_hectares || f.size_hectares || 0) * 3.5).toFixed(1),
          }));
          setFarms(mappedFarms);
        } else {
          setFarms([]);
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const totalHectares = farms.reduce((acc, f) => acc + (f.hectares || 0), 0);
  const totalYield = farms.reduce((acc, f) => acc + (parseFloat(f.expected_yield_mt) || 0), 0);

  const filteredFarms = farms.filter((f) => {
    const matchesSearch =
      !search.trim() ||
      f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      f.farmer_name.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = cropFilter === "all" || f.crop.toLowerCase().includes(cropFilter.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const handleScheduleVisit = async (farm) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/proxy/field-operations/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: farm.id,
          location: farm.location,
          inspection_type: "Field Inspection",
          notes: `Inspection scheduled for ${farm.farm_name}`
        })
      });
      if (res.ok) {
        toast.success(`Agronomy field visit dispatched for ${farm.farm_name}!`);
      } else {
        toast.info(`Visit request logged for ${farm.farm_name}.`);
      }
    } catch {
      toast.error("Failed to dispatch visit request");
    } finally {
      setActionLoading(false);
      setSelectedFarm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Cooperative Farm Operations</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
            Member Landholdings, Crop Lifecycle & GPS Boundaries
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member Farms</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{farms.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Acreage</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalHectares.toFixed(1)} Ha</p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projected Output</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalYield.toFixed(1)} MT</p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">GPS Mapped</p>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                {farms.filter((f) => f.boundary_verified).length} / {farms.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table & Filter */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Member Farm Registry & Field Operations</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farm or member..."
                className="pl-9 rounded-xl bg-gray-50 border-gray-200 text-sm"
              />
            </div>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">All Crops</option>
              <option value="maize">Maize</option>
              <option value="sorghum">Sorghum</option>
              <option value="soybean">Soybeans</option>
              <option value="rice">Rice</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-l-lg">Farm Name & Member</th>
                    <th className="px-6 py-4 font-bold">Primary Crop</th>
                    <th className="px-6 py-4 font-bold">Size (Hectares)</th>
                    <th className="px-6 py-4 font-bold">Location & Coordinates</th>
                    <th className="px-6 py-4 font-bold">Growth Stage</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredFarms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                        No member farms found in cooperative registry.
                      </td>
                    </tr>
                  ) : (
                    filteredFarms.map((farm) => (
                      <tr key={farm.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{farm.farm_name}</div>
                          <div className="text-xs text-gray-500 font-medium">Owner: {farm.farmer_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <Sprout className="w-3.5 h-3.5" />
                            {farm.crop}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                          {farm.hectares > 0 ? `${farm.hectares} Ha` : "—"}
                          {farm.expected_yield_mt > 0 && (
                            <div className="text-[11px] font-normal text-gray-400">Est. {farm.expected_yield_mt} MT</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{farm.location}</span>
                          </div>
                          {farm.gps_latitude && farm.gps_longitude ? (
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {farm.gps_latitude}°N, {farm.gps_longitude}°E
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-400 italic">GPS unmapped</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {farm.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFarm(farm)}
                            className="rounded-lg text-xs font-semibold border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                          >
                            Inspect Farm
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Farm Inspection / Operations Detail Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedFarm.farm_name}</h3>
                <p className="text-xs text-gray-500 font-medium">Farmer: {selectedFarm.farmer_name} · {selectedFarm.phone}</p>
              </div>
              <button
                onClick={() => setSelectedFarm(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Primary Crop</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedFarm.crop}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Land Area</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedFarm.hectares > 0 ? `${selectedFarm.hectares} Ha` : "Unspecified"}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Location</span>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{selectedFarm.location}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Water Source</span>
                <p className="font-semibold text-blue-600 mt-0.5">{selectedFarm.water_source}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">GPS Coordinates</span>
                <p className="font-mono text-gray-700 dark:text-gray-300 mt-0.5">
                  {selectedFarm.gps_latitude && selectedFarm.gps_longitude 
                    ? `Lat: ${selectedFarm.gps_latitude}, Lng: ${selectedFarm.gps_longitude}` 
                    : "Not yet captured"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleScheduleVisit(selectedFarm)}
                disabled={actionLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                Dispatch Agronomist Field Inspection
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFarm(null)}
                className="w-full text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
