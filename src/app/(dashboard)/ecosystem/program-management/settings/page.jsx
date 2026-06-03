"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Settings, Shield, Bell, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useProgramData } from "../useProgramData";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
   const { loading, currentUser } = useProgramData();
   const [activeTab, setActiveTab] = useState("profile");
   const [formData, setFormData] = useState({ fname: "", lname: "", phone: "", email: "" });
   const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
      if (currentUser) {
         setFormData({
            fname: currentUser.fname || "",
            lname: currentUser.lname || "",
            phone: currentUser.phone || "",
            email: currentUser.email || ""
         });
      }
   }, [currentUser]);

   const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
   };

   const handleSaveProfile = async () => {
      if (!formData.fname || !formData.lname || !formData.phone) {
         toast.error("Please fill in all required fields.");
         return;
      }

      setIsSaving(true);
      try {
         const res = await fetch("/api/proxy/vendor/update-basic-info", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               fname: formData.fname,
               lname: formData.lname,
               phone: formData.phone
            })
         });
         const data = await res.json();
         if (data.success) {
            toast.success("Profile updated successfully!");
         } else {
            toast.error(data.error || "Failed to update profile");
         }
      } catch (err) {
         console.error("Error saving profile:", err);
         toast.error("An error occurred while saving.");
      } finally {
         setIsSaving(false);
      }
   };

   if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">Loading Settings...</div>;

   const renderContent = () => {
      switch (activeTab) {
         case "profile":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 text-3xl font-black uppercase">
                           {currentUser?.fname?.[0]}{currentUser?.lname?.[0]}
                        </div>
                        <div>
                           <h3 className="text-xl font-black capitalize">{currentUser?.fname} {currentUser?.lname}</h3>
                           <p className="text-sm text-gray-500 font-medium capitalize">{currentUser?.role?.replace(/-/g, ' ')}</p>
                           {/* <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2 hover:underline">Change Avatar</button> */}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="First Name" value={formData.fname} onChange={(v) => handleInputChange("fname", v)} />
                        <InputGroup label="Last Name" value={formData.lname} onChange={(v) => handleInputChange("lname", v)} />
                        <InputGroup label="Email Address" value={formData.email} disabled={true} />
                        <InputGroup label="Phone Number" value={formData.phone} onChange={(v) => handleInputChange("phone", v)} />
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                           onClick={handleSaveProfile}
                           disabled={isSaving}
                           className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition"
                        >
                           {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                     </div>
                  </CardContent>
               </Card>
            );
         case "notifications":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Email Alerts</p>
                     <div className="space-y-4">
                        <ToggleItem label="New Input Requests" description="Get notified when a cluster supervisor submits a request" defaultChecked />
                        <ToggleItem label="Finance Approvals" description="Alert when a budget is approved for disbursement" defaultChecked />
                        <ToggleItem label="Repayment Reminders" description="Weekly summary of upcoming loan repayments" />
                     </div>

                     <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">In-App Notifications</p>
                        <div className="space-y-4">
                           <ToggleItem label="System Updates" description="Major updates to the AgriNoria ecosystem" defaultChecked />
                           <ToggleItem label="Farmer Activity" description="Notifications on individual farmer progress" />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            );
         case "security":
            return (
               <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-800">
                     <CardTitle>Security & Access</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Password Management</p>
                        <div className="grid grid-cols-1 gap-4">
                           <InputGroup label="Current Password" value="••••••••••••" />
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroup label="New Password" value="" />
                              <InputGroup label="Confirm Password" value="" />
                           </div>
                        </div>
                        <button className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-3 rounded-xl text-xs transition">
                           Update Password
                        </button>
                     </div>

                     <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Two-Factor Authentication</p>
                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                           <div className="flex items-center gap-4">
                              <Shield className="text-orange-600 w-8 h-8" />
                              <div>
                                 <p className="font-bold text-sm">2FA is currently Disabled</p>
                                 <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                              </div>
                           </div>
                           <button className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline">Enable</button>
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
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Configure your program preferences and profile</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
               <nav className="space-y-1">
                  <SettingTab
                     active={activeTab === "profile"}
                     onClick={() => setActiveTab("profile")}
                     icon={<User />}
                     label="Profile Info"
                  />
                  <SettingTab
                     active={activeTab === "notifications"}
                     onClick={() => setActiveTab("notifications")}
                     icon={<Bell />}
                     label="Notifications"
                  />
                  <SettingTab
                     active={activeTab === "security"}
                     onClick={() => setActiveTab("security")}
                     icon={<Shield />}
                     label="Security"
                  />
               </nav>
            </div>

            <div className="md:col-span-2">
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
         className={`flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all cursor-pointer ${active ? "bg-white dark:bg-gray-900 shadow-lg text-amber-600 border border-amber-100 dark:border-amber-900/30" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
      >
         <span className="w-5 h-5">{icon}</span>
         <span className="text-sm">{label}</span>
      </div>
   );
}

function InputGroup({ label, value, onChange, disabled }) {
   return (
      <div>
         <label className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-2">{label}</label>
         <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-amber-500 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
         />
      </div>
   );
}

function ToggleItem({ label, description, defaultChecked }) {
   return (
      <div className="flex items-center justify-between">
         <div>
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
         </div>
         <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
         </label>
      </div>
   );
}
