"use client";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/Card";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  User,
  Building2,
  ChevronRight,
  AlertCircle,
  Wallet,
  Edit3,
  RotateCcw,
  Check,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Coins,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

const fetcher = (url) => fetch(url).then((res) => res.json());

const INPUT_CATALOG = {
  Mechanical: { price: 150000, unit: "unit", qty: 1, icon: "🚜" },
  Seeds: { price: 45000, unit: "25kg bag", qty: 1, icon: "🌱" },
  Fertilizer: { price: 65000, unit: "50kg bag", qty: 1, icon: "🧪" },
  Irrigations: { price: 120000, unit: "system", qty: 1, icon: "💧" },
  Pesticides: { price: 35000, unit: "20L jerry", qty: 1, icon: "🧴" },
  Herbicides: { price: 25000, unit: "20L jerry", qty: 1, icon: "🌿" },
};

function getItemLabel(item) {
  return typeof item === "string"
    ? item
    : item?.name || item?.category || "Input";
}

function RequesterCard({ req }) {
  const initials = `${(req.fname || "?")[0]}${(req.lname || "?")[0]}`.toUpperCase();
  const role = req.requester_type || "farmer";
  const roleColors = {
    farmer: "bg-emerald-600 text-white",
    aggregator: "bg-blue-600 text-white",
    cluster_manager: "bg-purple-600 text-white",
    cluster_supervisor: "bg-purple-600 text-white",
  };

  const roleDisplay = role.replace(/_/g, " ").toUpperCase();

  return (
    <div className="flex items-start gap-3.5">
      <div
        className={`w-12 h-12 rounded-2xl ${roleColors[role] || "bg-slate-700 text-white"} flex items-center justify-center font-black text-sm tracking-wider shadow-sm shrink-0`}
      >
        {initials}
      </div>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-base text-slate-900 dark:text-white truncate">
            {req.fname} {req.lname}
          </p>
          {req.onboarding_status === "verified" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full">
              Pending KYC
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{req.email}</p>
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
            {roleDisplay}
          </span>
          {req.cluster_name && (
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              • {req.cluster_name}
            </span>
          )}
          {req.farm_size_hectares && (
            <span>• {parseFloat(req.farm_size_hectares).toFixed(1)} Ha</span>
          )}
          {req.program_name && (
            <span className="text-slate-400 truncate max-w-[200px]">
              • {req.program_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemBadge({ item }) {
  const label = getItemLabel(item);
  const meta = INPUT_CATALOG[label] || {};
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
      <span className="text-base">{meta.icon || "📦"}</span>
      <div>
        <p className="text-xs font-bold">{label}</p>
        {meta.unit && (
          <p className="text-[10px] text-slate-400">
            {meta.unit} · ₦{(meta.price || 0).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FinanceApprovalsPage() {
  const router = useRouter();
  const [processingId, setProcessingId] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [editableAmounts, setEditableAmounts] = useState({});
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const { data: authData } = useSWR("/api/proxy/auth/verify-vendor", fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (authData) {
      const role = authData.role?.toLowerCase();
      if (role !== "finance" && role !== "super admin" && role !== "admin" && role !== "cooperative") {
        toast.error("Access Denied: Finance role required");
        router.replace("/ecosystem/institution");
      }
    }
  }, [authData, router]);

  const { data: statsJson, isLoading: l1, mutate: m1 } = useSWR("/api/proxy/admin/institution/analytics", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
  const { data: pendingJson, isLoading: l2, mutate: m2 } = useSWR("/api/proxy/admin/institution/pending-requests", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
  const { data: distJson, isLoading: l3, mutate: m3 } = useSWR("/api/proxy/admin/institution/distributors", fetcher, { refreshInterval: 10000 });
  const { data: allJson, isLoading: l4, mutate: m4 } = useSWR("/api/proxy/pipeline/inputs/all", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
  const { data: ordersJson, isLoading: l5, mutate: m5 } = useSWR("/api/proxy/pipeline/buyer-orders/all", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
  const { data: treasuryJson, isLoading: l6, mutate: m6 } = useSWR("/api/proxy/pipeline/stats/platform-wallet", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });
  const { data: programsJson, isLoading: l7, mutate: m7 } = useSWR("/api/proxy/programs", fetcher, { refreshInterval: 30000, revalidateOnFocus: true });

  const stats = statsJson?.success ? statsJson.data.disbursements : {
    pendingCount: 0,
    pendingValue: 0,
    totalDisbursed: 0,
    rejectedCount: 0,
    rejectedValue: 0,
  };
  const ecosystemTreasury = treasuryJson?.success ? treasuryJson.data.ecosystem_treasury || 0 : 0;
  const distributors = distJson?.success ? distJson.data : [];
  const programs = programsJson?.success ? programsJson.data || [] : [];

  const pending = pendingJson?.success ? pendingJson.data || [] : [];
  const stage1 = pending.filter((r) => r.funds_status === "pending" || !r.funds_status);
  const stage2 = pending.filter((r) => r.funds_status === "approved" && r.status === "items_selected");
  const stage3 = pending.filter((r) => r.funds_status === "approved" && r.items_status === "delivered");

  const all = allJson?.success ? allJson.data || [] : [];
  const history = all.filter((r) => r.status !== "pending");

  const allOrders = ordersJson?.success ? ordersJson.data || [] : [];
  const marketplaceOrders = allOrders.filter(
    (o) =>
      o.status === "payment_pending_finance" ||
      o.payment_status === "paystack_verified" ||
      o.status === "payment_processing"
  );

  const loading = l1 || l2 || l6 || l7;

  const fetchData = async () => {
    await Promise.all([m1(), m2(), m3(), m4(), m5(), m6(), m7()]);
  };

  const handleAmountChange = (requestId, value) => {
    const num = Number(value);
    setEditableAmounts((prev) => ({
      ...prev,
      [requestId]: isNaN(num) ? "" : num,
    }));
  };

  const handleResetAmount = (requestId) => {
    setEditableAmounts((prev) => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  };

  const handleApproveFunds = async (req) => {
    const originalAmount = parseFloat(req.total_amount || req.total_value || 0);
    const customAmount = editableAmounts[req.id];
    const amountToAuthorize = (customAmount !== undefined && customAmount !== "" && Number(customAmount) > 0)
      ? Number(customAmount)
      : originalAmount;

    if (!amountToAuthorize || amountToAuthorize <= 0) {
      toast.error("Please enter a valid disbursement amount greater than ₦0");
      return;
    }

    setProcessingId(req.id);
    try {
      const res = await fetch("/api/proxy/admin/institution/approve-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: req.id,
          approved_amount: amountToAuthorize,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`✅ Funds authorized for ${req.fname} ${req.lname} (₦${amountToAuthorize.toLocaleString()})`);
        fetchData();
      } else {
        toast.error(json.error || "Failed to authorize funds");
      }
    } catch {
      toast.error("Network connection error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectFunds = async () => {
    if (!rejectModalReq) return;
    setIsRejecting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/reject-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: rejectModalReq.id,
          reason: rejectReason.trim() || "Declined by Finance Department",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.info("Financing request declined");
        setRejectModalReq(null);
        setRejectReason("");
        fetchData();
      } else {
        toast.error(json.error || "Failed to decline request");
      }
    } catch {
      toast.error("Network connection error");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleConfirmOrderPayment = async (orderId) => {
    setProcessingId(`order-${orderId}`);
    try {
      const res = await fetch(`/api/proxy/pipeline/buyer-orders/${orderId}/payment/finance-confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finance_note: "Confirmed via Finance Approval Center" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Marketplace payment confirmed successfully!");
        fetchData();
      } else {
        toast.error(json.error || "Failed to confirm payment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedDistributor) {
      toast.warning("Please choose a delivery partner");
      return;
    }
    setProcessingId(assigning.id);
    try {
      const res = await fetch("/api/proxy/admin/institution/assign-distributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: assigning.id,
          distributorId: selectedDistributor,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Input request approved & distributor assigned!");
        setAssigning(null);
        setSelectedDistributor("");
        fetchData();
      } else {
        toast.error(json.error || "Failed to assign distributor");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleaseFunds = async (req) => {
    setProcessingId(`release-${req.id}`);
    try {
      const res = await fetch("/api/proxy/admin/institution/payout-distributor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`✅ Payout released to distributor for ${req.fname} ${req.lname}`);
        fetchData();
      } else {
        toast.error(json.error || "Failed to release payout");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Global Treasury",
      value: `₦${ecosystemTreasury.toLocaleString()}`,
      sub: "Platform Liquidity",
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
      accent: "border-emerald-500/30 bg-emerald-500/5",
    },
    {
      label: "Stage 1: Fund Release",
      value: stage1.length,
      sub: "Pending Review",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      accent: "border-amber-500/30 bg-amber-500/5",
    },
    {
      label: "Stage 2: Distributors",
      value: stage2.length,
      sub: "Awaiting Assignment",
      icon: <Package className="w-5 h-5 text-blue-500" />,
      accent: "border-blue-500/30 bg-blue-500/5",
    },
    {
      label: "Stage 3: Payouts",
      value: stage3.length,
      sub: "Awaiting Release",
      icon: <Truck className="w-5 h-5 text-purple-500" />,
      accent: "border-purple-500/30 bg-purple-500/5",
    },
    {
      label: "Total Disbursed",
      value: `₦${(stats.totalDisbursed || 0).toLocaleString()}`,
      sub: "Since Inception",
      icon: <CheckCircle2 className="w-5 h-5 text-teal-500" />,
      accent: "border-teal-500/30 bg-teal-500/5",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Modern Simplified Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>Institutional Portal</span>
            <span>/</span>
            <span className="text-emerald-600 dark:text-emerald-400">Finance Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Finance & Disbursement Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authorize agricultural funding, adjust approved disbursement amounts, assign delivery partners, and confirm payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            className="rounded-xl px-3.5 py-2 text-xs font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Refresh
          </Button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Treasury Active
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {statCards.map((s, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${s.accent} bg-white dark:bg-slate-900/90 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {s.label}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0">
                {s.icon}
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {s.value}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Programme Treasuries Bar */}
      {programs.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Programme Treasuries Available:
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1.5 text-[11px]">
                Disbursements deduct directly from enrolled program balances
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-full">
            {programs.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="px-2.5 py-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <span className="font-bold text-slate-700 dark:text-slate-300 max-w-[110px] truncate">
                  {p.name}:
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  ₦{parseFloat(p.wallet_balance || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="program_approvals" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="program_approvals" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            Financing ({stage1.length + stage2.length + stage3.length})
          </TabsTrigger>
          <TabsTrigger value="active_programs" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            Program Funds ({programs.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace_orders" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            Marketplace ({marketplaceOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            History ({history.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. PROGRAM FINANCING TAB */}
        <TabsContent value="program_approvals" className="space-y-8">
          {/* ========================================================= */}
          {/* STAGE 1 — FUND AUTHORIZATION (WITH EDITABLE AMOUNT)       */}
          {/* ========================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                  1
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Stage 1 — Fund Authorization & Amount Adjustment
                </h2>
                {stage1.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[11px] font-black rounded-full border border-amber-200 dark:border-amber-800">
                    {stage1.length} Awaiting Authorization
                  </span>
                )}
              </div>
            </div>

            {stage1.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  All Stage 1 financing requests are authorized
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  New cluster supervisor and outgrower funding applications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stage1.map((req) => {
                  const originalAmount = parseFloat(req.total_amount || req.total_value || 0);
                  const customAmount = editableAmounts[req.id];
                  const currentAmount = (customAmount !== undefined && customAmount !== "")
                    ? Number(customAmount)
                    : originalAmount;
                  const isModified = customAmount !== undefined && Number(customAmount) !== originalAmount;

                  // Find matched program
                  const prog = programs.find((p) => p.id === req.program_id) || programs[0];
                  const progBalance = parseFloat(prog?.wallet_balance || 0);
                  const isOverBudget = prog ? currentAmount > progBalance : false;

                  return (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 sm:p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                        {/* Left: Requester & Items Details */}
                        <div className="space-y-4 flex-1 min-w-0">
                          <RequesterCard req={req} />

                          {/* Requested Items preview */}
                          {req.input_items && Array.isArray(req.input_items) && req.input_items.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Requested Package Allocation:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {req.input_items.map((item, i) => (
                                  <ItemBadge key={i} item={item} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Associated Program Information */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Program:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {prog?.name || req.program_name || "General Agriculture Program"}
                            </span>
                            {prog && (
                              <span className="ml-auto text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                Treasury: ₦{progBalance.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Editable Amount & Authorization Action */}
                        <div className="w-full lg:w-96 p-4 rounded-2xl bg-slate-900 dark:bg-black/60 border border-slate-800 text-white space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" />
                              Editable Disbursement Amount
                            </span>
                            {isModified && (
                              <button
                                type="button"
                                onClick={() => handleResetAmount(req.id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                                title="Reset to original requested amount"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Reset (₦{originalAmount.toLocaleString()})
                              </button>
                            )}
                          </div>

                          {/* Editable Input Field */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-400">
                                Approved Amount (₦)
                              </label>
                              <span className="text-[10px] text-slate-400">
                                Requested: ₦{originalAmount.toLocaleString()}
                              </span>
                            </div>

                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-amber-400">
                                ₦
                              </span>
                              <input
                                type="number"
                                min="1"
                                step="1000"
                                value={customAmount !== undefined ? customAmount : originalAmount}
                                onChange={(e) => handleAmountChange(req.id, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-lg font-black text-white outline-none transition"
                                placeholder="0"
                              />
                            </div>

                            {/* Validation message */}
                            {isOverBudget ? (
                              <p className="text-[10px] font-bold text-red-400 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                Exceeds program treasury balance (₦{progBalance.toLocaleString()} available)
                              </p>
                            ) : isModified ? (
                              <p className="text-[10px] font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
                                <Check className="w-3 h-3 shrink-0" />
                                Adjusted by {currentAmount >= originalAmount ? "+" : "-"}₦
                                {Math.abs(currentAmount - originalAmount).toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 mt-1.5">
                                Modify number above if financial committee approved a different sum.
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-1">
                            <Button
                              onClick={() => handleApproveFunds(req)}
                              disabled={processingId === req.id || currentAmount <= 0}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl py-3 text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                            >
                              {processingId === req.id ? (
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Authorizing Disbursement...
                                </span>
                              ) : (
                                `Authorize ₦${Number(currentAmount).toLocaleString()}`
                              )}
                            </Button>

                            <button
                              type="button"
                              onClick={() => setRejectModalReq(req)}
                              className="w-full py-1.5 text-center text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer"
                            >
                              Decline Financing Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* STAGE 2 — DISTRIBUTOR ASSIGNMENT                          */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-xs">
                2
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Stage 2 — Distributor Assignment
              </h2>
              {stage2.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[11px] font-black rounded-full border border-blue-200 dark:border-blue-800">
                  {stage2.length} Ready for Assignment
                </span>
              )}
            </div>

            {stage2.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
                <Truck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="font-bold text-slate-500 text-sm">
                  No requests currently awaiting distributor assignment
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Requests automatically move here once Stage 1 funds are authorized.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stage2.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <RequesterCard req={req} />
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Authorized Funding
                        </span>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ₦{parseFloat(req.total_amount || req.total_value || 0).toLocaleString()}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Funds Escrowed ✓
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span>Ready to assign certified agro-dealer for distribution</span>
                      </div>
                      <Button
                        onClick={() => setAssigning(req)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-sm cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        Assign Distributor & Dispatch
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* STAGE 3 — PAYOUT AUTHORIZATION                            */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                3
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Stage 3 — Final Payout Release
              </h2>
              {stage3.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-black rounded-full border border-emerald-200 dark:border-emerald-800">
                  {stage3.length} Pending Distributor Payout
                </span>
              )}
            </div>

            {stage3.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
                <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="font-bold text-slate-500 text-sm">
                  No requests awaiting final payout release
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items confirmed as delivered by farmers/clusters will appear here for escrow release.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stage3.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <RequesterCard req={req} />
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Escrow Payout Due
                        </span>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ₦{parseFloat(req.total_amount || req.total_value || 0).toLocaleString()}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          Items Delivered ✓
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs text-slate-500">
                        Distributor delivery verified by recipient. Release escrow payout to vendor wallet.
                      </div>
                      <Button
                        onClick={() => handleReleaseFunds(req)}
                        disabled={processingId === `release-${req.id}`}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-sm cursor-pointer"
                      >
                        {processingId === `release-${req.id}` ? "Processing..." : "Release Escrow Payout"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 2. ACTIVE PROGRAMMES TAB */}
        <TabsContent value="active_programs" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Active Programme Treasuries
              </h2>
              <p className="text-xs text-slate-500">
                Live balances allocated by government, financial institutions, and agricultural boards.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800">
              {programs.length} Active Programmes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                      {prog.name}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {prog.region || "National"} • {prog.commodity || "Multi-crop"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-md text-[10px] font-bold uppercase">
                    Active
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Treasury
                  </span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₦{parseFloat(prog.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Target Land:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {parseFloat(prog.target_hectares || 0).toLocaleString()} Ha
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 3. MARKETPLACE ORDERS TAB */}
        <TabsContent value="marketplace_orders" className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Marketplace Trade Orders (Payment Confirmation)
            </h2>
            {marketplaceOrders.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-black rounded-full">
                {marketplaceOrders.length} Pending
              </span>
            )}
          </div>

          {marketplaceOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-500 text-sm">
                No marketplace orders awaiting payment confirmation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {marketplaceOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-base text-slate-900 dark:text-white">
                        {order.buyer_name || "Buyer Organization"}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{order.email}</p>
                    <p className="text-xs font-bold text-slate-400">
                      Amount: <span className="text-slate-900 dark:text-white font-black">₦{parseFloat(order.total_amount).toLocaleString()}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => handleConfirmOrderPayment(order.id)}
                    disabled={processingId === `order-${order.id}`}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-sm cursor-pointer"
                  >
                    {processingId === `order-${order.id}` ? "Confirming..." : "Confirm Payment Received"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 4. HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Disbursement & Approval Records
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {history.length} records processed
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                    <th className="p-4 font-bold text-slate-400 uppercase">Requester</th>
                    <th className="p-4 font-bold text-slate-400 uppercase">Role</th>
                    <th className="p-4 font-bold text-slate-400 uppercase">Distributor</th>
                    <th className="p-4 font-bold text-slate-400 uppercase">Approved Amount</th>
                    <th className="p-4 font-bold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.length > 0 ? (
                    history.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {req.fname} {req.lname}
                          <p className="text-[10px] text-slate-400 font-normal">{req.email}</p>
                        </td>
                        <td className="p-4 capitalize text-slate-600 dark:text-slate-300">
                          {(req.requester_type || "farmer").replace(/_/g, " ")}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {req.distributor_fname ? `${req.distributor_fname} ${req.distributor_lname}` : "—"}
                        </td>
                        <td className="p-4 font-black text-slate-900 dark:text-white">
                          ₦{parseFloat(req.total_amount || req.total_value || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              req.status === "approved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : req.status === "delivered"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                                  : req.status === "rejected"
                                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        No historical approval records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Decline Financing Request Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Decline Financing Request
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Requester: {rejectModalReq.fname} {rejectModalReq.lname} (₦{parseFloat(rejectModalReq.total_amount || rejectModalReq.total_value || 0).toLocaleString()})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Declining (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Budget ceiling exceeded, duplicate request, or cluster requires re-verification"
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setRejectModalReq(null)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectFunds}
                disabled={isRejecting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold"
              >
                {isRejecting ? "Declining..." : "Confirm Decline"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Distributor Assignment Modal */}
      {assigning && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Assign Delivery Partner
                </h3>
                <p className="text-xs text-slate-500">
                  Select a registered agro-input distributor for this approved order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssigning(null);
                  setSelectedDistributor("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Requester summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
              <RequesterCard req={assigning} />
              <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-slate-500">Total Approved Value:</span>
                <span className="font-black text-emerald-600">
                  ₦{parseFloat(assigning.total_amount || assigning.total_value || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Distributor select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose Delivery Partner / Distributor
              </label>
              {distributors.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                  No active distributors found. Please register an input distributor first.
                </div>
              ) : (
                <select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a distributor...</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fname} {d.lname} ({d.company_name || d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold"
                onClick={() => {
                  setAssigning(null);
                  setSelectedDistributor("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={processingId === assigning?.id || !selectedDistributor}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {processingId === assigning?.id ? "Assigning..." : "Confirm & Assign"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
