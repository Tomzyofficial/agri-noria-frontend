"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaDatabase, FaChartBar, FaDownload, FaTerminal, FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/Button";

export default function DataExplorerPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Data <span className="text-purple-600">Explorer</span></h1>
                    <p className="text-gray-500 font-medium">Deep-query the ecosystem data lake for historical insights.</p>
                </div>
                <Button className="bg-slate-900 text-white rounded-2xl font-black px-8 py-6 shadow-xl flex items-center gap-2">
                    <FaDownload /> Export Dataset
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Query Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-gray-800 p-8">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-gray-700 pb-4 flex items-center gap-2">
                            <FaTerminal className="text-purple-600" /> Query Filters
                        </h3>
                        
                        <div className="space-y-6">
                            <FilterSelect label="Time Range" options={["Last 30 Days", "Current Cycle", "Historical"]} />
                            <FilterSelect label="Cluster" options={["All Clusters", "Kaduna North", "Kano Central"]} />
                            <FilterSelect label="Data Type" options={["Soil Moisture", "NDVI", "Yield History"]} />
                            
                            <Button className="w-full bg-purple-600 text-white font-black py-4 rounded-xl mt-4 shadow-lg shadow-purple-100">
                                Run Query
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-lg bg-gray-950 p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <FaTerminal className="text-emerald-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Log</p>
                        </div>
                        <div className="font-mono text-[10px] space-y-2 opacity-80">
                            <p className="text-emerald-500 underline">CONNECTED: AG-DATA-LAKE-01</p>
                            <p>SELECT * FROM satellite_imagery</p>
                            <p>WHERE cluster_id = 'KDN_02'</p>
                            <p className="animate-pulse">_FETCHING_CHUNKS...</p>
                        </div>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-3 space-y-8">
                    <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-gray-900 p-12 min-h-[500px] flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-3xl text-purple-600 mb-8 animate-bounce">
                            <FaChartBar />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter max-w-sm">Insight Visualization Engine</h3>
                        <p className="text-gray-400 mt-4 max-w-md font-medium">
                            Select filters to generate multispectral trends and comparative yield analysis. 
                            Aggregated data from 12,400+ sensors available.
                        </p>
                        <div className="flex gap-4 mt-10">
                            <Button variant="outline" className="rounded-xl font-bold px-8 py-5 border-gray-100">Preview Data</Button>
                            <Button className="bg-purple-600 text-white rounded-xl font-bold px-8 py-5">Generate Chart</Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-gray-800 p-8 flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-2xl text-blue-600">
                                <FaDatabase />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Indexed Records</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">1.2M +</p>
                            </div>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-gray-800 p-8 flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl text-emerald-600">
                                <FaSearch />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Data Sync</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 text-emerald-500">99.8%</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterSelect({ label, options }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
            <select className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 px-4 font-bold text-sm outline-none focus:ring-2 ring-purple-500/20">
                {options.map(o => <option key={o}>{o}</option>)}
            </select>
        </div>
    );
}
