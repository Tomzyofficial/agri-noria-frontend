"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { Handshake, Building2, Package, MapPin, Users2, Landmark } from "lucide-react";

export default function AggregatorOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Commodity Aggregator KYC & Operations Onboarding"
         roleBadge="Aggregator Verification"
         roleIcon={<Handshake className="w-6 h-6" />}
         description="Register your aggregation enterprise, buying centers, trade capacity, accreditation documents, and live biometric identity to participate in produce intake and bulk off-take contracts."
         dashboardRoute="/ecosystem/aggregator"
         documentLabels={{
            license: "CAC Certificate / Aggregation License",
            licenseDesc: "Corporate Affairs Commission certificate or State Produce Trade License",
         }}
         initialRoleData={{
            business_name: "",
            cac_number: "",
            address: "",
            primary_commodity: "Maize & Grains",
            aggregation_capacity_mt: "500",
            outgrower_farmer_count: "250",
            intake_depots_count: "3",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Aggregation Enterprise & Sourcing Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Aggregation Business / Enterprise Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="business_name"
                        required
                        value={formData.business_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Savannah Grain Aggregators Ltd"
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
                        placeholder="e.g. RC-1849204"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Depot / Central Aggregation Center Address <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="address"
                        required
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="e.g. Km 12 Zaria-Kano Road, Kaduna State"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Commodity Focus <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="primary_commodity"
                        value={formData.primary_commodity || "Maize & Grains"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Maize & Grains">Maize & Grains</option>
                        <option value="Paddy Rice">Paddy Rice</option>
                        <option value="Soybeans & Oilseeds">Soybeans & Oilseeds</option>
                        <option value="Cassava Tubers & Chips">Cassava Tubers & Chips</option>
                        <option value="Cocoa & Cash Crops">Cocoa & Cash Crops</option>
                        <option value="Sesame & Legumes">Sesame & Legumes</option>
                        <option value="Mixed Agricultural Produce">Mixed Agricultural Produce</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Monthly Aggregation Throughput (MT) <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="number"
                        name="aggregation_capacity_mt"
                        required
                        min="1"
                        value={formData.aggregation_capacity_mt || "500"}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Outgrower / Smallholder Farmer Network Size
                     </label>
                     <input
                        type="number"
                        name="outgrower_farmer_count"
                        min="0"
                        value={formData.outgrower_farmer_count || "250"}
                        onChange={handleChange}
                        placeholder="e.g. 250"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Active Buying Stations / Intake Centers
                     </label>
                     <input
                        type="number"
                        name="intake_depots_count"
                        min="1"
                        value={formData.intake_depots_count || "3"}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Aggregation Infrastructure & Operational Scope
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="State your weighing bridges, moisture meters, cleaning/sorting equipment, bagging facilities, and primary buyer contracts."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

