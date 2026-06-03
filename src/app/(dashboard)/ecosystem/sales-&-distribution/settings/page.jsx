"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaUserCircle, FaBell, FaShieldAlt, FaMapMarkedAlt, FaSave, FaTruck, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "Agrinoria Logistics",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await verifyVendorSession();
                if (data && data.authenticated) {
                    setProfile({
                        firstName: data.fname || "",
                        lastName: data.lname || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        companyName: data.company_name || "Agrinoria Logistics",
                    });
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/proxy/vendor/update-basic-info", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fname: profile.firstName,
                    lname: profile.lastName,
                    phone: profile.phone,
                }),
            });
            if (res.ok) {
                toast.success("Profile saved securely to the backend!");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to update profile.");
            }
        } catch (err) {
            toast.error("Network error while saving profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse font-black text-gray-400">Loading Profile Data...</div>;
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">System <span className="text-blue-600">Settings</span></h1>
                <p className="text-gray-500 font-medium">Configure your distribution preferences and profile information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <SettingNav icon={<FaUserCircle />} label="Profile Info" active />
                    {/* <SettingNav icon={<FaBell />} label="Notifications" /> */}
                    {/* <SettingNav icon={<FaShieldAlt />} label="Security" /> */}
                    {/* <SettingNav icon={<FaTruck />} label="Logistics Preferences" /> */}
                </div>

                <div className="md:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-gray-900 p-10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">Profile Information</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all"
                                        value={profile.firstName}
                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all"
                                        value={profile.lastName}
                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    className="w-full bg-gray-100 dark:bg-gray-800/50 border-none rounded-2xl p-4 font-bold text-slate-400 dark:text-slate-500 outline-none cursor-not-allowed transition-all"
                                    value={profile.email}
                                    title="Email cannot be changed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company / Distributor Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all"
                                    value={profile.companyName}
                                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-transform border-none disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                {saving ? "Saving Updates..." : "Save Profile Updates"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-blue-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FaShieldAlt size={100} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2">Operational Integrity</h3>
                            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
                                Your account is currently verified for Ecosystem Distribution. Maintain a high fulfillment rate to unlock premium logistics tiers.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SettingNav({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all ${active ? 'bg-white dark:bg-gray-900 shadow-lg text-blue-600 font-black' : 'text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </div>
    );
}

