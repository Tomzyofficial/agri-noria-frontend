"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaTruckMoving, FaRoute, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

export default function ShipmentsPage() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const res = await fetch("/api/proxy/pipeline/logistics/all");
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Non-OK response:", text);
                    throw new Error(`Server returned ${res.status}`);
                }
                const data = await res.json();
                if (data.success) setShipments(data.data || []);
            } catch (error) {
                console.error("Failed to fetch shipments", error);
                toast.error("Failed to load shipment data");
            } finally {
                setLoading(false);
            }
        };
        fetchShipments();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/proxy/pipeline/logistics/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                toast.success(`Shipment marked as ${status}`);
                setShipments(prev => prev.map(s => s.id === id ? { ...s, status } : s));
            }
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active <span className="text-blue-600">Shipments</span></h1>
                    <p className="text-gray-500 font-medium text-sm">Track real-time logistics and delivery fulfillment.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Transit</p>
                    <p className="text-xl font-black text-blue-600">{shipments.filter(s => s.status === 'in_transit').length}</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse font-black text-gray-300">Synchronizing Logistics Data...</div>
            ) : shipments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shipments.map((shipment) => (
                        <Card key={shipment.id} className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden group hover:scale-[1.01] transition-all">
                            <CardContent className="p-0">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-4 rounded-2xl ${shipment.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} transition-colors`}>
                                                <FaTruckMoving size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white">Shipment #{shipment.id.substring(0, 8)}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${shipment.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {shipment.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="rounded-xl text-gray-400"><FaRoute /></Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FaMapMarkerAlt /> Origin</p>
                                            <p className="font-bold text-sm">{shipment.warehouse_name || 'Central Hub'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FaRoute /> Destination</p>
                                            <p className="font-bold text-sm truncate">{shipment.buyer_destination || 'Assigned Buyer'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                            <FaCalendarAlt /> {new Date(shipment.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="font-black text-slate-900 dark:text-white">
                                            {shipment.weight_tons} <span className="text-[10px] text-gray-400 uppercase">Tons</span>
                                        </div>
                                    </div>
                                </div>

                                {shipment.status !== 'delivered' && (
                                    <div className="grid grid-cols-2 border-t border-gray-50 dark:border-gray-800">
                                        <button 
                                            onClick={() => updateStatus(shipment.id, 'in_transit')}
                                            className="py-4 font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors border-r border-gray-50 dark:border-gray-800"
                                        >
                                            Set In Transit
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(shipment.id, 'delivered')}
                                            className="py-4 font-black text-[10px] uppercase tracking-widest text-green-600 hover:bg-green-50 transition-colors"
                                        >
                                            Mark Delivered
                                        </button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-800 p-20 text-center">
                    <FaRoute className="text-6xl text-gray-100 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-300">No shipments found</h3>
                    <p className="text-gray-400 mt-2">Active logistics will appear here once orders are assigned.</p>
                </Card>
            )}
        </div>
    );
}
