"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaBoxOpen, FaWarehouse, FaCubes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { toast } from "react-toastify";

export default function WarehousePage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({ totalStock: 0, capacity: 100, inFlow: 0, outFlow: 0 });

    const fetchInventory = async () => {
        try {
            const res = await fetch("/api/proxy/pipeline/warehouse/inventory");
            const data = await res.json();
            if (data.success) {
                const items = data.data || [];
                setInventory(items);
                
                // Calculate live stats
                let totalTons = 0;
                let inFlowToday = 0;
                const today = new Date().toISOString().split('T')[0];
                
                items.forEach(item => {
                    let qtyInTons = parseFloat(item.quantity) || 0;
                    if (item.measuring_scale === 'Kg') qtyInTons /= 1000;
                    if (item.measuring_scale === 'g') qtyInTons /= 1000000;
                    
                    totalTons += qtyInTons;
                    
                    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
                    if (itemDate === today) {
                        inFlowToday += qtyInTons;
                    }
                });
                
                const maxCapacity = 1000; // 1000 Tons max capacity
                const availableCapacity = Math.max(0, 100 - (totalTons / maxCapacity) * 100).toFixed(1);
                
                setStats({
                    totalStock: totalTons.toFixed(2),
                    capacity: availableCapacity,
                    inFlow: inFlowToday.toFixed(2),
                    outFlow: 0.0 // No outflow tracking yet for removed items
                });
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleRemove = async (id) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const res = await fetch(`/api/proxy/pipeline/warehouse/inventory/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Item removed from stock");
                fetchInventory();
            } else {
                toast.error("Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing item", error);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Warehouse <span className="text-amber-600">Inventory</span></h1>
                <p className="text-gray-500 font-medium">Monitor stock levels, quality grades, and commodity aggregation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stock</p>
                    <p className="text-2xl font-black mt-1">{stats.totalStock} <span className="text-xs text-gray-300">Tons</span></p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Capacity</p>
                    <p className="text-2xl font-black mt-1 text-green-600">{stats.capacity}%</p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In-Flow Today</p>
                    <p className="text-2xl font-black mt-1 text-blue-600 font-black">+{stats.inFlow} T</p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out-Flow Today</p>
                    <p className="text-2xl font-black mt-1 text-red-600 font-black">-{stats.outFlow} T</p>
                </Card>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-300 font-black italic">Synchronizing Inventory...</div>
            ) : inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {inventory.map((item, i) => (
                        <Card key={i} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <FaWarehouse size={20} />
                                    </div>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest">{item.grade || 'Export Grade'}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.commodity}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{item.warehouse_name || 'AgriNoria Hub A'}</p>
                                <p className="text-sm font-bold text-green-600 mt-2">₦{parseFloat(item.price_per_unit || 0).toLocaleString()}</p>
                                
                                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{item.quantity} <span className="text-xs">{item.measuring_scale}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <button 
                                            onClick={() => handleRemove(item.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 text-3xl">
                        <FaCubes />
                    </div>
                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Inventory Empty</h3>
                    <p className="text-gray-400 mt-2 max-w-xs mx-auto">Aggregation cycles have not yet reached the warehouse phase for the current harvest.</p>
                </div>
            )}
        </div>
    );
}
