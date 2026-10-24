"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { Warehouse, MapPin, Layers, ShieldCheck, SlidersHorizontal, Save } from "lucide-react";

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capacity, setCapacity] = useState(0);
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const res = await fetch("/api/proxy/vendor/commodity-operations/storage/dashboard");
        const data = await res.json();
        if (data.success) {
          setCapacity(data.data.total_capacity || 0);
          setLocation(data.data.location || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStorageData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/storage/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          total_capacity_mt: capacity,
          location: location 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Storage facility settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving storage settings:", error);
      toast.error("Server error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 animate-pulse">
          <Warehouse size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <FaSpinner className="animate-spin text-emerald-600" />
          <span>Loading Facility Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80 dark:border-gray-800 space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Node Configuration
          </span>
          <span className="text-xs text-gray-400 font-semibold">• Storage Specs</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <SlidersHorizontal className="w-7 h-7 text-emerald-600" />
          Storage Facility Settings
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
          Configure facility capacity, geographic operational coordinates, and intake parameters.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden backdrop-blur-sm p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-600" />
            Facility Profile & Capacity Metrics
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            These values govern your warehouse availability in search radars, reservation calculations, and maximum e-NWR issuance thresholds.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location / Address */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                Physical Facility Address
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Plot 12, Industrial Area, Kano"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" 
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400">Used by farmers and logistics haulers for distance routing.</p>
            </div>

            {/* Total Capacity (MT) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600" />
                Total Certified Capacity (MT)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" 
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400">Total volume in metric tons across all silos, bays, and warehousing space.</p>
            </div>
          </div>

          {/* Security & Verification note */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-0.5 text-emerald-900 dark:text-emerald-200">
              <span className="font-bold">Cryptographically Audited Facility Node</span>
              <p className="text-emerald-800/80 dark:text-emerald-300/80">
                Changes to certified capacity are logged to the immutable ledger. Electronic warehouse receipts (e-NWR) issued are guaranteed against this limit.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <FaSpinner className="animate-spin text-sm" /> : <Save size={14} />}
              <span>{saving ? "Saving Configuration..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
