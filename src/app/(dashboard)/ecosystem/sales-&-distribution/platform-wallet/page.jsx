"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaCoins, FaShieldAlt, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

export default function PlatformWalletPage() {
    const [balance, setBalance] = useState(0);
    const [escrow, setEscrow] = useState(0);

    useEffect(() => {
        // Fetch platform-wide totals (Aggregator Escrows etc)
        const fetchPlatformStats = async () => {
            try {
                const res = await fetch("/api/proxy/pipeline/stats/platform-wallet");
                const data = await res.json();
                if (data.success) {
                    setBalance(data.data.balance || 0);
                    setEscrow(data.data.held_in_escrow || 0);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPlatformStats();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Platform <span className="text-emerald-500">Wallet</span></h1>
                <p className="text-gray-500 font-medium">Monitoring the ecosystem's liquidity and secured escrow reserves.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-900 p-12 text-white overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                        <FaCoins size={150} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Total Ecosystem Liquidity</p>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter">₦{parseFloat(balance).toLocaleString()}</h2>
                        <div className="mt-12 flex items-center gap-2 text-emerald-400 font-bold">
                            <FaChartLine /> +4.2% Growth Trend
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-12 overflow-hidden border-t-8 border-emerald-500">
                    <div className="flex items-center gap-3 mb-6">
                        <FaShieldAlt className="text-emerald-500" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Total Secured Escrow</p>
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter text-slate-900">₦{parseFloat(escrow).toLocaleString()}</h2>
                    <p className="mt-12 text-gray-500 font-medium leading-relaxed">
                        These funds are securely held across all active procurement and input financing agreements.
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Verified Agreements", value: "154", icon: <FaCheckCircle className="text-emerald-500" /> },
                    { label: "Active Escrows", value: "82", icon: <FaShieldAlt className="text-blue-500" /> },
                    { label: "Settlement Rate", value: "100%", icon: <FaCoins className="text-amber-500" /> },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-8 flex items-center gap-4">
                        <div className="text-2xl">{stat.icon}</div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
