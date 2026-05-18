"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaUser, FaBell, FaShieldAlt, FaSave, FaBuilding } from "react-icons/fa";

export default function BuyerSettingsPage() {
   const [activeTab, setActiveTab] = useState("company");

   const tabs = [
      { id: "company", label: "Company", icon: <FaBuilding /> },
      { id: "profile", label: "Profile", icon: <FaUser /> },
      { id: "notifications", label: "Notifications", icon: <FaBell /> },
      { id: "security", label: "Security", icon: <FaShieldAlt /> },
   ];

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Account Settings</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your corporate identity, preferences, and security</p>
         </div>

         <div className="flex gap-4 p-2 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 w-fit shadow-xl">
            {tabs.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
               >
                  {tab.icon} {tab.label}
               </button>
            ))}
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-4 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-2xl font-black capitalize">{activeTab} Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {activeTab === "company" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputGroup label="Company Name" value="Ecofarm Global Ltd" />
                     <InputGroup label="Registration Number" value="RC-12345678" />
                     <InputGroup label="Tax ID (TIN)" value="TIN-987654321" />
                     <InputGroup label="Corporate Headquarters" value="Lagos, Nigeria" />
                  </div>
               )}

               {activeTab === "profile" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputGroup label="Primary Contact" value="Alexander Graham" />
                     <InputGroup label="Official Email" value="partners@ecofarm.com" />
                     <InputGroup label="Support Hotline" value="+234 800 123 4567" />
                  </div>
               )}

               {activeTab === "notifications" && (
                  <div className="space-y-6">
                     <ToggleItem label="Market Alerts" description="Receive notifications for new produce availability and cluster harvests" checked={true} />
                     <ToggleItem label="Shipment Tracking" description="Real-time updates on your logistics and delivery status" checked={true} />
                     <ToggleItem label="Contract Milestones" description="Alerts for contract confirmations and payment settlements" checked={true} />
                  </div>
               )}

               {activeTab === "security" && (
                  <div className="space-y-8">
                     <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-black mb-4">API Access Keys</h3>
                        <Button className="bg-gray-950 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl transition-all hover:scale-105">Manage API Keys</Button>
                     </div>
                     <ToggleItem label="Two-Factor Authentication" description="Secure your corporate account with an extra layer of protection" checked={true} />
                  </div>
               )}

               <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-900 flex justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-3 uppercase tracking-widest text-xs transition-all hover:scale-105">
                     <FaSave /> Save Configuration
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

function InputGroup({ label, value }) {
   return (
      <div className="space-y-3">
         <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</label>
         <input 
            type="text" 
            defaultValue={value} 
            className="w-full bg-gray-50 dark:bg-gray-900 border-none px-6 py-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500" 
         />
      </div>
   );
}

function ToggleItem({ label, description, checked }) {
   return (
      <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-900">
         <div>
            <p className="font-black text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
         </div>
         <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${checked ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-800'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
         </div>
      </div>
   );
}
