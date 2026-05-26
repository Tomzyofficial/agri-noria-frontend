"use client";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  const initials =
    `${(req.fname || "?")[0]}${(req.lname || "?")[0]}`.toUpperCase();
  const role = req.requester_type || "farmer";
  const roleColors = {
    farmer: "bg-emerald-500",
    aggregator: "bg-blue-500",
    cluster_manager: "bg-purple-500",
  };
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl ${roleColors[role] || "bg-gray-500"} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0`}
      >
        {initials}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-black text-base">
            {req.fname} {req.lname}
          </p>
          {req.onboarding_status === "verified" && (
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full uppercase tracking-wider">
              Verified
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{req.email}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400 font-bold uppercase">
          <span>{role.replace("_", " ")}</span>
          {req.farm_size_hectares && (
            <>
              <span>·</span>
              <span>{parseFloat(req.farm_size_hectares).toFixed(1)} Ha</span>
            </>
          )}
          {req.cluster_name && (
            <>
              <span>·</span>
              <span>{req.cluster_name}</span>
            </>
          )}
          {req.program_name && (
            <>
              <span>·</span>
              <span>{req.program_name}</span>
            </>
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
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <span className="text-lg">{meta.icon || "📦"}</span>
      <div>
        <p className="text-xs font-black">{label}</p>
        {meta.unit && (
          <p className="text-[10px] text-gray-400 font-bold">
            {meta.unit} · ₦{(meta.price || 0).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FinanceApprovalsPage() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    pendingValue: 0,
    totalDisbursed: 0,
    rejectedCount: 0,
    rejectedValue: 0,
  });
  const [stage1, setStage1] = useState([]);
  const [stage2, setStage2] = useState([]);
  const [history, setHistory] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const authRes = await fetch("/api/proxy/auth/verify-vendor");
      const authData = await authRes.json();
      const role = authData.account_type?.toLowerCase();
      if (role !== "finance" && role !== "super admin" && role !== "admin") {
        toast.error("Access Denied: Finance role required");
        router.replace("/ecosystem/institution");
        return;
      }
      const [statsRes, pendingRes, distRes, allRes] = await Promise.all([
        fetch("/api/proxy/admin/institution/analytics"),
        fetch("/api/proxy/admin/institution/pending-requests"),
        fetch("/api/proxy/admin/institution/distributors"),
        fetch("/api/proxy/pipeline/inputs/all"),
      ]);
      const [statsJson, pendingJson, distJson, allJson] = await Promise.all([
        statsRes.json(),
        pendingRes.json(),
        distRes.json(),
        allRes.json(),
      ]);
      if (statsJson.success) setStats(statsJson.data.disbursements);
      if (distJson.success) setDistributors(distJson.data);
      const pending = pendingJson.success ? pendingJson.data || [] : [];
      setStage1(
        pending.filter((r) => r.funds_status === "pending" || !r.funds_status),
      );
      setStage2(
        pending.filter(
          (r) => r.funds_status === "approved" && r.status === "items_selected",
        ),
      );
      const all = allJson.success ? allJson.data || [] : [];
      setHistory(all.filter((r) => r.status !== "pending"));
    } catch (e) {
      console.error("Fetch error:", e);
      toast.error("Failed to load approval data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveFunds = async (req) => {
    setProcessingId(req.id);
    try {
      const res = await fetch("/api/proxy/admin/institution/approve-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`✅ Funds authorized for ${req.fname} ${req.lname}`);
        fetchData();
      } else {
        toast.error(json.error || "Failed to authorize funds");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedDistributor) {
      toast.warning("Select a distributor first");
      return;
    }
    setProcessingId(assigning.id);
    try {
      const res = await fetch(
        "/api/proxy/admin/institution/assign-distributor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: assigning.id,
            distributorId: selectedDistributor,
          }),
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success("✅ Input request approved & distributor assigned!");
        setAssigning(null);
        setSelectedDistributor("");
        fetchData();
      } else {
        toast.error(json.error || "Failed to assign");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 dark:bg-gray-900 rounded-2xl"
            />
          ))}
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 bg-gray-100 dark:bg-gray-900 rounded-2xl"
          />
        ))}
      </div>
    );

  const statCards = [
    {
      label: "Awaiting Stage 1",
      value: stage1.length,
      sub: "Fund Authorization",
      icon: <Clock className="w-5 h-5" />,
      color: "amber",
    },
    {
      label: "Awaiting Stage 2",
      value: stage2.length,
      sub: "Distributor Assignment",
      icon: <Package className="w-5 h-5" />,
      color: "blue",
    },
    {
      label: "Total Disbursed",
      value: `₦${(stats.totalDisbursed || 0).toLocaleString()}`,
      sub: "Since inception",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "emerald",
    },
    {
      label: "Rejected",
      value: stats.rejectedCount,
      sub: `₦${(stats.rejectedValue || 0).toLocaleString()}`,
      icon: <XCircle className="w-5 h-5" />,
      color: "rose",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-(--foreground)">
          Finance Approval Center
        </h1>
        <p className="text-gray-500 mt-1">
          Two-stage authorization: Fund release → Input & Distributor Assignment
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div
                className={`w-9 h-9 rounded-xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 flex items-center justify-center mb-3`}
              >
                {s.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black mt-0.5">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* STAGE 1 — Fund Authorization */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-sm">
            1
          </div>
          <h2 className="text-lg font-black">Stage 1 — Fund Authorization</h2>
          {stage1.length > 0 && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">
              {stage1.length} Pending
            </span>
          )}
        </div>

        {stage1.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-bold text-gray-400">
                No pending fund authorizations
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stage1.map((req) => (
              <Card
                key={req.id}
                className="border-none shadow-sm overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col lg:flex-row gap-6 justify-between">
                    {/* Requester Info */}
                    <RequesterCard req={req} />

                    {/* Stage UI */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
                      {/* Stage 1 Box — Active */}
                      <div className="flex-1 p-4 bg-gray-900 dark:bg-gray-950 rounded-2xl border border-amber-500/30 relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                              Stage 1: Finance Approval
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-full border border-amber-500/30">
                            PENDING ACTION
                          </span>
                        </div>
                        <div className="mb-1">
                          <p className="text-[10px] text-gray-400">
                            Request Value
                          </p>
                          <p className="text-2xl font-black text-white">
                            ₦
                            {parseFloat(
                              req.total_amount || req.total_value || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-4">
                          Authorization required to release funds from program
                          treasury.
                        </p>
                        <Button
                          onClick={() => handleApproveFunds(req)}
                          disabled={processingId === req.id}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl py-5 text-xs uppercase tracking-wider transition-all active:scale-95"
                        >
                          {processingId === req.id
                            ? "Authorizing..."
                            : "Authorize Funds Disbursement"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>

                      {/* Stage 2 Box — Locked */}
                      <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 opacity-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Stage 2: Distribution
                        </p>
                        <p className="text-[10px] text-gray-400 italic">
                          Requester selects items after fund approval...
                        </p>
                        <div className="mt-4 w-full py-4 rounded-xl bg-gray-200 dark:bg-gray-800 text-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Locked
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  {req.input_items &&
                    Array.isArray(req.input_items) &&
                    req.input_items.length > 0 && (
                      <div className="px-6 pb-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Requested Items
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {req.input_items.map((item, i) => (
                            <ItemBadge key={i} item={item} />
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* STAGE 2 — Distributor Assignment */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-sm">
            2
          </div>
          <h2 className="text-lg font-black">
            Stage 2 — Distributor Assignment
          </h2>
          {stage2.length > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider">
              {stage2.length} Ready
            </span>
          )}
        </div>

        {stage2.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Truck className="w-10 h-10 text-blue-300 mx-auto mb-3" />
              <p className="font-bold text-gray-400">
                No requests awaiting distributor assignment
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Requests move here after Stage 1 fund authorization
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stage2.map((req) => (
              <Card
                key={req.id}
                className="border-none shadow-sm overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardContent className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <RequesterCard req={req} />
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        Total Value
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        ₦
                        {parseFloat(
                          req.total_amount || req.total_value || 0,
                        ).toLocaleString()}
                      </p>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase">
                        Funds Authorized ✓
                      </span>
                    </div>
                  </div>

                  {/* Items with weights/counts */}
                  {req.input_items &&
                    Array.isArray(req.input_items) &&
                    req.input_items.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Selected Inputs
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {req.input_items.map((item, i) => {
                            const label = getItemLabel(item);
                            const meta = INPUT_CATALOG[label] || {};
                            return (
                              <div
                                key={i}
                                className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-2"
                              >
                                <span className="text-xl">
                                  {meta.icon || "📦"}
                                </span>
                                <div>
                                  <p className="text-xs font-black">{label}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {meta.unit || "1 unit"}
                                  </p>
                                  <p className="text-[10px] font-black text-blue-600">
                                    ₦{(meta.price || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setAssigning(req)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl py-5 text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Truck className="w-4 h-4 mr-2" /> Assign Distributor &
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Distributor Assignment Modal */}
      {assigning && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">Assign Distributor</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This action is final and will notify the distributor
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAssigning(null);
                  setSelectedDistributor("");
                }}
                className="rounded-full h-8 w-8"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-5">
              {/* Requester summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-3">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Requester
                </p>
                <RequesterCard req={assigning} />
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="font-black text-emerald-600">
                    ₦
                    {parseFloat(
                      assigning.total_amount || assigning.total_value || 0,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items */}
              {assigning.input_items &&
                Array.isArray(assigning.input_items) && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Items to Deliver
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assigning.input_items.map((item, i) => (
                        <ItemBadge key={i} item={item} />
                      ))}
                    </div>
                  </div>
                )}

              {/* Distributor select */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase">
                  Select Delivery Partner
                </label>
                {distributors.length === 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="text-xs text-amber-600 font-medium">
                      No distributors available. Please register a distributor
                      first.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Choose a distributor...</option>
                    {distributors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fname} {d.lname} — {d.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl py-5 font-bold"
                  onClick={() => {
                    setAssigning(null);
                    setSelectedDistributor("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-5 font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  onClick={handleAssign}
                  disabled={
                    processingId === assigning?.id || !selectedDistributor
                  }
                >
                  {processingId === assigning?.id
                    ? "Processing..."
                    : "Confirm & Assign ✓"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">Approval History</h2>
          <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black rounded-full uppercase">
            {history.length} Records
          </span>
        </div>
        <Card className="border-none shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-900">
                  {[
                    "Requester",
                    "Role",
                    "Items",
                    "Distributor",
                    "Amount",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold text-sm">
                          {req.fname} {req.lname}
                        </p>
                        <p className="text-[10px] text-gray-400">{req.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full capitalize">
                          {(req.requester_type || "farmer").replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(req.input_items)
                            ? req.input_items
                            : []
                          ).map((item, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-bold uppercase"
                            >
                              {getItemLabel(item)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold">
                        {req.distributor_fname
                          ? `${req.distributor_fname} ${req.distributor_lname}`
                          : "—"}
                      </td>
                      <td className="p-4 font-black text-sm">
                        ₦
                        {parseFloat(
                          req.total_amount || req.total_value || 0,
                        ).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            req.status === "approved"
                              ? "bg-emerald-100 text-emerald-600"
                              : req.status === "delivered"
                                ? "bg-blue-100 text-blue-600"
                                : req.status === "rejected"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-gray-400 italic text-sm"
                    >
                      No approval history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
