"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaMoneyBillWave, FaCheckCircle, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

export default function FinancingEscrowPage() {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/proxy/aggregator/agreements");
                if (res.ok) {
                    const data = await res.json();
                    setAgreements(data?.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleReleaseEscrow = async (agreementId) => {
        if (!confirm("Confirm delivery and release funds to stakeholders?")) return;
        try {
            const res = await fetch("/api/proxy/aggregator/release-escrow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agreement_id: agreementId })
            });
            if (res.ok) {
                toast.success("Funds released successfully!");
                window.location.reload();
            } else {
                toast.error("Failed to release funds");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading escrow data...</div>;

    const escrowAgreements = agreements.filter(a => ['sent', 'signed', 'approved', 'stamped', 'paid'].includes(a.status));
    const completedAgreements = agreements.filter(a => ['completed', 'fulfilled'].includes(a.status));

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-black tracking-tight">Financing & Escrow</h1>
                <p className="text-gray-500 mt-1">Monitor locked funds and manage the final settlement of procurement contracts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
                        <CardTitle className="flex items-center gap-2">
                            <FaClock className="text-amber-500" /> Active Escrow Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {escrowAgreements.length === 0 ? (
                                <p className="p-8 text-center text-gray-500 italic">No active escrows currently held.</p>
                            ) : escrowAgreements.map(ag => (
                                <div key={ag.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div>
                                        <p className="font-bold text-lg">{ag.buyer_name}</p>
                                        <p className="text-sm text-gray-500 font-medium">₦{parseFloat(ag.financing_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            ag.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {ag.status === 'paid' ? 'Secured in Escrow' : ag.status}
                                        </span>
                                        {ag.status === 'paid' && (
                                            <Button 
                                                onClick={() => handleReleaseEscrow(ag.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
                                            >
                                                Release Funds
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 p-6">
                        <CardTitle className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" /> Completed Settlements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {completedAgreements.length === 0 ? (
                                <p className="p-8 text-center text-gray-500 italic">No completed payouts recorded.</p>
                            ) : completedAgreements.map(ag => (
                                <div key={ag.id} className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-lg">{ag.buyer_name}</p>
                                        <p className="text-sm text-gray-500 italic">Funds released to stakeholders</p>
                                    </div>
                                    <span className="text-green-600 font-black text-lg">₦{parseFloat(ag.financing_amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
