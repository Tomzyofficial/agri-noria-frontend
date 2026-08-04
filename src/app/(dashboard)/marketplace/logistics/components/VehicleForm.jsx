"use client";

import { X } from "lucide-react";
import SubmitButton from "../../../dashboard/components/SubmitButton";
import { useVehicleForm } from "./UseVehicleForm";

export function VehicleForm() {
   const { formData, handleInputChange, regionInput, setRegionInput, handleAddRegion, handleRemoveRegion, handleSubmit, preview, loading } = useVehicleForm();

   const inputStyle = `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-black text-sm ${loading ? "cursor-not-allowed" : ""}`;

   return (
      <div className="my-10 p-8 bg-white dark:bg-gray-400 border border-gray-200 rounded-xl shadow-sm">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Fleet Vehicle</h2>
         <p className="text-gray-500 mb-6 text-sm">Register single vehicle capacity limits for ecosystem automated checkout and marketplace indexing.</p>

         <form noValidate onSubmit={handleSubmit} aria-busy={loading} className="space-y-6">
            {/* SECTION 1: Identity */}
            <div className="border-b border-gray-100 pb-6">
               <h3 className="text-lg font-semibold text-gray-700 mb-4">1. Vehicle Identity</h3>
               <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Image *</label>
                  {preview && (
                     <div className="mb-3 relative w-full h-48">
                        <img src={preview} alt="Vehicle preview" className="w-full h-full object-cover rounded-md" />
                     </div>
                  )}
                  <input type="file" name="image" onChange={handleInputChange} multiple accept="image/*" className={inputStyle} required />
                  <p className="text-xs text-gray-500 mt-1">Upload up to 5 images (JPG, JPEG, PNG, WEBP - max 5MB each)</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Title
                     </label>
                     <input type="text" id="title" name="title" required value={formData.title} disabled={loading} onChange={handleInputChange} placeholder="e.g., Heavy-Duty Mercedes Actros Flatbed" className={inputStyle} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Classification Type</label>
                     <select name="vehicle_type" required value={formData.vehicle_type} disabled={loading} onChange={handleInputChange} className={inputStyle}>
                        <option value="">Select Type</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="mini_van">Mini-Van / Cargo Wagon</option>
                        <option value="3_ton_truck">3-Ton Truck</option>
                        <option value="5_ton_truck">5-Ton Truck</option>
                        <option value="10_ton_truck">10-Ton Truck</option>
                     </select>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate Number
                        <span className="text-xs text-gray-400 font-normal">(Kept Private)</span>
                     </label>
                     <input type="text" name="license_plate" required disabled={loading} value={formData.license_plate} onChange={handleInputChange} placeholder="e.g., LND123XY" className={inputStyle} />
                  </div>
               </div>
            </div>

            {/* SECTION 2: Space Metrics */}
            <div className="border-b border-gray-100 pb-6">
               <h3 className="text-lg font-semibold text-gray-700 mb-4">2. Cargo Payload Space Configuration</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Enclosure Architecture</label>
                     <select name="cargo_type" disabled={loading} value={formData.cargo_type} onChange={handleInputChange} className={inputStyle}>
                        <option value="">Choose one</option>
                        <option value="enclosed_box">Enclosed Box</option>
                        <option value="open_bed">Open Bed / Flatbed</option>
                        <option value="refrigerated">Refrigerated Cold-Chain</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight Capacity (kg) *</label>
                     <input type="text" inputMode="decimal" name="max_weight_kg" disabled={loading} required min="1" value={formData.max_weight_kg} onChange={handleInputChange} placeholder="5000" className={inputStyle} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Total Volume (m³ - Optional)</label>
                     <input type="text" inputMode="decimal" name="volume_cubic_meters" disabled={loading} min="0.1" value={formData.volume_cubic_meters} onChange={handleInputChange} placeholder="18.5" className={inputStyle} />
                  </div>
               </div>
            </div>

            {/* SECTION 3: Logistics Parameters */}
            <div>
               <h3 className="text-lg font-semibold text-gray-700 mb-4">3. Logistical Reach & Pricing Matrix</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Base Hub Station Location *</label>
                     <input type="text" name="base_location" required disabled={loading} value={formData.base_location} onChange={handleInputChange} placeholder="e.g., Ikeja, Lagos" className={inputStyle} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Structural Model</label>
                     <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center text-sm text-gray-600">
                           <input type="radio" name="pricing_model" value="flat_rate" disabled={loading} checked={formData.pricing_model === "flat_rate"} onChange={handleInputChange} className="mr-2 text-emerald-600 focus:ring-emerald-500" />
                           Flat Rate / Trip
                        </label>
                        <label className="flex items-center text-sm text-gray-600">
                           <input type="radio" name="pricing_model" value="per_km" disabled={loading} checked={formData.pricing_model === "per_km"} onChange={handleInputChange} className="mr-2 text-emerald-600 focus:ring-emerald-500" />
                           Rate per KM
                        </label>
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Rate Value Amount</label>
                     <input type="text" inputMode="decimal" name="rate_amount" required disabled={loading} min="0" value={formData.rate_amount} onChange={handleInputChange} placeholder="Amount value" className={inputStyle} />
                  </div>

                  {/* Array Tags Manager for Operating Regions */}
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Operating Transit Regions</label>
                     <div className="flex space-x-2">
                        <input type="text" value={regionInput} disabled={loading} onChange={(e) => setRegionInput(e.target.value)} placeholder="Type a State/Region and click Add (e.g., Oyo)" className={inputStyle} />
                        <button type="button" onClick={handleAddRegion} className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-200">
                           Add
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2 mt-3">
                        {formData.operating_regions.map((region, i) => (
                           <span key={i} className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs px-2.5 py-1 rounded-full">
                              {region}
                              <button type="button" onClick={() => handleRemoveRegion(region)} className="ml-1.5 text-emerald-500 hover:text-emerald-800 focus:outline-none">
                                 <X />
                              </button>
                           </span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
            <div className="pt-4">
               <SubmitButton loading={loading} />
            </div>
         </form>
      </div>
   );
}
