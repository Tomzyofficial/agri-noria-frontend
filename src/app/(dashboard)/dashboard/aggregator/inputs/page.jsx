"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaPlusCircle, FaBoxOpen } from "react-icons/fa";
import InputRequestModal from "@/app/components/dashboard/InputRequestModal";

export default function InterventionRequestsPage() {
    const [inputRequests, setInputRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInputModal, setShowInputModal] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/proxy/inputs/my-requests");
            if (res.ok) {
                const data = await res.json();
                setInputRequests(data?.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !inputRequests.length) return <div className="p-8 text-center animate-pulse">Loading input requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Intervention Requests</h1>
                    <p className="text-gray-500 mt-1">Request and track bulk agricultural inputs for your clusters.</p>
                </div>
                <Button 
                    onClick={() => setShowInputModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    <FaPlusCircle /> New Input Request
                </Button>
            </div>

            <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Request ID</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {inputRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No input requests found.</td>
                                </tr>
                            ) : (
                                inputRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{req.id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(req.input_items || []).map((it, idx) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-bold uppercase">
                                                        {typeof it === 'object' && it !== null ? `${it.name || 'Item'} (${it.quantity || 1} ${it.unit || 'pcs'})` : it}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-900 dark:text-white">₦{parseFloat(req.total_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                                                req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <InputRequestModal 
                isOpen={showInputModal} 
                onClose={() => {
                    setShowInputModal(false);
                    fetchData();
                }}
            />
        </div>
    );
}
