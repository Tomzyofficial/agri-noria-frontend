"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
    FaUsers, 
    FaHandshake, 
    FaWallet, 
    FaChartLine,
    FaBoxOpen
} from "react-icons/fa";
import { useState, useEffect } from "react";

export default function AggregatorDashboard() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [agreements, setAgreements] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [inputRequests, setInputRequests] = useState([]);
    const [marketplaceData, setMarketplaceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, agreementsRes, walletRes, inputsRes, marketRes] = await Promise.all([
                    fetch("/api/proxy/aggregator/profile"),
                    fetch("/api/proxy/aggregator/agreements"),
                    fetch("/api/proxy/pipeline/wallet?type=aggregator"),
                    fetch("/api/proxy/inputs/my-requests"),
                    fetch("/api/proxy/aggregator/marketplace-data")
                ]);

                if (profileRes.ok) setProfile((await profileRes.json()).data);
                if (agreementsRes.ok) setAgreements((await agreementsRes.json()).data || []);
                
                const clustersRes = await fetch("/api/proxy/pipeline/clusters");
                if (clustersRes.ok) setClusters((await clustersRes.json()).data || []);

                if (walletRes.ok) setWallet((await walletRes.json()).data?.wallet);
                if (inputsRes?.ok) setInputRequests((await inputsRes.json()).data || []);
                if (marketRes?.ok) setMarketplaceData((await marketRes.json()).data || []);

            } catch (err) {
                console.error("Error fetching aggregator data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard overview...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        Welcome back, <span className="text-green-600">{profile?.company_name || 'Aggregator'}</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
                        System Online • Cluster Health: Optimal
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => window.location.href='/dashboard/aggregator/buyers'} className="bg-gray-900 text-white hover:bg-black px-6 py-6 rounded-2xl font-bold transition-all hover:scale-105">
                        Manage Buyers
                    </Button>
                    <Button onClick={() => window.location.href='/dashboard/aggregator/clusters'} className="bg-green-600 text-white hover:bg-green-700 px-6 py-6 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-105">
                        View Clusters
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Farmer Clusters" 
                    value={clusters.length} 
                    icon={<FaUsers />} 
                    color="bg-blue-600" 
                    gradient="from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10" 
                />
                <StatCard 
                    title="Active Agreements" 
                    value={agreements.length} 
                    icon={<FaHandshake />} 
                    color="bg-emerald-600" 
                    gradient="from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10" 
                />
                <StatCard 
                    title="Wallet Balance" 
                    value={`₦${parseFloat(wallet?.balance || 0).toLocaleString()}`} 
                    icon={<FaWallet />} 
                    color="bg-amber-500" 
                    gradient="from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/10" 
                />
                <StatCard 
                    title="Input Requests" 
                    value={inputRequests.length} 
                    icon={<FaBoxOpen />} 
                    color="bg-purple-600" 
                    gradient="from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Agreements */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black">Recent Procurement</h3>
                        <Button variant="ghost" onClick={() => window.location.href='/dashboard/aggregator/buyers'} className="text-green-600 font-bold hover:bg-green-50">View All</Button>
                    </div>
                    <div className="space-y-4">
                        {agreements.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8">No recent procurement activities found.</p>
                        ) : agreements.slice(0, 5).map(ag => (
                            <div key={ag.id} className="group p-5 rounded-3xl border border-gray-50 dark:border-gray-800 hover:border-green-100 dark:hover:border-green-900 hover:bg-green-50/30 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl font-black text-xs text-gray-400 group-hover:bg-white transition-colors">
                                        {ag.product_details?.commodity?.slice(0, 2).toUpperCase() || "PR"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{ag.buyer_name}</p>
                                        <p className="text-xs text-gray-500">{ag.product_details?.commodity || "General"} Procurement</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 dark:text-white">₦{parseFloat(ag.financing_amount).toLocaleString()}</p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        ag.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {ag.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Market Quick Glance */}
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-gray-900 text-white p-8">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                        <FaChartLine className="text-green-500" /> Market Glance
                    </h3>
                    <div className="space-y-6">
                        {marketplaceData.slice(0, 4).map(m => (
                            <div key={m.id} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0">
                                <div>
                                    <p className="font-bold">{m.commodity}</p>
                                    <p className="text-xs text-gray-500">{m.region}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-green-400">₦{parseFloat(m.current_price).toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                        {m.trend === 'up' ? '▲ Up' : '▼ Down'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {marketplaceData.length === 0 && (
                            <p className="text-gray-500 italic text-center py-4">No live market data available.</p>
                        )}
                    </div>
                    <Button onClick={() => window.location.href='/dashboard/aggregator/marketplace'} className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all">
                        Full Market Data
                    </Button>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, gradient }) {
    return (
        <Card className={`rounded-[2rem] border-none shadow-sm bg-gradient-to-br ${gradient} p-8`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`${color} text-white p-4 rounded-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{value}</h3>
        </Card>
    );
}
