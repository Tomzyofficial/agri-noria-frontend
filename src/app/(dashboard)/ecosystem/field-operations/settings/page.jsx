"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Save, Bell, Shield, User, Globe, MessageSquare, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function FieldOfficerSettings() {
   const [activeTab, setActiveTab] = useState("profile");
   const [settings, setSettings] = useState({
      notifyOnNewVisit: true,
      notifyOnCompletion: true,
      notifyOnDelayedVisit: true,
      emailNotifications: true,
      smsNotifications: true,
      twoFactorAuth: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      displayName: "Field Officer",
      profileVisibility: "private",
   });

   useEffect(() => {
      const fetchSettings = async () => {
         try {
            const res = await fetch("/api/proxy/field-operations/settings");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  setSettings(prev => ({ ...prev, ...json.data }));
               }
            }
         } catch (err) {
            console.error("Failed to fetch settings:", err);
         }
      };
      fetchSettings();
   }, []);

   const handleChange = (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
   };

   const handleSave = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
         });
         if (res.ok) {
            toast.success("Settings saved successfully");
         } else {
            toast.error("Failed to save settings");
         }
      } catch (err) {
         console.error("Error saving settings:", err);
         toast.error("An error occurred");
      }
   };

   const renderContent = () => {
      switch (activeTab) {
         case "profile":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle className="text-xl font-black">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 text-3xl font-black">
                           {`${settings.firstName?.charAt(0) || ''}${settings.lastName?.charAt(0) || ''}`.toUpperCase() || "FO"}
                        </div>
                        <div>
                           <h3 className="text-xl font-black">{settings.firstName} {settings.lastName}</h3>
                           <p className="text-sm text-gray-500 font-medium">Field Operations Officer</p>
                           <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 hover:underline">Change Avatar</button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">First Name</label>
                           <input type="text" value={settings.firstName} onChange={e => handleChange("firstName", e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Last Name</label>
                           <input type="text" value={settings.lastName} onChange={e => handleChange("lastName", e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Email Address</label>
                           <input type="email" value={settings.email} onChange={e => handleChange("email", e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Phone Number</label>
                           <input type="tel" value={settings.phone} onChange={e => handleChange("phone", e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">Profile Visibility</label>
                           <select value={settings.profileVisibility} onChange={e => handleChange("profileVisibility", e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all">
                              <option value="private">Private</option>
                              <option value="public">Public</option>
                              <option value="internal">Internal Only</option>
                           </select>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition flex items-center gap-2">
                           <Save className="w-4 h-4" /> Save Changes
                        </button>
                     </div>
                  </CardContent>
               </Card>
            );
         case "notifications":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle className="text-xl font-black">Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Operational Alerts</p>
                     <div className="space-y-4">
                        <ToggleItem label="Notify on New Visit" description="Alert when a new farm inspection is assigned" checked={settings.notifyOnNewVisit} onChange={v => handleChange("notifyOnNewVisit", v)} />
                        <ToggleItem label="Notify on Visit Completion" description="Get updates when field logs are finalized" checked={settings.notifyOnCompletion} onChange={v => handleChange("notifyOnCompletion", v)} />
                        <ToggleItem label="Notify on Delayed Visit" description="Warning for scheduled visits that are overdue" checked={settings.notifyOnDelayedVisit} onChange={v => handleChange("notifyOnDelayedVisit", v)} />
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Notification Channels</p>
                        <div className="space-y-4">
                           <ToggleItem label="Email Notifications" description="Detailed summaries sent to your inbox" checked={settings.emailNotifications} onChange={v => handleChange("emailNotifications", v)} />
                           <ToggleItem label="SMS Notifications" description="Instant text alerts for critical updates" checked={settings.smsNotifications} onChange={v => handleChange("smsNotifications", v)} />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            );
         case "security":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle className="text-xl font-black">Security & Access</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Two-Factor Authentication</p>
                        <div className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${settings.twoFactorAuth ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20" : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20"}`}>
                           <div className="flex items-center gap-4">
                              <Shield className={`w-8 h-8 ${settings.twoFactorAuth ? "text-emerald-600" : "text-blue-600"}`} />
                              <div>
                                 <p className="font-bold text-sm">2FA is currently {settings.twoFactorAuth ? "Enabled" : "Disabled"}</p>
                                 <p className="text-xs text-gray-500">Protect your account with an extra verification step.</p>
                              </div>
                           </div>
                           <button onClick={() => handleChange("twoFactorAuth", !settings.twoFactorAuth)} className={`font-black text-xs uppercase tracking-widest hover:underline ${settings.twoFactorAuth ? "text-emerald-600" : "text-blue-600"}`}>
                              {settings.twoFactorAuth ? "Disable" : "Enable"}
                           </button>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Login Security</p>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-gray-400" />
                              <p className="text-sm font-medium">Last logged in from iPhone 15</p>
                           </div>
                           <span className="text-[10px] font-black text-gray-400 uppercase">2 hours ago</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            );
         default:
            return null;
      }
   };

   return (
      <div className="space-y-6 max-w-6xl mx-auto">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Settings</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your field operations preferences</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
               <nav className="space-y-2">
                  <SettingTab active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={18} />} label="Profile Settings" />
                  <SettingTab active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={<Bell size={18} />} label="Notifications" />
                  <SettingTab active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Shield size={18} />} label="Security" />
               </nav>
            </div>

            <div className="md:col-span-3">
               {renderContent()}
            </div>
         </div>
      </div>
   );
}

function SettingTab({ icon, label, active, onClick }) {
   return (
      <div 
         onClick={onClick}
         className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all cursor-pointer border ${
            active ? "bg-white dark:bg-gray-900 shadow-lg text-blue-600 border-blue-100 dark:border-blue-900/30" : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
         }`}
      >
         {icon}
         <span className="text-sm">{label}</span>
      </div>
   );
}

function ToggleItem({ label, description, checked, onChange }) {
   return (
      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
         <div>
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
         </div>
         <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
         </label>
      </div>
   );
}
