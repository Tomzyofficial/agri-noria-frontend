"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaSatellite, FaLeaf, FaCloudSun, FaExclamationTriangle, FaSearchPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function SurveillancePage() {
    const [monitoringData, setMonitoringData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonitoring = async () => {
            try {
                // Simulate fetching satellite data
                // In production, this would call a dedicated satellite API or middleware
                const res = await fetch("/api/proxy/pipeline/stats/intelligence");
                const data = await res.json();
                
                if (data.success && data.data.clusters && data.data.clusters.length > 0) {
                    const liveData = data.data.clusters.map((c, idx) => ({
                        id: c.id,
                        cluster: c.name,
                        region: c.region,
                        health: 82 + (idx * 4) % 15,
                        ndvi: parseFloat((0.62 + (idx * 0.04) % 0.3).toFixed(2)),
                        lastScan: "Just now",
                        status: c.status === 'active' ? 'Optimal' : 'Warning'
                    }));
                    setMonitoringData(liveData);
                } else {
                    setMonitoringData([]);
                }
            } catch (error) {
                toast.error("Failed to sync satellite data");
            } finally {
                setLoading(false);
            }
        };
        fetchMonitoring();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Satellite <span className="text-purple-600">Surveillance</span></h1>
                    <p className="text-gray-500 font-medium">Remote sensing and multispectral crop analysis.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold flex items-center gap-2 py-6 px-8 shadow-xl shadow-purple-200 dark:shadow-none">
                    <FaSatellite className="animate-pulse" /> Trigger Deep Scan
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
                                <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl py-5">
                                    <FaSearchPlus /> Zoom Cluster
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-gray-800 p-8">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Average Vegetation Index (NDVI)</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">0.72</span>
                                <span className="text-emerald-500 font-bold text-sm mb-1">+4.2% ↑</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">Reflectance ratio indicates robust chlorophyll density.</p>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-gray-800 p-8">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Regional Cloud Cover</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">12%</span>
                                <FaCloudSun className="text-amber-500 text-2xl mb-2" />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">Optimal visibility for optical sensor calibration.</p>
                        </Card>
                    </div>
                </div>

                {/* Cluster Health Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight ml-2">Cluster Health Status</h3>
                    {monitoringData.map(item => (
                        <Card key={item.id} className="rounded-3xl border-none shadow-xl bg-white dark:bg-gray-800 p-6 hover:shadow-2xl transition-shadow group border-l-8 border-transparent hover:border-purple-500">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="font-black text-slate-900 dark:text-white">{item.cluster}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <FaLeaf className={item.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'} /> {item.status}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-purple-600">{item.health}%</p>
                                    <p className="text-[10px] text-gray-300">NDVI: {item.ndvi}</p>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${item.health > 80 ? 'bg-emerald-500' : item.health > 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                    style={{ width: `${item.health}%` }} 
                                />
                            </div>
                        </Card>
                    ))}

                    <Card className="rounded-3xl border-none bg-purple-600 p-8 text-white shadow-2xl relative overflow-hidden">
                        <FaExclamationTriangle className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12" />
                        <h4 className="font-black text-lg mb-2 italic">Risk Alert</h4>
                        <p className="text-xs text-purple-100 leading-relaxed font-medium">
                            Thermal sensors in <span className="font-bold">Oyo South</span> indicate moisture stress. Automated irrigation triggers recommended.
                        </p>
                        <Button variant="ghost" className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-5 font-bold text-xs uppercase tracking-widest">
                            Issue Field Audit
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
