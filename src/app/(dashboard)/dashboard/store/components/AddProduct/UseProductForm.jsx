"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export function useProductForm(user) {
   const [loading, setLoading] = useState(false);
   const [preview, setPreview] = useState(null);

   const [formData, setFormData] = useState({
      product_image: "",
      listing_name: "",
      location: "",
      // currency: "",
      price: "",
      unit_measure: "",
      available_quantity: "",
      unit: "",
      category: "",
      description: "",
      min_quantity: null,
      discount: null,
      attributes: {
         food_type: "",
         expiry_date: "",
         package_type: "",
         storage_requirement: "",
         harvest_date: "",
         crop_type: "",
         variety: "",
         quality: "",
         organic: "",
         equipment_type: "",
         brand: "",
         model: "",
         condition: "",
         warranty: "",
      },
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
         // Check if this is an attribute field (category-specific)
         const attributeFields = [
            "food_type",
            "expiry_date",
            "package_type",
            "storage_requirement",
            "harvest_date",
            "crop_type",
            "variety",
            "quality",
            "organic",
            "equipment_type",
            "brand",
            "model",
            "condition",
            "warranty",
         ];

         if (attributeFields.includes(name)) {
            // This is a category-specific field, store in attributes
            setFormData((prev) => ({
               ...prev,
               attributes: {
                  ...prev.attributes,
                  [name]: value,
               },
            }));
         } else {
            // This is a common field, store directly
            setFormData((prev) => ({ ...prev, [name]: value }));
         }
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      setLoading(true);

      try {
         // Client-side validation
         if (!formData.product_image) {
            throw new Error("Product image is required");
         }
         if (!formData.listing_name || formData.listing_name.trim() === "") {
            throw new Error("Product name is required");
         }
         if (!formData.location || formData.location.trim() === "") {
            throw new Error("Location is required");
         }
         // if (!formData.currency) {
         //    throw new Error("Currency is required");
         // }
         if (!formData.price || formData.price <= 0 || isNaN(formData.price) || formData.price.trim() === "") {
            throw new Error("Price must be a valid number");
         }
         if (!formData.unit_measure) {
            throw new Error("Unit measure is required");
         }
         if (
            !formData.available_quantity ||
            formData.available_quantity <= 0 ||
            isNaN(formData.available_quantity) ||
            formData.available_quantity.trim() === ""
         ) {
            throw new Error("Available quantity must be a valid number greater than 0");
         }
         if (!formData.unit || formData.unit.trim() === "") {
            throw new Error("Unit is required");
         }
         if (!formData.category) {
            throw new Error("Category is required");
         }
         if (!formData.description || formData.description.trim() === "") {
            throw new Error("Description is required");
         }
         if (formData.min_quantity !== undefined && formData.min_quantity !== null && formData.min_quantity !== "") {
            const minQtyNum = Number(formData.min_quantity);
            if (isNaN(minQtyNum) || minQtyNum < 0) {
               throw new Error("Minimum quantity must be a valid non-negative number");
            }
         }
         if (formData.discount !== undefined && formData.discount !== null && formData.discount !== "") {
            const discountNum = Number(formData.discount);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
               throw new Error("Discount must be a number between 0 and 100");
            }
         }

         // Category-specific validation
         if (formData.category === "food_items") {
            if (!formData.attributes.food_type || formData.attributes.food_type.trim() === "") {
               throw new Error("Food type is required");
            }
            if (!formData.attributes.expiry_date) {
               throw new Error("Expiry date is required");
            }
            if (!formData.attributes.package_type || formData.attributes.package_type.trim() === "") {
               throw new Error("Package type is required");
            }
            if (!formData.attributes.storage_requirement || formData.attributes.storage_requirement.trim() === "") {
               throw new Error("Storage requirement is required");
            }
         }

         if (formData.category === "farm_produce") {
            if (!formData.attributes.crop_type || formData.attributes.crop_type.trim() === "") {
               throw new Error("Crop type is required");
            }
            if (!formData.attributes.variety || formData.attributes.variety.trim() === "") {
               throw new Error("Variety is required");
            }
            if (!formData.attributes.quality || formData.attributes.quality.trim() === "") {
               throw new Error("Quality is required");
            }
            if (!formData.attributes.organic || formData.attributes.organic.trim() === "") {
               throw new Error("Organic status is required");
            }
            if (!formData.attributes.harvest_date) {
               throw new Error("Harvest date is required");
            }
         }

         if (formData.category === "equipment") {
            if (!formData.attributes.equipment_type || formData.attributes.equipment_type.trim() === "") {
               throw new Error("Equipment type is required");
            }
            if (!formData.attributes.brand || formData.attributes.brand.trim() === "") {
               throw new Error("Brand is required");
            }
            if (!formData.attributes.model || formData.attributes.model.trim() === "") {
               throw new Error("Model is required");
            }
            if (!formData.attributes.condition || formData.attributes.condition.trim() === "") {
               throw new Error("Condition is required");
            }
            if (!formData.attributes.warranty || formData.attributes.warranty.trim() === "") {
               throw new Error("Warranty is required");
            }
         }

         const formDataToSend = new FormData();

         // Add common fields
         Object.keys(formData).forEach((key) => {
            if (key !== "attributes" && formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
               formDataToSend.append(key, formData[key]);
            }
         });

         // Add attributes as JSON string
         if (formData.attributes && Object.keys(formData.attributes).length > 0) {
            formDataToSend.append("attributes", JSON.stringify(formData.attributes));
         }

         const response = await fetch("/api/proxy/vendor/products/add-item", {
            method: "POST",
            body: formDataToSend,
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || "Failed to add product. Try again.");
         }

         toast.success(data.message || "Product listed successfully.");
         Object.keys(formData).forEach((key) => setFormData((prev) => ({ ...prev, [key]: "" })));
         setPreview(null);
      } catch (err) {
         toast.error(err.message || "Something went wrong. Try again.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, preview, loading };
}
