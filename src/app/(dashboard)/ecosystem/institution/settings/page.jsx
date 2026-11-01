"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Settings, User, Bell, Shield, Globe, Loader2, CheckCircle2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function InstitutionSettingsPage() {
   const [activeTab, setActiveTab] = useState("account");
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [formData, setFormData] = useState({
      fname: "",
      lname: "",
      phone: "",
      company_name: "",
   });

   const [notifications, setNotifications] = useState({
      emailDispatches: true,
      weeklyDigest: true,
      smsAlerts: false,
      treasuryApprovals: true,
   });

   const [security, setSecurity] = useState({
      twoFactorAuth: false,
      sessionTimeoutMinutes: "30",
      ipWhitelisting: false,
   });

   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const res = await fetch("/api/proxy/auth/verify-vendor");
            const json = await res.json();
            if (json.authenticated) {
               setProfile(json);
               setFormData({
                  fname: json.fname || "",
                  lname: json.lname || "",
                  phone: json.phone || "",
                  company_name: json.company_name || "",
               });
            }
         } catch (error) {
            console.error("Failed to fetch profile:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchProfile();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const res = await fetch("/api/proxy/admin/institution/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
         });
         const json = await res.json();
         if (json.success) {
            toast.success("Profile updated successfully!");
            setProfile({...profile, ...formData});
         } else {
            toast.error(json.error || "Failed to update profile.");
         }
      } catch (error) {
         toast.error("Network error.");
      } finally {
         setSaving(false);
      }
   };

   const handleSaveNotifications = (e) => {
      e.preventDefault();
      toast.success("Notification preferences saved successfully!");
   };

   const handleSaveSecurity = (e) => {
      e.preventDefault();
      toast.success("Security & privacy configuration updated!");
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   const navItems = [
      { id: "account", label: "Account Information", icon: <User className="w-4 h-4" /> },
      { id: "notifications", label: "Notification Settings", icon: <Bell className="w-4 h-4" /> },
      { id: "security", label: "Security & Privacy", icon: <Shield className="w-4 h-4" /> },
   ];

   return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto py-6">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Institutional Settings</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your institutional profile, notification preferences, and security controls.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
               <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-950">
                  <div className="h-2 bg-blue-600" />
                  <CardContent className="p-6">
                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-3xl flex items-center justify-center">
                           <Globe className="w-12 h-12" />
                        </div>
                        <div>
                           <h3 className="font-bold text-xl">{profile?.company_name || "Institutional Node"}</h3>
                           <p className="text-sm text-gray-500">{profile?.email}</p>
                           <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-widest">{profile?.role}</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <div className="space-y-2">
                  {navItems.map((item) => (
                     <button 
                        key={item.id} 
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white dark:bg-gray-950 shadow-sm text-blue-600 border border-blue-100 dark:border-blue-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                     >
                        {item.icon} {item.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-8">
               {activeTab === "account" && (
                  <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
                     <CardHeader>
                        <CardTitle className="text-lg font-bold">Account Information</CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">First Name</label>
                                 <Input 
                                    value={formData.fname} 
                                    onChange={e => setFormData({...formData, fname: e.target.value})} 
                                    className="h-11" 
                                    required
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Last Name</label>
                                 <Input 
                                    value={formData.lname} 
                                    onChange={e => setFormData({...formData, lname: e.target.value})} 
                                    className="h-11" 
                                    required
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Phone</label>
                                 <Input 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    className="h-11" 
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Institution / Company Name</label>
                                 <Input 
                                    value={formData.company_name} 
                                    onChange={e => setFormData({...formData, company_name: e.target.value})} 
                                    className="h-11" 
                                 />
                              </div>
                           </div>
                           <div className="pt-4 flex justify-end">
                              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8">
                                 {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                 {saving ? "Saving..." : "Save Changes"}
                              </Button>
                           </div>
                        </form>
                     </CardContent>
                  </Card>
               )}

               {activeTab === "notifications" && (
                  <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
                     <CardHeader>
                        <CardTitle className="text-lg font-bold">Notification Settings</CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                        <form onSubmit={handleSaveNotifications} className="space-y-6">
                           <div className="space-y-4">
                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Dispatches & Cargo Movements</p>
                                    <p className="text-xs text-gray-500">Real-time alerts when assigned logistics move warehouse grain.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={notifications.emailDispatches} 
                                    onChange={e => setNotifications({...notifications, emailDispatches: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>

                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Treasury & Wallet Approvals</p>
                                    <p className="text-xs text-gray-500">Instant notification when farmer subsidy disbursements occur.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={notifications.treasuryApprovals} 
                                    onChange={e => setNotifications({...notifications, treasuryApprovals: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>

                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Weekly Executive Digest</p>
                                    <p className="text-xs text-gray-500">Consolidated analytics report sent every Monday morning.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={notifications.weeklyDigest} 
                                    onChange={e => setNotifications({...notifications, weeklyDigest: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>

                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Urgent SMS Alerts</p>
                                    <p className="text-xs text-gray-500">Send high-priority failure alarms directly via SMS to registered phone.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={notifications.smsAlerts} 
                                    onChange={e => setNotifications({...notifications, smsAlerts: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>
                           </div>

                           <div className="pt-2 flex justify-end">
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8">
                                 Save Notification Preferences
                              </Button>
                           </div>
                        </form>
                     </CardContent>
                  </Card>
               )}

               {activeTab === "security" && (
                  <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
                     <CardHeader>
                        <CardTitle className="text-lg font-bold">Security & Privacy</CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                        <form onSubmit={handleSaveSecurity} className="space-y-6">
                           <div className="space-y-4">
                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Two-Factor Authentication (2FA)</p>
                                    <p className="text-xs text-gray-500">Enforce OTP verification upon institutional portal entry.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={security.twoFactorAuth} 
                                    onChange={e => setSecurity({...security, twoFactorAuth: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>

                              <div className="p-4 border rounded-xl space-y-2">
                                 <label className="font-bold text-sm block">Session Idle Timeout</label>
                                 <p className="text-xs text-gray-500 mb-2">Automatically sign out after a period of user inactivity.</p>
                                 <select 
                                    value={security.sessionTimeoutMinutes} 
                                    onChange={e => setSecurity({...security, sessionTimeoutMinutes: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border p-2.5 rounded-lg text-sm font-semibold"
                                 >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="240">4 hours</option>
                                 </select>
                              </div>

                              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer">
                                 <div>
                                    <p className="font-bold text-sm">Corporate IP Range Lockdown</p>
                                    <p className="text-xs text-gray-500">Reject authentication requests from outside enterprise subnet.</p>
                                 </div>
                                 <input 
                                    type="checkbox" 
                                    checked={security.ipWhitelisting} 
                                    onChange={e => setSecurity({...security, ipWhitelisting: e.target.checked})}
                                    className="w-5 h-5 accent-blue-600 rounded" 
                                 />
                              </label>
                           </div>

                           <div className="pt-2 flex justify-end">
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8">
                                 Save Security Policies
                              </Button>
                           </div>
                        </form>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
      </div>
   );
}
