"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function FoodItemFields({ formData, handleChange, loading }) {
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         <div>
            <Label htmlFor="food_type">Food Type</Label>
            <Input
               name="food_type"
               placeholder="E.g., Rice"
               id="food_type"
               value={formData.attributes.food_type}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
               name="expiry_date"
               type="date"
               id="expiry_date"
               value={formData.attributes.expiry_date}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
               required
            />
         </div>

         <div>
            <Label htmlFor="package_type">Package Type</Label>
            <select
               name="package_type"
               id="packaging_type"
               value={formData.attributes.package_type}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            >
               <option value="">Select</option>
               <option value="Plastic">Plastic</option>
               <option value="Paper">Paper</option>
               <option value="Glass">Glass</option>
               <option value="Bottle">Bottle</option>
               <option value="Bag">Bag</option>
               <option value="Carton">Carton</option>
            </select>
         </div>

         <div>
            <Label htmlFor="storage_requirement">Storage Requirement</Label>
            <select
               name="storage_requirement"
               id="storage_requirement"
               value={formData.attributes.storage_requirement}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
               onChange={handleChange}
            >
               <option value="">Select One</option>
               <option value="Refrigerated">Refrigerated</option>
               <option value="Frozen">Frozen</option>
               <option value="Dry">Dry</option>
               <option value="Other">Other</option>
            </select>
         </div>
      </div>
   );
}
