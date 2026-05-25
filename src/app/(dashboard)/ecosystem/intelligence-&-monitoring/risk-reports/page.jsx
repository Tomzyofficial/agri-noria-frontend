"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaShieldAlt, FaCloudRain, FaBiohazard, FaHandHoldingUsd, FaExclamationCircle } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function RiskReportsPage() {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRisks = async () => {
            setRisks([
                { id: 1, type: "Climatic", severity: "High", description: "Extended drought forecasted for Northwest clusters.", trend: "Rising" },
                { id: 2, type: "Biological", severity: "Low", description: "Localized pest sightings in Oyo South. Controlled.", trend: "Stable" },
                { id: 3, type: "Financial", severity: "Moderate", description: "Repayment delays detected in Cluster B due to market lag.", trend: "Falling" },
            ]);
            setLoading(false);
        };
        fetchRisks();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Risk <span className="text-purple-600">Intelligence</span></h1>
                <p className="text-gray-500 font-medium">Predictive modeling for climatic, biological, and financial volatility.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Heatmap Placeholder */}
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-gray-800 p-10 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ecosystem Risk Index</h3>
                        <p className="text-sm text-gray-400 font-medium italic">Aggregate risk score across all active financing cycles.</p>
                    </div>
                    
                    <div className="py-12 flex flex-col items-center">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[16px] border-gray-50 dark:border-gray-700" />
                            <div className="absolute inset-0 rounded-full border-[16px] border-purple-500 border-t-transparent border-l-transparent rotate-[45deg]" />
                            <div className="text-center">
                                <p className="text-6xl font-black text-slate-900 dark:text-white">68</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Moderate Risk</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-gray-700">
                        <RiskMetric label="Health" value="82%" color="text-emerald-500" />
                        <RiskMetric label="Safety" value="95%" color="text-purple-500" />
                        <RiskMetric label="Market" value="45%" color="text-amber-500" />
                    </div>
                </Card>

                {/* Active Alerts */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3 ml-2">
                        <FaExclamationCircle className="text-red-500" /> Active Risk Matrix
                    </h3>
                    {risks.map(risk => (
                        <Card key={risk.id} className="rounded-3xl border-none shadow-xl bg-white dark:bg-gray-800 p-8 flex gap-6 hover:shadow-2xl transition-all border-r-8 border-transparent hover:border-purple-500">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                risk.type === 'Climatic' ? 'bg-blue-50 text-blue-600' :
                                risk.type === 'Biological' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                                {risk.type === 'Climatic' ? <FaCloudRain /> : 
                                 risk.type === 'Biological' ? <FaBiohazard /> : <FaHandHoldingUsd />}
                            </div>
                            <div className="flex-grow space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{risk.type} Volatility</h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        risk.severity === 'High' ? 'bg-red-100 text-red-600' :
                                        risk.severity === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {risk.severity} Severity
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{risk.description}</p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Trend: {risk.trend}</span>
                                    <Button variant="ghost" className="text-purple-600 text-[10px] font-black uppercase tracking-widest h-auto p-0 hover:bg-transparent">Generate Brief</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RiskMetric({ label, value, color }) {
    return (
        <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
        </div>
    );
}
