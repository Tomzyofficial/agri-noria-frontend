"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { X } from "lucide-react";
import SubmitButton from "@/components/dashboard/SubmitButton";
import ImageUploadPreview from "@/components/dashboard/ImageUploadPreview";

const storageTypes = ["Cold Storage", "Dry Storage", "Controlled Atmosphere", "Refrigerated"];

export default function FormFields({ formData, handleChange, preview, loading, handleAddFeature, handleRemoveFeature, featureText, setFeatureText }) {
   return (
      <>
         <ImageUploadPreview handleChange={handleChange} preview={preview} loading={loading} />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <Label htmlFor="listing_name">Storage Name</Label>
               <Input name="listing_name" type="text" id="listing_name" placeholder="Eg., Super deluxe" value={formData.listing_name} onChange={handleChange} required className={loading ? "cursor-not-allowed opacity-50" : ""} disabled={loading} />
            </div>

            <div className="hidden" aria-hidden="true">
               <Label htmlFor="href">Storage Link (href)</Label>
               <Input type="text" name="href" id="href" value={formData.href} readOnly placeholder="Auto-generated from storage name" />
            </div>

            <div>
               <Label htmlFor="storage_type">Storage Type</Label>
               <select required name="storage_type" id="storage_type" value={formData.storage_type} onChange={handleChange} disabled={loading} className={loading ? "cursor-not-allowed opacity-50" : ""}>
                  <option value="" disabled>
                     Choose one
                  </option>
                  {storageTypes.map((type) => (
                     <option key={type} value={type}>
                        {type}
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <Label htmlFor="location">Location</Label>
               <Input required type="text" name="location" id="location" value={formData.location} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} placeholder="Eg., Street, city, state..." />
            </div>

            <div>
               <Label htmlFor="capacity">Total Capacity</Label>
               <Input required type="text" name="capacity" id="capacity" value={formData.capacity} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} placeholder="Eg., 500 sq ft" />
            </div>

            <div>
               <Label htmlFor="available">Available Capacity</Label>
               <Input required type="text" name="available" id="available" value={formData.available} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} placeholder="Eg., 500 sq ft" />
            </div>

            <div>
               <Label htmlFor="price">Price</Label>
               <Input required type="number" name="price" id="price" value={formData.price} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} placeholder="E.g., 5000" />
            </div>

            <div>
               <Label htmlFor="temperature">Temperature Range</Label>
               <Input required type="text" name="temperature" id="temperature" value={formData.temperature} onChange={handleChange} className={loading ? "cursor-not-allowed opacity-50" : ""} placeholder="Eg., 10-25°C" />
            </div>

            <div>
               <Label htmlFor="features">Storage Features</Label>
               <div className="flex space-x-2">
                  <Input type="text" value={featureText} disabled={loading} onChange={(e) => setFeatureText(e.target.value)} placeholder="e.g., Steady light" />
                  <button type="button" onClick={handleAddFeature} className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-200">
                     Add
                  </button>
               </div>
               <div className="flex flex-wrap gap-2 mt-3">
                  {formData.features.map((feature, i) => (
                     <span key={i} className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs px-2.5 py-1 rounded-full">
                        {feature}
                        <button type="button" onClick={() => handleRemoveFeature(feature)} className="ml-1.5 text-emerald-500 hover:text-emerald-800 focus:outline-none">
                           <X />
                        </button>
                     </span>
                  ))}
               </div>
            </div>

            <div className="col-span-2">
               <Label htmlFor="description">Description</Label>
               <Textarea required name="description" id="description" value={formData.description} onChange={handleChange} className={`col-span-2 ${loading ? "cursor-not-allowed opacity-50" : ""}`} rows="3" placeholder="Enter description, clearly describe your storage facility..." />
            </div>
         </div>
         <SubmitButton loading={loading} text="Create Listing" />
      </>
   );
}
