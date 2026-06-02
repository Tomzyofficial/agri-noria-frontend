"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaUser, FaSave, FaBuilding } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "react-toastify";
import { verifyBuyerSession } from "@/actions/session";

export default function BuyerSettingsPage() {
   const [activeTab, setActiveTab] = useState("company");
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   
   const [profile, setProfile] = useState({
      companyName: "",
      registrationNumber: "",
      taxId: "",
      headquarters: "",
      name: "",
      email: "",
      phone: ""
   });

   const tabs = [
      { id: "company", label: "Company", icon: <FaBuilding /> },
      { id: "profile", label: "Profile", icon: <FaUser /> },
   ];

   useEffect(() => {
      fetchProfileData();
   }, []);

   const fetchProfileData = async () => {
      setIsLoading(true);
      try {
         const session = await verifyBuyerSession();
         if (session?.authenticated) {
            setProfile({
               companyName: session.companyName || "",
               registrationNumber: session.registrationNumber || "",
               taxId: session.taxId || "",
               headquarters: session.headquarters || "",
               name: session.name || "",
               email: session.email || "",
               phone: session.phone || ""
            });
         }
      } catch (err) {
         toast.error("Failed to fetch profile data");
      } finally {
         setIsLoading(false);
      }
   };

   const handleSave = async () => {
      setIsSaving(true);
      try {
         const res = await fetch("/api/proxy/auth/buyer/update-profile", {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               name: profile.name,
               phone: profile.phone,
               companyName: profile.companyName,
               registrationNumber: profile.registrationNumber,
               taxId: profile.taxId,
               headquarters: profile.headquarters
            })
         });

         const data = await res.json();
         if (data.success) {
            toast.success(data.message || "Settings updated successfully!");
         } else {
            toast.error(data.error || "Failed to update settings");
         }
      } catch (err) {
         toast.error("An error occurred while saving.");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="space-y-8 pb-20">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Account Settings</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your corporate identity and preferences</p>
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

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden relative">
            {isLoading && (
               <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <FaSpinner className="animate-spin text-indigo-500 w-10 h-10" />
               </div>
            )}
            <CardHeader className="p-10 pb-4 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-2xl font-black capitalize">{activeTab} Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {activeTab === "company" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputGroup 
                        label="Company Name" 
                        value={profile.companyName} 
                        onChange={(val) => setProfile({ ...profile, companyName: val })} 
                     />
                     <InputGroup 
                        label="Registration Number" 
                        value={profile.registrationNumber} 
                        onChange={(val) => setProfile({ ...profile, registrationNumber: val })} 
                     />
                     <InputGroup 
                        label="Tax ID (TIN)" 
                        value={profile.taxId} 
                        onChange={(val) => setProfile({ ...profile, taxId: val })} 
                     />
                     <InputGroup 
                        label="Corporate Headquarters" 
                        value={profile.headquarters} 
                        onChange={(val) => setProfile({ ...profile, headquarters: val })} 
                     />
                  </div>
               )}

               {activeTab === "profile" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputGroup 
                        label="Primary Contact Name" 
                        value={profile.name} 
                        onChange={(val) => setProfile({ ...profile, name: val })} 
                     />
                     <InputGroup 
                        label="Official Email" 
                        value={profile.email} 
                        disabled={true} 
                     />
                     <InputGroup 
                        label="Support Hotline (Phone)" 
                        value={profile.phone} 
                        onChange={(val) => setProfile({ ...profile, phone: val })} 
                     />
                  </div>
               )}

               <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-900 flex justify-end">
                  <Button 
                     onClick={handleSave} 
                     disabled={isSaving}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-3 uppercase tracking-widest text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                     {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                     {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

function InputGroup({ label, value, onChange, disabled }) {
   return (
      <div className="space-y-3">
         <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</label>
         <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            className={`w-full bg-gray-50 dark:bg-gray-900 border-none px-6 py-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
         />
      </div>
   );
}
