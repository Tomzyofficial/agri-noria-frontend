import { Label } from "@/components/ui/Label";
import { Check } from "lucide-react";

export function PaymentMethod({ formData, handleInputChange }) {
   return (
      <div className="bg-(--white-fff) dark:bg-(--card-dark) rounded-md shadow-sm p-6">
         <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
               <Check className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-(--foreground)">2. PAYMENT METHOD</h2>
         </div>

         <div className="grid lg:grid-cols-2 gap-3 mb-6">
            <div>
               <Label htmlFor="payment_method" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
               </Label>
               <select
                  id="payment_method"
                  autoComplete="on"
                  required
                  placeholder="Select payment method"
                  className="border px-3 py-2 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
               >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
               </select>
            </div>
         </div>
      </div>
   );
}
