"use client";
export default function LogisticsSettingsPage() {
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
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Rate (₦ / MT / KM)</label>
            <input type="number" defaultValue={120} className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Active Vehicles</label>
            <input type="number" defaultValue={15} className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800" />
          </div>
          <button type="button" className="bg-(--greenish-color) text-white px-4 py-2 rounded-lg font-medium mt-4 hover:bg-green-700 transition">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
