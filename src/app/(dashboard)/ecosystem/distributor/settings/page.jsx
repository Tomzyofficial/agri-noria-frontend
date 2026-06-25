"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FaUser, FaBuilding, FaSave, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";

export default function DistributorSettingsPage() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState("profile");

   // Form state for profile fields
   const [formData, setFormData] = useState({
      fname: "",
      lname: "",
      email: "",
      phone: "",
      company_name: "",
   });

   const fetchProfile = async () => {
      try {
         const session = await verifyVendorSession();
         const res = await fetch("/api/proxy/vendor/get-profile-info");
         let businessData = {};
         if (res.ok) {
            const data = await res.json();
            businessData = data.data || {};
         }
         
         if (session?.authenticated) {
            setFormData({
               fname: session.fname || "",
               lname: session.lname || "",
               email: session.email || "",
               phone: session.phone || "",
               company_name: businessData.business_name || "",
            });
         }
      } catch (err) {
         console.error("Failed to load profile:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProfile();
   }, []);

   const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
   };

   const handleSave = async () => {
      setSaving(true);
      try {
         // Update basic vendor info
         const basicRes = await fetch("/api/proxy/vendor/update-basic-info", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               fname: formData.fname,
               lname: formData.lname,
               phone: formData.phone,
            }),
         });

         if (!basicRes.ok) {
            const d = await basicRes.json();
            toast.error(d.error || "Failed to update profile info");
            setSaving(false);
            return;
         }

         toast.success("Profile updated successfully!");
         await fetchProfile();
      } catch (err) {
         console.error("Save error:", err);
         toast.error("Network error while saving");
      } finally {
         setSaving(false);
      }
   };

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Loading Settings...</div>;

   const tabs = [
      { id: "profile", label: "Profile", icon: <FaUser /> },
      { id: "business", label: "Business", icon: <FaBuilding /> },
   ];

   return (
      <div className="p-6 max-w-4xl mx-auto">
         <h1 className="text-3xl font-black text-(--foreground) tracking-tight mb-8">Settings</h1>

         <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-2">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                           ? "bg-(--greenish-color) text-white"
                           : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                     }`}
                  >
                     {tab.icon}
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
               {activeTab === "profile" && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <Label>First Name</Label>
                              <Input
                                 value={formData.fname}
                                 onChange={(e) => handleChange("fname", e.target.value)}
                                 placeholder="First Name"
                              />
                           </div>
                           <div className="space-y-2">
                              <Label>Last Name</Label>
                              <Input
                                 value={formData.lname}
                                 onChange={(e) => handleChange("lname", e.target.value)}
                                 placeholder="Last Name"
                              />
                           </div>
                           <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                 value={formData.email}
                                 disabled
                                 className="bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                              />
                              <p className="text-xs text-gray-500">Email cannot be changed.</p>
                           </div>
                           <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input
                                 value={formData.phone}
                                 onChange={(e) => handleChange("phone", e.target.value)}
                                 placeholder="Phone Number"
                              />
                           </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                           <Button onClick={handleSave} disabled={saving} className="bg-(--greenish-color) text-white hover:bg-(--dark-green-color)">
                              {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                              Save Changes
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               )}

               {activeTab === "business" && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="text-xl font-bold">Business Information</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Label>Company Name</Label>
                           <Input
                              value={formData.company_name}
                              disabled
                              className="bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                           />
                           <p className="text-xs text-gray-500">To change your company name, please contact support.</p>
                        </div>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
      </div>
   );
}
