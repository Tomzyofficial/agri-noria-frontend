"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function FarmerFields({ formData, handleChange, loading }) {
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         <div>
            <Label htmlFor="crop_type">Crop Type</Label>
            <Input
               name="crop_type"
               placeholder="Eg., Wheat, Maize..."
               id="crop_type"
               value={formData.attributes.crop_type}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="variety">Variety</Label>
            <Input
               name="variety"
               placeholder="Eg., Basmati, IR8..."
               id="variety"
               value={formData.attributes.variety}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
               required
            />
         </div>

         <div>
            <Label htmlFor="quality">Quality</Label>
            <select
               name="quality"
               id="quality"
               value={formData.attributes.quality}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            >
               <option value="">Select</option>
               <option value="Premium">Premium</option>
               <option value="Good">Good</option>
               <option value="Fair">Fair</option>
               <option value="Standard">Standard</option>
            </select>
         </div>

         <div>
            <Label htmlFor="harvest_date">Harvest Date</Label>
            <Input
               type="date"
               name="harvest_date"
               id="harvest_date"
               value={formData.attributes.harvest_date}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="organic">Organic</Label>
            <select
               name="organic"
               id="organic"
               value={formData.attributes.organic}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
               onChange={handleChange}
            >
               <option value="">Select</option>
               <option value="Yes">Yes</option>
               <option value="No">No</option>
               <option value="In Process">In Process</option>
            </select>
         </div>
      </div>
   );
}
