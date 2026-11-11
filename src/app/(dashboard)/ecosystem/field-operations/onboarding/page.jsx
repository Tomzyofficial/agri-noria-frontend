"use client";
import React, { useState, useEffect } from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import { ClipboardList, Sprout, ShieldCheck, MapPin, Building, Briefcase, Award, Wrench, FileSpreadsheet } from "lucide-react";
import { FaSpinner } from "react-icons/fa6";
import { verifyVendorSession } from "@/actions/session";

const ROLE_DEFINITIONS = {
   agronomist: {
      key: "agronomist",
      roleTitle: "Agronomist Professional Accreditation & KYC Onboarding",
      roleBadge: "Certified Agronomist Accreditation",
      roleIcon: <Sprout className="w-6 h-6 text-emerald-600" />,
      description: "Submit your agronomic qualifications, professional certification or degree, soil and crop diagnostic specializations, and live biometric face capture to conduct crop advisory and yield management.",
      documentLabels: {
         license: "Professional Agronomist Degree / Practice License / Certificate",
         licenseDesc: "B.Agric / M.Sc Degree certificate, Agricultural Council accreditation, or certified agronomist license",
      },
      initialRoleData: {
         operational_role: "Agronomist",
         institution_or_org: "",
         assigned_state: "",
         assigned_lga: "",
         specialization: "Soil Fertility, Chemistry & Nutrient Optimization",
         experience_years: "3",
         equipment_details: "",
         field_notes: "",
      },
      specializationOptions: [
         "Soil Fertility, Chemistry & Nutrient Optimization",
         "Crop Pathology & Plant Disease Diagnostics",
         "Integrated Pest Management (IPM) & Agro-chemicals",
         "Seed Science, Varietal Testing & Crop Breeding",
         "Irrigation, Water Management & Climate-Smart Agronomy",
         "Post-Harvest Quality & Grain Preservation",
      ],
      orgLabel: "Affiliated Research Institute / Agribusiness / Consultancy",
      orgPlaceholder: "e.g. ADP, IITA, National Cereals Research Institute, Agro-Consultancy",
      corridorLabel: "Assigned Agro-Ecological Corridor / River Basin",
      corridorPlaceholder: "e.g. Galma River Basin / Zaria Grain Corridor",
      equipmentLabel: "Diagnostic Equipment & Field Testing Kits On-Hand",
      equipmentPlaceholder: "e.g. Handheld soil pH/EC meter, digital NPK rapid test kit, optical refractometer, digital moisture tester",
      notesLabel: "Technical Advisory Protocols & Agronomic Scope",
      notesPlaceholder: "Detail your primary crop focus (Maize, Rice, Soybeans, Vegetables), disease diagnostic protocols, and farmer advisory coverage.",
   },
   inspector: {
      key: "inspector",
      roleTitle: "Field Standards & Quality Inspector KYC Onboarding",
      roleBadge: "Quality Inspector Accreditation",
      roleIcon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      description: "Submit your inspector accreditation, quality audit credentials, testing equipment specifications, and live biometric face capture to conduct farm audits, GAP certification, and produce grading.",
      documentLabels: {
         license: "Official Quality Inspector License / Auditor Certification",
         licenseDesc: "SON, NAQS, GlobalGAP auditor accreditation, or institutional inspector appointment letter",
      },
      initialRoleData: {
         operational_role: "Inspector",
         institution_or_org: "",
         assigned_state: "",
         assigned_lga: "",
         specialization: "Good Agricultural Practices (GAP) Farm Auditing",
         experience_years: "3",
         equipment_details: "",
         field_notes: "",
      },
      specializationOptions: [
         "Good Agricultural Practices (GAP) Farm Auditing",
         "Grain Moisture, Purity & Grading Standards (Grade A, B, C)",
         "Chemical Residue & Aflatoxin Screening",
         "Storage Facility Sanitation & Pest Audit",
         "Traceability, Bagging & Weighbridge Auditing",
      ],
      orgLabel: "Accrediting Audit Body / Inspection Agency",
      orgPlaceholder: "e.g. Standards Organisation of Nigeria (SON), NAQS, Commodity Exchange Auditor",
      corridorLabel: "Assigned Depots / Warehouses / Market Corridors",
      corridorPlaceholder: "e.g. Dawanau Market Corridor / Central Grain Depots",
      equipmentLabel: "Testing Hardware & Inspection Instruments On-Hand",
      equipmentPlaceholder: "e.g. Calibrated moisture meter, grain sampling spear/trier, digital scale, grading sieves, aflatoxin rapid test kit",
      notesLabel: "Audit Scope & Quality Verification Protocols",
      notesPlaceholder: "Detail your inspection depots, standard audit checklists, compliance certification protocols, and daily audit throughput.",
   },
   enumerator: {
      key: "enumerator",
      roleTitle: "Field Enumerator & GPS Mapping KYC Onboarding",
      roleBadge: "Field Enumerator Accreditation",
      roleIcon: <MapPin className="w-6 h-6 text-emerald-600" />,
      description: "Submit your survey accreditation, GIS/GPS mapping proficiency, data collection hardware details, and live biometric face capture to profile farmers and capture farm boundaries.",
      documentLabels: {
         license: "Enumerator Accreditation / Field Survey Appointment Letter",
         licenseDesc: "Official survey appointment letter, GIS profiling certification, or institutional enumerator card",
      },
      initialRoleData: {
         operational_role: "Enumerator",
         institution_or_org: "",
         assigned_state: "",
         assigned_lga: "",
         specialization: "High-Accuracy GPS Polygon Boundary Mapping",
         experience_years: "2",
         equipment_details: "",
         field_notes: "",
      },
      specializationOptions: [
         "High-Accuracy GPS Polygon Boundary Mapping",
         "Farmer Demographic & Household Census Profiling",
         "Land Tenure & Community Attestation Verification",
         "Mobile Data Collection (ODK, KoboCollect, QGIS)",
         "Biometric Farmer Identity Registration",
      ],
      orgLabel: "Survey Agency / Sponsoring Organization",
      orgPlaceholder: "e.g. State Agricultural Census, ADP, NGO Survey Partner",
      corridorLabel: "Assigned LGAs / Wards / Communities",
      corridorPlaceholder: "e.g. Mokwa LGA, Gbako Ward, Kpaki Community",
      equipmentLabel: "Survey Hardware & Mobile Mapping Devices",
      equipmentPlaceholder: "e.g. Rugged Android tablet with GPS, Garmin eTrex handheld, solar power bank, measuring tape",
      notesLabel: "Daily Enumeration Target & Mobility Notes",
      notesPlaceholder: "Detail your survey mobility (motorcycle), remote offline mapping capability, and daily farmer enumeration target (e.g. 15-20 farms/day).",
   },
   "field officer": {
      key: "field officer",
      roleTitle: "Field Operations & Extension KYC Onboarding",
      roleBadge: "Field Extension Verification",
      roleIcon: <ClipboardList className="w-6 h-6 text-emerald-600" />,
      description: "Submit your extension accreditation, operational jurisdiction, credentials, and live biometric face capture to participate in field surveys, farmer inspections, and agronomic tracking.",
      documentLabels: {
         license: "Official Appointment / Accreditation Letter",
         licenseDesc: "Government extension letter, employment contract, or professional accreditation",
      },
      initialRoleData: {
         operational_role: "Field Officer",
         institution_or_org: "",
         assigned_state: "",
         assigned_lga: "",
         specialization: "Farmer Mobilization & Extension Training",
         experience_years: "3",
         equipment_details: "",
         field_notes: "",
      },
      specializationOptions: [
         "Farmer Mobilization & Extension Training",
         "Inputs, Seeds & Fertilizer Distribution Tracking",
         "Farm Clearing, Ridging & Planting Supervision",
         "Harvest Coordination & Produce Aggregation Support",
         "Field Grievance & Farmer Support Management",
      ],
      orgLabel: "Affiliated Extension Agency / Organization",
      orgPlaceholder: "e.g. State Agricultural Development Programme (ADP) / Agribusiness",
      corridorLabel: "Assigned LGA / Operational Corridor",
      corridorPlaceholder: "e.g. Zaria LGA / Giwa Basin",
      equipmentLabel: "Extension Mobility & Demonstration Tools",
      equipmentPlaceholder: "e.g. Motorcycle mobility, handheld GPS, extension demonstration kit, farmer logbook",
      notesLabel: "Field Scope, Extension Outreach & Operational Notes",
      notesPlaceholder: "Detail your field mobility, primary crop expertise, and estimated farmer outreach coverage.",
   },
};

export default function FieldOperationsOnboardingPage() {
   const [selectedRoleKey, setSelectedRoleKey] = useState("field officer");
   const [isRoleDetected, setIsRoleDetected] = useState(false);

   useEffect(() => {
      const detectRole = async () => {
         try {
            const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const paramRole = searchParams?.get("role")?.toLowerCase().trim();

            if (paramRole && ROLE_DEFINITIONS[paramRole]) {
               setSelectedRoleKey(paramRole);
               setIsRoleDetected(true);
               return;
            }

            let session;
            try {
               const res = await fetch("/api/auth/session");
               if (res.ok) session = await res.json();
            } catch {
               session = await verifyVendorSession();
            }

            const rawRole = (
               session?.role ||
               session?.user?.role ||
               session?.data?.role ||
               ""
            ).toLowerCase().trim();

            if (rawRole.includes("agronom") || rawRole === "agronomist") {
               setSelectedRoleKey("agronomist");
            } else if (rawRole.includes("inspect") || rawRole === "inspector") {
               setSelectedRoleKey("inspector");
            } else if (rawRole.includes("enumera") || rawRole === "enumerator") {
               setSelectedRoleKey("enumerator");
            } else {
               setSelectedRoleKey("field officer");
            }
         } catch (e) {
            console.warn("Failed to detect role:", e);
         } finally {
            setIsRoleDetected(true);
         }
      };

      detectRole();
   }, []);

   if (!isRoleDetected) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
            <FaSpinner className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading operational accreditation profile...</p>
         </div>
      );
   }

   const currentConfig = ROLE_DEFINITIONS[selectedRoleKey] || ROLE_DEFINITIONS["field officer"];

   return (
      <div className="space-y-4">
         {/* Role Switcher Pill Bar for Field Operations Staff */}
         <div className="max-w-4xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                     Field Operations Designation
                  </p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                     Select your assigned operational function to view tailored accreditation requirements:
                  </p>
               </div>

               <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  {[
                     { key: "field officer", label: "Field Officer", icon: <ClipboardList className="w-3.5 h-3.5" /> },
                     { key: "agronomist", label: "Agronomist", icon: <Sprout className="w-3.5 h-3.5" /> },
                     { key: "inspector", label: "Inspector", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                     { key: "enumerator", label: "Enumerator", icon: <MapPin className="w-3.5 h-3.5" /> },
                  ].map((tab) => {
                     const isSelected = selectedRoleKey === tab.key;
                     return (
                        <button
                           key={tab.key}
                           type="button"
                           onClick={() => setSelectedRoleKey(tab.key)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                 ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                 : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                           }`}
                        >
                           {tab.icon}
                           <span>{tab.label}</span>
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Dedicated Onboarding Container */}
         <EcosystemRoleOnboarding
            key={currentConfig.key}
            roleTitle={currentConfig.roleTitle}
            roleBadge={currentConfig.roleBadge}
            roleIcon={currentConfig.roleIcon}
            description={currentConfig.description}
            dashboardRoute="/ecosystem/field-operations"
            documentLabels={currentConfig.documentLabels}
            initialRoleData={currentConfig.initialRoleData}
            renderRoleFields={({ formData, handleChange }) => (
               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                     <Briefcase className="w-4 h-4 text-emerald-600" />
                     {currentConfig.roleBadge} — Operational Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           Operational Role / Designation <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           name="operational_role"
                           readOnly
                           value={currentConfig.initialRoleData.operational_role}
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-not-allowed focus:outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           {currentConfig.orgLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           name="institution_or_org"
                           required
                           value={formData.institution_or_org || ""}
                           onChange={handleChange}
                           placeholder={currentConfig.orgPlaceholder}
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
                           placeholder="e.g. Kaduna State / Northern Agricultural Zone"
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           {currentConfig.corridorLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           name="assigned_lga"
                           required
                           value={formData.assigned_lga || ""}
                           onChange={handleChange}
                           placeholder={currentConfig.corridorPlaceholder}
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           Primary Technical Specialization <span className="text-red-500">*</span>
                        </label>
                        <select
                           name="specialization"
                           value={formData.specialization || currentConfig.specializationOptions[0]}
                           onChange={handleChange}
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                        >
                           {currentConfig.specializationOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                 {opt}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           Professional Practice Experience (Years) <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="number"
                           name="experience_years"
                           min="1"
                           max="50"
                           required
                           value={formData.experience_years || currentConfig.initialRoleData.experience_years}
                           onChange={handleChange}
                           className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-gray-400" />
                        <span>{currentConfig.equipmentLabel}</span>
                     </label>
                     <input
                        type="text"
                        name="equipment_details"
                        value={formData.equipment_details || ""}
                        onChange={handleChange}
                        placeholder={currentConfig.equipmentPlaceholder}
                        className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                        <span>{currentConfig.notesLabel}</span>
                     </label>
                     <textarea
                        rows={3}
                        name="field_notes"
                        value={formData.field_notes || ""}
                        onChange={handleChange}
                        placeholder={currentConfig.notesPlaceholder}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:border-emerald-500 focus:outline-none"
                     />
                  </div>
               </div>
            )}
         />
      </div>
   );
}
