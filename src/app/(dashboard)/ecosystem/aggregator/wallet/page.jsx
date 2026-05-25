"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaWallet, FaArrowUp, FaArrowDown, FaHistory, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AggregatorWalletPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWallet = async () => {
        try {
            const res = await fetch("/api/proxy/aggregator/my-wallet");
            if (res.ok) {
                const data = await res.json();
                setWallet(data?.data?.wallet);
                setTransactions(data?.data?.transactions || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Loading wallet...</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Financial Wallet</h1>
                    <p className="text-gray-500 mt-1">Manage your commissions, earnings, and withdrawal history.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-gray-900 text-white hover:bg-black px-8 py-6 rounded-2xl font-bold flex items-center gap-2">
                        <FaArrowUp /> Withdraw
                    </Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700 px-8 py-6 rounded-2xl font-bold shadow-lg shadow-green-600/20 flex items-center gap-2">
                        <FaPlus /> Top Up
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-gradient-to-br from-green-600 to-green-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FaWallet size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-green-100 font-bold uppercase tracking-widest text-xs">Total Balance</p>
                        <h2 className="text-6xl font-black mt-6 tracking-tighter">
                            ₦{parseFloat(wallet?.balance || 0).toLocaleString()}
                        </h2>
                        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between">
                            <div>
                                <p className="text-green-200 text-[10px] uppercase font-black">Escrow (Locked)</p>
                                <p className="text-xl font-bold">₦0.00</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-200 text-[10px] uppercase font-black">Currency</p>
                                <p className="text-xl font-bold">NGN</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <FaHistory className="text-gray-400" /> Transaction History
                        </h3>
                        <Button variant="outline" size="sm" onClick={fetchWallet}>Refresh</Button>
                    </div>

                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-400 italic">No transactions recorded yet.</p>
                            </div>
                        ) : (
                            transactions.map(tx => (
                                <div key={tx.id} className="group p-6 rounded-3xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                            tx.transaction_type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {tx.transaction_type === 'credit' ? <FaArrowDown size={20} /> : <FaArrowUp size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{tx.description}</p>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{new Date(tx.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.transaction_type === 'credit' ? '+' : '-'} ₦{parseFloat(tx.amount).toLocaleString()}
                                        </p>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Completed</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
