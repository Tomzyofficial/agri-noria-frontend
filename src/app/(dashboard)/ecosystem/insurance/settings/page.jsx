"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Shield, Building2, Key, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function InsuranceSettingsPage() {
  const [activeTab, setActiveTab] = useState("underwriting");
  const [underwriting, setUnderwriting] = useState({
    baseRate: "1.5",
    maxCoverage: "500000000",
    coverFlood: true,
    coverDrought: true,
    coverPestilence: true,
    coverTransitLoss: true,
  });

  const [firmProfile, setFirmProfile] = useState({
    companyName: "Agri-Noria Syndicate Underwriters",
    licenseNo: "NAICOM/RIC/2026/088",
    headquarters: "Victoria Island, Lagos, Nigeria",
    leadUnderwriter: "Adekunle Cole, ACII",
    claimsSlaDays: "3",
  });

  const [integrations, setIntegrations] = useState({
    weatherApiKey: "agr_live_wt_99f24e5f9374ce",
    satelliteWebhook: "https://api.agrinoria.eco/webhooks/sentinel2-ndvi",
    telemetrySource: "Copernicus Sentinel-2 & CHIRPS Rainfall",
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Insurance configuration updated successfully!");
  };

  const navItems = [
    { id: "underwriting", label: "Underwriting & Coverage", icon: <Shield className="w-4 h-4" /> },
    { id: "profile", label: "Firm Profile & Accreditation", icon: <Building2 className="w-4 h-4" /> },
    { id: "integrations", label: "API & Actuarial Oracles", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Insurance Settings
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage your insurance profile, coverage rules, and API integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white dark:bg-gray-900 shadow-sm text-(--greenish-color) border border-emerald-200/60 dark:border-emerald-800/40' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-8">
          {activeTab === "underwriting" && (
            <div className="bg-white dark:bg-(--background) rounded-2xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Underwriting Rules & Perils</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure automatic risk calculation, peril coverage, and premium parameters for the Commodity Operations pipeline.
              </p>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Base Premium Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={underwriting.baseRate} 
                      onChange={e => setUnderwriting({...underwriting, baseRate: e.target.value})} 
                      className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Coverage per Batch (₦)</label>
                    <input 
                      type="text" 
                      value={underwriting.maxCoverage} 
                      onChange={e => setUnderwriting({...underwriting, maxCoverage: e.target.value})} 
                      className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold uppercase text-gray-500 mb-3">Covered Perils & Risks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <input 
                        type="checkbox" 
                        checked={underwriting.coverFlood} 
                        onChange={e => setUnderwriting({...underwriting, coverFlood: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-600 rounded" 
                      />
                      <span className="text-xs font-semibold">Flood & Inundation</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <input 
                        type="checkbox" 
                        checked={underwriting.coverDrought} 
                        onChange={e => setUnderwriting({...underwriting, coverDrought: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-600 rounded" 
                      />
                      <span className="text-xs font-semibold">Drought & Crop Desiccation</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <input 
                        type="checkbox" 
                        checked={underwriting.coverPestilence} 
                        onChange={e => setUnderwriting({...underwriting, coverPestilence: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-600 rounded" 
                      />
                      <span className="text-xs font-semibold">Locust & Pest Infestation</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <input 
                        type="checkbox" 
                        checked={underwriting.coverTransitLoss} 
                        onChange={e => setUnderwriting({...underwriting, coverTransitLoss: e.target.checked})} 
                        className="w-4 h-4 accent-emerald-600 rounded" 
                      />
                      <span className="text-xs font-semibold">Haulage & Transit Collision</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-(--greenish-color) text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition">
                    Save Underwriting Rules
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white dark:bg-(--background) rounded-2xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Firm Profile & NAICOM Accreditation</h2>
              <p className="text-sm text-gray-500 mb-6">
                Official insurance syndicate credentials, regulatory license and claims settlement SLA.
              </p>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-gray-500">Underwriting Firm Name</label>
                  <input 
                    type="text" 
                    value={firmProfile.companyName} 
                    onChange={e => setFirmProfile({...firmProfile, companyName: e.target.value})} 
                    className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">NAICOM Regulatory License</label>
                    <input 
                      type="text" 
                      value={firmProfile.licenseNo} 
                      onChange={e => setFirmProfile({...firmProfile, licenseNo: e.target.value})} 
                      className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Claims Settlement SLA (Days)</label>
                    <input 
                      type="number" 
                      value={firmProfile.claimsSlaDays} 
                      onChange={e => setFirmProfile({...firmProfile, claimsSlaDays: e.target.value})} 
                      className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-gray-500">Principal Underwriting Lead</label>
                  <input 
                    type="text" 
                    value={firmProfile.leadUnderwriter} 
                    onChange={e => setFirmProfile({...firmProfile, leadUnderwriter: e.target.value})} 
                    className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-(--greenish-color) text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition">
                    Save Firm Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="bg-white dark:bg-(--background) rounded-2xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-1">API & Actuarial Oracles</h2>
              <p className="text-sm text-gray-500 mb-6">
                Connect external satellite weather feeds, sensor grids, and automated claims payout triggers.
              </p>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Actuarial Weather Telemetry Key</label>
                  <input 
                    type="password" 
                    value={integrations.weatherApiKey} 
                    onChange={e => setIntegrations({...integrations, weatherApiKey: e.target.value})} 
                    className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">NDVI Satellite Ingest Webhook</label>
                  <input 
                    type="url" 
                    value={integrations.satelliteWebhook} 
                    onChange={e => setIntegrations({...integrations, satelliteWebhook: e.target.value})} 
                    className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Primary Environmental Oracle</label>
                  <input 
                    type="text" 
                    value={integrations.telemetrySource} 
                    onChange={e => setIntegrations({...integrations, telemetrySource: e.target.value})} 
                    className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold" 
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-(--greenish-color) text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition">
                    Save API Integrations
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
