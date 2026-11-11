"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FaWarehouse,
  FaBoxes,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaMapMarkerAlt,
  FaTag,
  FaChartPie,
  FaBoxOpen,
} from "react-icons/fa";
import { RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

export default function WarehousePage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStock: "0.00",
    capacity: "100.0",
    inFlow: "0.00",
    outFlow: "0.00",
    totalValuation: 0,
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [sortBy, setSortBy] = useState("highest_stock");

  // Modal State
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [submittingIntake, setSubmittingIntake] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    commodity: "Maize",
    quantity: "",
    measuring_scale: "Tons",
    price_per_unit: "",
    warehouse_name: "",
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/proxy/pipeline/warehouse/inventory");
      const data = await res.json();
      if (data.success) {
        const items = data.data || [];
        setInventory(items);

        // Calculate live stats
        let totalTons = 0;
        let inFlowToday = 0;
        let totalVal = 0;
        const today = new Date().toISOString().split("T")[0];

        items.forEach((item) => {
          let qtyInTons = parseFloat(item.quantity) || 0;
          if (item.measuring_scale === "Kg") qtyInTons /= 1000;
          if (item.measuring_scale === "g") qtyInTons /= 1000000;

          totalTons += qtyInTons;

          const unitPrice = parseFloat(item.price_per_unit) || 0;
          const rawQty = parseFloat(item.quantity) || 0;
          totalVal += unitPrice * rawQty;

          const itemDate = new Date(item.created_at).toISOString().split("T")[0];
          if (itemDate === today) {
            inFlowToday += qtyInTons;
          }
        });

        const maxCapacity = 1000; // 1000 Tons max capacity
        const availableCapacity = Math.max(
          0,
          100 - (totalTons / maxCapacity) * 100
        ).toFixed(1);

        setStats({
          totalStock: totalTons.toFixed(2),
          capacity: availableCapacity,
          inFlow: inFlowToday.toFixed(2),
          outFlow: "0.00",
          totalValuation: totalVal,
        });
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      toast.error("Failed to load warehouse inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRemove = async (id, commodityName) => {
    if (
      !confirm(
        `Are you sure you want to remove this ${commodityName || "item"} from stock?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/proxy/pipeline/warehouse/inventory/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item removed from stock");
        fetchInventory();
      } else {
        toast.error(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item", error);
      toast.error("Network error removing item");
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (
      !intakeForm.quantity ||
      !intakeForm.warehouse_name ||
      !intakeForm.price_per_unit
    ) {
      return toast.error("Please fill in all fields");
    }
    setSubmittingIntake(true);
    try {
      const res = await fetch("/api/proxy/pipeline/warehouse/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intakeForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Warehouse intake recorded successfully!");
        setShowIntakeModal(false);
        setIntakeForm({
          commodity: "Maize",
          quantity: "",
          measuring_scale: "Tons",
          price_per_unit: "",
          warehouse_name: "",
        });
        fetchInventory();
      } else {
        toast.error(data.error || "Failed to record intake");
      }
    } catch (err) {
      toast.error("Network error recording intake");
    } finally {
      setSubmittingIntake(false);
    }
  };

  // Filter & Sort inventory
  const filteredInventory = useMemo(() => {
    let result = inventory.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        (item.commodity &&
          item.commodity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.warehouse_name &&
          item.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCommodity =
        selectedCommodity === "all" ||
        (item.commodity &&
          item.commodity.toLowerCase() === selectedCommodity.toLowerCase());

      return matchesSearch && matchesCommodity;
    });

    // Sorting
    result.sort((a, b) => {
      const qtyA = parseFloat(a.quantity) || 0;
      const qtyB = parseFloat(b.quantity) || 0;
      const priceA = (parseFloat(a.price_per_unit) || 0) * qtyA;
      const priceB = (parseFloat(b.price_per_unit) || 0) * qtyB;

      if (sortBy === "highest_stock") return qtyB - qtyA;
      if (sortBy === "lowest_stock") return qtyA - qtyB;
      if (sortBy === "highest_value") return priceB - priceA;
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

    return result;
  }, [inventory, searchQuery, selectedCommodity, sortBy]);

  // Unique commodities for filter tabs
  const commodityList = useMemo(() => {
    const list = new Set();
    inventory.forEach((i) => {
      if (i.commodity) list.add(i.commodity);
    });
    return Array.from(list);
  }, [inventory]);

  const capacityUtilized = Math.min(
    100,
    Math.max(0, 100 - parseFloat(stats.capacity || 100))
  ).toFixed(1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Silo Network Telemetry
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Warehouse <span className="text-amber-400">Inventory</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Real-time commodity reserves, certified physical grain aggregation, and
              silo storage capacity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setShowIntakeModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Record Stock Intake</span>
            </Button>
            <Button
              onClick={fetchInventory}
              variant="ghost"
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
              title="Refresh Inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top 4 Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Stock */}
        <div className="rounded-3xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FaWarehouse className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Total Silo Stock
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Grain Holdings
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight mt-1">
            {stats.totalStock}{" "}
            <span className="text-sm font-bold text-amber-400">Tons</span>
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-2">
            Est. Value:{" "}
            <span className="text-emerald-400">
              ₦{Number(stats.totalValuation).toLocaleString()}
            </span>
          </p>
        </div>

        {/* Capacity Utilization */}
        <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FaChartPie className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {stats.capacity}% Available
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Silo Capacity (1,000 T)
          </p>
          <h3 className="text-3xl font-black text-emerald-400 tracking-tight mt-1">
            {capacityUtilized}%{" "}
            <span className="text-xs font-bold text-slate-400">Filled</span>
          </h3>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${capacityUtilized}%` }}
            />
          </div>
        </div>

        {/* In-Flow Today */}
        <div className="rounded-3xl bg-slate-900/90 border border-blue-500/30 p-6 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FaArrowUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Intake
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            In-Flow Today
          </p>
          <h3 className="text-3xl font-black text-blue-400 tracking-tight mt-1">
            +{stats.inFlow}{" "}
            <span className="text-sm font-bold text-slate-400">Tons</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Incoming aggregation batches
          </p>
        </div>

        {/* Out-Flow Today */}
        <div className="rounded-3xl bg-slate-900/90 border border-rose-500/30 p-6 shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <FaArrowDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Dispatched
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Out-Flow Today
          </p>
          <h3 className="text-3xl font-black text-rose-400 tracking-tight mt-1">
            -{stats.outFlow}{" "}
            <span className="text-sm font-bold text-slate-400">Tons</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Fulfilled buyer shipments
          </p>
        </div>
      </div>

      {/* Filter, Search & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        {/* Commodity Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCommodity("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCommodity === "all"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            All Commodities ({inventory.length})
          </button>
          {commodityList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCommodity(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCommodity.toLowerCase() === c.toLowerCase()
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <FaSearch className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search commodity or depot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="highest_stock">Sort: Highest Stock</option>
            <option value="lowest_stock">Sort: Lowest Stock</option>
            <option value="highest_value">Sort: Highest Value</option>
            <option value="newest">Sort: Newest First</option>
          </select>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      {loading ? (
        <div className="py-24 text-center rounded-3xl bg-slate-900/40 border border-slate-800/60">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-bold">
            Synchronizing Physical Inventory...
          </p>
        </div>
      ) : filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => {
            const qtyNum = parseFloat(item.quantity) || 0;
            const priceNum = parseFloat(item.price_per_unit) || 0;
            const totalHoldingValue = qtyNum * priceNum;

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl backdrop-blur-md transition-all duration-200 flex flex-col justify-between space-y-5 group relative overflow-hidden"
              >
                {/* Ambient glow accent on card hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

                {/* Card Top: Icon & Grade Badge */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <FaWarehouse className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {item.grade || "Export Grade A"}
                    </span>
                  </div>

                  {/* Commodity Title (Modern Sans-Serif) */}
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {item.commodity}
                  </h3>

                  {/* Depot Location */}
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1.5 truncate">
                    <FaMapMarkerAlt className="text-amber-500 shrink-0" />
                    <span className="truncate">
                      {item.warehouse_name || "Central Grain Depot"}
                    </span>
                  </p>

                  {/* Unit Pricing & Valuation */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Price Per Unit
                      </p>
                      <p className="font-bold text-white mt-0.5">
                        ₦{priceNum.toLocaleString()}{" "}
                        <span className="text-[10px] text-slate-400">
                          / {item.measuring_scale || "Ton"}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Batch Valuation
                      </p>
                      <p className="font-bold text-emerald-400 mt-0.5">
                        ₦{totalHoldingValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quantity & Remove Button */}
                <div className="pt-4 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Stock Volume
                    </p>
                    <p className="text-2xl font-black text-white tracking-tight mt-0.5">
                      {qtyNum.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        {item.measuring_scale || "Tons"}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id, item.commodity)}
                    className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                    title="Remove item from stock"
                  >
                    <FaTrashAlt className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto text-3xl">
            <FaBoxes />
          </div>
          <h3 className="text-xl font-black text-slate-300">
            Warehouse Silos Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedCommodity !== "all"
              ? "No inventory matches your active filter criteria."
              : "No physical grains are currently stocked. Deposit new crop intakes using the button below."}
          </p>
          <Button
            onClick={() => setShowIntakeModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
          >
            Record First Intake
          </Button>
        </div>
      )}

      {/* WAREHOUSE INTAKE MODAL */}
      {showIntakeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-5 text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FaBoxOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Record Warehouse Intake
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deposit grain supplies into physical inventory silos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Commodity / Crop Type
                </label>
                <select
                  value={intakeForm.commodity}
                  onChange={(e) =>
                    setIntakeForm({ ...intakeForm, commodity: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Maize">Maize</option>
                  <option value="Rice">Rice</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Cocoa">Cocoa</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50"
                    value={intakeForm.quantity}
                    onChange={(e) =>
                      setIntakeForm({ ...intakeForm, quantity: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Scale Unit
                  </label>
                  <select
                    value={intakeForm.measuring_scale}
                    onChange={(e) =>
                      setIntakeForm({
                        ...intakeForm,
                        measuring_scale: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Tons">Tons</option>
                    <option value="Kg">Kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Price Per Unit (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 450000"
                  value={intakeForm.price_per_unit}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      price_per_unit: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Warehouse Depot Name / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noria Northern Hub (Kano Silo 2)"
                  value={intakeForm.warehouse_name}
                  onChange={(e) =>
                    setIntakeForm({
                      ...intakeForm,
                      warehouse_name: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  variant="ghost"
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingIntake}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider"
                >
                  {submittingIntake ? "Saving..." : "Record Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
