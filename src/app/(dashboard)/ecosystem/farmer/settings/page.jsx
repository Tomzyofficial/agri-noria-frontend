"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFarmerData } from "../useFarmerData";
import { FaUser, FaBell, FaShieldAlt, FaSave } from "react-icons/fa";

export default function FarmerSettingsPage() {
   const { loading, profile } = useFarmerData();
   const [activeTab, setActiveTab] = useState("profile");

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Settings...</div>;

   const tabs = [
      { id: "profile", label: "Profile", icon: <FaUser /> },
      { id: "notifications", label: "Notifications", icon: <FaBell /> },
      { id: "security", label: "Security", icon: <FaShieldAlt /> },
   ];

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Account Settings</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your identity, preferences, and account security</p>
         </div>

         <div className="flex gap-4 p-2 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 w-fit shadow-xl">
            {tabs.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
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
               {activeTab === "profile" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputGroup label="Full Name" value={profile?.name || "—"} />
                     <InputGroup label="Email Address" value={profile?.email || "—"} />
                     <InputGroup label="Phone Number" value={profile?.phone || "—"} />
                     <InputGroup label="Farm Location" value={profile?.address || "—"} />
                  </div>
               )}

               {activeTab === "notifications" && (
                  <div className="space-y-6">
                     <ToggleItem label="Email Notifications" description="Receive program updates and market alerts via email" checked={true} />
                     <ToggleItem label="SMS Alerts" description="Get urgent weather alerts and financing status via text" checked={true} />
                     <ToggleItem label="App Push" description="In-dashboard notifications for activity tracking" checked={false} />
                  </div>
               )}

               {activeTab === "security" && (
                  <div className="space-y-8">
                     <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-black mb-4">Password Management</h3>
                        <Button className="bg-gray-950 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl transition-all hover:scale-105">Change Password</Button>
                     </div>
                     <ToggleItem label="Two-Factor Authentication" description="Secure your account with an extra layer of protection" checked={true} />
                  </div>
               )}

               <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-900 flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-green-500/20 flex items-center gap-3 uppercase tracking-widest text-xs transition-all hover:scale-105">
                     <FaSave /> Save Changes
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
            className="w-full bg-gray-50 dark:bg-gray-900 border-none px-6 py-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-green-500" 
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
         <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${checked ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
         </div>
      </div>
   );
}
