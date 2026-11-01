"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { Landmark, Building2, Users2, ShieldCheck, MapPin, Award } from "lucide-react";

export default function InstitutionOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Institutional & Cooperative KYC Onboarding"
         roleBadge="Institution & Cooperative Verification"
         roleIcon={<Landmark className="w-6 h-6" />}
         description="Submit your cooperative or institutional charter, registration credentials, membership size, and live biometric face capture to participate in credit facilities, program sponsorships, and cooperative commodity aggregation."
         dashboardRoute="/ecosystem/institution"
         documentLabels={{
            license: "Registration Certificate / Charter",
            licenseDesc: "Cooperative Society Certificate, CAC Incorporation, or Ministry of Agriculture accreditation",
         }}
         initialRoleData={{
            institution_name: "",
            institution_type: "Agricultural Cooperative Society",
            registration_number: "",
            address: "",
            farmer_members_count: "500",
            key_commodities: "Maize, Rice & Soybeans",
            years_in_operation: "5",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Institutional & Cooperative Profile
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Institution / Cooperative Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="institution_name"
                        required
                        value={formData.institution_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Odua Farmers Cooperative Multipurpose Society"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Institutional Classification <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="institution_type"
                        value={formData.institution_type || "Agricultural Cooperative Society"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Agricultural Cooperative Society">Agricultural Cooperative Society</option>
                        <option value="Producer Association">Producer Association (e.g. AFAN, RIFAN)</option>
                        <option value="Research Institution">Agricultural Research Institution / University</option>
                        <option value="Non-Governmental Organization (NGO)">Agricultural Development NGO</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Registration / Certificate Number <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="registration_number"
                        required
                        value={formData.registration_number || ""}
                        onChange={handleChange}
                        placeholder="e.g. COOP/OG/2018/1429 or RC-149201"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Value Chains Supported <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="key_commodities"
                        required
                        value={formData.key_commodities || ""}
                        onChange={handleChange}
                        placeholder="e.g. Cassava, Maize, Poultry, Aquaculture"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Secretariat / Headquarters Office Address <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="address"
                        required
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="e.g. Cooperative House, Secretariat Road, Abeokuta, Ogun State"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Enrolled Farmer Membership Size <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="number"
                        name="farmer_members_count"
                        required
                        min="10"
                        value={formData.farmer_members_count || "500"}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Operational History (Years)
                     </label>
                     <input
                        type="number"
                        name="years_in_operation"
                        min="1"
                        max="100"
                        value={formData.years_in_operation || "5"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Institutional Mandate, Cooperative Assets & Governance Summary
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="State your cooperative leadership structure, community asset ownership (tractors, storage sheds, processing mills), and bank partnership history."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

