"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

export default function LogisticsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseRate, setBaseRate] = useState(120);
  const [activeVehicles, setActiveVehicles] = useState(15);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/proxy/vendor/commodity-operations/logistics/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setBaseRate(data.data.base_rate_per_km ?? 120);
          setActiveVehicles(data.data.active_vehicles ?? 15);
        }
      } catch (error) {
        console.error("Error fetching logistics settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/logistics/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_rate_per_km: parseFloat(baseRate) || 120,
          active_vehicles: parseInt(activeVehicles) || 15
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Logistics settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save logistics settings");
      }
    } catch (error) {
      console.error("Error saving logistics settings:", error);
      toast.error("Server error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Logistics Settings
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage fleet, base rates, and driver profiles.
        </p>
      </div>
      <div className="bg-white dark:bg-(--background) rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Fleet Configuration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Update your logistics capabilities and pricing parameters.
        </p>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium mb-1">Base Rate (₦ / MT / KM)</label>
            <input 
              type="number" 
              step="1"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 font-semibold" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Active Vehicles</label>
            <input 
              type="number" 
              step="1"
              value={activeVehicles}
              onChange={(e) => setActiveVehicles(e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800 font-semibold" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="bg-(--greenish-color) text-white px-4 py-2 rounded-lg font-medium mt-4 hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
