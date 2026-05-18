"use client";
import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/Button";

import { toast } from "react-toastify";
import { BusinessInfo } from "@/app/(dashboard)/dashboard/components/Profile/editProfile/Step1BusinessInfo";
import { BusinessDocs } from "@/app/(dashboard)/dashboard/components/Profile/editProfile/Step2BusinessDocs";
import { BusinessBank } from "@/app/(dashboard)/dashboard/components/Profile/editProfile/Step3BusinessBank";

export function VendorProfileEdit({ onProfileEdit }) {
   const [IDFrontpreview, setIDFrontPreview] = useState(null);
   const [IDBackpreview, setIDBackPreview] = useState(null);
   const [Licensepreview, setLicensePreview] = useState(null);
   const [activeTab, setActiveTab] = useState("info");
   const [step, setStep] = useState(1);
   const totalStep = 3;
   const steps = ["info", "docs", "bank"];

   const goToStep = (n) => {
      const clamped = Math.max(1, Math.min(n, totalStep));
      setStep(clamped);
      setActiveTab(steps[clamped - 1]);
   };

   const [formData, setFormData] = useState({
      business_name: "",
      hot_line_phone_number: "",
      address: "",
      business_desc: "",
      id_front_url: "",
      id_back_url: "",
      license_url: "",
      account_name: "",
      account_number: "",
      bank_name: "",
   });

   const handleInputChange = (e) => {
      const { type, name, value, files } = e.target;
      if (type === "file") {
         const file = files[0];
         if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit");
            return;
         }
         if (file) {
            const url = URL.createObjectURL(file);
            if (name === "id_front_url") setIDFrontPreview(url);
            if (name === "id_back_url") setIDBackPreview(url);
            if (name === "license_url") setLicensePreview(url);

            setFormData((prev) => ({
               ...prev,
               [name]: file,
            }));
         }
      } else {
         setFormData((prev) => ({
            ...prev,
            [name]: value,
         }));
      }
   };

   const [ispending, startTransition] = useTransition(formData);

   const handleSubmitInfo = async (e) => {
      e.preventDefault();
      try {
         const fd = new FormData();

         if (formData.business_name) fd.append("business_name", formData.business_name);
         if (formData.hot_line_phone_number) fd.append("hot_line_phone_number", formData.hot_line_phone_number);
         if (formData.address) fd.append("address", formData.address);
         if (formData.business_desc) fd.append("business_desc", formData.business_desc);

         if ([...fd.keys()].length === 0) {
            throw new Error("Please select at least one field to update");
         }

         if (formData.business_desc.length > 200) {
            throw new Error("Business description must be less than 200 characters");
         }

         startTransition(async () => {
            const res = await fetch("/api/proxy/vendor/edit-profile", {
               method: "POST",
               body: fd,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
               throw new Error(data.message || "Failed to save profile info");
            }

            onProfileEdit(data.updateDoc);

            toast.success(data.message || "Profile info saved");

            // Clear formata on successful update
            Object.entries(formData).forEach(([key, val]) => {
               if (val !== undefined && val !== null) {
                  setFormData((prev) => ({
                     ...prev,
                     [key]: "",
                  }));
               }
            });
         });
      } catch (error) {
         toast.error(error.message || "Error saving profile info");
      }
   };

   const handleSubmitDocs = async (e) => {
      e.preventDefault();
      try {
         const fd = new FormData();
         if (formData.id_front_url) fd.append("id_front_url", formData.id_front_url);
         if (formData.id_back_url) fd.append("id_back_url", formData.id_back_url);
         if (formData.license_url) fd.append("license_url", formData.license_url);
         if ([...fd.keys()].length === 0) {
            throw new Error("Please select at least one document to upload");
         }

         startTransition(async () => {
            const res = await fetch("/api/proxy/vendor/edit-profile", {
               method: "POST",
               body: fd,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
               throw new Error(data.error || "Failed to upload documents");
            }
            toast.success(data.message || "Documents uploaded");
         });
      } catch (error) {
         toast.error(error.message || "Error uploading documents");
      }
   };

   const handleSubmitBank = async (e) => {
      e.preventDefault();
      try {
         if (!formData.bank_name || !formData.account_name || !formData.account_number) {
            throw new Error("Please fill all bank details");
         }

         // Check to make sure bank account number doesn't exceed 10
         if (formData.account_number.length > 10 || formData.account_number.length < 10) {
            throw new Error("Bank account number must be 10 digits");
         }

         const fd = new FormData();
         fd.append("bank_name", formData.bank_name);
         fd.append("account_name", formData.account_name);
         fd.append("account_number", formData.account_number);

         startTransition(async () => {
            const res = await fetch("/api/proxy/vendor/edit-profile", {
               method: "POST",
               body: fd,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
               throw new Error(data.error || "Failed to save bank details");
            }
            toast.success(data.message || "Bank details saved");

            // Clear form on successful update
            Object.entries(formData).forEach(([key, val]) => {
               if (val !== undefined && val !== null) {
                  setFormData((prev) => ({
                     ...prev,
                     [key]: "",
                  }));
               }
            });
         });
      } catch (error) {
         toast.error(error.message || "Error saving bank details");
      }
   };

   // Revoke url file object to prevent memory leak
   useEffect(() => {
      return () => {
         try {
            if (IDFrontpreview?.startsWith("blob:")) URL.revokeObjectURL(IDFrontpreview);
         } catch {}
         try {
            if (IDBackpreview?.startsWith("blob:")) URL.revokeObjectURL(IDBackpreview);
         } catch {}
         try {
            if (Licensepreview?.startsWith("blob:")) URL.revokeObjectURL(Licensepreview);
         } catch {}
      };
   }, [IDFrontpreview, IDBackpreview, Licensepreview]);

   return (
      <div className="p-4">
         {/* Tabs */}
         <div className="flex gap-4 border-b my-10">
            {steps.map((tab, idx) => (
               <Button
                  key={tab}
                  type="button"
                  className={`pb-2 ${activeTab === tab ? "border-b-2 border-green-600 font-semibold" : ""}`}
                  onClick={() => goToStep(idx + 1)}
               >
                  {tab === "info" ? "Profile Info" : tab === "docs" ? "Documents & KYC" : "Bank Details"}
               </Button>
            ))}
         </div>

         <form
            className="space-y-3"
            onSubmit={(e) => {
               e.preventDefault();
            }}
            noValidate
            aria-busy={ispending}
         >
            {/* Step 1 */}
            {step === 1 ? (
               <BusinessInfo
                  ispending={ispending}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSubmitInfo={handleSubmitInfo}
               />
            ) : step === 2 ? (
               <BusinessDocs
                  IDFrontpreview={IDFrontpreview}
                  IDBackpreview={IDBackpreview}
                  Licensepreview={Licensepreview}
                  ispending={ispending}
                  handleInputChange={handleInputChange}
                  handleSubmitDocs={handleSubmitDocs}
               />
            ) : (
               <BusinessBank
                  ispending={ispending}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSubmitBank={handleSubmitBank}
               />
            )}
         </form>
      </div>
   );
}
