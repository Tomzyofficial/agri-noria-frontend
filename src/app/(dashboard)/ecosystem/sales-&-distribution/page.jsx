"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FaTruckMoving,
  FaBoxOpen,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowRight,
  FaWarehouse,
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronRight,
  FaCopy,
  FaUser,
  FaBoxes,
} from "react-icons/fa";
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

export default function SalesDistributionDashboard() {
  const [stats, setStats] = useState({
    activeShipments: 0,
    pendingDeliveries: 0,
    fulfilledOrders: 0,
    warehouseStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ecosystemOrders, setEcosystemOrders] = useState([]);
  const [forwardContracts, setForwardContracts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search & Filter state for Orders
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal management states
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Forms states
  const [warehouseForm, setWarehouseForm] = useState({
    commodity: "Maize",
    quantity: "",
    measuring_scale: "Tons",
    price_per_unit: "",
    warehouse_name: "",
  });

  const [orderForm, setOrderForm] = useState({
    product_name: "Maize Grade A",
    quantity: "",
    price_per_unit: "",
    delivery_address: "",
  });

  const [submittingWarehouse, setSubmittingWarehouse] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/proxy/pipeline/stats/sales");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Failed to fetch sales stats", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchForwardContracts = async () => {
    try {
      const res = await fetch("/api/proxy/pipeline/forward-contracts/sales");
      const data = await res.json();
      if (data.success) setForwardContracts(data.data || []);
    } catch (e) {
      console.error("Failed to fetch forward contracts", e);
    }
  };

  const fetchEcosystemOrders = async () => {
    setLoadingOrders(true);
    try {
      const [ordersRes, distRes] = await Promise.all([
        fetch("/api/proxy/pipeline/buyer-orders/all"),
        fetch("/api/proxy/pipeline/distributors"),
      ]);
      if (ordersRes.ok) {
        const od = await ordersRes.json();
        const validStatuses = [
          "ready_for_sales",
          "paid",
          "assigned",
          "processing",
          "processed",
          "in_progress",
          "delivered",
          "completed",
        ];
        const filteredOrders = (od.data || []).filter(
          (o) =>
            validStatuses.includes(o.status) ||
            o.payment_status === "finance_confirmed"
        );
        setEcosystemOrders(filteredOrders);
      }
      if (distRes.ok) {
        const dd = await distRes.json();
        setDistributors(dd.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch ecosystem orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEcosystemOrders();
    fetchForwardContracts();
  }, []);

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    if (
      !warehouseForm.quantity ||
      !warehouseForm.warehouse_name ||
      !warehouseForm.price_per_unit
    ) {
      return toast.error("Please fill in all fields");
    }
    setSubmittingWarehouse(true);
    try {
      const res = await fetch("/api/proxy/pipeline/warehouse/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warehouseForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Warehouse intake recorded successfully!");
        setShowWarehouseModal(false);
        setWarehouseForm({
          commodity: "Maize",
          quantity: "",
          measuring_scale: "Tons",
          price_per_unit: "",
          warehouse_name: "",
        });
        fetchStats();
      } else {
        toast.error(data.error || "Failed to record intake");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingWarehouse(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (
      !orderForm.quantity ||
      !orderForm.price_per_unit ||
      !orderForm.delivery_address
    ) {
      return toast.error("Please fill in all fields");
    }
    setSubmittingOrder(true);
    try {
      const payload = {
        items: [
          {
            product_id: "00000000-0000-0000-0000-000000000000",
            product_name: orderForm.product_name,
            quantity: parseInt(orderForm.quantity),
            price_per_unit: parseFloat(orderForm.price_per_unit),
          },
        ],
        total_amount:
          parseInt(orderForm.quantity) * parseFloat(orderForm.price_per_unit),
        delivery_address: orderForm.delivery_address,
        status: "paid",
        escrow_status: "held",
      };

      const res = await fetch("/api/proxy/pipeline/buyer-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Manual Ecosystem Order created successfully!");
        setShowOrderModal(false);
        setOrderForm({
          product_name: "Maize Grade A",
          quantity: "",
          price_per_unit: "",
          delivery_address: "",
        });
        fetchEcosystemOrders();
      } else {
        toast.error(data.error || "Failed to create order");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const assignDistributor = async (orderId, distributorId) => {
    if (!distributorId) return toast.error("Please select a distributor");
    try {
      const res = await fetch(
        "/api/proxy/pipeline/buyer-orders/assign-distributor",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            distributor_id: distributorId,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Distributor assigned successfully");
        fetchEcosystemOrders();
      } else {
        toast.error(data.error || "Failed to assign distributor");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(
        `/api/proxy/pipeline/buyer-orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchEcosystemOrders();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const copyOrderId = (id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      toast.info(`Copied #${id.slice(0, 8)} to clipboard`);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ecosystemOrders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.buyer_name &&
          order.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.delivery_address &&
          order.delivery_address
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "paid"
          ? order.status === "paid" || order.status === "ready_for_sales"
          : statusFilter === "assigned"
          ? order.status === "assigned" || !!order.distributor_id
          : statusFilter === "processing"
          ? order.status === "processing" || order.status === "in_progress"
          : statusFilter === "delivered"
          ? order.status === "delivered" || order.status === "completed"
          : true;

      return matchesSearch && matchesStatus;
    });
  }, [ecosystemOrders, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Operational Fulfillment Node
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Sales & <span className="text-blue-400">Distribution</span> Hub
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Platform logistics dispatch, physical warehouse silos, and buyer orders
              secured in guaranteed escrow.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setShowWarehouseModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <FaBoxOpen className="w-4 h-4" />
              <span>Record Intake</span>
            </Button>
            <Button
              onClick={() => setShowOrderModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/25 transition-all text-xs flex items-center gap-2 uppercase tracking-wider"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Direct Order</span>
            </Button>
            <Button
              onClick={() => {
                fetchStats();
                fetchEcosystemOrders();
                fetchForwardContracts();
              }}
              variant="ghost"
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <ModernStatCard
          title="Active Shipments"
          value={loading ? "..." : stats.activeShipments}
          badge="Live Logistics"
          icon={<FaTruckMoving className="w-5 h-5" />}
          gradient="from-blue-500/20 to-blue-600/5"
          borderColor="border-blue-500/30"
          iconBg="bg-blue-500/20 text-blue-400 border border-blue-500/30"
          link="/ecosystem/sales-&-distribution/shipments"
          subtitle="En route across regional delivery corridors"
        />

        <ModernStatCard
          title="Warehouse Stock"
          value={
            loading
              ? "..."
              : `${Number(stats.warehouseStock || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                })} T`
          }
          badge="Grain Reserves"
          icon={<FaWarehouse className="w-5 h-5" />}
          gradient="from-amber-500/20 to-amber-600/5"
          borderColor="border-amber-500/30"
          iconBg="bg-amber-500/20 text-amber-400 border border-amber-500/30"
          link="/ecosystem/sales-&-distribution/warehouse"
          subtitle="Physical aggregation stored in certified silos"
        />

        <ModernStatCard
          title="Fulfilled Orders"
          value={loading ? "..." : stats.fulfilledOrders}
          badge="Escrow Released"
          icon={<FaCheckCircle className="w-5 h-5" />}
          gradient="from-emerald-500/20 to-emerald-600/5"
          borderColor="border-emerald-500/30"
          iconBg="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          subtitle="Successfully delivered to off-takers"
        />
      </div>

      {/* Primary Section: Ecosystem Orders */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ecosystem Orders
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {ecosystemOrders.length} Total
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Fulfill verified off-taker orders locked in secure smart escrow.
            </p>
          </div>

          <Link href="/ecosystem/sales-&-distribution/analytics">
            <Button
              variant="ghost"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2.5 rounded-xl flex items-center gap-2 border border-blue-500/20"
            >
              <span>View Analytics</span>
              <FaArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Orders" },
              { id: "paid", label: "Paid / Ready" },
              { id: "assigned", label: "Assigned" },
              { id: "processing", label: "Processing" },
              { id: "delivered", label: "Delivered" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <FaSearch className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by buyer or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Orders Listing */}
        {loadingOrders ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/60">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-bold">
              Scanning Escrow Ledger...
            </p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const formattedAmount = Number(order.total_amount || 0).toLocaleString();
              const isAssigned = !!order.distributor_id;
              const isEscrowHeld = order.escrow_status === "held";

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-200 space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                          <FaUser className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {order.buyer_name || "Off-taker Order"}
                          </h3>
                        </div>
                      </div>

                      {/* Order ID Pill with Copy */}
                      <button
                        onClick={() => copyOrderId(order.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition-colors"
                        title="Click to copy full ID"
                      >
                        <span>#{order.id.substring(0, 8)}</span>
                        <FaCopy className="w-2.5 h-2.5 text-slate-500" />
                      </button>

                      {/* Status Badges */}
                      <OrderStatusBadge status={order.status} />

                      {isEscrowHeld && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <FaShieldAlt className="w-3 h-3 text-cyan-400" />
                          <span>Escrow Secured</span>
                        </div>
                      )}
                    </div>

                    {/* Logistics Status Indicator / Link */}
                    <div>
                      {isAssigned ? (
                        <Link href="/ecosystem/sales-&-distribution/shipments">
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer">
                            <FaTruckMoving className="w-3.5 h-3.5" />
                            <span>Logistics Active</span>
                            <FaChevronRight className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Distributor</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-1">
                    {/* Value */}
                    <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Settlement Value
                      </p>
                      <p className="text-lg font-black text-emerald-400 mt-1">
                        ₦{formattedAmount}
                      </p>
                    </div>

                    {/* Fulfillment Destination */}
                    <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 lg:col-span-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-slate-500" /> Delivery Address
                      </p>
                      <p className="text-xs font-bold text-slate-200 mt-1 truncate" title={order.delivery_address}>
                        {order.delivery_address || "No address specified"}
                      </p>
                    </div>

                    {/* Items / Quantity */}
                    <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <FaBoxes className="text-slate-500" /> Order Details
                      </p>
                      <p className="text-xs font-bold text-slate-200 mt-1 truncate">
                        {order.items && order.items.length > 0
                          ? `${order.items[0].product_name || "Commodity"} (${order.items[0].quantity} units)`
                          : "Standard Grain Order"}
                      </p>
                    </div>
                  </div>

                  {/* Card Controls Footer: Distributor Assign & Status Update */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Distributor Assignment */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                        Distributor:
                      </span>
                      {order.distributor_id ? (
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                          {distributors.find((d) => d.id === order.distributor_id)?.name ||
                            distributors.find((d) => d.id === order.distributor_id)?.fname ||
                            "Assigned"}
                        </span>
                      ) : (
                        <select
                          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:border-blue-500 focus:outline-none"
                          onChange={(e) => assignDistributor(order.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select Distributor...
                          </option>
                          {distributors.map((d) => (
                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                              {d.name || `${d.fname || ""} ${d.lname || ""}`.trim()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Status Update Control */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                        Process Status:
                      </span>
                      <select
                        className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:border-blue-500 focus:outline-none"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="paid" className="bg-slate-900 text-white">
                          Paid
                        </option>
                        <option value="ready_for_sales" className="bg-slate-900 text-white">
                          Ready For Sales
                        </option>
                        <option value="processing" className="bg-slate-900 text-white">
                          Processing
                        </option>
                        <option value="in_progress" className="bg-slate-900 text-white">
                          In Progress
                        </option>
                        <option value="delivered" className="bg-slate-900 text-white">
                          Delivered
                        </option>
                        <option value="completed" className="bg-slate-900 text-white">
                          Completed
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto text-2xl">
              <FaBoxOpen />
            </div>
            <h3 className="text-lg font-black text-slate-300">
              No Ecosystem Orders Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search criteria or filter tags."
                : "Active marketplace buyer orders will automatically populate here upon escrow deposit."}
            </p>
          </div>
        )}
      </div>

      {/* Pre-Harvest Forward Contracts Section */}
      <div className="space-y-5 pt-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">
              <FaBoxOpen />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pre-Harvest Forward Contracts
            </h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Pre-booked harvest volumes awaiting physical collection and silo aggregation.
          </p>
        </div>

        {forwardContracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {forwardContracts.map((contract, i) => (
              <div
                key={i}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-6 shadow-xl backdrop-blur-md transition-all space-y-4"
              >
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Forward Order
                    </span>
                    <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">
                      {contract.commodity}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-bold">
                      Buyer: {contract.buyer_name}
                      {contract.buyer_phone && ` • ${contract.buyer_phone}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-400">
                      ₦{Number(contract.total_price || 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {contract.quantity_tons} Tons Total
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Escrow State
                    </p>
                    <p className="font-bold text-slate-200 capitalize mt-0.5">
                      {(contract.escrow_status || "Held").replace("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 justify-end">
                      <FaCalendarAlt /> Expected Harvest
                    </p>
                    <p className="font-bold text-slate-200 mt-0.5">
                      {contract.expected_harvest_date
                        ? new Date(contract.expected_harvest_date).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-400">
              No Pre-Harvest Contracts Active
            </p>
            <p className="text-xs text-slate-600">
              Off-takers pre-booking harvest slots will appear here with projected yields.
            </p>
          </div>
        )}
      </div>

      {/* WAREHOUSE INTAKE MODAL */}
      {showWarehouseModal && (
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
                onClick={() => setShowWarehouseModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Commodity / Crop Type
                </label>
                <select
                  value={warehouseForm.commodity}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, commodity: e.target.value })
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
                    value={warehouseForm.quantity}
                    onChange={(e) =>
                      setWarehouseForm({ ...warehouseForm, quantity: e.target.value })
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
                    value={warehouseForm.measuring_scale}
                    onChange={(e) =>
                      setWarehouseForm({
                        ...warehouseForm,
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
                  value={warehouseForm.price_per_unit}
                  onChange={(e) =>
                    setWarehouseForm({
                      ...warehouseForm,
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
                  value={warehouseForm.warehouse_name}
                  onChange={(e) =>
                    setWarehouseForm({
                      ...warehouseForm,
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
                  onClick={() => setShowWarehouseModal(false)}
                  variant="ghost"
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingWarehouse}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider"
                >
                  {submittingWarehouse ? "Saving..." : "Record Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL DIRECT ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-5 text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FaPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Create Direct Ecosystem Order
                  </h3>
                  <p className="text-xs text-slate-400">
                    Log an offline buyer order with secured escrow fulfillment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Product Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maize Grade A"
                  value={orderForm.product_name}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, product_name: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Price / Unit (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={orderForm.price_per_unit}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        price_per_unit: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Fulfillment Delivery Address
                </label>
                <textarea
                  placeholder="Enter full destination address..."
                  value={orderForm.delivery_address}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      delivery_address: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 min-h-[75px]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  variant="ghost"
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider"
                >
                  {submittingOrder ? "Creating..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ModernStatCard({
  title,
  value,
  badge,
  icon,
  gradient,
  borderColor,
  iconBg,
  subtitle,
  link,
}) {
  const CardWrapper = (
    <div
      className={`rounded-3xl bg-gradient-to-br ${gradient} bg-slate-900/90 border ${borderColor} p-6 shadow-xl backdrop-blur-md transition-all duration-200 group ${
        link ? "cursor-pointer hover:scale-[1.01] hover:border-slate-600" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconBg} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
          {badge}
        </span>
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <h3 className="text-3xl font-black text-white tracking-tight mt-1">
        {value}
      </h3>
      {subtitle && (
        <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  return link ? <Link href={link}>{CardWrapper}</Link> : CardWrapper;
}

function OrderStatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "ready_for_sales") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        {status.replace(/_/g, " ")}
      </span>
    );
  }
  if (s === "assigned") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
        Assigned
      </span>
    );
  }
  if (s === "processing" || s === "in_progress") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
        {status.replace(/_/g, " ")}
      </span>
    );
  }
  if (s === "delivered" || s === "completed") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30">
        {status.replace(/_/g, " ")}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
      {status || "Pending"}
    </span>
  );
}
