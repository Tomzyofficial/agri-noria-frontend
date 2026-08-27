"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { imageFileTypes, MAX_FILE_SIZE } from "@/utils/otherUtils";

const ATTRIBUTE_FIELDS = ["equipment_type", "brand", "model", "condition", "warranty", "harvest_date", "crop_type", "variety", "quality", "organic", "food_type", "expiry_date", "package_type", "storage_requirement"];

const isBlank = (val) => val === null || val === undefined || String(val).trim() === "";

export function useProductEditForm(product) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);

   const [preview, setPreview] = useState(Array.isArray(product.image) ? product.image : product.image ? [product.image] : []);

   let parsedAttributes = {};
   if (product.attributes) {
      try {
         parsedAttributes = typeof product.attributes === "string" ? JSON.parse(product.attributes) : product.attributes;
      } catch (e) {
         console.error("Failed to parse product attributes:", e);
      }
   }

   const [formData, setFormData] = useState({
      product_id: product.id || "",
      image: null,
      listing_name: product.listing_name || "",
      description: product.description || "",
      price: product.price ?? "",
      location: product.location || "",
      unit_measure: product.unit_measure || "",
      available_quantity: product.available_quantity ?? "",
      unit: product.unit || "",
      min_quantity: product.min_quantity ?? "",
      category: product.category || "",
      discount: product.discount ?? "",
      attributes: parsedAttributes || {},
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
         if (ATTRIBUTE_FIELDS.includes(name)) {
            setFormData((prev) => ({
               ...prev,
               attributes: { ...prev.attributes, [name]: value },
            }));
         } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
         }
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         if (isBlank(formData.listing_name)) throw new Error("Product name is required");
         if (isBlank(formData.location)) throw new Error("Location is required");

         const priceNum = Number(formData.price);
         if (isBlank(formData.price) || isNaN(priceNum) || priceNum <= 0) {
            throw new Error("Price must be a valid number");
         }

         if (isBlank(formData.unit_measure)) throw new Error("Unit measure is required");

         const qtyNum = Number(formData.available_quantity);
         if (isBlank(formData.available_quantity) || isNaN(qtyNum) || qtyNum <= 0) {
            throw new Error("Available quantity must be a valid number greater than 0");
         }

         if (isBlank(formData.unit)) throw new Error("Unit is required");
         if (isBlank(formData.category)) throw new Error("Category is required");
         if (isBlank(formData.description)) throw new Error("Description is required");

         if (!isBlank(formData.min_quantity)) {
            const minQtyNum = Number(formData.min_quantity);
            if (isNaN(minQtyNum) || minQtyNum < 0) {
               throw new Error("Minimum quantity must be a valid non-negative number");
            }
         }

         if (!isBlank(formData.discount)) {
            const discountNum = Number(formData.discount);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
               throw new Error("Discount must be a number between 0 and 100");
            }
         }

         // --- Category-specific validation ---
         const attrs = formData.attributes || {};

         if (formData.category === "food_items") {
            if (isBlank(attrs.food_type)) throw new Error("Food type is required");
            if (isBlank(attrs.expiry_date)) throw new Error("Expiry date is required");
            if (isBlank(attrs.package_type)) throw new Error("Package type is required");
            if (isBlank(attrs.storage_requirement)) throw new Error("Storage requirement is required");
         }

         if (formData.category === "farm_produce") {
            if (isBlank(attrs.crop_type)) throw new Error("Crop type is required");
            if (isBlank(attrs.variety)) throw new Error("Variety is required");
            if (isBlank(attrs.quality)) throw new Error("Quality is required");
            if (isBlank(attrs.organic)) throw new Error("Organic status is required");
            if (isBlank(attrs.harvest_date)) throw new Error("Harvest date is required");
         }

         if (formData.category === "equipment") {
            if (isBlank(attrs.equipment_type)) throw new Error("Equipment type is required");
            if (isBlank(attrs.brand)) throw new Error("Brand is required");
            if (isBlank(attrs.model)) throw new Error("Model is required");
            if (isBlank(attrs.condition)) throw new Error("Condition is required");
            if (isBlank(attrs.warranty)) throw new Error("Warranty is required");
         }

         const formDataToSend = new FormData();

         Object.entries(formData).forEach(([key, value]) => {
            if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
               return;
            }
            if (key === "attributes") {
               formDataToSend.append("attributes", JSON.stringify(formData.attributes));
            } else if (key === "image" && Array.isArray(value)) {
               value.forEach((file) => {
                  formDataToSend.append(key, file);
               });
            } else {
               formDataToSend.append(key, value);
            }
         });

         const response = await fetch("/api/proxy/vendor/products/edit-item", {
            method: "PATCH",
            body: formDataToSend,
         });

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to update product");
         }

         toast.success(data.message || "Product updated successfully!");
         router.push("/marketplace/store/products");
      } catch (err) {
         console.error("Update error:", err);
         toast.error(err.message || "Something went wrong while updating the product.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, loading, preview };
}
