"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FaUsers, FaPlus, FaRegFilePdf, FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

export default function BuyerManagementPage() {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingBuyer, setIsCreatingBuyer] = useState(false);
    const [buyerFormData, setBuyerFormData] = useState({
        buyer_info: {
            buyer_name: "",
            buyer_email: "",
            buyer_phone: "",
            company_name: "",
            address: ""
        },
        product_details: {
            commodity: "",
            quantity: "",
            price: "",
            location: ""
        },
        financing_amount: "",
        is_pre_harvest: true,
        terms_and_conditions: "Standard platform terms apply."
    });

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBuyer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/aggregator/buyer-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buyerFormData)
            });
            if (res.ok) {
                toast.success("Buyer registration successful!");
                setIsCreatingBuyer(false);
                fetchData();
            } else {
                const d = await res.json();
                toast.error(d.error || "Failed to create buyer");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !agreements.length) return <div className="p-8 text-center animate-pulse">Loading buyers...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Buyer Management</h1>
                    <p className="text-gray-500 mt-1">Register buyers and manage procurement agreements.</p>
                </div>
                <Button onClick={() => setIsCreatingBuyer(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2">
                    <FaPlus /> New Buyer Registration
                </Button>
            </div>

            {agreements.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 text-center">
                    <FaUsers className="text-5xl text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Buyers Yet</h3>
                    <p className="text-gray-500 mb-6">Start by registering a buyer to generate an agreement.</p>
                    <Button onClick={() => setIsCreatingBuyer(true)} className="bg-blue-600 text-white">Register First Buyer</Button>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Post-Harvest / Ready Section */}
                    <section>
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <span className="h-2 w-8 bg-green-500 rounded-full"></span>
                            Immediate Procurement (Harvest Ready)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agreements.filter(a => !a.is_pre_harvest).map(ag => (
                                <Card key={ag.id} className="rounded-2xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden group">
                                    <div className="bg-green-500 h-1.5 w-full"></div>
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-black text-xl flex items-center gap-2">
                                                    {ag.buyer_name}
                                                    {['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(ag.status) && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                                            <FaCheckCircle size={10} /> Verified
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{ag.product_details.commodity}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Post-Harvest</span>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl mb-6 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Financing</span>
                                                <span className="font-black">₦{parseFloat(ag.financing_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Aggregator</span>
                                                <span className="font-bold text-green-600">You</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                className="w-full bg-gray-900 text-white hover:bg-black py-6 rounded-2xl font-bold flex items-center justify-center gap-2"
                                                onClick={() => {
                                                    const combinedLink = `${window.location.origin}/review-agreement/${ag.secure_token}?init_payment=true`;
                                                    navigator.clipboard.writeText(combinedLink);
                                                    toast.success("Combined Approval & Payment link copied!");
                                                }}
                                            >
                                                <FaExternalLinkAlt size={14} /> Copy Full Link
                                            </Button>
                                            <Button variant="ghost" className="w-full text-xs font-bold text-gray-400" onClick={() => window.open(ag.agreement_pdf_url)}>
                                                <FaRegFilePdf /> View Signed PDF
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {agreements.filter(a => !a.is_pre_harvest).length === 0 && (
                                <p className="text-gray-400 italic text-sm p-4">No post-harvest agreements found.</p>
                            )}
                        </div>
                    </section>

                    {/* Pre-Harvest Section */}
                    <section>
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <span className="h-2 w-8 bg-amber-500 rounded-full"></span>
                            Deferred Procurement (Pre-Harvest)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {agreements.filter(a => a.is_pre_harvest).map(ag => (
                                <div key={ag.id} className="space-y-4">
                                    <div className="flex items-center gap-3 px-4">
                                        <h3 className="font-black text-lg flex items-center gap-2">
                                            {ag.buyer_name}
                                            {['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(ag.status) && (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                                    <FaCheckCircle size={10} /> Verified
                                                </span>
                                            )}
                                        </h3>
                                        <span className="h-1 flex-1 bg-gray-100 rounded-full"></span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{ag.product_details.commodity}</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Card 1: Approval */}
                                        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden border-l-4 border-amber-500">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">PHASE 1</span>
                                                    <span className="text-xs font-bold text-gray-400">Approval & Commitment</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-6">Send this to the buyer for initial agreement signing before harvest.</p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl font-bold py-5"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/review-agreement/${ag.secure_token}`);
                                                        toast.success("Phase 1 Approval link copied!");
                                                    }}
                                                >
                                                    Copy Approval Link
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Card 2: Payment */}
                                        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden border-l-4 border-blue-500 opacity-80 hover:opacity-100 transition-opacity">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">PHASE 2</span>
                                                    <span className="text-xs font-bold text-gray-400">Post-Harvest Payment</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-6">Send this ONLY after harvest is ready for final payment (Paystack).</p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-bold py-5"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/payment-link/${ag.payment_token}`);
                                                        toast.success("Phase 2 Payment link copied!");
                                                    }}
                                                >
                                                    Copy Payment Link
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                            {agreements.filter(a => a.is_pre_harvest).length === 0 && (
                                <p className="text-gray-400 italic text-sm p-4">No pre-harvest agreements found.</p>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {isCreatingBuyer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
                        <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-2xl font-black">Buyer Registration</CardTitle>
                            <button onClick={() => setIsCreatingBuyer(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleCreateBuyer} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Buyer Name</Label>
                                        <Input
                                            required
                                            value={buyerFormData.buyer_info.buyer_name}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, buyer_info: { ...buyerFormData.buyer_info, buyer_name: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Buyer Email</Label>
                                        <Input
                                            type="email"
                                            required
                                            value={buyerFormData.buyer_info.buyer_email}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, buyer_info: { ...buyerFormData.buyer_info, buyer_email: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company Name</Label>
                                        <Input
                                            value={buyerFormData.buyer_info.company_name}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, buyer_info: { ...buyerFormData.buyer_info, company_name: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Commodity</Label>
                                        <Input
                                            required
                                            value={buyerFormData.product_details.commodity}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, product_details: { ...buyerFormData.product_details, commodity: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            required
                                            placeholder="e.g. 50"
                                            value={buyerFormData.product_details.quantity}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, product_details: { ...buyerFormData.product_details, quantity: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit Price (₦)</Label>
                                        <Input
                                            type="number"
                                            required
                                            placeholder="e.g. 500"
                                            value={buyerFormData.product_details.price}
                                            onChange={e => setBuyerFormData({ ...buyerFormData, product_details: { ...buyerFormData.product_details, price: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label>Total Value (Auto)</Label>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-black text-green-600">
                                            ₦{(parseFloat(buyerFormData.product_details.quantity || 0) * parseFloat(buyerFormData.product_details.price || 0)).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Procurement Scenario</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setBuyerFormData({ ...buyerFormData, is_pre_harvest: true })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${buyerFormData.is_pre_harvest ? 'border-amber-500 bg-amber-50' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <p className="font-black text-amber-700">Pre-Harvest</p>
                                                <p className="text-[10px] text-amber-600">Approval first, payment later.</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setBuyerFormData({ ...buyerFormData, is_pre_harvest: false })}
                                                className={`p-4 rounded-2xl border-2 transition-all text-left ${!buyerFormData.is_pre_harvest ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <p className="font-black text-green-700">Post-Harvest</p>
                                                <p className="text-[10px] text-green-600">Immediate approval & payment.</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg">
                                    {loading ? "Processing..." : "Generate Agreement"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
