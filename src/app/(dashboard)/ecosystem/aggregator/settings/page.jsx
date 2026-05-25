"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "react-toastify";

export default function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/proxy/aggregator/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data?.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            company_name: formData.get("company_name"),
            registration_details: formData.get("registration_details"),
            company_logo_url: formData.get("company_logo_url"),
        };
        try {
            const res = await fetch("/api/proxy/aggregator/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toast.success("Profile updated successfully!");
            } else {
                toast.error("Failed to update profile");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your company profile, logo, and registration credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm bg-white dark:bg-gray-900 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700 dark:text-gray-300">Company Name</Label>
                                <Input name="company_name" defaultValue={profile?.company_name} className="rounded-xl border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700 dark:text-gray-300">Company Logo URL</Label>
                                <Input name="company_logo_url" defaultValue={profile?.company_logo_url} className="rounded-xl border-gray-200" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-gray-700 dark:text-gray-300">Registration Details (CAC/Tax ID)</Label>
                            <textarea 
                                name="registration_details"
                                defaultValue={profile?.registration_details}
                                className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 dark:bg-gray-800 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm"
                            />
                        </div>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-transform active:scale-95">
                            Save Profile Changes
                        </Button>
                    </form>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-sm bg-gray-50 dark:bg-gray-800 p-6">
                        <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Aggregator Identity</h3>
                        <div className="space-y-5 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                <span className="text-gray-500 font-medium">Unique ID</span>
                                <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-100">{profile?.vendor_id?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                <span className="text-gray-500 font-medium">Verification Status</span>
                                <span className="text-green-600 font-black uppercase text-[10px] tracking-widest bg-green-50 px-2 py-1 rounded-full">Fully Verified</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Joined Date</span>
                                <span className="text-gray-900 dark:text-white font-bold">{new Date(profile?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
