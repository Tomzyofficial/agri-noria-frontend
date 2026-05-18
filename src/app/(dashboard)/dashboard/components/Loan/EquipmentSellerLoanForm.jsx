import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
export function EquipmentSellerLoanForm({ formData, handleChange }) {
   return (
      <>
         <div className="flex flex-col">
            <Label htmlFor="inv_type" className="text-sm font-semibold mb-1">
               Inventory Type
            </Label>
            <Input
               type="text"
               id="inv_type"
               name="inv_type"
               value={formData.inv_type}
               onChange={handleChange}
               placeholder="e.g. Fertilizers, Tools"
               className="p-3 border rounded-xl dark:bg-slate-800"
               required
            />
         </div>
      </>
   );
}
