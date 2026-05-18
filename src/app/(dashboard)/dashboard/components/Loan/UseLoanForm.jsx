"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export function UseLoanForm() {
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      total_capacity: "",
      current_utilization: "",
      storage_type: "",
      farmers_served: "",
      monthly_revenue: "",
      inv_type: "",
      farm_size: "",
      primary_crop: "",
      org_name: "",
      amount: "",
      repay_amount: "",
      repay_period: "",
      years_in_operation: "",
      supporting_doc: "",
      bank_statement: "",
   });

   // Debug formData changes
   // useEffect(() => {
   //    console.log("formData changed:", formData);

   //    // Auto-calculate repay_amount (10% of amount) when amount changes
   //    if (formData.amount && !formData.repay_amount) {
   //       const calculatedRepayAmount = Number(formData.amount) * 0.1; // 10% of amount
   //       setFormData((prev) => ({ ...prev, repay_amount: calculatedRepayAmount.toString() }));
   //       console.log("Auto-calculated repay_amount:", calculatedRepayAmount);
   //    }
   // }, [formData]);

   const handleChange = (e) => {
      const { name, type, value, files } = e.target;
      if (type === "file") {
         const file = files[0];
         if (file) {
            setFormData((prev) => ({ ...prev, [name]: file }));
         } else {
            setFormData((prev) => ({ ...prev, [name]: "" })); // Ensure empty value is set
         }
      } else {
         if (name === "amount") {
            const newAmount = Number(value);
            const calculatedRepayAmount = Number(newAmount) + Number(newAmount * 0.1); // 10% of amount
            setFormData((prev) => ({
               ...prev,
               [name]: value,
               repay_amount: calculatedRepayAmount,
            }));
         } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
         }
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      const validateFile = (file, fieldName) => {
         if (!file) {
            throw new Error(`${fieldName} is required`);
         }
         if (!file.type?.startsWith("image/")) {
            throw new Error(`${fieldName} must be an image`);
         }
         if (file.size > 5 * 1024 * 1024) {
            throw new Error(`${fieldName} exceeds 5MB`);
         }
      };

      validateFile(formData.supporting_doc, "Supporting document");
      validateFile(formData.bank_statement, "Bank statement");

      try {
         setLoading(true);
         const formDataToSend = new FormData();

         Object.keys(formData).forEach((key) => {
            formDataToSend.append(key, formData[key]);
         });

         const response = await fetch("/api/proxy/vendor/loan/application", {
            method: "POST",
            body: formDataToSend,
         });

         const data = await response.json();
         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to submit loan application.");
         }

         toast.success(data.message);
         setFormData({
            total_capacity: "",
            current_utilization: "",
            storage_type: "",
            farmers_served: "",
            monthly_revenue: "",
            inv_type: "",
            farm_size: "",
            primary_crop: "",
            org_name: "",
            amount: "",
            repay_amount: "",
            repay_period: "",
            years_in_operation: "",
            supporting_doc: "",
            bank_statement: "",
         });
      } catch (error) {
         console.error("Submit error:", error);
         toast.error(error.message || "Something went wrong. Try again.");
      } finally {
         setLoading(false);
      }
   };

   return { formData, handleChange, handleSubmit, loading };
}
