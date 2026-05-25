"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export function useStorageForm() {
   const [loading, setLoading] = useState(false);
   const [preview, setPreview] = useState(null);

   const [formData, setFormData] = useState({
      storage_image: "",
      storage_name: "",
      href: "",
      storage_type: "",
      location: "",
      capacity: "",
      available: "",
      price: "",
      temperature: "",
      description: "",
      features: [],
   });

   const handleChange = (e) => {
      const { name, type, value, files } = e.target;

      if (type === "file") {
         const file = files[0];
         if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
         }
         if (file) {
            setPreview(URL.createObjectURL(file));
            setFormData((prev) => ({ ...prev, [name]: file }));
         }
      } else {
         // Auto-generate href from storage_name
         if (name === "storage_name") {
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

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         if (!formData.storage_image) {
            throw new Error("Storage image is required");
         }
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

         setLoading(true);
         const formDataToSend = new FormData();
         Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));

         const response = await fetch("/api/proxy/vendor/storage/add-storage", {
            method: "POST",
            body: formDataToSend,
         });

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to add storage facility.");
         }

         toast.success(data.message);
         /*   setFormData({
            storage_image: "",
            storage_name: "",
            href: "",
            storage_type: "",
            city: "",
            state: "",
            capacity: "",
            available: "",
            price: "",
            currency: "",
            temperature: "",
            description: "",
            features: [],
         }); */
         Object.keys(formData).forEach((key) => setFormData((prev) => ({ ...prev, [key]: "", features: [] })));
         setPreview(null);
      } catch (error) {
         toast.error(error.message || "Something went wrong. Try again.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, preview, loading };
}
