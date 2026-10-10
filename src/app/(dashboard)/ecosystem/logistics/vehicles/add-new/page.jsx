"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, UploadCloud, X, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";

export default function AddNewEcosystemVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [regionInput, setRegionInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    vehicle_type: "10_ton_truck",
    license_plate: "",
    cargo_type: "enclosed_box",
    max_weight_kg: 10000,
    max_tons: 10,
    volume_cubic_meters: "",
    base_location: "",
    operating_regions: ["Northern Corridor", "Nationwide"],
    pricing_model: "flat_rate",
    base_amount: 35000,
    rate_amount: 120,
    imageFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (files && files[0]) {
        if (files[0].size > 5 * 1024 * 1024) {
          toast.error("Image file size must be less than 5MB");
          return;
        }
        setPreview(URL.createObjectURL(files[0]));
        setFormData((prev) => ({ ...prev, imageFile: files[0] }));
      }
    } else if (name === "max_tons") {
      const tons = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        max_tons: value,
        max_weight_kg: tons * 1000,
      }));
    } else if (name === "max_weight_kg") {
      const kg = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        max_weight_kg: value,
        max_tons: (kg / 1000).toFixed(1),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRegion = (e) => {
    e.preventDefault();
    if (regionInput.trim() && !formData.operating_regions.includes(regionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        operating_regions: [...prev.operating_regions, regionInput.trim()],
      }));
      setRegionInput("");
    }
  };

  const handleRemoveRegion = (region) => {
    setFormData((prev) => ({
      ...prev,
      operating_regions: prev.operating_regions.filter((r) => r !== region),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.license_plate || !formData.base_location) {
      toast.error("Please fill in all required fields (Title, Plate, Base Location).");
      return;
    }

    setLoading(true);

    try {
      const bodyData = new FormData();
      bodyData.append("title", formData.title);
      bodyData.append("vehicle_type", formData.vehicle_type);
      bodyData.append("license_plate", formData.license_plate);
      bodyData.append("cargo_type", formData.cargo_type);
      bodyData.append("max_weight_kg", formData.max_weight_kg || 10000);
      bodyData.append("max_tons", formData.max_tons || 10);
      bodyData.append("base_location", formData.base_location);
      bodyData.append("operating_regions", JSON.stringify(formData.operating_regions));
      bodyData.append("pricing_model", formData.pricing_model);
      bodyData.append("base_amount", formData.base_amount || 35000);
      bodyData.append("rate_amount", formData.rate_amount || formData.base_amount || 35000);
      if (formData.volume_cubic_meters) bodyData.append("volume_cubic_meters", formData.volume_cubic_meters);
      if (formData.imageFile) bodyData.append("image", formData.imageFile);

      const res = await fetch("/api/proxy/vendor/logistics/add-vehicle", {
        method: "POST",
        body: bodyData,
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to register vehicle");
      }

      toast.success("Vehicle registered successfully to your fleet!");
      router.push("/ecosystem/logistics/vehicles");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save vehicle");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-(--greenish-color)";

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Back button & title */}
      <div>
        <Link
          href="/ecosystem/logistics/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-(--greenish-color) mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </Link>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight flex items-center gap-3">
          <Truck className="w-8 h-8 text-(--greenish-color)" />
          Add Vehicle to Fleet
        </h1>
        <p className="text-gray-500 mt-1 font-medium text-sm">
          Register truck specifications, carrying tonnage (MT), and pricing structure for harvest operations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-(--background) rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Section 1: Identification & Image */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
            1. Vehicle Identity & Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Vehicle Title / Make & Model *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Mercedes-Benz Actros 30-Ton Flatbed"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Vehicle Classification *
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className={inputClass}
                required
              >
                <option value="3_ton_truck">3-Ton Light Commercial Truck</option>
                <option value="5_ton_truck">5-Ton Medium Duty Truck</option>
                <option value="10_ton_truck">10-Ton Heavy Hauler</option>
                <option value="15_ton_truck">15-Ton Grain Tipper / Truck</option>
                <option value="20_ton_truck">20-Ton Heavy Duty Truck</option>
                <option value="30_ton_trailer">30-Ton Articulated Trailer</option>
                <option value="flatbed">Flatbed Heavy Carrier</option>
                <option value="refrigerated">Refrigerated Cold-Chain Truck</option>
                <option value="mini_van">Mini-Van / Cargo Wagon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                License Plate Number *
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                placeholder="e.g. KAN-782-AA"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Cargo Body Architecture
              </label>
              <select
                name="cargo_type"
                value={formData.cargo_type}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="enclosed_box">Enclosed Box / Weather-Proof</option>
                <option value="open_bed">Open Bed / Flatbed</option>
                <option value="tipper">Bulk Grain Tipper</option>
                <option value="refrigerated">Refrigerated Cold-Chain</option>
                <option value="tanker">Liquid / Bulk Tanker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Vehicle Image (Optional)
            </label>
            {preview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setFormData((prev) => ({ ...prev, imageFile: null }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <UploadCloud className="w-8 h-8 text-(--greenish-color) mb-1" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Click to upload vehicle photo</span>
                <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP (Max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Section 2: Capacity Metrics */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
            2. Tonnage Capacity & Payload Limits
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Max Capacity in Metric Tons (MT) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                name="max_tons"
                value={formData.max_tons}
                onChange={handleInputChange}
                placeholder="10"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Carrying limit matched to harvest batches</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Weight in Kilograms (KG)
              </label>
              <input
                type="number"
                step="100"
                min="500"
                name="max_weight_kg"
                value={formData.max_weight_kg}
                onChange={handleInputChange}
                className={inputClass}
              />
              <p className="text-[10px] text-gray-400 mt-1">Auto-calculated from Metric Tons</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Cargo Volume (m³ - Optional)
              </label>
              <input
                type="number"
                step="0.5"
                name="volume_cubic_meters"
                value={formData.volume_cubic_meters}
                onChange={handleInputChange}
                placeholder="e.g. 25"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Reach */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
            3. Operational Hub & Pricing Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Base Station / Hub Location *
              </label>
              <input
                type="text"
                name="base_location"
                value={formData.base_location}
                onChange={handleInputChange}
                placeholder="e.g. Kano Central Freight Terminal"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Used for proximity & distance estimation</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                Base Fee Amount (₦) *
              </label>
              <input
                type="number"
                name="base_amount"
                value={formData.base_amount}
                onChange={handleInputChange}
                placeholder="35000"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Base rate displayed to farmers/aggregators</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Operating Transit Regions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                placeholder="Add state or corridor (e.g. Kano, Kaduna, Lagos)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddRegion}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-xs rounded-xl"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.operating_regions.map((region, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800"
                >
                  {region}
                  <button type="button" onClick={() => handleRemoveRegion(region)} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end gap-3">
          <Link
            href="/ecosystem/logistics/vehicles"
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-(--greenish-color) hover:opacity-95 text-white font-black text-sm shadow-md shadow-green-900/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {loading ? "Registering Vehicle..." : "Save Vehicle to Fleet"}
          </button>
        </div>
      </form>
    </div>
  );
}
