import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
// import { StateSelector, CitySelector } from "@/components/LocationSelector";
import { Check } from "lucide-react";

export function CustomerAddress({ formData, handleInputChange }) {
   return (
      <div className="bg-(--white-fff) dark:bg-(--card-dark) rounded-md shadow-sm p-6">
         <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-6 rounded-full  bg-[#5CB85C] flex items-center justify-center text-white text-xs">
               <Check className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-(--foreground)">1. CUSTOMER ADDRESS</h2>
         </div>
         <div className="grid lg:grid-cols-2 gap-3 mb-6">
            <div className="">
               <Label htmlFor="fname" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  First name
               </Label>
               <Input
                  required
                  autoComplete="on"
                  id="fname"
                  placeholder="Enter first name"
                  className="border px-3 py-2 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
               />
            </div>
            <div className="">
               <Label htmlFor="lname" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last name
               </Label>
               <Input
                  required
                  autoComplete="on"
                  id="lname"
                  placeholder="Enter last name"
                  className="border px-3 py-2 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
               />
            </div>
            <div className="">
               <Label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
               </Label>
               <Input
                  id="phone"
                  autoComplete="on"
                  required
                  placeholder="Enter phone number"
                  className="border px-3 py-2 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <Label htmlFor="address" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
               </Label>
               <Input
                  id="address"
                  autoComplete="on"
                  required
                  placeholder="Enter address"
                  className="border px-3 py-2 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
               />
            </div>

            <div className="">{/* <StateSelector value={formData.state} onChange={handleInputChange} /> */}</div>
            <div className="">
               {/* <CitySelector state={formData.state} value={formData.city} onChange={handleInputChange} /> */}
            </div>
         </div>
      </div>
   );
}
