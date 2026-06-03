"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaChartBar, FaChartLine, FaChartPie, FaDownload, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [manualStats, setManualStats] = useState({
        returnRate: 0.4,
        growthTrajectory: "Projected 15% increase next quarter based on current sales volume.",
        marketShare: "45% Northern Region, 30% Western, 25% Eastern"
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/proxy/pipeline/buyer-orders/all");
                const data = await res.json();
                if (data.success) {
                    // Filter for active/completed orders
                    const validStatuses = ['ready_for_sales', 'paid', 'assigned', 'processing', 'processed', 'in_progress', 'delivered', 'completed'];
                    const validOrders = (data.data || []).filter(o => validStatuses.includes(o.status) || o.payment_status === "finance_confirmed");
                    setOrders(validOrders);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Formulas based on live activities
    const totalOrders = orders.length;
    const grossSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? grossSales / totalOrders : 0;

    const escrowOrders = orders.filter(order => order.escrow_status === "held" || order.escrow_status === "released").length;
    const escrowSuccessRate = totalOrders > 0 ? ((escrowOrders / totalOrders) * 100).toFixed(1) : 0;

    const formatCurrency = (value) => {
        if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `₦${(value / 1000).toFixed(1)}k`;
        return `₦${value.toLocaleString()}`;
    };

    const handleSaveManual = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // Note: Can be wired up to a DB endpoint later to persist these settings
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales <span className="text-indigo-600">Analytics</span></h1>
                    <p className="text-gray-500 font-medium">Real-time market insights and fulfillment performance.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => setIsEditing(true)} className="bg-white dark:bg-gray-800 text-slate-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl font-bold flex items-center gap-2 shadow-sm transition-all">
                        <FaEdit /> Edit Manual Inputs
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md transition-all border-none">
                        <FaDownload /> Export Report
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center font-black text-gray-300 italic animate-pulse">
                    Calculating Analytics...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Sales</p>
                            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{formatCurrency(grossSales)}</p>
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-black mt-2">Based on {totalOrders} total orders</p>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Order Value</p>
                            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{formatCurrency(avgOrderValue)}</p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black mt-2">Dynamic average</p>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Success</p>
                            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{escrowSuccessRate}%</p>
                            <p className="text-[10px] text-gray-400 font-black mt-2">Across {totalOrders} Orders</p>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Rate</p>
                            <p className="text-2xl font-black mt-1 text-red-500 dark:text-red-400">{manualStats.returnRate}%</p>
                            <p className="text-[10px] text-gray-400 font-black mt-2">Manual Input</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-900 p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-6">
                                <FaChartLine size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Growth Trajectory</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg font-medium">{manualStats.growthTrajectory}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black mt-6 uppercase tracking-widest border-t dark:border-gray-800 pt-4 w-full">Manual Analysis Update</p>
                        </Card>
                        <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-900 p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-6">
                                <FaChartPie size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Market Share</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">{manualStats.marketShare}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black mt-6 uppercase tracking-widest border-t dark:border-gray-800 pt-4 w-full">Manual Analysis Update</p>
                        </Card>
                    </div>
                </>
            )}

            {/* MANUAL INPUT MODAL */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 max-w-lg w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Edit Manual Analytics
                            </h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-black text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Update the subjective or externally tracked metrics for the analytics dashboard.
                        </p>

                        <form onSubmit={handleSaveManual} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Return Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={manualStats.returnRate}
                                    onChange={(e) =>
                                        setManualStats({ ...manualStats, returnRate: e.target.value })
                                    }
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Growth Trajectory Analysis
                                </label>
                                <textarea
                                    value={manualStats.growthTrajectory}
                                    onChange={(e) =>
                                        setManualStats({ ...manualStats, growthTrajectory: e.target.value })
                                    }
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white min-h-[100px]"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Market Share Distribution
                                </label>
                                <textarea
                                    value={manualStats.marketShare}
                                    onChange={(e) =>
                                        setManualStats({ ...manualStats, marketShare: e.target.value })
                                    }
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white min-h-[80px]"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
                                >
                                    Save Updates
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
