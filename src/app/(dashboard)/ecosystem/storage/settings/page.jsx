"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [capacity, setCapacity] = useState(0);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const res = await fetch("/api/proxy/vendor/commodity-operations/storage/dashboard");
        const data = await res.json();
        if (data.success) {
          setCapacity(data.data.total_capacity);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCapacity();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/storage/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_capacity_mt: capacity })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Server error");
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
          Storage Settings
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage warehouse profiles, capacity, and pricing.
        </p>
      </div>
      <div className="bg-white dark:bg-(--background) rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Facility Configuration</h2>
        <p className="text-sm text-gray-500 mb-6">
          Update your storage capabilities.
        </p>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium mb-1">Total Global Capacity (MT)</label>
            <input 
              type="number" 
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-50 dark:bg-gray-800" 
              required
            />
          </div>
          <button type="submit" className="bg-(--greenish-color) text-white px-4 py-2 rounded-lg font-medium mt-4 hover:bg-green-700 transition">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
