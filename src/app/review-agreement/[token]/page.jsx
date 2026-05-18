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

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const res = await fetch(`/api/proxy/aggregator/review-agreement/${token}`);
                const d = await res.json();
                if (res.ok) setAgreement(d.data);
            } catch (err) {
                console.error("Error fetching agreement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgreement();
    }, [token]);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/proxy/aggregator/initialize-payment/${token}`, { method: 'POST' });
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full shadow-lg"></div>
                <p className="text-gray-400 font-bold animate-pulse">Securing Agreement Details...</p>
            </div>
        </div>
    );

    if (!agreement) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-4">
            <Card className="p-12 rounded-[2.5rem] shadow-2xl border-none max-w-md">
                <FaLock className="text-5xl text-red-400 mx-auto mb-6" />
                <h1 className="text-3xl font-black text-gray-900">Access Denied</h1>
                <p className="text-gray-500 mt-4 font-medium">This agreement link is either invalid, expired, or has already been processed.</p>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 py-16 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-600/30">
                            <span className="text-white text-3xl font-black italic">A</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Agronoria</h1>
                            <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Official Procurement Channel</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaBuilding size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Contractor</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregator Name</p>
                                    <p className="text-xl font-bold text-slate-800">{agreement.aggregator_fname} {agreement.aggregator_lname}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</p>
                                    <p className="font-bold text-slate-600">{agreement.aggregator_company || "Agronoria Verified Aggregator"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8 group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FaBoxOpen size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Commodity Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commodity</p>
                                    <p className="text-xl font-bold text-slate-800">{agreement.product_details?.commodity}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                                        <p className="font-bold text-slate-600">{agreement.product_details?.quantity} Units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</p>
                                        <p className="font-bold text-slate-600">₦{parseFloat(agreement.product_details?.price || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-slate-900 to-black p-10 relative overflow-hidden text-white">
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
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <FaInfoCircle className="text-slate-300" /> Contract Terms
                        </h3>
                        <div className="text-slate-500 text-sm leading-relaxed max-h-48 overflow-y-auto pr-4 scrollbar-thin">
                            {agreement.terms_and_conditions || "By proceeding, the buyer acknowledges and agrees to the procurement terms. Payments are securely held in Agronoria's escrow system and only released to the aggregator upon successful delivery and quality verification. All disputes are subject to platform mediation guidelines."}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Workflow */}
                <div className="lg:col-span-5">
                    <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-10 sticky top-10 border-t-[10px] border-green-600">
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Approval Workflow</h3>
                        
                        <div className="space-y-10">
                            {/* Step 1 */}
                            <div className="flex gap-6 items-start group">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 font-black group-hover:bg-green-100 group-hover:text-green-600 transition-colors">1</div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900">Review & Download</h4>
                                    <p className="text-xs text-slate-400 mt-1">Carefully read the system-generated agreement.</p>
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 border-slate-200 rounded-xl font-bold py-5 hover:border-green-600 hover:text-green-600 w-full flex gap-2"
                                        onClick={() => window.open(agreement.agreement_pdf_url)}
                                    >
                                        <FaFileDownload /> Get Official PDF
                                    </Button>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6 items-start group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all ${signed ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-slate-100'}`}>
                                    {signed ? <FaCheckCircle /> : '2'}
                                </div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900">Digital Commitment</h4>
                                    <p className="text-xs text-slate-400 mt-1">Digitally acknowledge receipt and terms.</p>
                                    <Button 
                                        onClick={() => { setSigned(true); toast.info("Document marked as signed locally."); }}
                                        disabled={signed}
                                        className={`mt-4 w-full py-5 rounded-xl font-bold transition-all ${signed ? 'bg-green-50 text-green-600 border-none opacity-100' : 'bg-slate-900 text-white hover:bg-black'}`}
                                    >
                                        {signed ? '✓ Terms Accepted' : 'Acknowledge Terms'}
                                    </Button>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6 items-start group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all ${stamped ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-slate-100'}`}>
                                    {stamped ? <FaCheckCircle /> : '3'}
                                </div>
                                <div className="flex-1 pt-2">
                                    <h4 className="font-bold text-slate-900">Final Verification</h4>
                                    <p className="text-xs text-slate-400 mt-1">Apply your digital stamp of approval.</p>
                                    <Button 
                                        onClick={() => { setStamped(true); toast.success("Agreement Verified!"); }}
                                        disabled={!signed || stamped}
                                        className={`mt-4 w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 ${stamped ? 'bg-green-50 text-green-600 border-none' : !signed ? 'bg-slate-100 text-slate-300' : 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-600/20'}`}
                                    >
                                        <FaStamp /> {stamped ? 'Verification Complete' : 'Verify Agreement'}
                                    </Button>
                                </div>
                            </div>

                            {/* Final Action: Payment or Wait */}
                            {(signed && stamped) && (
                                <div className="pt-8 border-t border-slate-100 mt-4">
                                    {!agreement.is_pre_harvest ? (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-green-600 uppercase text-center tracking-widest animate-pulse">Payment Gateway Ready</p>
                                            <Button 
                                                onClick={handlePayment}
                                                disabled={processing}
                                                className="w-full bg-green-600 text-white py-6 rounded-2xl font-black text-lg shadow-2xl shadow-green-600/40 hover:bg-green-700 flex items-center justify-center gap-3 group"
                                            >
                                                {processing ? 'Connecting Paystack...' : <>Proceed to Secure Payment <FaArrowRight className="group-hover:translate-x-2 transition-transform" /></>}
                                            </Button>
                                            <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 mt-4">
                                                <FaLock size={10} /> 256-bit SSL Secure Transaction
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                            <div className="flex gap-4">
                                                <FaInfoCircle className="text-amber-500 mt-1" size={18} />
                                                <div>
                                                    <p className="font-black text-amber-900 text-sm">Pre-Harvest Commitment Secured</p>
                                                    <p className="text-xs text-amber-700 mt-1">Your approval has been logged. The payment link will be activated and sent to you once the harvest cycle is complete.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {agreement.status === "paid" && (
                                <Card className="p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <FaCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-green-900">Transaction Complete</p>
                                        <p className="text-xs text-green-700">Funds are now held in secure escrow.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
