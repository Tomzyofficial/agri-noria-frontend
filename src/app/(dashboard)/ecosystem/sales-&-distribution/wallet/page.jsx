"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function SalesWalletPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await fetch("/api/proxy/aggregator/my-wallet"); // Reusing aggregator wallet logic if compatible or similar
                const data = await res.json();
                if (data.success) {
                    setWallet(data.data);
                    setTransactions(data.data.transactions || []);
                }
            } catch (error) {
                console.error("Failed to fetch wallet", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales <span className="text-emerald-600">Wallet</span></h1>
                    <p className="text-gray-500 font-medium">Manage your commissions, payouts, and operational funds.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-emerald-600 text-white rounded-2xl font-bold px-8 shadow-xl shadow-emerald-500/20">Withdraw</Button>
                    <Button variant="outline" className="border-gray-200 rounded-2xl font-bold px-8">Top Up</Button>
                </div>
            </div>

            <Card className="rounded-[3rem] border-none shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <FaWallet size={200} />
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-black uppercase tracking-widest opacity-80">Available Balance</p>
                    <h2 className="text-6xl font-black mt-4 tracking-tighter">₦{parseFloat(wallet?.balance || 0).toLocaleString()}</h2>
                    
                    <div className="mt-12 flex gap-12 border-t border-white/10 pt-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Payout</p>
                            <p className="text-xl font-bold mt-1">₦{parseFloat(wallet?.locked_balance || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Earned</p>
                            <p className="text-xl font-bold mt-1">₦1,250,000</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FaHistory className="text-gray-400" />
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Transaction History</h3>
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Fetching secure transaction ledger...</div>
                ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map((tx, i) => (
                            <Card key={i} className="rounded-3xl border-none shadow-sm bg-white p-6 hover:shadow-md transition-all">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {tx.type === 'credit' ? <FaArrowUp /> : <FaArrowDown />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{tx.description}</p>
                                            <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₦{parseFloat(tx.amount).toLocaleString()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-16 text-center">
                        <FaExchangeAlt className="text-4xl text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold italic">Your transaction ledger is currently empty.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
