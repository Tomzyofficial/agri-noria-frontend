"use client";
import { storageFormSchema } from "@/_lib/validations/ValidateStorageListing";
import { imageFileTypes, MAX_FILE_SIZE } from "@/utils/otherUtils";
import { useState } from "react";
import { toast } from "react-toastify";

export function useStorageForm() {
   const [loading, setLoading] = useState(false);
   const [preview, setPreview] = useState([]);
   const [featureText, setFeatureText] = useState("");

   const [formData, setFormData] = useState({
      listing_name: "",
      href: "",
      storage_type: "",
      location: "",
      capacity: "",
      available: "",
      price: "",
      temperature: "",
      description: "",
      features: [],
      image: "",
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
         let validate = storageFormSchema.safeParse(formData);
         if (!validate.success) {
            const firstMsg = Object.values(validate.error.flatten().fieldErrors).flat().filter(Boolean)[0];
            if (firstMsg) {
               toast.error(firstMsg);
               return;
            }
         }

         setLoading(true);
         const validatedData = validate.data;
         const formDataToSend = new FormData();

         Object.entries(validatedData).forEach(([key, value]) => {
            if (value == null || value === "") return;

            if (key === "image" && Array.isArray(value)) {
               value.forEach((file) => {
                  formDataToSend.append(key, file);
               });
            } else {
               formDataToSend.append(key, value);
            }
         });

         const response = await fetch("/api/proxy/vendor/storage/add-storage", {
            method: "POST",
            body: formDataToSend,
         });

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to add storage facility.");
         }
         Object.keys(formData).forEach((key) => setFormData((prev) => ({ ...prev, [key]: "", features: [] })));
         setPreview(null);
         toast.success(data.message);
      } catch (error) {
         toast.error(error.message || "Something went wrong. Try again.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, preview, loading, handleAddFeature, handleRemoveFeature, featureText, setFeatureText };
}
