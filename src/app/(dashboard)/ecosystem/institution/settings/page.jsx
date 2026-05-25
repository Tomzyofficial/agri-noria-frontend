"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Settings, User, Bell, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstitutionSettingsPage() {
   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div>
            <h1 className="text-3xl font-black text-(--foreground)">Institutional Settings</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your institutional profile and preferences.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
               <Card className="border-none shadow-sm overflow-hidden">
                  <div className="h-2 bg-blue-600" />
                  <CardContent className="p-6">
                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-3xl flex items-center justify-center">
                           <Globe className="w-12 h-12" />
                        </div>
                        <div>
                           <h3 className="font-bold text-xl">Institutional Node</h3>
                           <p className="text-sm text-gray-500">Government Entity ID: AGRI-NODE-001</p>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl">Edit Profile</Button>
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
                     <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 text-center py-20">
                     <Settings className="w-12 h-12 text-gray-200 mx-auto animate-spin-slow" />
                     <p className="text-gray-400 text-sm max-w-xs mx-auto italic">Institutional preference and account configuration coming soon.</p>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}
