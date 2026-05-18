import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
export function Acceptance({ formData, setFormData }) {
   return (
      <div className="flex gap-2 items-center">
         <Input
            type="checkbox"
            required
            id="accepted"
            autoComplete="off"
            name="accepted"
            checked={formData.accepted}
            onChange={(e) => setFormData((prev) => ({ ...prev, accepted: e.target.checked }))}
         />
         <Label htmlFor="accepted">Check the box if all of the above is correct and proceed to checkout</Label>
      </div>
   );
}
