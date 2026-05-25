"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaTruck, FaMapMarkerAlt, FaUser, FaCheckCircle, FaBox, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributionsPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/proxy/pipeline/distributor/orders");
            const data = await res.json();
            if (data.success) setOrders(data.data || []);
        } catch (error) {
            console.error("Failed to fetch distributor orders", error);
            toast.error("Failed to load assigned distributions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsDelivered = async (orderId) => {
        try {
            const res = await fetch("/api/proxy/pipeline/distributor/mark-delivered", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Order marked as delivered");
                fetchOrders(); // Refresh
            }
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const groupedOrders = orders.reduce((acc, order) => {
        const status = order.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(order);
        return acc;
    }, {});

    return (
        <div className="space-y-10 max-w-7xl mx-auto py-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">Ecosystem <span className="text-blue-600">Distributions</span></h1>
                <p className="text-gray-500 font-medium">Manage and fulfill product deliveries assigned to your fleet.</p>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse font-black text-gray-300 italic">Synchronizing Fleet Assignments...</div>
            ) : orders.length > 0 ? (
                <div className="space-y-12">
                    {Object.entries(groupedOrders).map(([status, items]) => (
                        <div key={status} className="space-y-6">
                            <div className="flex items-center gap-3 ml-4">
                                <div className={`w-2 h-2 rounded-full ${status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{status.replace('_', ' ')} Tasks</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {items.map((order) => (
                                    <Card key={order.id} className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-2xl transition-all">
                                        <CardContent className="p-0">
                                            <div className="p-10 flex flex-col lg:flex-row gap-10">
                                                <div className="flex-1 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                                                <FaTruck size={24} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Order #{order.id.substring(0, 8)}</h3>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.buyer_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><FaCalendarAlt className="inline mr-1" /> Assigned</p>
                                                            <p className="font-bold text-sm dark:text-gray-300">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem]">
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                <FaUser /> Delivery Contact
                                                            </p>
                                                            <div className="space-y-1">
                                                                <p className="font-black text-lg text-slate-900 dark:text-white">{order.buyer_name}</p>
                                                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                                                    <FaMapMarkerAlt className="text-red-400" /> {order.delivery_address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                <FaBox /> Payload Details
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.items?.map((item, idx) => (
                                                                    <span key={idx} className="px-4 py-2 bg-white dark:bg-gray-700 rounded-xl text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-600">
                                                                        {item.quantity} x {item.product_name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:w-72 flex flex-col justify-center items-center gap-6 border-l border-gray-50 dark:border-gray-800 pl-10">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                                        <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    {order.status !== 'delivered' && (
                                                        <Button 
                                                            onClick={() => markAsDelivered(order.id)}
                                                            className="w-full bg-slate-900 text-white rounded-2xl py-8 font-black flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
                                                        >
                                                            <FaCheckCircle /> Mark Delivered
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[40px] border-none shadow-xl bg-white dark:bg-gray-800 p-20 text-center">
                    <FaTruck className="text-7xl text-gray-100 mx-auto mb-8" />
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Active Distributions</h3>
                    <p className="text-gray-400 mt-4 max-w-md mx-auto font-medium leading-relaxed">
                        You currently have no assigned deliveries. Distributions will appear here once the finance team assigns ecosystem orders to your fleet.
                    </p>
                </Card>
            )}
        </div>
    );
}
