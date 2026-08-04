"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import vehicleUploadSchema from "@/_lib/validations/validateLogisticsOperation";

export function useVehicleForm() {
   const [preview, setPreview] = useState(null);
   const [formData, setFormData] = useState({
      image: null,
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
         const fileList = files;
         Array.from(fileList).forEach((f) => {
            if (f.size > 5 * 1024 * 1024) {
               toast.error("File size must be less than 5MB");
               return;
            }
         });
         if (fileList && fileList.length > 0) {
            setPreview(URL.createObjectURL(fileList[0]));
            setFormData((prev) => ({ ...prev, [name]: fileList }));
         }
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }
   };

   const handleAddRegion = (e) => {
      e.preventDefault();
      if (regionInput.trim() && !formData.operating_regions.includes(regionInput.trim())) {
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
         operating_regions: prev.operating_regions.filter((r) => r !== regionToRemove),
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      let validate = vehicleUploadSchema.safeParse(formData);
      if (!validate.success) {
         const firstMsg = Object.values(validate.error.flatten().fieldErrors).flat().filter(Boolean)[0];
         if (firstMsg) {
            toast.error(firstMsg);
            setLoading(false);
            return;
         }
      }
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
         if (value == null || value === "") return;

         if (value instanceof FileList) {
            Array.from(value).forEach((file) => {
               formDataToSend.append(key, file);
            });
         } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
         } else {
            formDataToSend.append(key, value);
         }
      });

      console.log("sending data", formDataToSend);
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
               image: null,
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
