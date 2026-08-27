import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { FaSpinner } from "react-icons/fa6";

export function BusinessInfo({ ispending, formData, handleInputChange, handleSubmitInfo }) {
   return (
      <section className="space-y-2">
         <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
               type="text"
               disabled={ispending}
               className={ispending ? "opacity-50" : ""}
               autoComplete="on"
               id="business_name"
               name="business_name"
               value={formData.business_name}
               onChange={handleInputChange}
               placeholder="Business Name"
               required
            />
         </div>
         <div>
            <Label htmlFor="hot_line_phone_number">Phone Number </Label>
            <Input
               type="tel"
               disabled={ispending}
               className={ispending ? "opacity-50" : ""}
               autoComplete="on"
               id="hot_line_phone_number"
               name="hot_line_phone_number"
               value={formData.hot_line_phone_number}
               onChange={handleInputChange}
               placeholder="Phone"
               required
            />
         </div>
         <div>
            <Label htmlFor="address">Address</Label>
            <Input
               type="text"
               autoComplete="on"
               disabled={ispending}
               className={ispending ? "opacity-50" : ""}
               id="address"
               name="address"
               value={formData.address}
               onChange={handleInputChange}
               placeholder="Address"
            />
         </div>
         <div>
            <Label htmlFor="business_desc">About your business</Label>
            <Textarea
               disabled={ispending}
               className={ispending ? "opacity-50" : ""}
               id="business_desc"
               name="business_desc"
               value={formData.business_desc}
               onChange={handleInputChange}
               placeholder="About your business"
            />
         </div>
         <div>
            <Button
               type="button"
               disabled={ispending}
               className={`bg-green-600 text-white px-4 py-2 rounded ${ispending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
               onClick={handleSubmitInfo}
            >
               {ispending ? (
                  <span className="flex items-center gap-2">
                     <FaSpinner className="animate-spin h-4 w-4" />
                     Saving...
                  </span>
               ) : (
                  "Save"
               )}
            </Button>
         </div>
      </section>
   );
}
