"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { FaMoneyBillWave, FaChartLine } from "react-icons/fa";

export default function MarketplaceDataPage() {
    const [marketplaceData, setMarketplaceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/proxy/aggregator/marketplace-data");
                if (res.ok) {
                    const data = await res.json();
                    setMarketplaceData(data?.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading market data...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <FaChartLine className="text-green-600" /> Marketplace Intelligence
                </h1>
                <p className="text-gray-500 mt-1">Real-time commodity prices and regional market trends to inform aggregation strategies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketplaceData.map((m) => (
                    <Card key={m.id} className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl ${m.trend === 'up' ? 'bg-green-50 text-green-600' : m.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                                <FaMoneyBillWave size={24} />
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${m.trend === 'up' ? 'bg-green-100 text-green-700' : m.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                                {m.trend === 'up' ? '▲ Upward' : m.trend === 'down' ? '▼ Downward' : '● Stable'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{m.commodity}</h3>
                        <p className="text-3xl font-black mt-2 tracking-tighter">₦{parseFloat(m.current_price).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-bold">per {m.unit} • {m.region} Region</p>
                    </Card>
                ))}
            </div>

            <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Commodity</th>
                                <th className="px-6 py-5">Current Price</th>
                                <th className="px-6 py-5">Previous Price</th>
                                <th className="px-6 py-5">Performance</th>
                                <th className="px-6 py-5">Market Location</th>
                                <th className="px-6 py-5">Last Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {marketplaceData.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white">{m.commodity}</td>
                                    <td className="px-6 py-5 font-black text-green-600">₦{parseFloat(m.current_price).toLocaleString()} / {m.unit}</td>
                                    <td className="px-6 py-5 text-gray-400 font-medium">₦{parseFloat(m.previous_price || 0).toLocaleString()}</td>
                                    <td className="px-6 py-5">
                                        <span className={`text-xs font-black uppercase ${m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                                            {m.trend}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-gray-600 dark:text-gray-400">{m.region}</td>
                                    <td className="px-6 py-5 text-xs text-gray-400 font-bold">{new Date(m.updated_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
