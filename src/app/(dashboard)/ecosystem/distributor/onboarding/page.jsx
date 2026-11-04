"use client";
import React, { useState } from "react";
import EcosystemRoleOnboarding from "@/components/onboarding/EcosystemRoleOnboarding";
import {
   Truck,
   Store,
   Building2,
   Package,
   MapPin,
   Award,
   CheckCircle2,
   Sparkles,
   ShieldCheck,
   Layers,
   Wrench,
   Sprout,
   FlaskConical,
   Droplets,
   ShieldAlert,
   Boxes,
} from "lucide-react";

const AVAILABLE_CATEGORIES = [
   {
      id: "Mechanical",
      name: "Mechanical & Machinery",
      desc: "Tractors, Power Tillers, Planters, Harvesters & Implement attachments",
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      tag: "Heavy Equipment",
   },
   {
      id: "Seeds",
      name: "Certified Hybrid Seeds",
      desc: "High-yield certified varieties (Maize, Paddy Rice, Soybeans, Sorghum, Wheat)",
      icon: <Sprout className="w-5 h-5 text-emerald-500" />,
      tag: "Certified High Yield",
   },
   {
      id: "Fertilizer",
      name: "Fertilizers & Soil Nutrients",
      desc: "Inorganic & organic (NPK 15:15:15, Urea 46%, Organic Compost, Micro-nutrients)",
      icon: <FlaskConical className="w-5 h-5 text-blue-500" />,
      tag: "Soil Nutrition",
   },
   {
      id: "Irrigations",
      name: "Irrigation & Water Systems",
      desc: "Solar water pumps, Drip line kits, Sprinkler networks, Flexible discharge hoses",
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
      tag: "Water Management",
   },
   {
      id: "Pesticides",
      name: "Crop Protection & Agrochemicals",
      desc: "Selective & broad-spectrum Herbicides, Insecticides, Fungicides, Seed dressers",
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      tag: "Crop Health",
   },
   {
      id: "Herbicides",
      name: "Post-Harvest & Farm Gear",
      desc: "Hermetic grain bags, Knapsack sprayers, PPE safety kits, Grain moisture meters",
      icon: <Boxes className="w-5 h-5 text-purple-500" />,
      tag: "Farm Supplies",
   },
];

const FLEET_OPTIONS = [
   "Heavy Haulage Trucks (10 - 30 MT)",
   "Light Commercial Vans & Pickups (1 - 3 MT)",
   "Motorbikes & Tricycles for Rural Access",
   "Farm Gate Direct Delivery Fleet",
];

export default function DistributorOnboardingPage() {
   return (
      <EcosystemRoleOnboarding
         roleTitle="Agro-Input Distributor Enterprise Onboarding & Certification"
         roleBadge="Input Distributor Verification"
         roleIcon={<Truck className="w-6 h-6 text-amber-600" />}
         description="List the agricultural inputs and equipment you stock, specify your warehouse facilities and delivery fleet capabilities, and submit verification credentials to participate in national program disbursements."
         dashboardRoute="/ecosystem/distributor"
         documentLabels={{
            license: "Dealership License / CAC Incorporation Certificate",
            licenseDesc: "Manufacturer dealership authorization letter, NAIDA dealer certificate, or CAC incorporation document",
         }}
         initialRoleData={{
            business_name: "",
            cac_number: "",
            tin_number: "",
            address: "",
            supplied_materials: ["Seeds", "Fertilizer", "Pesticides", "Herbicides"],
            product_categories: "Comprehensive Integrated Agro-Inputs",
            brand_partners: "Indorama, Notore, SeedCo, Syngenta, Bayer",
            delivery_fleet: ["Light Commercial Vans & Pickups (1 - 3 MT)", "Farm Gate Direct Delivery Fleet"],
            coverage_states: "Kano, Kaduna, Katsina, Niger, Abuja FCT, Ogun",
            retail_outlets_supplied: "35",
            storage_capacity_mt: "500",
            dispatch_lead_time: "24 - 48 Hours",
            description: "",
         }}
         renderRoleFields={({ formData, handleChange, setFormData }) => {
            const selectedMaterials = Array.isArray(formData.supplied_materials)
               ? formData.supplied_materials
               : ["Seeds", "Fertilizer"];

            const selectedFleet = Array.isArray(formData.delivery_fleet)
               ? formData.delivery_fleet
               : [];

            const toggleMaterial = (id) => {
               if (!setFormData) return;
               setFormData((prev) => {
                  const current = Array.isArray(prev.supplied_materials) ? prev.supplied_materials : [];
                  const exists = current.includes(id);
                  const updated = exists ? current.filter((m) => m !== id) : [...current, id];
                  return { ...prev, supplied_materials: updated };
               });
            };

            const toggleFleet = (item) => {
               if (!setFormData) return;
               setFormData((prev) => {
                  const current = Array.isArray(prev.delivery_fleet) ? prev.delivery_fleet : [];
                  const exists = current.includes(item);
                  const updated = exists ? current.filter((f) => f !== item) : [...current, item];
                  return { ...prev, delivery_fleet: updated };
               });
            };

            return (
               <div className="space-y-8">
                  {/* Section A: Enterprise Identity */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-500" />
                        Enterprise Profile & Legal Registration
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
                              placeholder="e.g. Apex Agro-Mechanics & Inputs Ltd"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
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
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>

                        <div className="sm:col-span-2">
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Central Warehouse & Distribution Hub Physical Address <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="address"
                              required
                              value={formData.address || ""}
                              onChange={handleChange}
                              placeholder="e.g. KM 14 Commercial Highway, Bompai Industrial Area, Kano State"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Tax Identification Number (TIN)
                           </label>
                           <input
                              type="text"
                              name="tin_number"
                              value={formData.tin_number || ""}
                              onChange={handleChange}
                              placeholder="e.g. 23819283-0001"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Regional Coverage / Target Delivery States <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="coverage_states"
                              required
                              value={formData.coverage_states || ""}
                              onChange={handleChange}
                              placeholder="e.g. Kano, Kaduna, Katsina, Niger, Abuja FCT, Ogun"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section B: What You Sell — Stocked Input Materials & Catalog */}
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                              <Package className="w-4 h-4 text-emerald-500" />
                              What You Stock & Sell (Input Categories) <span className="text-red-500">*</span>
                           </h3>
                           <p className="text-xs text-gray-500 mt-0.5">
                              Select the materials and equipment you regularly supply. Institutional buyers match orders directly against these selections.
                           </p>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                           {selectedMaterials.length} Selected
                        </span>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {AVAILABLE_CATEGORIES.map((cat) => {
                           const isChecked = selectedMaterials.includes(cat.id);
                           return (
                              <div
                                 key={cat.id}
                                 onClick={() => toggleMaterial(cat.id)}
                                 className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                    isChecked
                                       ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                                       : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700"
                                 }`}
                              >
                                 <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                       <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 shrink-0">
                                          {cat.icon}
                                       </div>
                                       <div
                                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                                             isChecked
                                                ? "border-emerald-500 bg-emerald-500 text-white"
                                                : "border-gray-300 dark:border-gray-600"
                                          }`}
                                       >
                                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                       </div>
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                                          {cat.name}
                                       </h4>
                                       <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                          {cat.desc}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                       {cat.tag}
                                    </span>
                                    <span
                                       className={`text-[10px] font-bold ${
                                          isChecked ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                                       }`}
                                    >
                                       {isChecked ? "In Stock ✓" : "Click to Add"}
                                    </span>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Key Agro-Input Brand & Manufacturer Partnerships
                           </label>
                           <input
                              type="text"
                              name="brand_partners"
                              value={formData.brand_partners || ""}
                              onChange={handleChange}
                              placeholder="e.g. Indorama, Notore, SeedCo, Syngenta, Bayer, Saro"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Downstream Retail Outlets / Agro-Dealers Supplied
                           </label>
                           <input
                              type="number"
                              min="0"
                              name="retail_outlets_supplied"
                              value={formData.retail_outlets_supplied || "35"}
                              onChange={handleChange}
                              placeholder="e.g. 35"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Section C: Delivery Logistics & Fleet Capability */}
                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                           <Truck className="w-4 h-4 text-blue-500" />
                           Delivery Logistics & Transportation Fleet
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                           Indicate the vehicles and logistics modes you utilize for delivering orders to clusters and farm gates.
                        </p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FLEET_OPTIONS.map((fleet) => {
                           const isSelected = selectedFleet.includes(fleet);
                           return (
                              <div
                                 key={fleet}
                                 onClick={() => toggleFleet(fleet)}
                                 className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                       ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100"
                                       : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                 }`}
                              >
                                 <div className="flex items-center gap-2.5">
                                    <Truck className={`w-4 h-4 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                                    <span className="text-xs font-bold">{fleet}</span>
                                 </div>
                                 <div
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                       isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                 >
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Total Warehouse Storage Capacity (MT) <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="number"
                              min="1"
                              name="storage_capacity_mt"
                              required
                              value={formData.storage_capacity_mt || "500"}
                              onChange={handleChange}
                              placeholder="e.g. 500"
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Standard Order Dispatch Lead Time
                           </label>
                           <select
                              name="dispatch_lead_time"
                              value={formData.dispatch_lead_time || "24 - 48 Hours"}
                              onChange={handleChange}
                              className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                           >
                              <option value="Same Day (Within 12 Hours)">Same Day (Within 12 Hours)</option>
                              <option value="24 - 48 Hours">24 - 48 Hours</option>
                              <option value="3 - 5 Days">3 - 5 Days</option>
                              <option value="Scheduled Program Cycles">Scheduled Program Cycles</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           Additional Enterprise & Operational Details
                        </label>
                        <textarea
                           rows={3}
                           name="description"
                           value={formData.description || ""}
                           onChange={handleChange}
                           placeholder="Describe any credit terms offered to farmer clusters, cold-chain storage capabilities, agro-technical advisory, or certified agronomic staff."
                           className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:border-amber-500 focus:outline-none"
                        />
                     </div>
                  </div>
               </div>
            );
         }}
      />
   );
}
