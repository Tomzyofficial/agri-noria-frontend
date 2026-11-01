"use client";
import React from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { ClipboardList, Award, MapPin, Building, Briefcase } from "lucide-react";

export default function FieldOperationsOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Field Operations & Extension KYC Onboarding"
         roleBadge="Field Extension Verification"
         roleIcon={<ClipboardList className="w-6 h-6" />}
         description="Submit your extension accreditation, operational jurisdiction, credentials, and live biometric face capture to participate in field surveys, farmer inspections, and agronomic tracking."
         dashboardRoute="/ecosystem/field-operations"
         documentLabels={{
            license: "Official Appointment / Accreditation Letter",
            licenseDesc: "Government extension letter, employment contract, or professional accreditation",
         }}
         initialRoleData={{
            operational_role: "Field Officer",
            assigned_state: "",
            assigned_lga: "",
            specialization: "Soil & Crop Health Diagnostics",
            experience_years: "3",
            institution_or_org: "",
            field_notes: "",
         }}
         renderRoleFields={({ formData, handleChange }) => (
            <div className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Field Extension & Operational Profile
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Operational Designation <span className="text-red-500">*</span>
                     </label>
                     <select
                        name="operational_role"
                        value={formData.operational_role || "Field Officer"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Field Officer">Field Officer (Extension & Monitoring)</option>
                        <option value="Agronomist">Agronomist (Soil, Crop Health & Yield)</option>
                        <option value="Inspector">Inspector (Standards, Quality & Certification)</option>
                        <option value="Enumerator">Enumerator (Farmer Mapping & GPS Profiling)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Affiliated Extension Agency / Organization <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="institution_or_org"
                        required
                        value={formData.institution_or_org || ""}
                        onChange={handleChange}
                        placeholder="e.g. State Agricultural Development Programme (ADP) / Agribusiness"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Assigned State / Region <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="assigned_state"
                        required
                        value={formData.assigned_state || ""}
                        onChange={handleChange}
                        placeholder="e.g. Kaduna State"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Assigned LGA / Operational Corridor <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="assigned_lga"
                        required
                        value={formData.assigned_lga || ""}
                        onChange={handleChange}
                        placeholder="e.g. Zaria LGA / Giwa Basin"
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Primary Agronomic Specialization
                     </label>
                     <select
                        name="specialization"
                        value={formData.specialization || "Soil & Crop Health Diagnostics"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                     >
                        <option value="Soil & Crop Health Diagnostics">Soil & Crop Health Diagnostics</option>
                        <option value="Pest, Weed & Disease Control">Pest, Weed & Disease Control</option>
                        <option value="GPS Farm Boundary & Polygon Mapping">GPS Farm Boundary & Polygon Mapping</option>
                        <option value="Harvest Inspection & Produce Grading">Harvest Inspection & Produce Grading</option>
                        <option value="Organic & Good Agricultural Practices (GAP)">Organic & Good Agricultural Practices (GAP)</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Field Experience (Years)
                     </label>
                     <input
                        type="number"
                        name="experience_years"
                        min="1"
                        max="50"
                        value={formData.experience_years || "3"}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                     Field Scope, Extension Equipment & Operational Notes
                  </label>
                  <textarea
                     rows={3}
                     name="field_notes"
                     value={formData.field_notes || ""}
                     onChange={handleChange}
                     placeholder="Detail your field mobility (motorcycle, handheld GPS, soil test kits), primary crop expertise, and estimated farmer coverage."
                     className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                  />
               </div>
            </div>
         )}
      />
   );
}

