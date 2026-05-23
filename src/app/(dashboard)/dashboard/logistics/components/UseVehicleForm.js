"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import vehicleUploadSchema from "@/_lib/validations/validateLogisticsOperation";

export function useVehicleForm() {
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    images: "",
    title: "",
    vehicle_type: "",
    license_plate: "",
    cargo_type: "enclosed_box",
    max_weight_kg: "",
    volume_cubic_meters: "",
    base_location: "",
    operating_regions: [],
    pricing_model: "flat_rate",
    rate_amount: "",
  });

  const [regionInput, setRegionInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (file) {
        setPreview(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRegion = (e) => {
    e.preventDefault();
    if (
      regionInput.trim() &&
      !formData.operating_regions.includes(regionInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        operating_regions: [...prev.operating_regions, regionInput.trim()],
      }));
      setRegionInput("");
    }
  };

  const handleRemoveRegion = (regionToRemove) => {
    setFormData((prev) => ({
      ...prev,
      operating_regions: prev.operating_regions.filter(
        (r) => r !== regionToRemove,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    /*  try {
      if (formData.operating_regions.length === 0) {
        throw new Error("Please add at least one operating region");
      }

      for (const [key, value] of Object.entries(formData)) {
        // Skip volume_cubic_meters as it's optional
        if (key === "volume_cubic_meters") continue;

        if (
          value === "" ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          const formattedKey = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

          throw new Error(`${formattedKey} is required`);
        }
      }
    } catch (error) {
      console.log("error occurred here", error);
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
 */

    let validate = vehicleUploadSchema.safeParse(formData);
    if (!validate.success) {
      const firstMsg = Object.values(validate.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0];
      if (firstMsg) {
        toast.error(firstMsg);
        setLoading(false);
        return;
      }
    }
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== "" &&
        formData[key] !== null &&
        formData[key] !== undefined
      ) {
        if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    try {
      const response = await fetch("/api/proxy/vendor/logistics/add-vehicle", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload vehicle record");
      } else {
        // Reset form
        setFormData({
          title: "",
          vehicle_type: "",
          license_plate: "",
          cargo_type: "enclosed_box",
          max_weight_kg: "",
          volume_cubic_meters: "",
          base_location: "",
          operating_regions: [],
          pricing_model: "flat_rate",
          rate_amount: "",
          images: "",
        });
        setPreview(null);
        toast.success("Vehicle uploaded successfully");
      }
    } catch (err) {
      console.log("error occurred while sending vehicle data", err);
      toast.error(err.message || "Error occurred catch");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleInputChange,
    regionInput,
    setRegionInput,
    handleAddRegion,
    handleRemoveRegion,
    handleSubmit,
    preview,
    loading,
  };
}
