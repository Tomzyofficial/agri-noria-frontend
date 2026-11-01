"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { TrendingUp, Building2, Package, MapPin, Briefcase, Award } from "lucide-react";

export default function SalesDistributionOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Sales & Distribution Operations KYC Onboarding"
         roleBadge="Sales & Distribution Verification"
         roleIcon={<TrendingUp className="w-6 h-6" />}
         description="Register your commercial sales profile, territorial allocation, operational credentials, and live biometric face capture to manage inventory sales, dealer orders, and commodity dispatches."
         dashboardRoute="/ecosystem/sales-&-distribution"
         documentLabels={{
            license: "Appointment Letter / Employment Credential",
            licenseDesc: "Official appointment letter, commercial contract, or operating credential",
         }}
         initialRoleData={{
            operational_role: "Sales Manager",
            company_name: "",
            assigned_hub: "",
            experience_years: "4",
            monthly_volume_target: "300",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Commercial Position & Territory Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Operational Designation <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="operational_role"
                        value={formData.operational_role || "Sales Manager"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Sales Manager">Sales Manager (Commercial Off-take & Deals)</option>
                        <option value="Logistics Coordinator">Logistics Coordinator (Dispatch & Route Fleet)</option>
                        <option value="Warehouse Supervisor">Warehouse Supervisor (Inventory & Stock Control)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Affiliated Agribusiness / Commercial Division <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="company_name"
                        required
                        value={formData.company_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Northern Grains Commercial Group"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Assigned Regional Hub / State <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="assigned_hub"
                        required
                        value={formData.assigned_hub || ""}
                        onChange={handleChange}
                        placeholder="e.g. North-Central Trade Hub (Abuja / Minna)"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Experience in Agricultural Distribution (Years)
                     </label>
                     <input
                        type="number"
                        name="experience_years"
                        min="1"
                        max="40"
                        value={formData.experience_years || "4"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Target Monthly Volume / Inventory Quota (MT)
                     </label>
                     <input
                        type="number"
                        name="monthly_volume_target"
                        min="1"
                        value={formData.monthly_volume_target || "300"}
                        onChange={handleChange}
                        placeholder="e.g. 300"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Operational Scope & Distribution Network Summary
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="Detail your sales pipelines, client relationships with food processors/feed mills, and dispatch tracking methods."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

