"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaSatellite, FaBell, FaShieldAlt, FaKey, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

export default function IntelligenceSettingsPage() {
    const [settings, setSettings] = useState({
        riskAlerts: true,
        satelliteSync: "Every 6 Hours",
        autoAudit: false,
        apiStatus: "Active"
    });

    const handleSave = () => {
        toast.success("Intelligence configuration updated");
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">System <span className="text-purple-600">Settings</span></h1>
                <p className="text-gray-500 font-medium">Configure surveillance frequency and risk monitoring thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <SettingNav icon={<FaBell />} label="Alert Thresholds" active />
                    <SettingNav icon={<FaSatellite />} label="Sensor Sync" />
                    <SettingNav icon={<FaShieldAlt />} label="Integrity Protocols" />
                    <SettingNav icon={<FaKey />} label="API Integrations" />
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-800 p-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">Surveillance Configuration</h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Real-time Risk Alerts</p>
                                    <p className="text-xs text-gray-400">Push notifications for severe climatic or biological risk detections.</p>
                                </div>
                                <Toggle checked={settings.riskAlerts} onChange={(v) => setSettings({...settings, riskAlerts: v})} />
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Automated Field Audits</p>
                                    <p className="text-xs text-gray-400">Trigger agent verification instantly on moisture stress detection.</p>
                                </div>
                                <Toggle checked={settings.autoAudit} onChange={(v) => setSettings({...settings, autoAudit: v})} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Satellite Imagery Frequency</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-gray-300 outline-none focus:ring-2 ring-purple-500/20"
                                    value={settings.satelliteSync}
                                    onChange={(e) => setSettings({...settings, satelliteSync: e.target.value})}
                                >
                                    <option>Every 1 Hour (Real-time)</option>
                                    <option>Every 6 Hours</option>
                                    <option>Every 24 Hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700">
                            <Button 
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-transform"
                            >
                                <FaSave /> Save Configuration
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-purple-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FaShieldAlt size={100} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2 italic">Intelligence Integrity</h3>
                            <p className="text-purple-100 text-sm leading-relaxed max-w-xs">
                                All monitoring protocols comply with AgriNoria Global Standards. Encrypted satellite handshakes are active.
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
        <div className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all ${active ? 'bg-white dark:bg-gray-800 shadow-lg text-purple-600 font-black' : 'text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <div 
            onClick={() => onChange(!checked)}
            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    );
}
