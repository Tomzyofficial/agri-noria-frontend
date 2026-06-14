"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Settings, User, Bell, Shield, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function InstitutionSettingsPage() {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [formData, setFormData] = useState({
      fname: "",
      lname: "",
      phone: "",
      company_name: "",
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

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Institutional Settings</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your institutional profile and preferences.</p>
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
                  {[
                     { label: "Account Information", icon: <User className="w-4 h-4" />, active: true },
                     { label: "Notification Settings", icon: <Bell className="w-4 h-4" /> },
                     { label: "Security & Privacy", icon: <Shield className="w-4 h-4" /> },
                  ].map((item, i) => (
                     <button 
                        key={i} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-white dark:bg-gray-950 shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                     >
                        {item.icon} {item.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-8">
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
            </div>
         </div>
      </div>
   );
}
