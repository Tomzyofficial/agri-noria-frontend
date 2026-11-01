"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaSatellite, FaBell, FaShieldAlt, FaKey, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

export default function IntelligenceSettingsPage() {
    const [activeTab, setActiveTab] = useState("alerts");
    const [settings, setSettings] = useState({
        riskAlerts: true,
        satelliteSync: "Every 6 Hours",
        autoAudit: false,
        apiStatus: "Active",
        sensorSyncFreq: "Every 15 Minutes",
        droneOrthomosaicFreq: "Weekly",
        zkProofsEnabled: true,
        tamperThreshold: "Strict (0.01 deviation)",
        copernicusApiKey: "copernicus_live_token_77a9",
        planetLabsKey: "pl_ingest_sec_554189",
    });

    const handleSave = () => {
        toast.success("Intelligence configuration updated successfully!");
    };

    const navTabs = [
        { id: "alerts", label: "Alert Thresholds", icon: <FaBell /> },
        { id: "sensor", label: "Sensor Sync", icon: <FaSatellite /> },
        { id: "integrity", label: "Integrity Protocols", icon: <FaShieldAlt /> },
        { id: "api", label: "API Integrations", icon: <FaKey /> },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">System <span className="text-purple-600">Settings</span></h1>
                <p className="text-gray-500 font-medium">Configure surveillance frequency, sensor calibration, and risk monitoring thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    {navTabs.map((tab) => (
                        <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 shadow-lg text-purple-600 font-black border border-purple-100 dark:border-purple-900/30' : 'text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-2 space-y-8">
                    {activeTab === "alerts" && (
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
                    )}

                    {activeTab === "sensor" && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-800 p-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">Sensor & Telemetry Sync</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IoT Probe Polling Rate</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-gray-300 outline-none focus:ring-2 ring-purple-500/20"
                                        value={settings.sensorSyncFreq}
                                        onChange={(e) => setSettings({...settings, sensorSyncFreq: e.target.value})}
                                    >
                                        <option>Every 15 Minutes</option>
                                        <option>Every 30 Minutes</option>
                                        <option>Every 1 Hour</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Drone Multispectral Orthomosaics</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-gray-300 outline-none focus:ring-2 ring-purple-500/20"
                                        value={settings.droneOrthomosaicFreq}
                                        onChange={(e) => setSettings({...settings, droneOrthomosaicFreq: e.target.value})}
                                    >
                                        <option>Twice Weekly</option>
                                        <option>Weekly</option>
                                        <option>Bi-weekly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700">
                                <Button 
                                    onClick={handleSave}
                                    className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-transform"
                                >
                                    <FaSave /> Save Sensor Protocols
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === "integrity" && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-800 p-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">Cryptographic Integrity Protocols</h3>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Zero-Knowledge Yield Attestation</p>
                                        <p className="text-xs text-gray-400">Sign farm inspection and harvest telemetry with cryptographic non-repudiation.</p>
                                    </div>
                                    <Toggle checked={settings.zkProofsEnabled} onChange={(v) => setSettings({...settings, zkProofsEnabled: v})} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Geofence Tamper Detection Sensitivity</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-gray-300 outline-none focus:ring-2 ring-purple-500/20"
                                        value={settings.tamperThreshold}
                                        onChange={(e) => setSettings({...settings, tamperThreshold: e.target.value})}
                                    >
                                        <option>Strict (0.01 deviation)</option>
                                        <option>Moderate (0.05 deviation)</option>
                                        <option>Relaxed (0.10 deviation)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700">
                                <Button 
                                    onClick={handleSave}
                                    className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-transform"
                                >
                                    <FaSave /> Save Integrity Protocols
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === "api" && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-800 p-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">API Integrations & Oracles</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Copernicus Sentinel-2 API Token</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-mono font-bold text-slate-700 dark:text-gray-300 outline-none"
                                        value={settings.copernicusApiKey}
                                        onChange={(e) => setSettings({...settings, copernicusApiKey: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Planet Labs Ingest Secret</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-mono font-bold text-slate-700 dark:text-gray-300 outline-none"
                                        value={settings.planetLabsKey}
                                        onChange={(e) => setSettings({...settings, planetLabsKey: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700">
                                <Button 
                                    onClick={handleSave}
                                    className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-transform"
                                >
                                    <FaSave /> Save API Keys
                                </Button>
                            </div>
                        </Card>
                    )}

                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-purple-600 p-10 text-white relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Integrity Protection</span>
                            <h4 className="text-2xl font-black">Zero-Knowledge Traceability</h4>
                            <p className="text-purple-100 text-xs font-medium max-w-sm">Every surveillance scan is cryptographically signed and stored on the immutable audit trail.</p>
                        </div>
                        <FaShieldAlt className="absolute -right-8 -bottom-8 text-9xl text-white/10" />
                    </Card>
                </div>
            </div>
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
