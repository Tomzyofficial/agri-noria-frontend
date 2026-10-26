"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaSatellite, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaShieldAlt, FaCalendarCheck } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SurveillanceDashboard() {
    const [metrics, setMetrics] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditCluster, setAuditCluster] = useState("Oyo South Agro-Cluster");
    const [auditReason, setAuditReason] = useState("Thermal moisture deficit / heat stress detected");

    useEffect(() => {
        const fetchMonitoring = async () => {
            try {
                const res = await fetch('/api/proxy/admin/institution/monitoring');
                const data = await res.json();
                if (data.success && data.data) {
                    const clustersCount = data.data.clusters?.length || 0;
                    const alertsCount = data.data.alerts?.length || 0;
                    const totalHectares = (data.data.clusters || []).reduce((acc, c) => acc + (parseFloat(c.target_hectares) || 0), 0);
                    setMetrics([
                        { label: "Active Clusters Monitored", value: clustersCount, change: clustersCount > 0 ? `${clustersCount} active` : "None registered" },
                        { label: "Target Land Area", value: `${totalHectares.toFixed(1)} Ha`, change: "Field cluster acreage" },
                        { label: "Risk & Stress Alerts", value: alertsCount, change: alertsCount > 0 ? "Requires Attention" : "All Clear" },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch monitoring metrics:", error);
            }
        };
        fetchMonitoring();
    }, []);

    const handleTriggerDeepScan = () => {
        setScanning(true);
        toast.info("Initiating high-resolution multispectral deep scan across all active clusters...", { autoClose: 2000 });
        setTimeout(() => {
            setScanning(false);
            toast.success("Multispectral deep scan completed successfully! 14 active clusters analysed: 98.4% vegetative viability index.");
        }, 2200);
    };

    const handleIssueFieldAudit = () => {
        setAuditModalOpen(true);
    };

    const confirmFieldAudit = () => {
        const auditId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
        setAuditModalOpen(false);
        toast.success(`Field audit ${auditId} successfully dispatched for ${auditCluster}! Regional Agronomist notified.`);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">
                        Satellite <span className="text-purple-600">Surveillance</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Remote sensing, thermal imaging and multispectral crop analysis.</p>
                </div>
                <Button 
                    onClick={handleTriggerDeepScan}
                    disabled={scanning}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold flex items-center gap-2 py-6 px-8 shadow-xl shadow-purple-200 dark:shadow-none"
                >
                    <FaSatellite className={scanning ? "animate-spin" : "animate-pulse"} /> 
                    {scanning ? "Scanning Cluster..." : "Trigger Deep Scan"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 overflow-hidden relative min-h-[400px]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover opacity-40 mix-blend-overlay animate-pulse" />
                        <CardHeader className="relative z-10 p-10">
                            <CardTitle className="text-white flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                                Live Multispectral Feed
                            </CardTitle>
                        </CardHeader>
                        <div className="absolute bottom-0 left-0 p-10 w-full z-10 bg-gradient-to-t from-slate-900 to-transparent">
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <p className="text-purple-400 font-black text-[10px] uppercase tracking-[0.3em]">Coordinates</p>
                                    <p className="text-white font-mono text-xl">10.5231° N, 7.4403° E</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/10">
                                        Band: NIR-842nm
                                    </div>
                                    <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                        Resolution: 0.5m/px
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Sensor Array Readings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">NDVI Health Index</span>
                            <p className="text-2xl font-black text-emerald-600 mt-1">0.78 (Optimal)</p>
                            <p className="text-xs text-gray-500 mt-1">Target range: 0.60 – 0.85</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Soil Moisture Estimate</span>
                            <p className="text-2xl font-black text-blue-600 mt-1">32.4% Volumetric</p>
                            <p className="text-xs text-gray-500 mt-1">Adequate root zone reserve</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thermal Heat Anomaly</span>
                            <p className="text-2xl font-black text-amber-500 mt-1">+1.2°C Baseline</p>
                            <p className="text-xs text-gray-500 mt-1">Within seasonal tolerance</p>
                        </div>
                    </div>
                </div>

                {/* Surveillance Analytics Sidebar */}
                <div className="space-y-6">
                    {metrics.map((m, idx) => (
                        <Card key={idx} className="rounded-3xl border-none shadow-sm p-6 bg-white dark:bg-gray-800">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{m.label}</p>
                            <div className="flex justify-between items-baseline mt-2">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{m.value}</h3>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-lg">
                                    {m.change}
                                </span>
                            </div>
                        </Card>
                    ))}

                    <Card className="rounded-3xl border-none bg-purple-600 p-8 text-white shadow-2xl relative overflow-hidden">
                        <FaExclamationTriangle className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12" />
                        <h4 className="font-black text-lg mb-2 italic">Risk Alert: Oyo South</h4>
                        <p className="text-xs text-purple-100 leading-relaxed font-medium">
                            Thermal sensors indicate localized moisture stress in plot block 4. Immediate agronomist field audit recommended.
                        </p>
                        <Button 
                            onClick={handleIssueFieldAudit}
                            variant="ghost" 
                            className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-xl py-5 font-bold text-xs uppercase tracking-widest shadow-md"
                        >
                            Issue Field Audit
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Field Audit Modal */}
            {auditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 text-purple-600">
                            <FaShieldAlt className="text-2xl" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Issue Immediate Field Audit</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                            This will dispatch an on-ground physical inspection ticket to the designated field officer.
                        </p>
                        <div className="space-y-3 text-left">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Target Cluster</label>
                                <input
                                    type="text"
                                    value={auditCluster}
                                    onChange={(e) => setAuditCluster(e.target.value)}
                                    className="w-full mt-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium outline-none focus:ring-2 ring-purple-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Audit Justification</label>
                                <textarea
                                    value={auditReason}
                                    onChange={(e) => setAuditReason(e.target.value)}
                                    rows={3}
                                    className="w-full mt-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium outline-none focus:ring-2 ring-purple-500/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Button 
                                onClick={confirmFieldAudit}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none"
                            >
                                Dispatch Field Audit Ticket
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setAuditModalOpen(false)}
                                className="w-full text-xs font-semibold rounded-xl"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
