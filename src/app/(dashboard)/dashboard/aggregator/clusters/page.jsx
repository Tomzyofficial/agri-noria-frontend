"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FaPlus, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ClusterManagementPage() {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        region: "",
        gps_latitude: 0,
        gps_longitude: 0,
        program_id: null
    });

    const fetchData = async () => {
        try {
            const res = await fetch("/api/proxy/pipeline/clusters");
            if (res.ok) {
                const data = await res.json();
                setClusters(data?.data || []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/pipeline/clusters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Cluster created successfully!");
                setShowModal(false);
                fetchData();
            } else {
                const d = await res.json();
                toast.error(d.error || "Failed to create cluster");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !clusters.length) return <div className="p-8 text-center animate-pulse">Loading clusters...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Cluster Management</h1>
                    <p className="text-gray-500 mt-1">Organize farmers into geographical clusters for localized management.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
                    <FaPlus /> Create New Cluster
                </Button>
            </div>

            {clusters.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
                    <FaMapMarkerAlt className="text-5xl text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Clusters Defined</h3>
                    <p className="text-gray-500 mb-6">Clusters help in efficient input distribution and monitoring.</p>
                    <Button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white">Create First Cluster</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clusters.map(cluster => (
                        <Card key={cluster.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all bg-white dark:bg-gray-900">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl">
                                        <FaUsers className="text-2xl text-emerald-600" />
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                                        {cluster.status || "Active"}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{cluster.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{cluster.region}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-sm text-gray-400 font-medium">{cluster.farmer_count || 0} Farmers</span>
                                    <Button variant="ghost" size="sm" className="text-emerald-600 font-bold hover:bg-emerald-50">View Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md rounded-3xl shadow-2xl">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-black">Create Cluster</CardTitle>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Cluster Name</Label>
                                    <Input
                                        placeholder="e.g. North Maize Cluster A"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Input
                                        placeholder="e.g. Kaduna, Nigeria"
                                        required
                                        value={formData.region}
                                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Latitude</Label>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.gps_latitude}
                                            onChange={e => setFormData({ ...formData, gps_latitude: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Longitude</Label>
                                        <Input
                                            type="number"
                                            step="any"
                                            value={formData.gps_longitude}
                                            onChange={e => setFormData({ ...formData, gps_longitude: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold">
                                    {loading ? "Creating..." : "Create Cluster"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
