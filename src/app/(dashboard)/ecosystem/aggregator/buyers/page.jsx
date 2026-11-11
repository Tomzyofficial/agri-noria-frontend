"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    FaUsers,
    FaPlus,
    FaRegFilePdf,
    FaExternalLinkAlt,
    FaCheckCircle,
    FaClock,
    FaSearch,
    FaCopy,
    FaCheck,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaSeedling,
    FaBoxes,
    FaHandshake,
    FaFileContract,
    FaArrowRight,
    FaInfoCircle,
    FaCalendarAlt,
    FaFilter,
    FaPaperPlane,
    FaTruck,
    FaStar
} from "react-icons/fa";
import { toast } from "react-toastify";

const COMMODITY_PRESETS = [
    { name: "Tomatoes", defaultUnit: "Crates", defaultPrice: 500 },
    { name: "Paddy Rice", defaultUnit: "MT", defaultPrice: 450000 },
    { name: "White Maize", defaultUnit: "MT", defaultPrice: 380000 },
    { name: "Soybeans", defaultUnit: "MT", defaultPrice: 520000 },
    { name: "Cassava Tubers", defaultUnit: "MT", defaultPrice: 120000 },
    { name: "Sorghum", defaultUnit: "MT", defaultPrice: 340000 },
    { name: "Wheat", defaultUnit: "MT", defaultPrice: 480000 },
    { name: "Cocoa", defaultUnit: "MT", defaultPrice: 2800000 },
    { name: "Palm Oil", defaultUnit: "Bags (50kg)", defaultPrice: 35000 },
    { name: "Chili Peppers", defaultUnit: "Bags (50kg)", defaultPrice: 42000 }
];

const UNIT_OPTIONS = [
    "MT (Metric Tonnes)",
    "Bags (50kg)",
    "Bags (100kg)",
    "Crates",
    "Kg",
    "Baskets"
];

export default function BuyerManagementPage() {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingBuyer, setIsCreatingBuyer] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedToken, setCopiedToken] = useState(null);
    const [selectedAgreementDetails, setSelectedAgreementDetails] = useState(null);
    const [createdAgreementSuccess, setCreatedAgreementSuccess] = useState(null);
    const [dispatchingAgreement, setDispatchingAgreement] = useState(null);
    const [dispatchForm, setDispatchForm] = useState({
        waybill_number: "",
        driver_name: "",
        driver_phone: "",
        vehicle_plate: "",
        dispatch_notes: ""
    });
    const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

    const [buyerFormData, setBuyerFormData] = useState({
        buyer_info: {
            buyer_name: "",
            buyer_email: "",
            buyer_phone: "",
            company_name: "",
            address: ""
        },
        product_details: {
            commodity: "Tomatoes",
            quantity: "40",
            unit: "Crates",
            price: "500",
            location: "",
            fulfillment_date: "",
            specifications: "Grade A quality, clean packaging, certified moisture standard"
        },
        financing_amount: "",
        is_pre_harvest: true,
        terms_and_conditions: "Standard Agri-Noria platform escrow terms apply. Produce will be verified at receiving hub prior to final disbursement."
    });

    const fetchData = async () => {
        try {
            const res = await fetch("/api/proxy/aggregator/agreements");
            if (res.ok) {
                const data = await res.json();
                setAgreements(data?.data || []);
            }
        } catch (err) {
            console.error("Error fetching aggregator agreements:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const copyToClipboard = (text, tokenId) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedToken(tokenId);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopiedToken(null), 3000);
    };

    const handleDispatchProduce = async (e) => {
        e.preventDefault();
        if (!dispatchingAgreement) return;
        setIsSubmittingDispatch(true);
        try {
            const res = await fetch(`/api/proxy/aggregator/dispatch-produce/${dispatchingAgreement.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dispatchForm)
            });
            const d = await res.json();
            if (res.ok) {
                toast.success(d.message || "Produce marked as dispatched and in-transit!");
                setDispatchingAgreement(null);
                setDispatchForm({
                    waybill_number: "",
                    driver_name: "",
                    driver_phone: "",
                    vehicle_plate: "",
                    dispatch_notes: ""
                });
                fetchData();
            } else {
                toast.error(d.error || "Failed to dispatch produce");
            }
        } catch (err) {
            toast.error("Network error during produce dispatch");
        } finally {
            setIsSubmittingDispatch(false);
        }
    };

    const handleCreateBuyer = async (e) => {
        e.preventDefault();
        setLoading(true);

        const qty = parseFloat(buyerFormData.product_details.quantity || 0);
        const unitPrice = parseFloat(buyerFormData.product_details.price || 0);
        const totalCalculated = qty * unitPrice;

        const payload = {
            ...buyerFormData,
            financing_amount: totalCalculated,
            buyer_name: buyerFormData.buyer_info.buyer_name,
            buyer_email: buyerFormData.buyer_info.buyer_email,
            buyer_phone: buyerFormData.buyer_info.buyer_phone,
            company_name: buyerFormData.buyer_info.company_name,
            address: buyerFormData.buyer_info.address,
            commodity: buyerFormData.product_details.commodity,
            quantity: buyerFormData.product_details.quantity,
            unit_price: buyerFormData.product_details.price,
            product_details: {
                ...buyerFormData.product_details,
                price: buyerFormData.product_details.price,
                quantity: buyerFormData.product_details.quantity
            }
        };

        try {
            const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
            const res = await fetch("/api/proxy/aggregator/buyer-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    origin: clientOrigin
                })
            });
            const d = await res.json();
            if (res.ok) {
                toast.success("Procurement agreement generated successfully!");
                setIsCreatingBuyer(false);
                const safeSuccess = {
                    ...d.data,
                    acceptance_link: d.data?.secure_token ? `${clientOrigin}/review-agreement/${d.data.secure_token}` : d.data?.acceptance_link,
                    payment_link: d.data?.payment_token ? `${clientOrigin}/payment-link/${d.data.payment_token}` : d.data?.payment_link
                };
                setCreatedAgreementSuccess(safeSuccess);
                fetchData();
            } else {
                toast.error(d.error || "Failed to create buyer agreement");
            }
        } catch (err) {
            toast.error("Network error creating agreement");
        } finally {
            setLoading(false);
        }
    };

    // Metrics calculations
    const metrics = useMemo(() => {
        const total = agreements.length;
        const totalValue = agreements.reduce((acc, a) => acc + (parseFloat(a.financing_amount) || 0), 0);
        const preHarvestCount = agreements.filter(a => a.is_pre_harvest).length;
        const postHarvestCount = agreements.filter(a => !a.is_pre_harvest).length;
        const verifiedCount = agreements.filter(a => ['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(a.status)).length;

        return {
            total,
            totalValue,
            preHarvestCount,
            postHarvestCount,
            verifiedCount
        };
    }, [agreements]);

    // Filtered agreements
    const filteredAgreements = useMemo(() => {
        return agreements.filter(ag => {
            const matchesSearch =
                (ag.buyer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ag.buyer_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ag.buyer_company || ag.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ag.product_details?.commodity || "").toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === "pre_harvest") return ag.is_pre_harvest;
            if (activeTab === "post_harvest") return !ag.is_pre_harvest;
            if (activeTab === "in_transit") return ag.status === 'dispatched';
            if (activeTab === "delivered") return ['delivered', 'completed'].includes(ag.status);
            if (activeTab === "pending") return !['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(ag.status);
            if (activeTab === "verified") return ['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(ag.status);

            return true;
        });
    }, [agreements, searchQuery, activeTab]);

    const selectCommodityPreset = (preset) => {
        setBuyerFormData(prev => ({
            ...prev,
            product_details: {
                ...prev.product_details,
                commodity: preset.name,
                unit: preset.defaultUnit,
                price: preset.defaultPrice.toString()
            }
        }));
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16 px-2 sm:px-4">
            {/* Header & Primary CTA */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-2xl border border-emerald-900/40">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Aggregator Offtake Console
                            </span>
                            <span className="text-xs text-slate-400 font-bold">• Guaranteed Platform Escrow</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            Buyer Procurement & Offtake Agreements
                        </h1>
                        <p className="text-slate-300 text-sm max-w-2xl font-medium">
                            Structure forward purchase commitments with off-takers, manage pre-harvest and spot contracts, and track escrow settlements in real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={() => setIsCreatingBuyer(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
                        >
                            <FaPlus /> New Offtake Deal
                        </Button>
                    </div>
                </div>

                {/* 4 Live Summary Metric Cards */}
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-6">
                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Offtake Deals</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-white/15 rounded-lg animate-pulse my-1" />
                        ) : (
                            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{metrics.total}</p>
                        )}
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">Institutional & Spot</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Pipeline Escrow</p>
                        {loading ? (
                            <div className="h-8 w-28 bg-white/15 rounded-lg animate-pulse my-1" />
                        ) : (
                            <p className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">₦{metrics.totalValue.toLocaleString()}</p>
                        )}
                        <p className="text-[11px] text-slate-400 font-bold mt-1">Cumulative contract value</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Pre-Harvest Contracts</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-white/15 rounded-lg animate-pulse my-1" />
                        ) : (
                            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{metrics.preHarvestCount}</p>
                        )}
                        <p className="text-[11px] text-amber-300 font-bold mt-1">Deferred harvest settlements</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Verified & Active</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-white/15 rounded-lg animate-pulse my-1" />
                        ) : (
                            <p className="text-2xl sm:text-3xl font-black mt-1 text-white">{metrics.verifiedCount}</p>
                        )}
                        <p className="text-[11px] text-blue-300 font-bold mt-1">Signed / Escrow deposited</p>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <Input
                        placeholder="Search by buyer, company, email, or commodity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-emerald-500"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                        { id: "all", label: "All Deals", count: metrics.total },
                        { id: "pre_harvest", label: "Pre-Harvest", count: metrics.preHarvestCount },
                        { id: "post_harvest", label: "Harvest-Ready", count: metrics.postHarvestCount },
                        { id: "in_transit", label: "In-Transit", count: agreements.filter(a => a.status === 'dispatched').length },
                        { id: "delivered", label: "Handover Complete", count: agreements.filter(a => ['delivered', 'completed'].includes(a.status)).length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                activeTab === tab.id ? "bg-white/20 dark:bg-black/20" : "bg-slate-200 dark:bg-slate-700"
                            }`}>
                                {loading ? "..." : tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Agreements List / Loader / Empty State */}
            {loading ? (
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-3">
                        <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                        <span className="text-sm font-black tracking-wide">Syncing verified offtake agreements & escrow status...</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 animate-pulse shadow-sm">
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                                <div className="flex justify-between items-center">
                                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 space-y-3">
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-6 w-28 bg-slate-300 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : filteredAgreements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-inner">
                        <FaHandshake className="text-3xl" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {searchQuery ? "No matching procurement deals" : "No Offtake Deals Registered Yet"}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm">
                        {searchQuery
                            ? `Try clearing your search query "${searchQuery}" or filter tabs.`
                            : "Register institutional buyers or food processors to generate verifiable legal agreements and escrow links."}
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        {searchQuery && (
                            <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">
                                Clear Search
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsCreatingBuyer(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-2.5 cursor-pointer"
                        >
                            <FaPlus className="mr-2" /> Register New Buyer
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgreements.map((ag) => {
                        const isVerified = ['accepted', 'stamped', 'approved', 'paid', 'completed'].includes(ag.status);
                        const isPaid = ag.status === 'paid' || ag.payment_status === 'completed';
                        const reviewUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/review-agreement/${ag.secure_token}`;
                        const paymentUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/payment-link/${ag.payment_token}`;
                        const pdfUrl = `/api/proxy/aggregator/agreement-pdf/${ag.secure_token}`;

                        const commodity = ag.product_details?.commodity || "Agricultural Produce";
                        const quantity = ag.product_details?.quantity || 0;
                        const unit = ag.product_details?.unit || "Units";
                        const unitPrice = parseFloat(ag.product_details?.price || 0);
                        const totalValue = parseFloat(ag.financing_amount || 0);

                        return (
                            <Card
                                key={ag.id}
                                className="group relative rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                            >
                                {/* Top status accent line */}
                                <div className={`h-2 w-full ${ag.is_pre_harvest ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                                <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                                    {/* Header: Scenario & Status */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            {ag.is_pre_harvest ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                                    <FaSeedling size={10} /> Pre-Harvest Forward
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                                    <FaBoxes size={10} /> Harvest-Ready Spot
                                                </span>
                                            )}

                                            {isPaid ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                    <FaCheckCircle size={10} /> Escrow Funded
                                                </span>
                                            ) : isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                                    <FaCheckCircle size={10} /> Digitally Signed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                                    <FaClock size={10} /> Awaiting Signature
                                                </span>
                                            )}
                                        </div>

                                        {/* Buyer Info */}
                                        <div className="flex items-start gap-3 pt-1">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-800 dark:text-slate-100 text-base shadow-sm shrink-0">
                                                {(ag.buyer_name || "B").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
                                                    {ag.buyer_name || "Valued Off-taker"}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                                    <FaBuilding size={11} className="text-slate-400 shrink-0" />
                                                    <span>{ag.buyer_company || ag.company_name || "Commercial Buyer"}</span>
                                                </p>
                                                {ag.buyer_email && (
                                                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                                        <FaEnvelope size={10} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{ag.buyer_email}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Commodity & Value breakdown card */}
                                    <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Commodity</span>
                                            <span className="font-black text-slate-800 dark:text-slate-200 uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                                {commodity}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Volume & Rate</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {quantity} {unit} @ ₦{unitPrice.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="border-t border-slate-200/80 dark:border-slate-800 pt-2 flex items-baseline justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Contract Value</p>
                                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                                    ₦{totalValue.toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <FaShieldAlt className="text-emerald-500" /> Escrow Protected
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Links & Multi-Phase Workflow */}
                                    <div className="space-y-2 pt-1">
                                        {ag.is_pre_harvest ? (
                                            /* Pre-harvest: 2-Phase Links */
                                            <div className="space-y-2">
                                                {/* Phase 1: Approval */}
                                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 uppercase">Phase 1</span>
                                                            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 truncate">Sign Agreement</span>
                                                        </div>
                                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 truncate mt-0.5">Off-taker commitment link</p>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => copyToClipboard(reviewUrl, `${ag.id}-p1`)}
                                                            className="text-xs px-2.5 py-1.5 h-auto rounded-lg font-bold border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer"
                                                        >
                                                            {copiedToken === `${ag.id}-p1` ? <><FaCheck size={10} className="mr-1 text-green-600" /> Copied</> : <><FaCopy size={10} className="mr-1" /> Copy</>}
                                                        </Button>
                                                        <button
                                                            onClick={() => window.open(reviewUrl, "_blank")}
                                                            title="Open agreement review in new tab"
                                                            className="p-2 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
                                                        >
                                                            <FaExternalLinkAlt size={11} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Phase 2: Payment */}
                                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-500 text-white uppercase">Phase 2</span>
                                                            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 truncate">Harvest Payment</span>
                                                        </div>
                                                        <p className="text-[10px] text-blue-700 dark:text-blue-400 truncate mt-0.5">Paystack escrow deposit</p>
                                                    </div>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => copyToClipboard(paymentUrl, `${ag.id}-p2`)}
                                                            className="text-xs px-2.5 py-1.5 h-auto rounded-lg font-bold border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                                                        >
                                                            {copiedToken === `${ag.id}-p2` ? <><FaCheck size={10} className="mr-1 text-green-600" /> Copied</> : <><FaCopy size={10} className="mr-1" /> Copy</>}
                                                        </Button>
                                                        <button
                                                            onClick={() => window.open(paymentUrl, "_blank")}
                                                            title="Open payment page in new tab"
                                                            className="p-2 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition cursor-pointer"
                                                        >
                                                            <FaExternalLinkAlt size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Immediate spot procurement: Direct link */
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block truncate">
                                                        Direct Sign & Pay Link
                                                    </span>
                                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                                                        Instant verification + Paystack escrow
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(reviewUrl, `${ag.id}-spot`)}
                                                        className="text-xs px-2.5 py-1.5 h-auto rounded-lg font-bold border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer"
                                                    >
                                                        {copiedToken === `${ag.id}-spot` ? <><FaCheck size={10} className="mr-1 text-green-600" /> Copied</> : <><FaCopy size={10} className="mr-1" /> Copy</>}
                                                    </Button>
                                                    <button
                                                        onClick={() => window.open(reviewUrl, "_blank")}
                                                        title="Open agreement review in new tab"
                                                        className="p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer"
                                                    >
                                                        <FaExternalLinkAlt size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Produce Dispatch Action for Funded Escrow */}
                                        {(ag.status === "paid" || ag.payment_status === "escrow") && (
                                            <div className="pt-1">
                                                <Button
                                                    onClick={() => {
                                                        setDispatchingAgreement(ag);
                                                        setDispatchForm({
                                                            waybill_number: `WB-AGR-${ag.id.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                                                            driver_name: "",
                                                            driver_phone: "",
                                                            vehicle_plate: "",
                                                            dispatch_notes: `${ag.product_details?.quantity || ''} ${ag.product_details?.unit || 'units'} of ${ag.product_details?.commodity || 'produce'} loaded and dispatched.`
                                                        });
                                                    }}
                                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                                                >
                                                    <FaTruck /> Dispatch Produce & Issue Waybill
                                                </Button>
                                            </div>
                                        )}

                                        {ag.status === "dispatched" && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1">
                                                <div className="flex items-center justify-between font-bold text-blue-700 dark:text-blue-300">
                                                    <span className="flex items-center gap-1.5"><FaTruck /> In-Transit</span>
                                                    <span className="font-mono text-[11px]">{ag.product_details?.dispatch?.waybill_number || "Waybill Active"}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">Carrier: {ag.product_details?.dispatch?.driver_name || "Logistics Partner"} {ag.product_details?.dispatch?.driver_phone && <>({ag.product_details.dispatch.driver_phone})</>}</p>
                                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Waiting for buyer physical handover confirmation</p>
                                            </div>
                                        )}

                                        {["delivered", "completed"].includes(ag.status) && (
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                                                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                                                    <span className="flex items-center gap-1.5"><FaCheckCircle /> 2-Way Handover Verified</span>
                                                    <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200 font-black">Escrow Released</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    Rating: {"★".repeat(ag.product_details?.delivery_confirmation?.buyer_rating || 5)} • Receiver: {ag.product_details?.delivery_confirmation?.received_by_name || ag.buyer_name}
                                                </p>
                                            </div>
                                        )}

                                        {/* Utility buttons */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => window.open(pdfUrl, "_blank")}
                                                className="flex-1 text-xs font-bold py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <FaRegFilePdf className="text-red-500" /> Official PDF
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                onClick={() => setSelectedAgreementDetails(ag)}
                                                className="flex-1 text-xs font-bold py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <FaInfoCircle className="text-blue-500" /> Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Buyer Registration Modal */}
            {isCreatingBuyer && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in overflow-y-auto">
                    <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 my-auto">
                        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <FaFileContract size={18} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                        Register Buyer & Generate Agreement
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Establish legal procurement terms and automated escrow links.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreatingBuyer(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <CardContent className="p-6 sm:p-8 space-y-8">
                            <form onSubmit={handleCreateBuyer} className="space-y-8">
                                {/* SECTION 1: Buyer Information */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        <FaBuilding /> 1. Off-taker & Company Profile
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Buyer Full Name *
                                            </Label>
                                            <Input
                                                required
                                                placeholder="e.g. Esther Adewale"
                                                value={buyerFormData.buyer_info.buyer_name}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    buyer_info: { ...buyerFormData.buyer_info, buyer_name: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Buyer Email Address *
                                            </Label>
                                            <Input
                                                type="email"
                                                required
                                                placeholder="e.g. buyer@enterprise.com"
                                                value={buyerFormData.buyer_info.buyer_email}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    buyer_info: { ...buyerFormData.buyer_info, buyer_email: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Company / Organization
                                            </Label>
                                            <Input
                                                placeholder="e.g. Emma Agro Processing Ltd"
                                                value={buyerFormData.buyer_info.company_name}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    buyer_info: { ...buyerFormData.buyer_info, company_name: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Phone Number
                                            </Label>
                                            <Input
                                                placeholder="e.g. +234 813 973 8894"
                                                value={buyerFormData.buyer_info.buyer_phone}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    buyer_info: { ...buyerFormData.buyer_info, buyer_phone: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Delivery / Warehouse Address
                                            </Label>
                                            <Input
                                                placeholder="e.g. Plot 14 Industrial Layout, Lagos Central Depot"
                                                value={buyerFormData.buyer_info.address}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    buyer_info: { ...buyerFormData.buyer_info, address: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: Commodity & Volume */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <FaBoxes /> 2. Commodity & Valuation Parameters
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-bold">Quick presets available</span>
                                    </div>

                                    {/* Commodity Quick Presets */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {COMMODITY_PRESETS.slice(0, 6).map((preset) => (
                                            <button
                                                type="button"
                                                key={preset.name}
                                                onClick={() => selectCommodityPreset(preset)}
                                                className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition cursor-pointer ${
                                                    buyerFormData.product_details.commodity.toLowerCase() === preset.name.toLowerCase()
                                                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                                                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                                }`}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Commodity Produce *
                                            </Label>
                                            <Input
                                                required
                                                placeholder="e.g. Tomatoes"
                                                value={buyerFormData.product_details.commodity}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    product_details: { ...buyerFormData.product_details, commodity: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Volume / Quantity *
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                step="any"
                                                required
                                                placeholder="e.g. 40"
                                                value={buyerFormData.product_details.quantity}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    product_details: { ...buyerFormData.product_details, quantity: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Unit Price (₦) *
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                step="any"
                                                required
                                                placeholder="e.g. 500"
                                                value={buyerFormData.product_details.price}
                                                onChange={e => setBuyerFormData({
                                                    ...buyerFormData,
                                                    product_details: { ...buyerFormData.product_details, price: e.target.value }
                                                })}
                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Real-time Total Escrow Value Callout */}
                                    <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                Auto-Calculated Escrow Total
                                            </p>
                                            <p className="text-3xl font-black mt-1 text-white tracking-tight">
                                                ₦{(parseFloat(buyerFormData.product_details.quantity || 0) * parseFloat(buyerFormData.product_details.price || 0)).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right text-xs text-slate-300 font-medium">
                                            <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                                <FaShieldAlt /> 100% Guaranteed Escrow
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Funds released upon delivery confirmation</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: Procurement Scenario */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Label className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                        <FaCalendarAlt /> 3. Select Procurement Scenario
                                    </Label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setBuyerFormData({ ...buyerFormData, is_pre_harvest: true })}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                                                buyerFormData.is_pre_harvest
                                                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                                    Deferred Offtake
                                                </span>
                                                <FaSeedling className="text-amber-500 text-lg" />
                                            </div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-base">
                                                Pre-Harvest Forward
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                Buyer digitally signs commitment agreement now. Payment link unlocks when crop harvest is certified.
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setBuyerFormData({ ...buyerFormData, is_pre_harvest: false })}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                                                !buyerFormData.is_pre_harvest
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                    Immediate Spot
                                                </span>
                                                <FaBoxes className="text-emerald-500 text-lg" />
                                            </div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-base">
                                                Harvest-Ready Spot
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                Produce is harvested and ready in stock. Buyer approves agreement and immediately funds escrow via Paystack.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {/* Form Submittal Actions */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreatingBuyer(false)}
                                        className="rounded-xl px-5 py-3 font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-8 rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                                    >
                                        {loading ? "Generating Deal..." : <><FaFileContract /> Generate Legal Agreement</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Created Agreement Success Dialog */}
            {createdAgreementSuccess && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-emerald-500/30 bg-white dark:bg-slate-900 overflow-hidden text-center p-8 space-y-6">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <FaCheckCircle className="text-3xl" />
                        </div>

                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Agreement Ready
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                                Procurement Deal Created!
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                The legal procurement agreement has been generated and tokens have been allocated.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Phase 1: Digital Review & Sign Link</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        readOnly
                                        value={createdAgreementSuccess.acceptance_link}
                                        className="text-xs bg-white dark:bg-slate-900 font-mono py-1.5 h-auto rounded-lg"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => copyToClipboard(createdAgreementSuccess.acceptance_link, "succ-p1")}
                                        className="shrink-0 text-xs px-3 py-2 h-auto rounded-lg font-bold bg-slate-900 text-white hover:bg-black dark:bg-emerald-500 dark:text-slate-950 cursor-pointer"
                                    >
                                        {copiedToken === "succ-p1" ? <FaCheck /> : <FaCopy />}
                                    </Button>
                                </div>
                            </div>

                            {createdAgreementSuccess.payment_link && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Phase 2: Post-Harvest Payment Link</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            readOnly
                                            value={createdAgreementSuccess.payment_link}
                                            className="text-xs bg-white dark:bg-slate-900 font-mono py-1.5 h-auto rounded-lg"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => copyToClipboard(createdAgreementSuccess.payment_link, "succ-p2")}
                                            className="shrink-0 text-xs px-3 py-2 h-auto rounded-lg font-bold bg-slate-900 text-white hover:bg-black dark:bg-emerald-500 dark:text-slate-950 cursor-pointer"
                                        >
                                            {copiedToken === "succ-p2" ? <FaCheck /> : <FaCopy />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                onClick={() => window.open(createdAgreementSuccess.acceptance_link, "_blank")}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
                            >
                                <FaExternalLinkAlt size={12} /> Test / Open Sign Link Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setCreatedAgreementSuccess(null)}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer text-sm"
                            >
                                Done
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Dispatch Produce Modal */}
            {dispatchingAgreement && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                    <Card className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 space-y-6 text-left border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                    <FaTruck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Dispatch Produce Waybill</h3>
                                    <p className="text-xs text-slate-500">Initiate Logistics & Transit to Off-taker</p>
                                </div>
                            </div>
                            <button onClick={() => setDispatchingAgreement(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                        </div>

                        <form onSubmit={handleDispatchProduce} className="space-y-4 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                                <p className="font-bold text-slate-700 dark:text-slate-300">Off-taker: <span className="text-slate-900 dark:text-white">{dispatchingAgreement.buyer_name} ({dispatchingAgreement.buyer_company || dispatchingAgreement.company_name})</span></p>
                                <p className="text-slate-500 mt-0.5">Commodity: <strong className="text-slate-800 dark:text-slate-200">{dispatchingAgreement.product_details?.quantity} {dispatchingAgreement.product_details?.unit || 'Units'} of {dispatchingAgreement.product_details?.commodity}</strong></p>
                                <p className="text-slate-500">Destination: <strong className="text-slate-800 dark:text-slate-200">{dispatchingAgreement.buyer_address || "Designated Receiving Depot"}</strong></p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Waybill Number *</label>
                                    <input
                                        required
                                        value={dispatchForm.waybill_number}
                                        onChange={e => setDispatchForm({ ...dispatchForm, waybill_number: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle / Truck Plate</label>
                                    <input
                                        placeholder="e.g. KJA-482-XA"
                                        value={dispatchForm.vehicle_plate}
                                        onChange={e => setDispatchForm({ ...dispatchForm, vehicle_plate: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Driver / Carrier Name *</label>
                                    <input
                                        required
                                        placeholder="e.g. Musa Ibrahim"
                                        value={dispatchForm.driver_name}
                                        onChange={e => setDispatchForm({ ...dispatchForm, driver_name: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Driver Phone Number</label>
                                    <input
                                        placeholder="e.g. +234 803 123 4567"
                                        value={dispatchForm.driver_phone}
                                        onChange={e => setDispatchForm({ ...dispatchForm, driver_phone: e.target.value })}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 dark:text-slate-300">Dispatch & Packing Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Notes on produce condition, batch number, or packaging..."
                                    value={dispatchForm.dispatch_notes}
                                    onChange={e => setDispatchForm({ ...dispatchForm, dispatch_notes: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-3">
                                <Button
                                    type="submit"
                                    disabled={isSubmittingDispatch}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl cursor-pointer"
                                >
                                    {isSubmittingDispatch ? "Processing Dispatch..." : "Confirm Dispatch & Mark In-Transit"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDispatchingAgreement(null)}
                                    className="px-5 py-3 rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Agreement Details Drawer / Modal */}
            {selectedAgreementDetails && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
                    <Card className="w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 my-auto p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                                    Offtake Contract Specification
                                </span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                                    Agreement #{selectedAgreementDetails.id?.substring(0, 8)}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedAgreementDetails(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-left">
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Buyer Name</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedAgreementDetails.buyer_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Company</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedAgreementDetails.buyer_company || selectedAgreementDetails.company_name || "Enterprise Offtaker"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Buyer Email</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedAgreementDetails.buyer_email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Procurement Scenario</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                                        {selectedAgreementDetails.is_pre_harvest ? "Pre-Harvest Forward" : "Harvest-Ready Spot"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                                <p className="text-[10px] font-black uppercase text-slate-400">Commodity Produce Terms</p>
                                <p className="text-base font-black text-slate-900 dark:text-white">
                                    {selectedAgreementDetails.product_details?.commodity}
                                </p>
                                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                    <span>Quantity: {selectedAgreementDetails.product_details?.quantity} {selectedAgreementDetails.product_details?.unit || "Units"}</span>
                                    <span>Unit Rate: ₦{parseFloat(selectedAgreementDetails.product_details?.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <span className="font-black text-xs">Total Escrow Value:</span>
                                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                        ₦{parseFloat(selectedAgreementDetails.financing_amount || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                                <p className="text-[10px] font-black uppercase text-slate-400">Legal Terms & Conditions</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2 scrollbar-thin">
                                    {selectedAgreementDetails.terms_and_conditions || "Standard Agri-Noria platform escrow and arbitration terms apply to this procurement agreement."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => window.open(`/api/proxy/aggregator/agreement-pdf/${selectedAgreementDetails.secure_token}`, "_blank")}
                                className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
                            >
                                <FaRegFilePdf className="text-red-500" /> View Official PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedAgreementDetails(null)}
                                className="px-6 py-3 rounded-xl font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer text-sm"
                            >
                                Close
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
