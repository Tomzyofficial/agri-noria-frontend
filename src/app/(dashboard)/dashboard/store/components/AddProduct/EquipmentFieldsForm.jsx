"use client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function EquipmentFieldsForm({ formData, handleChange, loading }) {
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         <div>
            <Label htmlFor="equipment_type">Equipment Type</Label>
            <Input
               name="equipment_type"
               placeholder="Eg., Tractor, Combine Harvester..."
               id="equipment_type"
               value={formData.attributes.equipment_type}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
               name="brand"
               placeholder="Eg., John Deere, Mahindra..."
               id="brand"
               value={formData.attributes.brand}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="model">Model</Label>
            <Input
               name="model"
               placeholder="Eg., XTS-3000, TH-250..."
               id="model"
               value={formData.attributes.model}
               onChange={handleChange}
               required
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>

         <div>
            <Label htmlFor="condition">Condition</Label>
            <select
               name="condition"
               id="condition"
               value={formData.attributes.condition}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            >
               <option value="">Select</option>
               <option value="New">New</option>
               <option value="Used - Excellent">Used - Excellent</option>
               <option value="Used - Good">Used - Good</option>
               <option value="Refurbished">Refurbished</option>
            </select>
         </div>

         <div>
            <Label htmlFor="warranty">Warranty (months)</Label>
            <Input
               name="warranty"
               placeholder="Eg., 12 months"
               id="warranty"
               value={formData.attributes.warranty}
               onChange={handleChange}
               className={loading ? "cursor-not-allowed opacity-50" : ""}
               disabled={loading}
            />
         </div>
      </div>
   );
}
