"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { Truck, Store, Building2, Package, MapPin, Award } from "lucide-react";

export default function DistributorOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Agro-Input Distributor KYC & Operations Onboarding"
         roleBadge="Input Distributor Verification"
         roleIcon={<Truck className="w-6 h-6" />}
         description="Submit your input distribution credentials, dealership certificates, warehouse capacity, and live biometric face capture to participate in program input disbursement and agro-dealer credit."
         dashboardRoute="/ecosystem/distributor"
         documentLabels={{
            license: "Dealership License / CAC Certificate",
            licenseDesc: "Manufacturer dealership authorization, NAIDA certificate, or CAC incorporation document",
         }}
         initialRoleData={{
            business_name: "",
            cac_number: "",
            address: "",
            product_categories: "Fertilizers & Soil Nutrients",
            coverage_states: "Kano, Kaduna, Katsina",
            retail_outlets_supplied: "45",
            storage_capacity_mt: "300",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  Agro-Input Distribution Enterprise Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Distributor Enterprise / Company Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="business_name"
                        required
                        value={formData.business_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Apex Agri-Inputs & Chemicals Ltd"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        CAC / RC Registration Number <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="cac_number"
                        required
                        value={formData.cac_number || ""}
                        onChange={handleChange}
                        placeholder="e.g. RC-1928374"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Principal Warehouse & Distribution Hub Address <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="address"
                        required
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="e.g. Plot 4 Commercial Layout, Bompai Industrial Area, Kano"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Input Category <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="product_categories"
                        value={formData.product_categories || "Fertilizers & Soil Nutrients"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Fertilizers & Soil Nutrients">Fertilizers & Soil Nutrients (NPK, Urea, Organic)</option>
                        <option value="Crop Protection & Agrochemicals">Crop Protection & Agrochemicals (Herbicides, Pesticides)</option>
                        <option value="Certified Hybrid Seeds">Certified Hybrid Seeds (Maize, Rice, Soybeans)</option>
                        <option value="Farm Equipment & Sprayers">Farm Equipment, Sprayers & Irrigation Tools</option>
                        <option value="Comprehensive Integrated Inputs">Comprehensive Integrated Inputs (All Categories)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Regional Coverage / Target States <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="coverage_states"
                        required
                        value={formData.coverage_states || ""}
                        onChange={handleChange}
                        placeholder="e.g. Kano, Kaduna, Katsina, Jigawa"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Input Storage Capacity (MT)
                     </label>
                     <input
                        type="number"
                        name="storage_capacity_mt"
                        min="1"
                        value={formData.storage_capacity_mt || "300"}
                        onChange={handleChange}
                        placeholder="e.g. 300"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Downstream Agro-Dealers Supplied
                     </label>
                     <input
                        type="number"
                        name="retail_outlets_supplied"
                        min="1"
                        value={formData.retail_outlets_supplied || "45"}
                        onChange={handleChange}
                        placeholder="e.g. 45"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Manufacturer Dealerships, Last-Mile Logistics & Operational Scope
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="List key manufacturing partners (e.g. Indorama, Notore, SeedCo, Syngenta), delivery fleet capability, and credit terms."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

