"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { LineChart, Satellite, Globe, Building2, ShieldCheck, MapPin } from "lucide-react";

export default function IntelligenceMonitoringOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Intelligence & Monitoring KYC Onboarding"
         roleBadge="Data Intelligence Verification"
         roleIcon={<Satellite className="w-6 h-6" />}
         description="Register your data analytics credentials, geospatial monitoring tools, accreditation documents, and live biometric face capture to participate in crop surveillance, yield auditing, and risk analytics."
         dashboardRoute="/ecosystem/intelligence-&-monitoring"
         documentLabels={{
            license: "Professional Certification / Appointment Letter",
            licenseDesc: "GIS certification, academic credentials in data/geospatial science, or official appointment letter",
         }}
         initialRoleData={{
            operational_role: "Satellite Monitor",
            institution_name: "",
            primary_analytical_focus: "Crop Health & NDVI Vegetation Index",
            gis_tools: "Google Earth Engine, Sentinel Hub, QGIS",
            coverage_region: "",
            years_experience: "3",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Analytics Designation & Geospatial Specifications
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Operational Designation <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="operational_role"
                        value={formData.operational_role || "Satellite Monitor"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Satellite Monitor">Satellite Monitor (Earth Observation & NDVI)</option>
                        <option value="Data Analyst">Data Analyst (Yield, Agronomic & Market Data)</option>
                        <option value="Field Auditor">Field Auditor (Land Compliance, GPS & Farm Verification)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Monitoring Organization / Firm <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="institution_name"
                        required
                        value={formData.institution_name || ""}
                        onChange={handleChange}
                        placeholder="e.g. AgriGeospatial Intelligence Services Ltd"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Analytical Focus <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="primary_analytical_focus"
                        value={formData.primary_analytical_focus || "Crop Health & NDVI Vegetation Index"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Crop Health & NDVI Vegetation Index">Crop Health & NDVI Vegetation Index</option>
                        <option value="Yield Forecasting & Weather Risk Modelling">Yield Forecasting & Weather Risk Modelling</option>
                        <option value="Farm Polygon Audit & Land Use Verification">Farm Polygon Audit & Land Use Verification</option>
                        <option value="Commodity Price Forecasting & Market Economics">Commodity Price Forecasting & Market Economics</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        GIS Software & Analytical Tooling
                     </label>
                     <input
                        type="text"
                        name="gis_tools"
                        value={formData.gis_tools || "Google Earth Engine, Sentinel Hub, QGIS"}
                        onChange={handleChange}
                        placeholder="e.g. GEE, QGIS, ArcGIS, Python/R"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Monitored States / Agricultural Basins <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="coverage_region"
                        required
                        value={formData.coverage_region || ""}
                        onChange={handleChange}
                        placeholder="e.g. Niger Basin, Hadejia-Jam'are Corridor, Benue Valley"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Experience in Agricultural Remote Sensing (Years)
                     </label>
                     <input
                        type="number"
                        name="years_experience"
                        min="1"
                        max="35"
                        value={formData.years_experience || "3"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Analytical Methodology, Satellite Imagery Sources & Scope
                  </label>
                  <textarea
                     rows={3}
                     name="description"
                     value={formData.description || ""}
                     onChange={handleChange}
                     placeholder="State your data ingestion pipelines, cloud-masking algorithms, baseline indices (NDVI/EVI), and validation field ground-truthing cadence."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

