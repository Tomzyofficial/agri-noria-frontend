"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { 
   Loader2, Save, AlertCircle, Globe, Shield, 
   FileText, Settings, Bell, Lock, Database,
   Zap, Server, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function SettingsPage() {
   const [settings, setSettings] = useState({
      platformName: "AgriNoria",
      platformEmail: "support@agrinoria.com",
      maintenanceMode: false,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      emailVerificationRequired: true,
      twoFactorRequired: false,
      maxUploadSize: 50,
      apiRateLimit: 100,
      enableAuditLogs: true,
   });
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState("general");

   useEffect(() => {
      const fetchSettings = async () => {
         try {
            const res = await fetch("/api/proxy/admin/settings");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data) {
                  setSettings((prev) => ({ ...prev, ...json.data }));
               }
            }
         } catch (err) {
            console.error("Failed to fetch settings:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchSettings();
   }, []);

   const handleChange = (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
   };

   const handleSave = async () => {
      setSaving(true);
      try {
         const res = await fetch("/api/proxy/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
         });

         if (res.ok) {
            toast.success("Settings saved successfully and applied globally");
         } else {
            toast.error("Failed to save settings");
         }
      } catch (err) {
         console.error("Error saving settings:", err);
         toast.error("An error occurred while saving settings");
      } finally {
         setSaving(false);
      }
   };

   const tabs = [
      { id: "general", label: "General", icon: Globe },
      { id: "security", label: "Security", icon: Shield },
      { id: "files", label: "Storage", icon: Database },
      { id: "system", label: "System", icon: Server },
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-(--foreground) bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  System Configuration
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                  Platform-wide governance and security orchestrations.
               </p>
            </div>
            <Button 
               onClick={handleSave} 
               disabled={saving} 
               className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40 px-8 h-12 rounded-2xl flex items-center gap-2 group transition-all"
            >
               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
               <span className="font-bold">{saving ? "Saving Changes..." : "Apply Settings"}</span>
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-3 space-y-2">
               {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                           activeTab === tab.id
                              ? "bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30 translate-x-1"
                              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                     >
                        <Icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                        {tab.label}
                     </button>
                  );
               })}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">
               {activeTab === "general" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <Globe className="w-5 h-5 text-blue-500" />
                              Platform Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Platform Name</label>
                                 <input
                                    type="text"
                                    value={settings.platformName}
                                    onChange={(e) => handleChange("platformName", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-medium"
                                    placeholder="Enter platform name"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Support Email</label>
                                 <input
                                    type="email"
                                    value={settings.platformEmail}
                                    onChange={(e) => handleChange("platformEmail", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all font-medium"
                                    placeholder="support@example.com"
                                 />
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               )}

               {activeTab === "security" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-red-500" />
                              Security Governance
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Max Login Attempts</label>
                                 <div className="relative">
                                    <input
                                       type="number"
                                       value={settings.maxLoginAttempts}
                                       onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                                       className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-lg"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Session Timeout (min)</label>
                                 <div className="relative">
                                    <input
                                       type="number"
                                       value={settings.sessionTimeout}
                                       onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                                       className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all font-bold text-lg"
                                    />
                                    <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              {[
                                 { key: "emailVerificationRequired", label: "Enforce Email Verification", desc: "Users must verify their email before accessing core features", icon: Bell },
                                 { key: "twoFactorRequired", label: "Mandatory 2FA", desc: "Require two-factor authentication for all administrative accounts", icon: Lock },
                              ].map((item) => (
                                 <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                       <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                                          <item.icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
                                          <p className="text-sm text-gray-500">{item.desc}</p>
                                       </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                       <input
                                          type="checkbox"
                                          className="sr-only peer"
                                          checked={settings[item.key]}
                                          onChange={(e) => handleChange(item.key, e.target.checked)}
                                       />
                                       <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                                    </label>
                                 </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               )}

               {activeTab === "files" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <Database className="w-5 h-5 text-emerald-500" />
                              Storage & Resource Limits
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                           <div className="max-w-md space-y-4">
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Max Upload Size (MB)</label>
                                 <div className="flex items-center gap-4">
                                    <input
                                       type="range"
                                       min="1"
                                       max="500"
                                       value={settings.maxUploadSize}
                                       onChange={(e) => handleChange("maxUploadSize", parseInt(e.target.value))}
                                       className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <span className="w-20 text-center font-black text-2xl text-emerald-600">{settings.maxUploadSize}MB</span>
                                 </div>
                                 <p className="text-xs text-gray-500 mt-2 italic">Controls maximum size for vendor documents and profile assets.</p>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               )}

               {activeTab === "system" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <Card className="border-2 border-orange-200 dark:border-orange-900/50 shadow-2xl bg-orange-50/50 dark:bg-orange-950/20 backdrop-blur-xl">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                              <AlertCircle className="w-6 h-6 animate-bounce" />
                              Critical Infrastructure Control
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8">
                           <div className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-900/80 rounded-3xl border-2 border-orange-200 dark:border-orange-900/50 shadow-lg group">
                              <div className="space-y-1">
                                 <h4 className="text-xl font-black text-orange-800 dark:text-orange-400">MAINTENANCE MODE</h4>
                                 <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                                    Instantly disconnect all non-administrative users. Use only for emergency patches or scheduled updates.
                                 </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer scale-125">
                                 <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                                 />
                                 <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600 shadow-xl"></div>
                              </label>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                                    <Cpu className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Rate Limiting</p>
                                    <p className="text-lg font-bold">100 req/min</p>
                                 </div>
                              </div>
                              <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                                 <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                                    <FileText className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Audit Logging</p>
                                    <p className="text-lg font-bold">ENABLED</p>
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
