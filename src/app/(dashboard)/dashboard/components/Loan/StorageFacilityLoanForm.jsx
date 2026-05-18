import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const StorageFacilityLoanForm = ({ formData, handleChange }) => {
   return (
      <>
         <section className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Facility Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="">
                  <Label htmlFor="total_capacity" className="text-xs font-bold mb-1">
                     Total Capacity (MT/CBM)
                  </Label>
                  <Input
                     type="text"
                     id="total_capacity"
                     placeholder="e.g. 500 Metric Tons"
                     className="p-3 border rounded-xl dark:bg-slate-800"
                     required
                     name="total_capacity"
                     value={formData?.total_capacity}
                     onChange={handleChange}
                  />
               </div>
               <div>
                  <Label htmlFor="current_utilization" className="text-xs font-bold mb-1">
                     Current Utilization (%)
                  </Label>
                  <Input
                     type="number"
                     id="current_utilization"
                     placeholder="e.g. 80"
                     className="p-3 border rounded-xl dark:bg-slate-800"
                     required
                     name="current_utilization"
                     value={formData?.current_utilization}
                     onChange={handleChange}
                  />
               </div>
               <div>
                  <Label htmlFor="storage_type" className="text-xs font-bold mb-1">
                     Storage Type
                  </Label>
                  <select
                     className="p-3 border rounded-xl dark:bg-slate-800"
                     id="storage_type"
                     name="storage_type"
                     value={formData?.storage_type}
                     onChange={handleChange}
                     required
                  >
                     <option value="" disabled>
                        Choose one
                     </option>
                     <option value="Cold Storage">Cold Storage</option>
                     <option value="Dry Storage">Dry Storage</option>
                     <option value="Controlled Atmosphere">Controlled Atmosphere</option>
                     <option value="Refrigerated">Refrigerated</option>
                  </select>
               </div>
               <div>
                  <Label htmlFor="farmers_served" className="text-xs font-bold mb-1">
                     Number of Farmers Served
                  </Label>
                  <Input
                     type="number"
                     id="farmers_served"
                     placeholder="e.g. 100"
                     className="p-3 border rounded-xl dark:bg-slate-800"
                     required
                     name="farmers_served"
                     value={formData?.farmers_served}
                     onChange={handleChange}
                  />
               </div>
            </div>
         </section>
      </>
   );
};

export default StorageFacilityLoanForm;
