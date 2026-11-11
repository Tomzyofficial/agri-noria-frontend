"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    FaCheckCircle,
    FaShieldAlt,
    FaFileContract,
    FaTruck,
    FaArrowRight,
    FaCopy,
    FaCheck,
    FaDownload,
    FaBuilding,
    FaUserCheck,
    FaLock,
    FaExternalLinkAlt,
    FaInfoCircle,
    FaReceipt
} from "react-icons/fa";
import { toast } from "react-toastify";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const agreementId = searchParams.get("agreement_id") || "";
    const tokenParam = searchParams.get("token") || "";
    const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

    const [loading, setLoading] = useState(true);
    const [agreement, setAgreement] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [copiedRef, setCopiedRef] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (reference) queryParams.set("reference", reference);
                if (agreementId) queryParams.set("agreement_id", agreementId);
                if (tokenParam) queryParams.set("token", tokenParam);

                const res = await fetch(`/api/proxy/aggregator/verify-payment?${queryParams.toString()}`);
                const d = await res.json();

                if (res.ok && d.data) {
                    setAgreement(d.data.agreement);
                    setTransaction(d.data.transaction);
                } else {
                    setErrorMsg(d.error || "Unable to retrieve payment verification details.");
                }
            } catch (err) {
                console.error("Payment verification error:", err);
                setErrorMsg("Network error connecting to escrow verification service.");
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [reference, agreementId, tokenParam]);

    const activeToken = tokenParam || agreement?.secure_token || agreement?.payment_token || "";
    const rawAmount = agreement?.financing_amount || (transaction?.amount ? transaction.amount / 100 : 0);
    const formattedAmount = Number(rawAmount || 0).toLocaleString("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    });

    const commodityDetails = typeof agreement?.product_details === "object" ? agreement.product_details : {};
    const commodityName = commodityDetails?.commodity || "Agricultural Commodity";
    const commodityQty = commodityDetails?.quantity ? `${commodityDetails.quantity} ${commodityDetails.unit || "Units"}` : "Spot Contract";

    const handleCopyRef = () => {
        const textToCopy = reference || agreement?.paystack_reference || `AGR-${agreement?.id?.substring(0, 8).toUpperCase()}`;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopiedRef(true);
        toast.success("Transaction Reference copied to clipboard!");
        setTimeout(() => setCopiedRef(false), 2500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20">
                            <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
                        </div>
                        <FaShieldAlt className="absolute inset-0 m-auto text-emerald-400 text-sm animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white">Verifying Escrow Settlement</h2>
                        <p className="text-slate-400 text-sm font-medium animate-pulse">
                            Communicating with Paystack & locking funds into platform trust vault...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 space-y-6">
                {/* Header Brand Badge */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20">
                            AN
                        </div>
                        <div>
                            <span className="text-sm font-black text-white tracking-wide">AGRI-NORIA</span>
                            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider">
                                Escrow Settlement
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <FaLock className="text-emerald-400 text-xs" />
                        <span>SSL 256-Bit Encrypted</span>
                    </div>
                </div>

                {/* Main Settlement Success Card */}
                <Card className="rounded-[2.5rem] bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 overflow-hidden text-slate-100">
                    {/* Top Status Banner */}
                    <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 text-center text-white relative">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl shadow-black/20">
                            <FaCheckCircle className="text-4xl text-white drop-shadow-md animate-bounce" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Escrow Deposit Confirmed
                        </h1>
                        <p className="text-emerald-100 text-sm mt-1 max-w-md mx-auto font-medium">
                            Your payment has been successfully placed into Agri-Noria Platform Escrow Trust.
                        </p>
                    </div>

                    <CardContent className="p-6 sm:p-8 space-y-6">
                        {/* Escrow Protection Guarantee Pill */}
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <FaShieldAlt className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                                        100% Escrow Protection Guaranteed
                                    </p>
                                    <p className="text-xs text-slate-300 font-medium">
                                        Funds remain safely held in trust until you confirm delivery of produce.
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Deposited</span>
                                <span className="text-lg sm:text-xl font-black text-emerald-400">{formattedAmount}</span>
                            </div>
                        </div>

                        {/* Transaction Receipt Breakdown Grid */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <FaReceipt className="text-emerald-400" /> Settlement Receipt Details
                            </h3>
                            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-3.5 text-xs">
                                {/* Transaction Reference */}
                                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                    <span className="text-slate-400 font-semibold">Payment Reference</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-200">
                                            {reference || agreement?.paystack_reference || "N/A"}
                                        </span>
                                        <button
                                            onClick={handleCopyRef}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                            title="Copy Reference"
                                        >
                                            {copiedRef ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>

                                {/* Agreement ID */}
                                {agreement?.id && (
                                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                        <span className="text-slate-400 font-semibold">Agreement Contract</span>
                                        <span className="font-mono font-bold text-emerald-400">
                                            AGR-{agreement.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {/* Commodity */}
                                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                    <span className="text-slate-400 font-semibold">Produce / Commodity</span>
                                    <span className="font-bold text-white capitalize">
                                        {commodityName} ({commodityQty})
                                    </span>
                                </div>

                                {/* Off-taker / Buyer */}
                                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                    <span className="text-slate-400 font-semibold">Off-Taker (Buyer)</span>
                                    <span className="font-bold text-slate-200">
                                        {agreement?.buyer_name || "Authorized Off-Taker"} {agreement?.company_name ? `(${agreement.company_name})` : ""}
                                    </span>
                                </div>

                                {/* Aggregator / Supplier */}
                                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                                    <span className="text-slate-400 font-semibold">Certified Aggregator</span>
                                    <span className="font-bold text-slate-200">
                                        {agreement?.aggregator_company || "Accredited Agro-Enterprise"}
                                    </span>
                                </div>

                                {/* Escrow Vault Status */}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-400 font-semibold">Escrow Vault Status</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-[11px] uppercase tracking-wide">
                                        <FaShieldAlt className="text-[10px]" /> Funds Held in Trust
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Escrow Process Visual Roadmap */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Next Steps in Escrow Fulfillment
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                                        <FaCheckCircle /> 1. Escrow Deposited
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                                        Settlement complete. Funds locked in Agri-Noria trust vault.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                                        <FaTruck /> 2. Produce Dispatch
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                        Aggregator packs and dispatches cargo with trackable waybill.
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                                    <div className="flex items-center gap-2 text-slate-400 font-black text-xs">
                                        <FaUserCheck /> 3. Verify & Release
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                        Buyer confirms receipt and quality to release funds to aggregator.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            {activeToken && (
                                <Link href={`/review-agreement/${activeToken}`} className="block">
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm">
                                        <FaTruck /> Track Produce & View Agreement <FaArrowRight size={12} />
                                    </Button>
                                </Link>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {activeToken && (
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(`/api/proxy/aggregator/agreement-pdf/${activeToken}`, "_blank")}
                                        className="w-full sm:flex-1 py-3 rounded-xl font-bold border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-200 cursor-pointer text-xs flex items-center justify-center gap-2"
                                    >
                                        <FaDownload size={12} /> Download Official Contract PDF
                                    </Button>
                                )}
                                <Link href="/ecosystem/aggregator" className="w-full sm:flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full py-3 rounded-xl font-bold border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 cursor-pointer text-xs flex items-center justify-center gap-2"
                                    >
                                        <FaBuilding size={12} /> Aggregator Hub
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Security Note */}
                <p className="text-center text-xs text-slate-400 font-medium">
                    Protected by Agri-Noria Escrow Protocol • Regulated Agricultural Smart Offtake Contracts
                </p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}
