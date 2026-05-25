"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaShieldAlt, FaMapMarkerAlt, FaUserEdit, FaFilter, FaSearch, FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";

export default function FieldAuditsPage() {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                // Simulate fetching field verification data
                const res = await fetch("/api/proxy/pipeline/stats/intelligence");
                const data = await res.json();
                
                if (data.success && data.data.clusters && data.data.clusters.length > 0) {
                    const liveAudits = data.data.clusters.map((c, idx) => ({
                        id: `AUD-${920 + idx}`,
                        cluster: c.name,
                        region: c.region,
                        agent: c.supervisor_fname ? `${c.supervisor_fname} ${c.supervisor_lname}` : 'Unassigned',
                        type: ["Planting Audit", "Harvest Audit", "Input Verification"][idx % 3],
                        date: new Date(c.created_at || Date.now()).toISOString().split('T')[0],
                        status: c.status === 'active' ? 'Verified' : 'Pending'
                    }));
                    setAudits(liveAudits);
                } else {
                    setAudits([]);
                }
            } catch (error) {
                toast.error("Failed to fetch audit logs");
            } finally {
                setLoading(false);
            }
        };
        fetchAudits();
    }, []);

    return (
        <div className="space-y-8 max-w-7xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Field <span className="text-purple-600">Audits</span></h1>
                    <p className="text-gray-500 font-medium">Independent verification and field operation integrity monitoring.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-2xl border-2 border-gray-100 font-bold px-6 py-6 flex items-center gap-2">
                        <FaFilter /> Filters
                    </Button>
                    <Button className="bg-slate-900 text-white rounded-2xl font-black px-8 py-6 shadow-xl hover:scale-[1.02] transition-transform">
                        Schedule Audit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatBox label="Total Audits" value={audits.length} icon={<FaHistory />} color="text-slate-400" />
                <StatBox label="Verified" value={audits.filter(a => a.status === 'Verified').length} icon={<FaShieldAlt />} color="text-emerald-500" />
                <StatBox label="Pending" value={audits.filter(a => a.status === 'Pending').length} icon={<FaHistory />} color="text-amber-500" />
                <StatBox label="Disputed" value={audits.filter(a => a.status === 'Flagged').length} icon={<FaShieldAlt />} color="text-red-500" />
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
                <div className="p-10 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <FaShieldAlt className="text-purple-600" /> System Audit Ledger
                    </h3>
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                            type="text" 
                            placeholder="Search by Audit ID or Cluster..." 
                            className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 ring-purple-500/20 font-bold text-sm outline-none"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-gray-800/30 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-6 text-left">Audit ID</th>
                                <th className="px-10 py-6 text-left">Target Cluster</th>
                                <th className="px-10 py-6 text-left">Cluster Manager</th>
                                <th className="px-10 py-6 text-left">Audit Type</th>
                                <th className="px-10 py-6 text-left">Verification Date</th>
                                <th className="px-10 py-6 text-left">Status</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {audits.map((audit) => (
                                <tr key={audit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 dark:text-white tracking-tight">{audit.id}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
                                                <FaMapMarkerAlt size={12} />
                                            </div>
                                            <span className="font-bold text-sm text-slate-700 dark:text-gray-300">{audit.cluster}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                                                <FaUserEdit size={12} />
                                            </div>
                                            <span className="font-bold text-sm text-slate-700 dark:text-gray-300">{audit.agent}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                                            {audit.type}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-gray-500">{audit.date}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${audit.status === 'Verified' ? 'bg-emerald-500' : audit.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${audit.status === 'Verified' ? 'text-emerald-500' : audit.status === 'Pending' ? 'text-amber-500' : 'text-red-500'}`}>
                                                {audit.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <Button variant="ghost" className="text-purple-600 font-black text-xs uppercase tracking-widest hover:bg-purple-50 rounded-xl">
                                            View Report
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function StatBox({ label, value, icon, color }) {
    return (
        <Card className="rounded-3xl border-none shadow-lg bg-white dark:bg-gray-800 p-8 flex justify-between items-center group hover:scale-[1.05] transition-transform">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tighter">{value}</p>
            </div>
            <div className={`text-2xl ${color} opacity-20 group-hover:opacity-100 transition-opacity`}>
                {icon}
            </div>
        </Card>
    );
}
