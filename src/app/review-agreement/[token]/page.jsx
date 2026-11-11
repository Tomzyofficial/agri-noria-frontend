"use client";
import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    FaFileDownload,
    FaCheckCircle,
    FaBuilding,
    FaBoxOpen,
    FaInfoCircle,
    FaArrowRight,
    FaStamp,
    FaLock,
    FaCreditCard
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function ReviewAgreementPage({ params }) {
    const { token } = use(params);
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signed, setSigned] = useState(false);
    const [stamped, setStamped] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [confirmingDelivery, setConfirmingDelivery] = useState(false);
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [buyerRating, setBuyerRating] = useState(5);
    const [receiverName, setReceiverName] = useState("");

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const res = await fetch(`/api/proxy/aggregator/review-agreement/${token}`);
                const d = await res.json();
                if (res.ok) {
                    setAgreement(d.data);
                    if (["accepted", "stamped", "approved", "paid", "completed", "fulfilled"].includes(d.data.status)) {
                        setSigned(true);
                        setStamped(true);
                    } else if (d.data.status === "signed") {
                        setSigned(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching agreement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgreement();
    }, [token]);

    const handleVerifyAndStamp = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/proxy/aggregator/verify-stamp/${token}`, { method: 'POST' });
            const d = await res.json();
            if (res.ok) {
                setStamped(true);
                toast.success("Agreement Verified & Stamped!");
                setAgreement(d.data);
            } else {
                toast.error(d.error || "Verification failed");
            }
        } catch (err) {
            toast.error("Network error during verification");
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmDelivery = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/proxy/aggregator/confirm-delivery/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyer_rating: buyerRating,
                    inspection_notes: deliveryNotes,
                    received_by_name: receiverName || agreement.buyer_name || "Authorized Receiver"
                })
            });
            const d = await res.json();
            if (res.ok) {
                toast.success(d.message || "Produce delivery confirmed & escrow released!");
                setAgreement(d.data);
                setConfirmingDelivery(false);
            } else {
                toast.error(d.error || "Failed to confirm delivery");
            }
        } catch (err) {
            toast.error("Network error confirming delivery");
        } finally {
            setProcessing(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
            const callbackUrl = `${clientOrigin}/payment-success?agreement_id=${agreement?.id || ""}&token=${token}`;

            const res = await fetch(`/api/proxy/aggregator/initialize-payment/${token}`, { 
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    origin: clientOrigin,
                    callback_url: callbackUrl
                })
            });
            const d = await res.json();
            if (res.ok && d.data?.authorization_url) {
                window.location.href = d.data.authorization_url;
            } else {
                toast.error(d.error || "Payment initialization failed");
            }
        } catch (err) {
            toast.error("Network error during payment");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full shadow-lg"></div>
                <p className="text-gray-400 dark:text-gray-500 font-bold animate-pulse">Securing Agreement Details...</p>
            </div>
        </div>
    );

    if (!agreement) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-center p-4">
            <Card className="p-12 rounded-[2.5rem] shadow-2xl border-none max-w-md bg-white dark:bg-gray-900">
                <FaLock className="text-5xl text-red-400 mx-auto mb-6" />
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Access Denied</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">This agreement link is either invalid, expired, or has already been processed.</p>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-16 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-600/30">
                            <span className="text-white text-3xl font-black italic">A</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Agronoria</h1>
                            <p className="text-slate-400 dark:text-slate-500 font-bold tracking-widest text-xs uppercase">Official Procurement Channel</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaBuilding size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-sm">Contractor</h3>
                            </div>
                            <div className="space-y-4 text-left">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aggregator Name</p>
                                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{agreement.aggregator_fname} {agreement.aggregator_lname}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entity</p>
                                    <p className="font-bold text-slate-600 dark:text-slate-300">{agreement.aggregator_company || "Agronoria Verified Aggregator"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaBoxOpen size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-sm">Commodity Details</h3>
                            </div>
                            <div className="space-y-4 text-left">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Commodity</p>
                                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{agreement.product_details?.commodity}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quantity</p>
                                        <p className="font-bold text-slate-600 dark:text-slate-300">{agreement.product_details?.quantity} Units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unit Price</p>
                                        <p className="font-bold text-slate-600 dark:text-slate-300">₦{parseFloat(agreement.product_details?.price || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Escrow Value Assessment Card - Bypass Card component to avoid dark-theme overrides */}
                    <div className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-slate-900 to-black p-10 relative overflow-hidden text-white text-left">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <FaCreditCard size={150} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Escrow Value Assessment</p>
                            </div>
                            <p className="text-gray-400 font-medium">Total Procurement Value</p>
                            <h2 className="text-6xl font-black mt-2 tracking-tighter">₦{parseFloat(agreement.financing_amount).toLocaleString()}</h2>
                            <div className="mt-12 flex gap-10 border-t border-white/10 pt-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protection</p>
                                    <p className="text-sm font-bold flex items-center gap-2 mt-1">
                                        <FaCheckCircle className="text-green-500" /> Agronoria Escrow
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scenario</p>
                                    <p className="text-sm font-bold mt-1 uppercase">{agreement.is_pre_harvest ? 'Pre-Harvest Order' : 'Immediate Harvest'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8 text-left">
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <FaInfoCircle className="text-slate-300 dark:text-slate-600" /> Contract Terms
                        </h3>
                        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-4 scrollbar-thin">
                            {agreement.terms_and_conditions || "By proceeding, the buyer acknowledges and agrees to the procurement terms. Payments are securely held in Agronoria's escrow system and only released to the aggregator upon successful delivery and quality verification. All disputes are subject to platform mediation guidelines."}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Workflow */}
                <div className="lg:col-span-5">
                    <Card className="rounded-[3rem] border-none shadow-2xl bg-white dark:bg-gray-900 p-10 sticky top-10 border-t-[10px] border-green-600 text-left">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Approval Workflow</h3>
                        
                        <div className="space-y-10">
                            {/* Step 1 */}
                            <div className="flex gap-6 items-start group">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0 font-black text-slate-900 dark:text-slate-100 group-hover:bg-green-100 group-hover:text-green-600 dark:group-hover:bg-green-950 dark:group-hover:text-green-400 transition-colors">1</div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Review & Download</h4>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Carefully read the system-generated agreement.</p>
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold py-5 hover:border-green-600 hover:text-green-600 dark:hover:border-green-400 dark:hover:text-green-400 w-full flex gap-2"
                                        onClick={() => window.open(`/api/proxy/aggregator/agreement-pdf/${token}`)}
                                    >
                                        <FaFileDownload /> Get Official PDF
                                    </Button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6 items-start group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all ${signed ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-slate-100'}`}>
                                    {signed ? <FaCheckCircle /> : '2'}
                                </div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Digital Commitment</h4>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Digitally acknowledge receipt and terms.</p>
                                    <Button 
                                        onClick={() => { setSigned(true); toast.info("Document marked as signed locally."); }}
                                        disabled={signed}
                                        className={`mt-4 w-full py-5 rounded-xl font-bold transition-all ${signed ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-none opacity-100' : 'bg-slate-900 dark:bg-gray-800 text-white hover:bg-black dark:hover:bg-slate-700'}`}
                                    >
                                        {signed ? '✓ Terms Accepted' : 'Acknowledge Terms'}
                                    </Button>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6 items-start group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all ${stamped ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-slate-100'}`}>
                                    {stamped ? <FaCheckCircle /> : '3'}
                                </div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Final Verification</h4>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Apply your digital stamp of approval.</p>
                                    <Button 
                                        onClick={handleVerifyAndStamp}
                                        disabled={!signed || stamped || processing}
                                        className={`mt-4 w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 ${
                                            stamped 
                                                ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-none' 
                                                : !signed 
                                                    ? 'bg-slate-100 dark:bg-gray-800 text-slate-300 dark:text-slate-600' 
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-600/20'
                                        }`}
                                    >
                                        <FaStamp /> {processing ? 'Verifying...' : stamped ? 'Verification Complete' : 'Verify Agreement'}
                                    </Button>
                                </div>
                            </div>

                            {/* Final Action: Payment or Wait */}
                            {(signed && stamped) && (
                                <div className="pt-8 border-t border-slate-100 dark:border-gray-800 mt-4">
                                    {!agreement.is_pre_harvest ? (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase text-center tracking-widest animate-pulse">Payment Gateway Ready</p>
                                            <Button 
                                                onClick={handlePayment}
                                                disabled={processing}
                                                className="w-full bg-green-600 text-white py-6 rounded-2xl font-black text-lg shadow-2xl shadow-green-600/40 hover:bg-green-700 flex items-center justify-center gap-3 group border-none"
                                            >
                                                {processing ? 'Connecting Paystack...' : <>Proceed to Secure Payment <FaArrowRight className="group-hover:translate-x-2 transition-transform" /></>}
                                            </Button>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1 mt-4">
                                                <FaLock size={10} /> 256-bit SSL Secure Transaction
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-left">
                                            <div className="flex gap-4">
                                                <FaInfoCircle className="text-amber-500 shrink-0 mt-1" size={18} />
                                                <div>
                                                    <p className="font-black text-amber-900 dark:text-amber-400 text-sm">Pre-Harvest Commitment Secured</p>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Your approval has been logged. The payment link will be activated and sent to you once the harvest cycle is complete.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2-Way Delivery Tracking & Handover Acceptance */}
                            {["paid", "dispatched", "delivered", "completed"].includes(agreement.status) && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-800 text-left">
                                    {/* Stage A: Funds in Escrow, Awaiting Dispatch */}
                                    {agreement.status === "paid" && (
                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md">
                                                    <FaCheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 dark:text-white text-sm">Escrow Funded & Secured</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Funds of ₦{parseFloat(agreement.financing_amount || 0).toLocaleString()} are locked in platform escrow.</p>
                                                </div>
                                            </div>
                                            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                <FaTruck className="text-emerald-500 shrink-0" size={16} />
                                                <span>Awaiting supplier packaging & dispatch to your delivery hub.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stage B: Produce Dispatched & In-Transit */}
                                    {agreement.status === "dispatched" && (
                                        <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500/40 rounded-3xl space-y-5">
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white">
                                                    <FaTruck size={10} /> Produce In-Transit
                                                </span>
                                                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                                                    {agreement.product_details?.dispatch?.waybill_number || "Waybill Assigned"}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-xs">
                                                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                                                    Produce is on its way to your destination
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-300">
                                                    Carrier: <strong className="text-slate-900 dark:text-white">{agreement.product_details?.dispatch?.driver_name || "Logistics Driver"}</strong> 
                                                    {agreement.product_details?.dispatch?.driver_phone && <> ({agreement.product_details.dispatch.driver_phone})</>}
                                                </p>
                                                {agreement.product_details?.dispatch?.vehicle_plate && (
                                                    <p className="text-slate-500">Vehicle Plate: <strong>{agreement.product_details.dispatch.vehicle_plate}</strong></p>
                                                )}
                                                {agreement.product_details?.dispatch?.dispatch_notes && (
                                                    <p className="text-[11px] text-slate-500 italic mt-1">"{agreement.product_details.dispatch.dispatch_notes}"</p>
                                                )}
                                            </div>

                                            {/* Action to confirm receipt */}
                                            <div className="pt-2">
                                                <Button
                                                    onClick={() => setConfirmingDelivery(true)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                                                >
                                                    <FaCheckCircle /> Confirm Physical Receipt & Release Escrow
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stage C: Delivered & Confirmed (Escrow Released) */}
                                    {["delivered", "completed"].includes(agreement.status) && (
                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-3xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md">
                                                    <FaCheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-sm">2-Way Handover Verified</h4>
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Produce received and verified. Escrow payment released to supplier.</p>
                                                </div>
                                            </div>

                                            {agreement.product_details?.delivery_confirmation && (
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300 border border-emerald-100 dark:border-emerald-900/40">
                                                    <p>Received by: <strong>{agreement.product_details.delivery_confirmation.received_by_name || agreement.buyer_name}</strong></p>
                                                    <p>Quality Rating: <strong>{"★".repeat(agreement.product_details.delivery_confirmation.buyer_rating || 5)}</strong></p>
                                                    {agreement.product_details.delivery_confirmation.inspection_notes && (
                                                        <p className="italic text-[11px] text-slate-400">"{agreement.product_details.delivery_confirmation.inspection_notes}"</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Modal for Buyer Receipt Confirmation */}
                            {confirmingDelivery && (
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                                    <Card className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 space-y-6 text-left border border-slate-200 dark:border-slate-800 shadow-2xl">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                                    <FaCheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Confirm Produce Receipt</h3>
                                                    <p className="text-xs text-slate-500">2-Way Handover & Escrow Authorization</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setConfirmingDelivery(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                                        </div>

                                        <div className="space-y-4 text-xs">
                                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                                                <p className="font-bold">You are confirming delivery of:</p>
                                                <p className="text-sm font-black mt-1">
                                                    {agreement.product_details?.quantity} {agreement.product_details?.unit || "Units"} of {agreement.product_details?.commodity}
                                                </p>
                                                <p className="text-[11px] mt-1 text-emerald-700 dark:text-emerald-400">
                                                    Authorizes release of <strong>₦{parseFloat(agreement.financing_amount || 0).toLocaleString()}</strong> held in platform escrow to {agreement.aggregator_company || "the supplier"}.
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="font-bold text-slate-700 dark:text-slate-300">Received By (Your Full Name)</label>
                                                <input
                                                    type="text"
                                                    placeholder={agreement.buyer_name || "Enter receiver name"}
                                                    value={receiverName}
                                                    onChange={e => setReceiverName(e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="font-bold text-slate-700 dark:text-slate-300">Produce Quality Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setBuyerRating(star)}
                                                            className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
                                                                buyerRating >= star
                                                                    ? "bg-amber-500 text-slate-950 border-amber-400"
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                                                            }`}
                                                        >
                                                            ★ {star}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="font-bold text-slate-700 dark:text-slate-300">Inspection & Receipt Remarks</label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="e.g. Received at depot, verified quantity and moisture standard."
                                                    value={deliveryNotes}
                                                    onChange={e => setDeliveryNotes(e.target.value)}
                                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                onClick={handleConfirmDelivery}
                                                disabled={processing}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer"
                                            >
                                                {processing ? "Releasing Escrow..." : "Authorize Escrow Release"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setConfirmingDelivery(false)}
                                                className="px-5 py-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
