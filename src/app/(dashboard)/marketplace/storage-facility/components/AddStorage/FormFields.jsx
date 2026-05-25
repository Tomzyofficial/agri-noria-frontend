"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

const storageTypes = ["Cold Storage", "Dry Storage", "Controlled Atmosphere", "Refrigerated"];

export default function FormFields({ formData, handleChange, loading }) {
   const initialFeatures = formData.features && formData.features.length > 0 ? formData.features : [];

   const [features, setFeatures] = useState(initialFeatures);

   // Reset local features state when formData.features is reset to empty (after successful submission)
   useEffect(() => {
      // Only reset if formData.features is empty and we have non-empty features in local state
      if (Array.isArray(formData.features) && formData.features.length === 0) {
         const hasNonEmptyFeatures = features.some((f) => f && f.trim().length > 0);
         if (hasNonEmptyFeatures) {
            setFeatures([""]); // Reset to one empty input field
         }
      }
   }, [formData.features]);

   // Update formData.features whenever features change
   useEffect(() => {
      const featuresArray = [];
      features.forEach((feature) => {
         if (feature && feature.trim().length > 0) {
            featuresArray.push(feature);
         }
      });

      // Create a synthetic event to update formData
      const syntheticEvent = {
         target: {
            name: "features",
            value: featuresArray.length > 0 ? featuresArray : [],
         },
      };
      handleChange(syntheticEvent);
   }, [features]);

   const addFeature = () => {
      setFeatures([...features, ""]);
   };

   const removeFeature = (index) => {
      if (features.length > 1) {
         setFeatures(features.filter((_, i) => i !== index));
      }
   };

   const updateFeature = (index, value) => {
      const newFeatures = [...features];
      newFeatures[index] = value;
      setFeatures(newFeatures);
   };

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
            <Label htmlFor="storage_name">Storage Name</Label>
            <Input
               name="storage_name"
               id="storage_name"
               placeholder="Eg., Super deluxe"
               value={formData.storage_name}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div className="hidden" aria-hidden="true">
            <Label htmlFor="href">Storage Link (href)</Label>
            <Input
               type="text"
               name="href"
               id="href"
               value={formData.href}
               readOnly
               placeholder="Auto-generated from storage name"
            />
         </div>

         <div>
            <Label htmlFor="storage_type">Storage Type</Label>
            <select
               required
               name="storage_type"
               id="storage_type"
               value={formData.storage_type}
               onChange={handleChange}
               disabled={loading}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
            >
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
            <Input
               required
               type="text"
               name="location"
               id="location"
               value={formData.location}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               placeholder="Eg., Street, city, state..."
            />
         </div>

         <div>
            <Label htmlFor="capacity">Total Capacity</Label>
            <Input
               required
               type="text"
               inputMode="numeric"
               name="capacity"
               id="capacity"
               value={formData.capacity}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               placeholder="Eg., 500 sq ft"
            />
         </div>

         <div>
            <Label htmlFor="available">Available Capacity</Label>
            <Input
               required
               type="text"
               inputMode="numeric"
               name="available"
               id="available"
               value={formData.available}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               placeholder="Eg., 500 sq ft"
            />
         </div>

         <div>
            <Label htmlFor="price">Price</Label>
            <Input
               required
               type="text"
               name="price"
               id="price"
               value={formData.price}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               placeholder="E.g., 5000"
            />
         </div>

         <div>
            <Label htmlFor="temperature">Temperature Range</Label>
            <Input
               required
               type="text"
               name="temperature"
               id="temperature"
               value={formData.temperature}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               placeholder="Eg., 10-25°C"
            />
         </div>

         <div className="space-y-3">
            <Label htmlFor="features">Storage Features</Label>
            {features.map((feature, index) => (
               <div key={index} className="flex gap-3 items-center">
                  <Input
                     type="text"
                     placeholder="Eg., Refrigeration, Humidity Control"
                     value={formData.features[index] || feature}
                     onChange={(e) => updateFeature(index, e.target.value)}
                     className={loading ? "cursor-not-allowed opacity-50" : ""}
                     disabled={loading}
                  />
                  <Button
                     type="button"
                     onClick={() => removeFeature(index)}
                     disabled={features.length === 1 || loading}
                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                     title="Remove feature"
                  >
                     <Trash2 size={20} />
                  </Button>
               </div>
            ))}
            {/* Add Feature Button */}
            <div className="flex gap-3">
               <Button
                  type="button"
                  onClick={addFeature}
                  disabled={loading}
                  className="flex items-center gap-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Plus size={20} />
                  Add Feature
               </Button>
            </div>
         </div>

         <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
               required
               name="description"
               id="description"
               value={formData.description}
               onChange={handleChange}
               className={`col-span-2 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
               rows="3"
               placeholder="Enter description, clearly describe your storage facility..."
            />
         </div>
      </div>
   );
}
