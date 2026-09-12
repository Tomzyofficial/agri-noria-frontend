"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { imageFileTypes, MAX_FILE_SIZE } from "@/utils/otherUtils";
import { updateStorageSchema } from "@/_lib/validations/ValidateStorageListing";

export function useStorageEditForm(storage) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [preview, setPreview] = useState(storage.image);
   const [featureText, setFeatureText] = useState("");

   const [formData, setFormData] = useState({
      storageId: storage.id,
      listing_name: storage.listing_name || "",
      href: storage.href || "",
      storage_type: storage.storage_type || "",
      location: storage.location || "",
      capacity: storage.capacity || "",
      available: storage.available || "",
      price: storage.price || "",
      temperature: storage.temperature || "",
      description: storage.description || "",
      features: Array.isArray(storage.features) ? storage.features : [],
      image: null,
   });

   const handleChange = (e) => {
      const { name, type, value, files } = e.target;

      if (type === "file") {
         const selectedFiles = Array.from(files ?? []);

         if (selectedFiles.length === 0) return;
         const oversizedFile = selectedFiles.find((f) => f.size > MAX_FILE_SIZE);
         if (oversizedFile) {
            toast.error(`"${oversizedFile.name}" exceeds the 5MB limit`);
            return;
         }
         const invalidFile = selectedFiles.find((f) => !imageFileTypes.includes(f.type));

         if (invalidFile) {
            toast.error("You can only upload image files (JPEG, PNG, JPG, WebP)");
            return;
         }
         const urls = selectedFiles.map((file) => URL.createObjectURL(file));
         setPreview(urls);

         if (e.target.multiple) {
            setFormData((prev) => ({ ...prev, [name]: selectedFiles }));
         } else {
            setFormData((prev) => ({ ...prev, [name]: selectedFiles[0] }));
         }
      } else {
         // Auto-generate href from listing_name
         if (name === "listing_name") {
            const href = value
               .trim()
               .toLowerCase()
               .replace(/[^a-z0-9\s]/g, "") // Remove special chars first (except spaces)
               .replace(/\s+/g, "-"); // Turn spaces into hyphens

            setFormData((prev) => ({ ...prev, [name]: value, href: href }));
         } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
         }
      }
   };

   const handleAddFeature = (e) => {
      e.preventDefault();
      if (featureText.trim() && !formData.features.includes(featureText.trim())) {
         setFormData((prev) => ({
            ...prev,
            features: [...prev.features, featureText.trim()],
         }));
         setFeatureText("");
      }
   };

   const handleRemoveFeature = (featureText) => {
      setFormData((prev) => ({
         ...prev,
         features: prev.features.filter((r) => r !== featureText),
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         // if (!formData.listing_name || formData.listing_name.trim() === "") {
         //    throw new Error("Storage name is required");
         // }
         // if (!formData.storage_type) {
         //    throw new Error("Storage type is required");
         // }
         // if (!formData.location || formData.location.trim() === "") {
         //    throw new Error("Location is required");
         // }
         // if (!formData.capacity || formData.capacity.trim() === "") {
         //    throw new Error("Capacity is required");
         // }
         // if (!formData.available || formData.available.trim() === "") {
         //    throw new Error("Available is required");
         // }
         // if (!formData.price || formData.price.trim() === "" || isNaN(formData.price) || formData.price <= 0) {
         //    throw new Error("Price must be a valid number");
         // }
         // if (!formData.temperature || formData.temperature.trim() === "") {
         //    throw new Error("Temperature is required");
         // }
         // if (formData.features.length === 0) {
         //    throw new Error("At least one feature is required");
         // }
         // if (!formData.description || formData.description.trim() === "") {
         //    throw new Error("Description is required");
         // }

         let validate = updateStorageSchema.safeParse(formData);
         if (!validate.success) {
            const firstMsg = Object.values(validate.error.flatten().fieldErrors).flat().filter(Boolean)[0];
            if (firstMsg) {
               toast.error(firstMsg);
               return;
            }
         }

         setLoading(true);

         const formDataToSend = new FormData();
         // Object.entries(formData).forEach(([key, value]) => {
         //    if (key === "features") {
         //       formDataToSend.append(key, JSON.stringify(value));
         //    } else if (key === "image" && typeof value === "object") {
         //       formDataToSend.append("image", value);
         //    } else if (value !== null && value !== undefined) {
         //       formDataToSend.append(key, value);
         //    }
         // });

         Object.entries(validate.data).forEach(([key, value]) => {
            if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
               return;
            }

            if (key === "image" && Array.isArray(value)) {
               value.forEach((file) => {
                  formDataToSend.append(key, file);
               });
            } else if (key === "features") {
               formDataToSend.append(key, JSON.stringify(value));
            } else {
               formDataToSend.append(key, value);
            }
         });

         const response = await fetch(`/api/proxy/vendor/storage/edit-item`, {
            method: "PATCH",
            body: formDataToSend,
         });

         const data = await response.json();
         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to update storage facility");
         }

         toast.success("Storage facility updated successfully!");
         router.push("/marketplace/storage-facility/storage-facilities");
      } catch (err) {
         toast.error(err.message || "Something went wrong while updating the storage facility.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, preview, loading, handleAddFeature, handleRemoveFeature, featureText, setFeatureText };
}
