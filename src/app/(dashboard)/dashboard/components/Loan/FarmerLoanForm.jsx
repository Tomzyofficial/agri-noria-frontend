import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
export function FarmerLoanForm({ formData, handleChange }) {
   return (
      <>
         <div className="flex flex-col">
            <Label htmlFor="farm_size" className="text-sm font-semibold mb-1">
               Farm Size
            </Label>
            <Input
               type="number"
               id="farm_size"
               name="farm_size"
               value={formData.farm_size}
               onChange={handleChange}
               className="p-3 border rounded-xl dark:bg-slate-800"
               placeholder="E.g. 5 acres/meters"
               required
            />
         </div>
         <div className="flex flex-col">
            <Label htmlFor="primary_crop" className="text-sm font-semibold mb-1">
               Primary Crop
            </Label>
            <Input
               type="text"
               id="primary_crop"
               name="primary_crop"
               value={formData.primary_crop}
               onChange={handleChange}
               placeholder="e.g. Cocoa, Rice"
               className="p-3 border rounded-xl dark:bg-slate-800"
               required
            />
         </div>
      </>
   );
}
