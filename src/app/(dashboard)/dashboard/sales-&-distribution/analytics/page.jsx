"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaChartBar, FaChartLine, FaChartPie, FaDownload } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales <span className="text-indigo-600">Analytics</span></h1>
                    <p className="text-gray-500 font-medium">Real-time market insights and fulfillment performance.</p>
                </div>
                <Button className="bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2">
                    <FaDownload /> Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Sales</p>
                    <p className="text-2xl font-black mt-1">₦42.5M</p>
                    <p className="text-[10px] text-green-600 font-black mt-2">↑ 12% vs Last Month</p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Order Value</p>
                    <p className="text-2xl font-black mt-1">₦2.1M</p>
                    <p className="text-[10px] text-blue-600 font-black mt-2">Stable Trend</p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Success</p>
                    <p className="text-2xl font-black mt-1 text-emerald-600">99.2%</p>
                    <p className="text-[10px] text-gray-400 font-black mt-2">Across 124 Orders</p>
                </Card>
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Rate</p>
                    <p className="text-2xl font-black mt-1 text-red-400">0.4%</p>
                    <p className="text-[10px] text-gray-400 font-black mt-2">Industry Best-in-class</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 rounded-[3rem] border-none shadow-xl bg-white p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="p-8 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                        <FaChartLine size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Growth Trajectory</h3>
                    <p className="text-gray-400 mt-2 max-w-sm">Detailed sales volume charts will be rendered here once your distribution cycle matures.</p>
                </Card>
                <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="p-8 bg-emerald-50 text-emerald-600 rounded-full mb-6">
                        <FaChartPie size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Market Share</h3>
                    <p className="text-gray-400 mt-2">Distribution by commodity and region.</p>
                </Card>
            </div>
        </div>
    );
}
