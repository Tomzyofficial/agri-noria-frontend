"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FaRegFilePdf, FaFileAlt } from "react-icons/fa";

export default function DocumentsPage() {
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

    if (loading) return <div className="p-8 text-center animate-pulse">Loading documents...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-black tracking-tight">Document Center</h1>
                <p className="text-gray-500 mt-1">Access all generated agreements, signed contracts, and legal documentation.</p>
            </div>

            {agreements.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
                    <FaFileAlt className="text-5xl text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Documents Yet</h3>
                    <p className="text-gray-500">Agreements will appear here once you register buyers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agreements.map(ag => (
                        <Card 
                            key={ag.id} 
                            className="rounded-2xl hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group"
                            onClick={() => window.open(ag.agreement_pdf_url)}
                        >
                            <CardContent className="p-6 flex items-center gap-5">
                                <div className="bg-red-50 dark:bg-red-900/10 text-red-500 p-5 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaRegFilePdf size={28} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{ag.buyer_name} Agreement</h4>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(ag.created_at).toLocaleDateString()} · Procurement</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
