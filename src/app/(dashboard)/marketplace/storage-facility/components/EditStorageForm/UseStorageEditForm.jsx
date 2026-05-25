"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function useStorageEditForm(storage) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [preview, setPreview] = useState(storage.storage_image);

   const [formData, setFormData] = useState({
      storageId: storage.id,
      storage_name: storage.storage_name || "",
      href: storage.href || "",
      storage_type: storage.storage_type || "",
      location: storage.location || "",
      capacity: storage.capacity || "",
      available: storage.available || "",
      price: storage.price || "",
      temperature: storage.temperature || "",
      description: storage.description || "",
      features: Array.isArray(storage.features) ? storage.features : [],
      storage_image: storage.storage_image || "",
   });

   const handleChange = (e) => {
      const { name, value, type, files } = e.target;

      if (type === "file" && files && files[0]) {
         const file = files[0];
         const reader = new FileReader();

         reader.onloadend = () => {
            setPreview(reader.result);
            setFormData((prev) => ({
               ...prev,
               storage_image: file,
            }));
         };

         reader.readAsDataURL(file);
      } else {
         if (name === "storage_name") {
            const href = value
               .trim()
               .toLowerCase()
               .replace(/[^a-z0-9\s]/g, "") // Remove special chars first (except spaces)
               .replace(/\s+/g, "-"); // Turn spaces into hyphens

            setFormData((prev) => ({
               ...prev,
               [name]: value,
               href: href,
            }));
         } else {
            setFormData((prev) => ({
               ...prev,
               [name]: value,
            }));
         }
      }
   };

   /*    const handleFeatureChange = (index, value) => {
      const updatedFeatures = [...formData.features];
      updatedFeatures[index] = value;
      setFormData((prev) => ({
         ...prev,
         features: updatedFeatures,
      }));
   };

   const addFeature = () => {
      setFormData((prev) => ({
         ...prev,
         features: [...prev.features, ""],
      }));
   };

   const removeFeature = (index) => {
      const updatedFeatures = [...formData.features];
      updatedFeatures.splice(index, 1);
      setFormData((prev) => ({
         ...prev,
         features: updatedFeatures,
      }));
   } */
   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         if (!formData.storage_name || formData.storage_name.trim() === "") {
            throw new Error("Storage name is required");
         }
         if (!formData.storage_type) {
            throw new Error("Storage type is required");
         }
         if (!formData.location || formData.location.trim() === "") {
            throw new Error("Location is required");
         }
         if (!formData.capacity || formData.capacity.trim() === "") {
            throw new Error("Capacity is required");
         }
         if (!formData.available || formData.available.trim() === "") {
            throw new Error("Available is required");
         }
         if (!formData.price || formData.price.trim() === "" || isNaN(formData.price) || formData.price <= 0) {
            throw new Error("Price must be a valid number");
         }
         if (!formData.temperature || formData.temperature.trim() === "") {
            throw new Error("Temperature is required");
         }
         if (formData.features.length === 0) {
            throw new Error("At least one feature is required");
         }
         if (!formData.description || formData.description.trim() === "") {
            throw new Error("Description is required");
         }

         const formDataToSend = new FormData();
         Object.entries(formData).forEach(([key, value]) => {
            if (key === "features") {
               formDataToSend.append(key, JSON.stringify(value));
            } else if (key === "storage_image" && typeof value === "object") {
               formDataToSend.append("storage_image", value);
            } else if (value !== null && value !== undefined) {
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
         router.push("/dashboard/sub-store/storage-facilities");
      } catch (err) {
         toast.error(err.message || "Something went wrong while updating the storage facility.");
      } finally {
         setLoading(false);
      }
   };

   return {
      formData,
      handleChange,
      handleSubmit,
      preview,
      loading,
   };
}
