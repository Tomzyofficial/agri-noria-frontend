"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { ShieldCheck, Building2, Umbrella, FileCheck, Landmark } from "lucide-react";

export default function InsuranceOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Agricultural Insurer KYC & Underwriting Onboarding"
         roleBadge="Agricultural Insurer Verification"
         roleIcon={<Umbrella className="w-6 h-6" />}
         description="Submit your underwriting credentials, NAICOM regulatory licenses, policy structures, and live biometric face capture to participate in index insurance, farmer risk coverage, and automated claims settlements."
         dashboardRoute="/ecosystem/insurance"
         documentLabels={{
            license: "NAICOM License / CAC Certificate",
            licenseDesc: "National Insurance Commission license or CAC Certificate of Incorporation",
         }}
         initialRoleData={{
            company_name: "",
            naicom_license_no: "",
            cac_number: "",
            address: "",
            insurance_products: "Area Yield Index Insurance (AYII)",
            reinsurance_partners: "Africa Re, Continental Re",
            coverage_capacity_ngn: "500000000",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Insurer Regulatory & Underwriting Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Insurance Enterprise / Firm Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="company_name"
                        required
                        value={formData.company_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Veritas Agricultural Insurance Plc"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        NAICOM Underwriting License Number <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="naicom_license_no"
                        required
                        value={formData.naicom_license_no || ""}
                        onChange={handleChange}
                        placeholder="e.g. NAICOM/RIC/082/2021"
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
                        placeholder="e.g. RC-1234567"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Agricultural Insurance Product <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="insurance_products"
                        value={formData.insurance_products || "Area Yield Index Insurance (AYII)"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Area Yield Index Insurance (AYII)">Area Yield Index Insurance (AYII)</option>
                        <option value="Weather Index Insurance (WII - Drought/Flood)">Weather Index Insurance (WII - Drought/Flood)</option>
                        <option value="Multi-Peril Crop Insurance (MPCI)">Multi-Peril Crop Insurance (MPCI)</option>
                        <option value="Livestock & Aquaculture Mortality Cover">Livestock & Aquaculture Mortality Cover</option>
                        <option value="Comprehensive Agri-Portfolio Bundle">Comprehensive Agri-Portfolio Bundle</option>
                     </select>
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Corporate Head Office Address <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="address"
                        required
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="e.g. Insurance House, Central Business District, Abuja"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Reinsurance Treaties / Backing Partners
                     </label>
                     <input
                        type="text"
                        name="reinsurance_partners"
                        value={formData.reinsurance_partners || "Africa Re, Continental Re"}
                        onChange={handleChange}
                        placeholder="e.g. Africa Re, Continental Re, Swiss Re"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Underwriting Portfolio Limit (₦)
                     </label>
                     <input
                        type="number"
                        name="coverage_capacity_ngn"
                        min="1000000"
                        value={formData.coverage_capacity_ngn || "500000000"}
                        onChange={handleChange}
                        placeholder="e.g. 500,000,000"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Underwriting Guidelines & Automated Claims Settlement Protocols
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="State your trigger criteria (e.g. rainfall deficit mm, NDVI drop threshold, historical yield baseline percentage) and standard claims payout turnaround."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

