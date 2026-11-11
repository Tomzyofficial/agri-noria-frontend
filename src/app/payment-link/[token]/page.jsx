"use client";
import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    FaCreditCard,
    FaLock,
    FaShieldAlt,
    FaCheckCircle,
    FaFileContract,
    FaBuilding,
    FaBoxOpen,
    FaMapMarkerAlt,
    FaCopy,
    FaCheck,
    FaExternalLinkAlt,
    FaInfoCircle,
    FaClock,
    FaArrowRight
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function PaymentLinkPage({ params }) {
    const { token } = use(params);
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const res = await fetch(`/api/proxy/aggregator/review-agreement/${token}`);
                const d = await res.json();
                if (res.ok) {
                    setAgreement(d.data);
                }
            } catch (err) {
                console.error("Error fetching agreement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgreement();
    }, [token]);

    const handleCopyRef = () => {
        if (!agreement) return;
        const refId = `AGR-${agreement.id?.substring(0, 8).toUpperCase()}`;
        navigator.clipboard.writeText(refId);
        setCopiedRef(true);
        toast.success("Reference ID copied!");
        setTimeout(() => setCopiedRef(false), 2500);
    };

    const handlePayment = async () => {
        if (!agreement) return;

        // If pre-harvest and not yet signed/accepted
        const validSignedStatuses = ["signed", "approved", "accepted", "stamped"];
        if (agreement.is_pre_harvest && !validSignedStatuses.includes(agreement.status)) {
            toast.warning("Agreement must be digitally reviewed & signed before payment can be initialized.");
            return;
        }

        setIsProcessing(true);
        try {
            const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
            const callbackUrl = `${clientOrigin}/payment-success?agreement_id=${agreement.id}&token=${token}`;

            const res = await fetch(`/api/proxy/aggregator/initialize-payment/${token}`, {
                method: "POST",
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
                toast.error(d.error || "Failed to initialize payment gateway. Please verify agreement signing status.");
            }
        } catch (err) {
            toast.error("Network error connecting to payment gateway");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                        <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-wide animate-pulse">
                        Securing Escrow Settlement Details...
                    </p>
                </div>
            </div>
        );
    }

    if (!agreement) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
                <Card className="p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 bg-slate-900 max-w-md w-full text-white">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-5">
                        <FaLock className="text-3xl" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Payment Link Invalid or Expired</h1>
                    <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                        This procurement agreement link could not be located. It may have expired, or the payment has already been settled into escrow.
                    </p>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl cursor-pointer"
                    >
                        Return to Platform
                    </Button>
                </Card>
            </div>
        );
    }

    const commodity = agreement.product_details?.commodity || "Agricultural Produce";
    const quantity = agreement.product_details?.quantity || 0;
    const unit = agreement.product_details?.unit || "Units";
    const unitPrice = parseFloat(agreement.product_details?.price || 0);
    const totalAmount = parseFloat(agreement.financing_amount || 0);
    const refCode = `AGR-${agreement.id?.substring(0, 8).toUpperCase()}`;

    const validSignedStatuses = ["signed", "approved", "accepted", "stamped"];
    const isSigned = validSignedStatuses.includes(agreement.status);
    const isPreHarvestPending = agreement.is_pre_harvest && !isSigned;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
            {/* Top Brand Bar */}
            <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
                        🌱
                    </div>
                    <div>
                        <h2 className="text-base font-black tracking-tight text-white uppercase">AGRI-NORIA</h2>
                        <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Escrow Settlement Gateway</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-black text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>256-bit SSL Protected</span>
                </div>
            </div>

            {/* Main Escrow Checkout Card */}
            <div className="max-w-2xl mx-auto w-full my-6">
                <Card className="rounded-[2.5rem] border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
                    {/* Top Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-4 pointer-events-none">
                            <FaShieldAlt size={180} />
                        </div>
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-black/25 text-white border border-white/20">
                                    {agreement.is_pre_harvest ? "Pre-Harvest Forward Escrow" : "Spot Harvest Escrow"}
                                </span>
                                <button
                                    onClick={handleCopyRef}
                                    className="text-xs font-mono bg-black/30 hover:bg-black/50 px-3 py-1 rounded-lg text-emerald-200 flex items-center gap-1.5 transition cursor-pointer border border-white/10"
                                >
                                    <span>#{refCode}</span>
                                    {copiedRef ? <FaCheck size={11} className="text-white" /> : <FaCopy size={11} />}
                                </button>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Procurement Escrow Deposit
                            </h1>
                            <p className="text-xs text-emerald-100 max-w-md font-medium leading-relaxed">
                                Funds are held safely in Agri-Noria platform escrow and disbursed to the aggregator only upon successful physical delivery and quality certification.
                            </p>
                        </div>
                    </div>

                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Amount Callout */}
                        <div className="rounded-2xl p-6 bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-baseline justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Settlement Amount</p>
                                <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-1">
                                    ₦{totalAmount.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <FaShieldAlt size={12} /> 100% Escrow Protection
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1">Regulated agricultural escrow trust</p>
                            </div>
                        </div>

                        {/* Pre-harvest warning if not yet signed */}
                        {isPreHarvestPending && (
                            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
                                <FaClock className="shrink-0 text-amber-400 mt-0.5 text-base" />
                                <div className="space-y-2">
                                    <p className="font-black text-amber-200">Phase 1 Signature Pending</p>
                                    <p className="text-amber-300/90 leading-relaxed">
                                        This pre-harvest agreement must be digitally reviewed and acknowledged before payment can proceed.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => window.location.href = `/review-agreement/${agreement.secure_token}`}
                                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl py-2 px-4 cursor-pointer"
                                    >
                                        Review & Sign Agreement First <FaArrowRight className="ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Deal Parameters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Off-taker / Buyer</p>
                                <p className="text-sm font-bold text-white">{agreement.buyer_name || "Valued Buyer"}</p>
                                <p className="text-[11px] text-slate-400">{agreement.buyer_company || agreement.company_name || "Enterprise Offtaker"}</p>
                                {agreement.buyer_email && (
                                    <p className="text-[11px] text-slate-500 truncate">{agreement.buyer_email}</p>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Certified Supplier</p>
                                <p className="text-sm font-bold text-white">
                                    {agreement.aggregator_company || (agreement.aggregator_fname ? `${agreement.aggregator_fname} ${agreement.aggregator_lname || ''}` : "Agri-Noria Aggregator")}
                                </p>
                                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <FaCheckCircle size={10} /> Platform Accredited
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1 sm:col-span-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Commodity Produce Terms</p>
                                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                        ₦{unitPrice.toLocaleString()} / {unit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-base font-black text-white uppercase">{commodity}</span>
                                    <span className="font-bold text-slate-300">{quantity} {unit} Total</span>
                                </div>
                                {agreement.buyer_address && (
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800 mt-2">
                                        <FaMapMarkerAlt className="text-slate-500 shrink-0" />
                                        <span className="truncate">Delivery Hub: {agreement.buyer_address}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 3-Step Escrow Process */}
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                How Escrow Protection Works
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Step 1</span>
                                    <p className="font-bold text-white text-xs mt-1.5">Deposit Funds</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Payment is held in segregated trust account.</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Step 2</span>
                                    <p className="font-bold text-white text-xs mt-1.5">Produce Dispatch</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Aggregator delivers verified harvest to destination.</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                    <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Step 3</span>
                                    <p className="font-bold text-white text-xs mt-1.5">Verify & Release</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Funds released only after buyer confirms receipt.</p>
                                </div>
                            </div>
                        </div>

                        {/* Primary Payment Button */}
                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing || isPreHarvestPending}
                                className={`w-full py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 cursor-pointer ${
                                    isPreHarvestPending
                                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                        : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-xl shadow-emerald-500/25 hover:scale-[1.01]"
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                                        <span>Connecting to Paystack Secure Checkout...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaLock />
                                        <span>Pay ₦{totalAmount.toLocaleString()} via Paystack</span>
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 pt-1">
                                <button
                                    onClick={() => window.open(`/api/proxy/aggregator/agreement-pdf/${agreement.secure_token}`, "_blank")}
                                    className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                                >
                                    <FaFileContract /> View PDF Contract
                                </button>
                                <span>•</span>
                                <button
                                    onClick={() => window.location.href = `/review-agreement/${agreement.secure_token}`}
                                    className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                                >
                                    <FaExternalLinkAlt size={10} /> Full Legal Terms
                                </button>
                            </div>
                        </div>

                        {/* Paystack Trust & Security Badges (Replaced broken image) */}
                        <div className="border-t border-slate-800 pt-5 text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Secured & Powered By</span>
                                {/* Clean Paystack SVG Logo */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-black text-xs">
                                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2 4h20v4H2V4zm0 6h20v4H2v-4zm0 6h20v4H2v-4z" />
                                    </svg>
                                    <span>paystack</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                                Supports Bank Cards (Mastercard, Visa, Verve), Direct Bank Transfer, and USSD. Your payment information is encrypted and never stored on our servers.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="max-w-2xl mx-auto w-full text-center text-[11px] text-slate-600 font-medium">
                © {new Date().getFullYear()} Agri-Noria Ecosystem Limited. All rights reserved.
            </div>
        </div>
    );
}
