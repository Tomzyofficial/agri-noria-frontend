"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { Briefcase, Building2, Globe2, Package, ShieldCheck, Factory } from "lucide-react";

export default function BuyerPartnerOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Commodity Buyer & Corporate Partner KYC Onboarding"
         roleBadge="Buyer & Partner Verification"
         roleIcon={<Briefcase className="w-6 h-6" />}
         description="Register your corporate procurement profile, off-take targets, processing accreditation, and live biometric face capture to participate in structured forward contracts, bulk trades, and escrow settlements."
         dashboardRoute="/ecosystem/buyer-partner"
         documentLabels={{
            license: "Trade / Export License or CAC Certificate",
            licenseDesc: "NEPC Export Certificate, Food Processing Permit, or CAC Certificate of Incorporation",
         }}
         initialRoleData={{
            company_name: "",
            buyer_type: "Commercial Off-taker",
            cac_number: "",
            address: "",
            target_commodities: "Maize & Grains",
            offtake_capacity_mt: "1000",
            processing_facility_desc: "",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Factory className="w-4 h-4 text-emerald-600" />
                  Corporate Procurement & Off-Take Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Corporate / Enterprise Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="company_name"
                        required
                        value={formData.company_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. Zenith Agro-Industries Ltd"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Buyer / Partner Classification <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="buyer_type"
                        value={formData.buyer_type || "Commercial Off-taker"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Commercial Off-taker">Commercial Off-taker (Industrial Processing)</option>
                        <option value="Commodity Exporter">Commodity Exporter (International Trade)</option>
                        <option value="Agro-Processor / Miller">Agro-Processor / Grain Mill / Feed Mill</option>
                        <option value="Bulk Warehouse Buyer">Bulk Warehouse Buyer / Trading Firm</option>
                        <option value="Institutional Off-taker">Institutional Buyer (Strategic Grain Reserve / NGO)</option>
                     </select>
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
                        placeholder="e.g. RC-1748291"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Target Commodities <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="target_commodities"
                        value={formData.target_commodities || "Maize & Grains"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Maize & Grains">Yellow & White Maize</option>
                        <option value="Paddy Rice">Paddy Rice</option>
                        <option value="Soybeans">Soybeans & Oilseeds</option>
                        <option value="Cocoa Beans">Raw Cocoa Beans</option>
                        <option value="Cashew & Sesame">Raw Cashew Nuts & Sesame Seeds</option>
                        <option value="Cassava Tubers">Industrial Cassava Tubers</option>
                        <option value="Diversified Portfolio">Diversified Commodity Portfolio</option>
                     </select>
                  </div>

                  <div className="sm:col-span-2">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Corporate Headquarters & Intake Facility Address <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="address"
                        required
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="e.g. Plot 12 Industrial Estate, Ikeja, Lagos / Processing Plant: Kaduna"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Monthly Purchase Capacity (MT) <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="number"
                        name="offtake_capacity_mt"
                        required
                        min="1"
                        value={formData.offtake_capacity_mt || "1000"}
                        onChange={handleChange}
                        placeholder="e.g. 1000"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Processing Assets / Milling Equipment
                     </label>
                     <input
                        type="text"
                        name="processing_facility_desc"
                        value={formData.processing_facility_desc || ""}
                        onChange={handleChange}
                        placeholder="e.g. 50MT/day Rice Mill, Solvent Oil Plant, Grain Silos"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Quality Parameters, Moisture Tolerances & Trade Specifications
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="Specify maximum permissible moisture percentage, foreign matter threshold, aflatoxin limits, and preferred delivery terms (FOB / Ex-Warehouse)."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

