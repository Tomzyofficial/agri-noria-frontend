"use client";

import { useState } from "react";
import { Calendar, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "react-toastify";
import { storageQuoteRequestSchema } from "@/_lib/validations/validateQuoteReq";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Textarea } from "../ui/Textarea";

export default function StorageForm({ onClose, targetId, quoteType }) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    commodity: "",
    quantity: "",
    unit: "",
    duration: "",
    start_date: "",
    storage_type: "",
    agreement: false,
    additional_info: "",
    quote_type: quoteType,
  });

  const inputStyle = "rounded-r border-1 border-transparent ring ring-(--greenish-color) dark:ring-gray-700 outline-none bg-(--gray-color) dark:bg-(--background) focus:border-(--dark-green-color) dark:focus:border-gray-500 p-2 w-full bookings";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validateSchema = storageQuoteRequestSchema.safeParse(formData);
      if (!validateSchema.success) {
        const fieldErrors = validateSchema.error.flatten().fieldErrors;
        const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
        if (firstMsg) throw new Error(firstMsg);
      }

      if (!isValidPhoneNumber(formData.phone)) {
        throw new Error("Please enter a valid phone number");
      }

      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch(`/api/proxy/marketplace/booking-request/${targetId.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit booking request");
      }

      setIsSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error) {
      toast.error(error.message || "An error occurred while submitting your request.");
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Storage Quote Request Sent!</h3>
        <p className="text-gray-600 mb-6">We've received your storage quote request. You'll be contacted shortly by the storage provider with further information. Thank you for using our marketplace!</p>
        <Button onClick={onClose} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h3 className="sm:text-lg md:text-2xl font-semibold md:font-bold text-gray-900 mb-4 md:mb-6">Request Storage Quote</h3>
      <form onSubmit={handleSubmit} aria-busy={isSubmitting} noValidate>
        {/* CONTACT INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:space-y-2">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <div className="flex items-center">
              <div className="hidden md:block pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                <User className="h-4.5 w-5 text-gray-400" />
              </div>
              <Input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" autoComplete="on" />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center">
              {/* <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                <Phone className="h-4.5 w-5 text-gray-400" />
              </div> */}

              {/* <Input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}

                placeholder="Enter phone number (Include country code)"
              /> */}
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phone}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: value,
                  }))
                }
                placeholder="Enter phone number"
                className="phone-input"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="commodity">Commodity Type</Label>
            <select id="commodity" name="commodity" required value={formData.commodity} onChange={handleChange}>
              <option value="">Select Commodity Type *</option>
              <option value="Maize">Maize</option>
              <option value="Rice">Rice</option>
              <option value="Beans">Beans</option>
              <option value="Soybeans">Soybeans</option>
              <option value="Cassava">Cassava</option>
              <option value="Yam">Yam</option>
              <option value="Groundnuts">Groundnuts</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input type="number" id="quantity" name="quantity" placeholder="Enter quantity" required value={formData.quantity} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <select id="unit" name="unit" required value={formData.unit} onChange={handleChange}>
              <option value="">Select Unit *</option>
              <option value="Kg">Kg</option>
              <option value="Tons">Tons</option>
              <option value="Bags">Bags</option>
              <option value="Crates">Crates</option>
            </select>
          </div>

          <div>
            <Label htmlFor="storage_type">Storage Type</Label>
            <select id="storage_type" name="storage_type" required value={formData.storage_type} onChange={handleChange}>
              <option value="">Select Storage Type *</option>
              <option value="Dry">Dry Storage</option>
              <option value="Cold">Cold Storage</option>
              <option value="Frozen">Frozen Storage</option>
              <option value="Warehouse">General Warehouse</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <div className="flex items-center">
              <div className="pointer-events-none p-3 bg-background ring ring-(--greenish-color) dark:ring-gray-700 rounded-l">
                <Calendar className="h-4.5 w-5 text-gray-400" />
              </div>
              <Input type="date" id="start_date" name="start_date" required min={new Date().toISOString().split("T")[0]} value={formData.start_date} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Storage Duration</Label>
            <select id="duration" name="duration" required value={formData.duration} onChange={handleChange}>
              <option value="">Select Storage Duration *</option>
              <option value="1 month">Less than 1 month</option>
              <option value="1-3 months">1 - 3 months</option>
              <option value="3-6 months">3 - 6 months</option>
              <option value="6-12 months">6 - 12 months</option>
              <option value="12+ months">More than 1 year</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="additional_info">Additional Information (Optional)</Label>
            <Textarea id="additional_info" name="additional_info" value={formData.additional_info} placeholder="Any specific requirements or details you'd like to share?" onChange={handleChange} />
          </div>
        </div>

        <div className="flex items-start space-x-3 py-4">
          <input type="checkbox" id="agreement" name="agreement" required checked={formData.agreement} onChange={handleChange} className="mt-1" />
          <Label htmlFor="agreement" className="text-sm text-gray-700">
            I agree to share my details with the storage provider for quotation purposes
          </Label>
        </div>

        <div className="pt-2 md:pt-3 flex space-x-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full cursor-pointer flex justify-center py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"}`}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-2">
                <FaSpinner className="h-4 w-4 animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : (
              "Request Quote"
            )}
          </Button>

          <Button type="button" onClick={onClose} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
