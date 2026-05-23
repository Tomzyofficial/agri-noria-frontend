import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Check } from "lucide-react";
import { LogisticsProviders } from "./LogisticProviders";

export function CustomerAddress({
  formData,
  handleInputChange,
  onLogisticsSelect,
}) {
  const address = formData.address;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-[#5CB85C] flex items-center justify-center text-white">
          <Check className="w-4 h-4" />
        </div>
        <h2 className="text-lg font-semibold uppercase">1. customer address</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-8">
        {/* Name Fields */}
        <div>
          <Label htmlFor="fname">First Name</Label>
          <Input
            id="fname"
            name="fname"
            value={formData.fname || ""}
            onChange={handleInputChange}
            placeholder="Enter first name"
            required
          />
        </div>

        <div>
          <Label htmlFor="lname">Last Name</Label>
          <Input
            id="lname"
            name="lname"
            value={formData.lname || ""}
            onChange={handleInputChange}
            placeholder="Enter last name"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Delivery Address</Label>
          <Input
            id="address"
            name="address"
            value={address || ""}
            onChange={handleInputChange}
            placeholder="Enter full address"
            required
          />
        </div>
      </div>

      {address && (
        <LogisticsProviders
          address={address}
          onLogisticsSelect={onLogisticsSelect}
        />
      )}
    </div>
  );
}
