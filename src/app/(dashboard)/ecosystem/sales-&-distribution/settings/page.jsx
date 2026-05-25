"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaUserCircle, FaBell, FaShieldAlt, FaMapMarkedAlt, FaSave, FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: true,
        autoAssign: false,
        escrowAlerts: true,
        warehouseRegion: "Lagos Hub",
        contactEmail: "distributor@agrinoria.com"
    });

    const handleSave = () => {
        toast.success("Settings updated successfully");
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">System <span className="text-blue-600">Settings</span></h1>
                <p className="text-gray-500 font-medium">Configure your distribution preferences and notification triggers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <SettingNav icon={<FaUserCircle />} label="Profile Info" active />
                    <SettingNav icon={<FaBell />} label="Notifications" />
                    <SettingNav icon={<FaShieldAlt />} label="Security" />
                    <SettingNav icon={<FaTruck />} label="Logistics Preferences" />
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-gray-50 pb-4">Logistics Configuration</h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Auto-Assign Shipments</p>
                                    <p className="text-xs text-gray-400">Automatically assign new ecosystem orders to nearest drivers.</p>
                                </div>
                                <Toggle checked={settings.autoAssign} onChange={(v) => setSettings({...settings, autoAssign: v})} />
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Escrow Payment Alerts</p>
                                    <p className="text-xs text-gray-400">Get notified the moment a buyer secures funds in escrow.</p>
                                </div>
                                <Toggle checked={settings.escrowAlerts} onChange={(v) => setSettings({...settings, escrowAlerts: v})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Warehouse Region</label>
                                <select 
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                                    value={settings.warehouseRegion}
                                    onChange={(e) => setSettings({...settings, warehouseRegion: e.target.value})}
                                >
                                    <option>Lagos Hub</option>
                                    <option>Kano Aggregation Center</option>
                                    <option>Ibadan Storage</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notification Email</label>
                                <input 
                                    type="email"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-50">
                            <Button 
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-transform"
                            >
                                <FaSave /> Save Configuration
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-blue-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FaShieldAlt size={100} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2">Operational Integrity</h3>
                            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                                Your account is currently verified for Ecosystem Distribution. Maintain a high fulfillment rate to unlock premium logistics tiers.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SettingNav({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all ${active ? 'bg-white shadow-lg text-blue-600 font-black' : 'text-gray-400 font-bold hover:bg-gray-50'}`}>
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <div 
            onClick={() => onChange(!checked)}
            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}
        >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    );
}
