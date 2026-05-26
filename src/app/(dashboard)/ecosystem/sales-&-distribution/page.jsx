"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  FaTruckMoving,
  FaBoxOpen,
  FaRoute,
  FaCheckCircle,
  FaUsers,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SalesDistributionDashboard() {
  const [stats, setStats] = useState({
    activeShipments: 0,
    pendingDeliveries: 0,
    fulfilledOrders: 0,
    warehouseStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ecosystemOrders, setEcosystemOrders] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modal management states
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Forms states
  const [warehouseForm, setWarehouseForm] = useState({
    commodity: "Maize",
    quantity_tons: "",
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

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    if (!warehouseForm.quantity_tons || !warehouseForm.warehouse_name) {
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
          quantity_tons: "",
          warehouse_name: "",
        });
        // Refresh stats
        const statsRes = await fetch("/api/proxy/pipeline/stats/sales");
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);
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
        // Refresh ecosystem orders
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

  useEffect(() => {
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
    fetchStats();
    fetchEcosystemOrders();
  }, []);

  const fetchEcosystemOrders = async () => {
    setLoadingOrders(true);
    try {
      const [ordersRes, distRes] = await Promise.all([
        fetch("/api/proxy/pipeline/buyer-orders/all"),
        fetch("/api/proxy/pipeline/distributors"),
      ]);
      if (ordersRes.ok) {
        const od = await ordersRes.json();
        setEcosystemOrders(od.data || []);
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
        },
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Order assigned successfully");
        fetchEcosystemOrders();
      } else {
        toast.error(data.error || "Failed to assign");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Sales & <span className="text-blue-600">Distribution</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">
            Platform Logistics Hub & Order Fulfillment Center.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Operational Node: Active
          </span>
        </div>
      </div>

      {/* Interactive Sales Entry Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-gray-800">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">
          Operational Actions:
        </h4>
        <Button
          onClick={() => setShowWarehouseModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <FaBoxOpen size={14} /> Record Warehouse Intake
        </Button>
        <Button
          onClick={() => setShowOrderModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <FaCheckCircle size={14} /> Place Direct Order
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Active Shipments"
          value={loading ? "..." : stats.activeShipments}
          icon={<FaTruckMoving />}
          color="text-blue-600"
          bg="bg-blue-50"
          link="/ecosystem/sales-&-distribution/shipments"
        />
        <StatCard
          title="Warehouse Stock"
          value={loading ? "..." : `${stats.warehouseStock || 0} T`}
          icon={<FaBoxOpen />}
          color="text-amber-600"
          bg="bg-amber-50"
          link="/ecosystem/sales-&-distribution/warehouse"
        />
        <StatCard
          title="Fulfilled Orders"
          value={loading ? "..." : stats.fulfilledOrders}
          icon={<FaCheckCircle />}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* Primary Action Section: Ecosystem Orders */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Ecosystem Orders
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Fulfill buyer orders secured in platform escrow.
            </p>
          </div>
          <Link href="/ecosystem/sales-&-distribution/analytics">
            <Button
              variant="ghost"
              className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50"
            >
              View Analytics <FaArrowRight />
            </Button>
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-20 text-center font-black text-gray-300 italic animate-pulse">
            Scanning Ecosystem Ledger...
          </div>
        ) : ecosystemOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {ecosystemOrders.map((order) => (
              <Card
                key={order.id}
                className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-gray-900 p-10 flex flex-col md:flex-row justify-between items-center gap-10 hover:shadow-2xl transition-shadow border-t-8 border-slate-50 dark:border-gray-800"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white">
                      {order.buyer_name}
                    </h3>
                    <span
                      className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {order.status}
                    </span>
                    {order.escrow_status === "held" && (
                      <div className="flex items-center gap-1.5 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        <FaShieldAlt /> Escrow Secured
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Order ID
                      </p>
                      <p className="font-bold text-sm dark:text-gray-300">
                        #{order.id.substring(0, 8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Value
                      </p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        ₦{parseFloat(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Fulfillment Address
                      </p>
                      <p className="font-bold text-sm truncate max-w-[200px] dark:text-gray-300">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {order.escrow_status === "held" && !order.distributor_id ? (
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                      <select
                        id={`dist-${order.id}`}
                        className="bg-transparent border-none outline-none font-black text-sm px-4 pr-10 appearance-none cursor-pointer"
                      >
                        <option value="">Select Logistics Agent...</option>
                        {distributors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() =>
                          assignDistributor(
                            order.id,
                            document.getElementById(`dist-${order.id}`).value,
                          )
                        }
                        className="bg-slate-900 text-white font-black px-10 py-4 rounded-2xl shadow-2xl hover:bg-black uppercase tracking-widest text-[10px]"
                      >
                        Assign
                      </Button>
                    </div>
                  ) : order.distributor_id ? (
                    <Link href="/ecosystem/sales-&-distribution/shipments">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 px-10 py-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.2em] group cursor-pointer hover:bg-emerald-100 transition-colors">
                        <FaTruckMoving
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />{" "}
                        Logistics Active
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 px-10 py-6 rounded-3xl border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      Awaiting Escrow
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-[4rem] border-none shadow-xl bg-white dark:bg-gray-800 p-24 text-center">
            <FaBoxOpen className="text-6xl text-gray-100 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">
              Ecosystem Pipeline Clear
            </h3>
            <p className="text-gray-400 mt-2 max-w-sm mx-auto">
              New buyer orders from the marketplace will appear here once they
              secure funding.
            </p>
          </Card>
        )}
      </div>

      {/* WAREHOUSE INTAKE MODAL */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 max-w-lg w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Warehouse Deposit
              </h3>
              <button
                onClick={() => setShowWarehouseModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-black text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              Add newly aggregated grains or incoming crops to physical stock
              inventory.
            </p>

            <form onSubmit={handleWarehouseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Commodity / Crop
                </label>
                <select
                  value={warehouseForm.commodity}
                  onChange={(e) =>
                    setWarehouseForm({
                      ...warehouseForm,
                      commodity: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                >
                  <option value="Maize">Maize</option>
                  <option value="Rice">Rice</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Cocoa">Cocoa</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Quantity (Tons)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50"
                  value={warehouseForm.quantity_tons}
                  onChange={(e) =>
                    setWarehouseForm({
                      ...warehouseForm,
                      quantity_tons: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Warehouse Depot Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Noria Northern Hub (Kano)"
                  value={warehouseForm.warehouse_name}
                  onChange={(e) =>
                    setWarehouseForm({
                      ...warehouseForm,
                      warehouse_name: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingWarehouse}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
                >
                  {submittingWarehouse ? "Saving..." : "Record Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 max-w-lg w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                New Manual Order
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-black text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              Log an offline buyer sale directly. Status will be pre-paid and
              escrow will be marked held for immediate logistics distribution.
            </p>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Product Details
                </label>
                <input
                  type="text"
                  value={orderForm.product_name}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, product_name: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Fulfillment Delivery Address
                </label>
                <textarea
                  placeholder="Enter destination delivery address..."
                  value={orderForm.delivery_address}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      delivery_address: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-bold focus:outline-none dark:text-white min-h-[80px]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingOrder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
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

function StatCard({ title, value, icon, color, bg, link }) {
  const content = (
    <Card
      className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all group ${link ? "hover:scale-[1.03] cursor-pointer" : ""}`}
    >
      <CardContent className="p-10 flex items-center gap-6">
        <div
          className={`p-6 rounded-[2rem] ${bg} ${color} text-3xl group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {title}
          </p>
          <p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}
