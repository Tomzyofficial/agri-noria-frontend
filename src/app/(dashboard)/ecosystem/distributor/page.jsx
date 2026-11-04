"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
   Truck,
   Package,
   CheckCircle2,
   Clock,
   MapPin,
   Phone,
   Mail,
   ArrowRight,
   ShieldCheck,
   Wallet,
   BarChart3,
   Search,
   Filter,
   AlertCircle,
   RefreshCw,
   Printer,
   Plus,
   Layers,
   ChevronRight,
   XCircle,
   Store,
   Sparkles,
   Tag,
   Coins,
   Check,
   Eye,
   Copy,
} from "lucide-react";
import {
   FaTruckLoading,
   FaCheckCircle,
   FaBoxOpen,
   FaWallet,
   FaChartLine,
   FaExchangeAlt,
   FaArrowDown,
   FaArrowUp,
   FaCoins,
} from "react-icons/fa";
import { toast } from "react-toastify";

const DEFAULT_INVENTORY = [
   { id: "inv-1", name: "Certified Hybrid Maize (SeedCo SC-719)", category: "Seeds", unit: "25kg Bag", price: 45000, stock: 420, inStock: true },
   { id: "inv-2", name: "Certified FARO 44 Paddy Rice Seeds", category: "Seeds", unit: "50kg Bag", price: 60000, stock: 280, inStock: true },
   { id: "inv-3", name: "Indorama Granular Urea (46% Nitrogen)", category: "Fertilizer", unit: "50kg Bag", price: 65000, stock: 650, inStock: true },
   { id: "inv-4", name: "Golden Fertilizer NPK 15:15:15 Premium", category: "Fertilizer", unit: "50kg Bag", price: 68000, stock: 520, inStock: true },
   { id: "inv-5", name: "Heavy-Duty Rotary Tiller (18 HP Diesel)", category: "Mechanical", unit: "Unit", price: 1500000, stock: 14, inStock: true },
   { id: "inv-6", name: "2-Row Mechanical Tractor Planter", category: "Mechanical", unit: "Unit", price: 850000, stock: 8, inStock: true },
   { id: "inv-7", name: "Solar Submersible Water Pump Kit (2.5 HP)", category: "Irrigations", unit: "Complete System", price: 280000, stock: 26, inStock: true },
   { id: "inv-8", name: "Precision Drip Irrigation System (1 Ha)", category: "Irrigations", unit: "Hectare Kit", price: 120000, stock: 45, inStock: true },
   { id: "inv-9", name: "Force-Up Non-Selective Herbicide", category: "Pesticides", unit: "20L Drum", price: 35000, stock: 110, inStock: true },
   { id: "inv-10", name: "Syngenta Broad-Spectrum Insecticide", category: "Pesticides", unit: "1L Bottle", price: 14000, stock: 320, inStock: true },
   { id: "inv-11", name: "Hermetic Multi-Layer Storage Bags", category: "Herbicides", unit: "Pack of 10", price: 18000, stock: 400, inStock: true },
];

export default function DistributorDashboard() {
   const [inputs, setInputs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isUpdating, setIsUpdating] = useState(null);
   const [activeTab, setActiveTab] = useState("deliveries"); // 'deliveries', 'inventory', 'wallet', 'analytics'
   const [deliveryFilter, setDeliveryFilter] = useState("all"); // 'all', 'pending', 'dispatched', 'delivered'
   const [deliverySearch, setDeliverySearch] = useState("");

   const copyWaybill = (id) => {
      const code = `WB-${id.slice(0, 8).toUpperCase()}`;
      try {
         navigator.clipboard.writeText(code);
         toast.info(`Waybill #${code} copied to clipboard!`);
      } catch {
         toast.info(`Waybill #${code}`);
      }
   };

   // Modals state
   const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
   const [deliverModalOrder, setDeliverModalOrder] = useState(null);
   const [waybillNote, setWaybillNote] = useState("");
   const [driverPhone, setDriverPhone] = useState("");
   const [inventoryList, setInventoryList] = useState(DEFAULT_INVENTORY);
   const [inventorySearch, setInventorySearch] = useState("");
   const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");

   // Wallet & Stats states
   const [walletData, setWalletData] = useState(null);
   const [statsData, setStatsData] = useState(null);
   const [loadingWallet, setLoadingWallet] = useState(false);
   const [loadingStats, setLoadingStats] = useState(false);

   useEffect(() => {
      fetchInputs();
      fetchWallet();
      fetchStats();
   }, []);

   const fetchInputs = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/inputs/distributor");
         if (res.ok) {
            const data = await res.json();
            setInputs(data.data || []);
         }
      } catch (err) {
         toast.error("Failed to load assigned deliveries");
      } finally {
         setLoading(false);
      }
   };

   const fetchWallet = async () => {
      setLoadingWallet(true);
      try {
         const res = await fetch("/api/proxy/pipeline/wallet?type=distributor");
         if (res.ok) {
            const data = await res.json();
            setWalletData(data.data || null);
         }
      } catch (err) {
         console.error("Failed to load wallet", err);
      } finally {
         setLoadingWallet(false);
      }
   };

   const fetchStats = async () => {
      setLoadingStats(true);
      try {
         const res = await fetch("/api/proxy/pipeline/distributor/stats");
         if (res.ok) {
            const data = await res.json();
            setStatsData(data.data || null);
         }
      } catch (err) {
         console.error("Failed to load stats", err);
      } finally {
         setLoadingStats(false);
      }
   };

   const handleUpdateStatus = async (id, status) => {
      setIsUpdating(id);
      try {
         const res = await fetch(`/api/proxy/pipeline/inputs/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
         });
         if (res.ok) {
            toast.success(
               status === "dispatched"
                  ? "🚚 Order marked as Dispatched & In Transit!"
                  : "✅ Delivery confirmed at farm gate! Escrow payout queued."
            );
            setInputs((prev) =>
               prev.map((req) => (req.id === id ? { ...req, items_status: status } : req))
            );
            setDispatchModalOrder(null);
            setDeliverModalOrder(null);
            setWaybillNote("");
            setDriverPhone("");
            fetchWallet();
            fetchStats();
         } else {
            toast.error("Failed to update status");
         }
      } catch {
         toast.error("Network error");
      } finally {
         setIsUpdating(null);
      }
   };

   const toggleInventoryStock = (id) => {
      setInventoryList((prev) =>
         prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
      );
      toast.info("Stock availability updated");
   };

   // Delivery filters & metrics
   const pendingDeliveries = inputs.filter(
      (r) => r.items_status !== "delivered" && r.items_status !== "dispatched"
   ).length;
   const activeDispatches = inputs.filter((r) => r.items_status === "dispatched").length;
   const completedDeliveries = inputs.filter((r) => r.items_status === "delivered").length;
   const totalValueHandled = inputs.reduce(
      (acc, r) => acc + parseFloat(r.total_value || r.total_amount || 0),
      0
   );

   const filteredInputs = inputs.filter((r) => {
      if (deliveryFilter === "pending") {
         if (r.items_status === "delivered" || r.items_status === "dispatched") return false;
      } else if (deliveryFilter === "dispatched") {
         if (r.items_status !== "dispatched") return false;
      } else if (deliveryFilter === "delivered") {
         if (r.items_status !== "delivered") return false;
      }

      if (deliverySearch.trim()) {
         const q = deliverySearch.toLowerCase();
         const farmer = `${r.farmer_fname || ""} ${r.farmer_lname || ""}`.toLowerCase();
         const cluster = (r.cluster_name || "").toLowerCase();
         const region = (r.region || "").toLowerCase();
         const waybill = (r.id || "").toLowerCase();
         const pkg = (r.package_name || "").toLowerCase();
         return (
            farmer.includes(q) ||
            cluster.includes(q) ||
            region.includes(q) ||
            waybill.includes(q) ||
            pkg.includes(q)
         );
      }
      return true;
   });

   const filteredInventory = inventoryList.filter((item) => {
      const matchQuery =
         !inventorySearch ||
         item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
         item.category.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCat =
         inventoryCategoryFilter === "all" ||
         item.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
      return matchQuery && matchCat;
   });

   return (
      <div className="space-y-8 pb-20 max-w-7xl mx-auto">
         {/* Premium Modern Header */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
            <div>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  <span>Ecosystem Agro-Distribution</span>
                  <span>/</span>
                  <span className="text-slate-400">Logistics & Supply Hub</span>
               </div>
               <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Partner <span className="text-amber-500">Distribution Portal</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
                  Manage assigned program input orders, track multi-stage logistics, verify field deliveries, and release escrow payouts.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  onClick={() => {
                     fetchInputs();
                     fetchWallet();
                     fetchStats();
                  }}
                  className="rounded-2xl px-4 py-2.5 text-xs font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
               >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Refresh Manifest
               </Button>
               <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-2 shadow-xs">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Fleet Active
               </div>
            </div>
         </div>

         {/* Top Stats Overview */}
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 bg-white dark:bg-slate-900/90 shadow-xs hover:border-blue-500/40 transition">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                     Awaiting Dispatch
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                     <Package className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingDeliveries}</p>
               <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Preparing at warehouse
               </p>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 bg-white dark:bg-slate-900/90 shadow-xs hover:border-amber-500/40 transition">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                     Active In-Transit
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                     <Truck className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-slate-900 dark:text-white">{activeDispatches}</p>
               <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  En route to cluster
               </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 bg-white dark:bg-slate-900/90 shadow-xs hover:border-emerald-500/40 transition">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                     Completed
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                     <CheckCircle2 className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-slate-900 dark:text-white">{completedDeliveries}</p>
               <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Farm gate verified
               </p>
            </div>

            <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/5 bg-white dark:bg-slate-900/90 shadow-xs hover:border-purple-500/40 transition">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                     Total Value
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                     <Coins className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-xl font-black text-slate-900 dark:text-white">
                  ₦{(totalValueHandled / 1000000).toFixed(1)}M
               </p>
               <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                  Cumulative orders
               </p>
            </div>

            <div className="p-4 rounded-2xl border border-teal-500/25 bg-teal-500/5 bg-white dark:bg-slate-900/90 shadow-xs hover:border-teal-500/40 transition">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                     Stock Catalog
                  </span>
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                     <Store className="w-4 h-4" />
                  </div>
               </div>
               <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {inventoryList.filter((i) => i.inStock).length}
               </p>
               <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                  Available in catalog
               </p>
            </div>
         </div>

         {/* Premium Navigation Tabs */}
         <div className="flex bg-slate-100/90 dark:bg-slate-900 p-1.5 rounded-2xl max-w-3xl border border-slate-200/80 dark:border-slate-800 shadow-inner overflow-x-auto gap-1">
            <button
               onClick={() => setActiveTab("deliveries")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "deliveries"
                     ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                     : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
               }`}
            >
               <Truck className="w-4 h-4" />
               Deliveries & Orders
               {pendingDeliveries + activeDispatches > 0 && (
                  <span className="ml-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                     {pendingDeliveries + activeDispatches}
                  </span>
               )}
            </button>

            <button
               onClick={() => setActiveTab("inventory")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "inventory"
                     ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                     : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
               }`}
            >
               <Store className="w-4 h-4" />
               Stock & Inventory
            </button>

            <button
               onClick={() => setActiveTab("wallet")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "wallet"
                     ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                     : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
               }`}
            >
               <FaWallet size={13} />
               Wallet & Escrow
            </button>

            <button
               onClick={() => setActiveTab("analytics")}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === "analytics"
                     ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                     : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
               }`}
            >
               <FaChartLine size={13} />
               Analytics
            </button>
         </div>

         {/* ======================================================== */}
         {/* TAB 1: DELIVERIES & ORDERS                               */}
         {/* ======================================================== */}
         {activeTab === "deliveries" && (
            <div className="space-y-6">
               {/* Controls Bar: Filters & Live Search */}
               <div className="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                     <button
                        type="button"
                        onClick={() => setDeliveryFilter("all")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                           deliveryFilter === "all"
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                     >
                        <span>All Orders</span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10 dark:bg-white/10 font-mono font-bold">
                           {inputs.length}
                        </span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setDeliveryFilter("pending")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                           deliveryFilter === "pending"
                              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100"
                        }`}
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Preparing ({pendingDeliveries})</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setDeliveryFilter("dispatched")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                           deliveryFilter === "dispatched"
                              ? "bg-blue-600 text-white font-black shadow-xs"
                              : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100"
                        }`}
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>In Transit ({activeDispatches})</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setDeliveryFilter("delivered")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                           deliveryFilter === "delivered"
                              ? "bg-emerald-600 text-white font-black shadow-xs"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100"
                        }`}
                     >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Delivered ({completedDeliveries})</span>
                     </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative min-w-[240px] sm:w-72">
                     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input
                        type="text"
                        value={deliverySearch}
                        onChange={(e) => setDeliverySearch(e.target.value)}
                        placeholder="Search recipient, cluster, waybill..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500/50"
                     />
                     {deliverySearch && (
                        <button
                           onClick={() => setDeliverySearch("")}
                           className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                        >
                           ×
                        </button>
                     )}
                  </div>
               </div>

               {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-3">
                     <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
                     <p className="text-xs font-bold text-slate-400">Loading delivery manifests...</p>
                  </div>
               ) : filteredInputs.length === 0 ? (
                  <div className="p-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                     <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Package className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Deliveries Found</h3>
                     <p className="text-slate-500 text-xs mt-1">
                        {deliverySearch
                           ? `No delivery orders matched "${deliverySearch}".`
                           : deliveryFilter !== "all"
                           ? `No delivery orders match the "${deliveryFilter}" status filter.`
                           : "You currently have no orders assigned for distribution."}
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {filteredInputs.map((req) => {
                        const isDelivered = req.items_status === "delivered";
                        const isDispatched = req.items_status === "dispatched";
                        const isPreparing = !isDelivered && !isDispatched;

                        const itemsList = Array.isArray(req.input_items) ? req.input_items : [];

                        return (
                           <div
                              key={req.id}
                              className="group bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                           >
                              {/* Subtle top indicator bar */}
                              <div
                                 className={`h-1.5 w-full ${
                                    isDelivered
                                       ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                       : isDispatched
                                       ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                       : "bg-gradient-to-r from-amber-500 to-orange-500"
                                 }`}
                              />

                              {/* Sleek Executive Header */}
                              <div className="p-5 pb-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                                 {/* Status Pill */}
                                 <div className="flex items-center gap-2">
                                    {isDelivered ? (
                                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                          Confirmed Delivered
                                       </span>
                                    ) : isDispatched ? (
                                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                          <span className="relative flex h-2 w-2">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                          </span>
                                          <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                          In Transit to Cluster
                                       </span>
                                    ) : (
                                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                          <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                          Assigned / Preparing
                                       </span>
                                    )}
                                 </div>

                                 {/* Waybill & Date Monospace Pill with Copy Action */}
                                 <div className="flex items-center gap-2">
                                    <button
                                       type="button"
                                       onClick={() => copyWaybill(req.id)}
                                       title="Click to copy waybill code"
                                       className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-amber-500/50 transition cursor-pointer group/wb"
                                    >
                                       <span className="text-slate-400 font-sans text-[10px]">WB:</span>
                                       <span>#{req.id.slice(0, 8).toUpperCase()}</span>
                                       <Copy className="w-3 h-3 text-slate-400 group-hover/wb:text-amber-500 transition-colors ml-0.5" />
                                    </button>
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                       <Clock className="w-3 h-3 text-slate-400" />
                                       {new Date(req.created_at).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                       })}
                                    </span>
                                 </div>
                              </div>

                              {/* Modern Logistics Milestone Stepper */}
                              <div className="px-6 py-4 bg-slate-50/40 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/60">
                                 <div className="relative">
                                    {/* Background connecting bar */}
                                    <div className="absolute top-3.5 left-6 right-6 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />
                                    {/* Active filled connecting bar */}
                                    <div
                                       className={`absolute top-3.5 left-6 h-1 rounded-full z-0 transition-all duration-500 ${
                                          isDelivered
                                             ? "right-6 bg-emerald-500"
                                             : isDispatched
                                             ? "w-1/2 bg-blue-500"
                                             : "w-8 bg-amber-500"
                                       }`}
                                    />

                                    {/* 3 Step nodes */}
                                    <div className="relative z-10 flex items-center justify-between text-xs">
                                       {/* Step 1: Assigned */}
                                       <div className="flex flex-col items-center">
                                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900">
                                             <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          </div>
                                          <span className="mt-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                             1. Assigned
                                          </span>
                                       </div>

                                       {/* Step 2: Dispatched */}
                                       <div className="flex flex-col items-center">
                                          <div
                                             className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ring-4 ring-white dark:ring-slate-900 transition-colors ${
                                                isDispatched || isDelivered
                                                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                                   : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                                             }`}
                                          >
                                             {isDispatched || isDelivered ? (
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                             ) : (
                                                <span className="text-[10px]">2</span>
                                             )}
                                          </div>
                                          <span
                                             className={`mt-1.5 text-[10px] font-black uppercase tracking-wider ${
                                                isDispatched || isDelivered
                                                   ? "text-blue-600 dark:text-blue-400"
                                                   : "text-slate-400 dark:text-slate-500"
                                             }`}
                                          >
                                             2. In Transit
                                          </span>
                                       </div>

                                       {/* Step 3: Delivered */}
                                       <div className="flex flex-col items-center">
                                          <div
                                             className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ring-4 ring-white dark:ring-slate-900 transition-colors ${
                                                isDelivered
                                                   ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                                                   : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                                             }`}
                                          >
                                             {isDelivered ? (
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                             ) : (
                                                <span className="text-[10px]">3</span>
                                             )}
                                          </div>
                                          <span
                                             className={`mt-1.5 text-[10px] font-black uppercase tracking-wider ${
                                                isDelivered
                                                   ? "text-emerald-600 dark:text-emerald-400"
                                                   : "text-slate-400 dark:text-slate-500"
                                             }`}
                                          >
                                             3. Farm Gate
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Card Content Body */}
                              <div className="p-6 space-y-5">
                                 {/* Recipient & Destination Box */}
                                 <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5 min-w-0">
                                       {/* Avatar / Recipient Initials */}
                                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                          {((req.farmer_fname?.[0] || "") + (req.farmer_lname?.[0] || "")).toUpperCase() ||
                                             "RC"}
                                       </div>
                                       <div className="min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                             <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                                                {req.farmer_fname} {req.farmer_lname}
                                             </h3>
                                             <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                   req.is_cluster_request || req.requester_type === "cluster_manager"
                                                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                }`}
                                             >
                                                {req.is_cluster_request || req.requester_type === "cluster_manager"
                                                   ? "Cluster Supervisor"
                                                   : "Individual Farmer"}
                                             </span>
                                          </div>

                                          {req.cluster_name && (
                                             <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                Cluster:{" "}
                                                <span className="underline decoration-purple-300 underline-offset-2">
                                                   {req.cluster_name}
                                                </span>
                                             </p>
                                          )}

                                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                                             <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                             <span className="font-medium truncate">
                                                {req.region || "Regional Destination Hub"}
                                             </span>
                                          </p>
                                       </div>
                                    </div>

                                    {/* Call Action Button */}
                                    {req.farmer_phone ? (
                                       <a
                                          href={`tel:${req.farmer_phone}`}
                                          title={`Call Recipient: ${req.farmer_phone}`}
                                          className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 shrink-0"
                                       >
                                          <Phone className="w-4 h-4" />
                                       </a>
                                    ) : (
                                       <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                                          <Phone className="w-4 h-4" />
                                       </div>
                                    )}
                                 </div>

                                 {/* Assigned Materials Section */}
                                 <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                          <Package className="w-3.5 h-3.5 text-amber-500" />
                                          Assigned Materials for Dispatch
                                       </span>
                                       <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                                          {itemsList.length} Items Total
                                       </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                       {itemsList.map((it, idx) => {
                                          const label = typeof it === "object" && it !== null ? it.name : it;
                                          const labelLower = String(label).toLowerCase();
                                          let emoji = "📦";
                                          if (
                                             labelLower.includes("seed") ||
                                             labelLower.includes("maize") ||
                                             labelLower.includes("rice")
                                          )
                                             emoji = "🌱";
                                          else if (
                                             labelLower.includes("fertilizer") ||
                                             labelLower.includes("urea") ||
                                             labelLower.includes("npk")
                                          )
                                             emoji = "🧪";
                                          else if (
                                             labelLower.includes("tractor") ||
                                             labelLower.includes("tiller") ||
                                             labelLower.includes("mechanical")
                                          )
                                             emoji = "🚜";
                                          else if (
                                             labelLower.includes("water") ||
                                             labelLower.includes("pump") ||
                                             labelLower.includes("drip") ||
                                             labelLower.includes("irrigat")
                                          )
                                             emoji = "💧";
                                          else if (
                                             labelLower.includes("pest") ||
                                             labelLower.includes("herb") ||
                                             labelLower.includes("insect")
                                          )
                                             emoji = "🛡️";

                                          return (
                                             <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                                             >
                                                <span>{emoji}</span>
                                                <span>{label}</span>
                                             </span>
                                          );
                                       })}
                                       {itemsList.length === 0 && (
                                          <span className="text-xs italic text-slate-400">
                                             Standard Program Package Allocation
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Executive Financial & Farmland Reach Tiles */}
                                 <div className="grid grid-cols-2 gap-3.5">
                                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                                       <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800/70 dark:text-emerald-400/70">
                                             Escrow Order Value
                                          </span>
                                          <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                       </div>
                                       <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                          ₦{parseFloat(req.total_value || req.total_amount || 0).toLocaleString()}
                                       </p>
                                       <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 font-medium">
                                          Guaranteed in escrow
                                       </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                                       <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                                             Farmland Reach
                                          </span>
                                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                       </div>
                                       <p className="text-lg font-black text-amber-700 dark:text-amber-400">
                                          {parseFloat(req.farm_size_hectares || 0).toFixed(1)}{" "}
                                          <span className="text-xs font-bold">Ha</span>
                                       </p>
                                       <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 font-medium">
                                          Cultivation target
                                       </p>
                                    </div>
                                 </div>

                                 {/* Action Footer */}
                                 <div className="pt-2">
                                    {isDelivered ? (
                                       <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                                          <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                             <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                             Farm-Gate Delivery Verified
                                          </span>
                                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                                             Escrow Queued
                                          </span>
                                       </div>
                                    ) : isDispatched ? (
                                       <div className="space-y-2">
                                          <Button
                                             onClick={() => setDeliverModalOrder(req)}
                                             className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-2xl cursor-pointer shadow-lg shadow-emerald-600/20 text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                                          >
                                             <CheckCircle2 className="w-4 h-4" />
                                             Confirm Farm-Gate Delivery
                                          </Button>
                                          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                             Materials in transit • Confirm once handed over to cluster supervisor
                                          </p>
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-3">
                                          <Button
                                             onClick={() => setDispatchModalOrder(req)}
                                             className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3 rounded-2xl cursor-pointer shadow-lg shadow-amber-500/25 text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                                          >
                                             <Truck className="w-4 h-4" />
                                             Mark Dispatched & In Transit
                                          </Button>
                                          <Button
                                             onClick={() => setDeliverModalOrder(req)}
                                             variant="outline"
                                             className="rounded-2xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold py-3 px-4 cursor-pointer"
                                          >
                                             Direct Delivered
                                          </Button>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* ======================================================== */}
         {/* TAB 2: MY STOCK & INVENTORY (PRODUCTS SOLD)             */}
         {/* ======================================================== */}
         {activeTab === "inventory" && (
            <div className="space-y-6">
               {/* Controls Bar */}
               <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="relative flex-1">
                     <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                     <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search products by brand, chemical name, or specification..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                     />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                     {["all", "Seeds", "Fertilizer", "Mechanical", "Irrigations", "Pesticides"].map((cat) => (
                        <button
                           key={cat}
                           type="button"
                           onClick={() => setInventoryCategoryFilter(cat)}
                           className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer shrink-0 ${
                              inventoryCategoryFilter === cat
                                 ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                                 : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
                           }`}
                        >
                           {cat === "all" ? "All Products" : cat}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Inventory Table / Grid */}
               <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950/40">
                     <div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                           <Store className="w-4 h-4 text-amber-500" />
                           Dealership Catalog & Input Products Sold
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                           These materials are broadcast to institutional program directors and farmer clusters for assignment.
                        </p>
                     </div>
                     <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800">
                        {filteredInventory.length} Products Stocked
                     </span>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-xs">
                        <thead>
                           <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-950/60">
                              <th className="p-4 font-bold text-gray-400 uppercase">Product & Brand</th>
                              <th className="p-4 font-bold text-gray-400 uppercase">Category</th>
                              <th className="p-4 font-bold text-gray-400 uppercase">Packaging Unit</th>
                              <th className="p-4 font-bold text-gray-400 uppercase">Price / Unit</th>
                              <th className="p-4 font-bold text-gray-400 uppercase">Stock Quantity</th>
                              <th className="p-4 font-bold text-gray-400 uppercase">Availability</th>
                              <th className="p-4 font-bold text-gray-400 uppercase text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                           {filteredInventory.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                                 <td className="p-4">
                                    <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                    <span className="text-[10px] text-gray-400 font-mono">SKU-{item.id.toUpperCase()}</span>
                                 </td>
                                 <td className="p-4">
                                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                       {item.category}
                                    </span>
                                 </td>
                                 <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{item.unit}</td>
                                 <td className="p-4 font-black text-gray-900 dark:text-white">
                                    ₦{item.price.toLocaleString()}
                                 </td>
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                                    {item.stock} {item.unit.toLowerCase().includes("bag") ? "bags" : "units"}
                                 </td>
                                 <td className="p-4">
                                    <span
                                       className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                          item.inStock
                                             ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                             : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                       }`}
                                    >
                                       {item.inStock ? "In Stock ✓" : "Out of Stock"}
                                    </span>
                                 </td>
                                 <td className="p-4 text-right">
                                    <button
                                       type="button"
                                       onClick={() => toggleInventoryStock(item.id)}
                                       className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                                    >
                                       {item.inStock ? "Set Out of Stock" : "Mark In Stock"}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* ======================================================== */}
         {/* TAB 3: WALLET & ESCROW LEDGER                            */}
         {/* ======================================================== */}
         {activeTab === "wallet" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: Glassmorphic Debit Card & Withdrawal Options */}
               <div className="lg:col-span-1 space-y-6">
                  {loadingWallet ? (
                     <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                  ) : (
                     <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12" />
                        <div className="flex justify-between items-start mb-12">
                           <div>
                              <p className="text-[10px] uppercase tracking-widest font-black opacity-80">
                                 DISTRIBUTOR ESCROW WALLET
                              </p>
                              <h4 className="text-sm font-bold mt-1">AgriNoria Settlement</h4>
                           </div>
                           <FaCoins size={28} className="text-amber-100" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                              Available Settlement Balance
                           </p>
                           <h2 className="text-3xl font-black tracking-tight">
                              ₦
                              {(walletData?.wallet?.balance
                                 ? parseFloat(walletData.wallet.balance)
                                 : 0.0
                              ).toLocaleString()}
                           </h2>
                        </div>
                        <div className="mt-10 flex justify-between items-end border-t border-white/20 pt-4">
                           <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-60">Wallet ID</p>
                              <p className="text-xs font-mono font-bold mt-0.5 opacity-90">
                                 {walletData?.wallet?.id
                                    ? `${walletData.wallet.id.slice(0, 8)}...${walletData.wallet.id.slice(-6)}`
                                    : "Active"}
                              </p>
                           </div>
                           <div className="text-right">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mt-0.5">
                                 Settlement Active
                              </span>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl space-y-3">
                     <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold uppercase tracking-widest text-xs">
                        <FaCoins /> Payout Disbursement Flow
                     </div>
                     <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed font-medium">
                        When you mark orders as delivered at the farm gate, institutional finance is notified to authorize the release of escrow funds into your wallet.
                     </p>
                  </div>
               </div>

               {/* Right Column: Ledger / Transaction History */}
               <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
                     <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div>
                           <h3 className="font-black text-lg text-gray-900 dark:text-white">
                              Ecosystem Disbursement Ledger
                           </h3>
                           <p className="text-xs text-gray-500 mt-0.5">
                              Complete record of program payouts and credit releases
                           </p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                           {(walletData?.transactions || []).length} Records
                        </span>
                     </div>
                     <CardContent className="p-0">
                        {loadingWallet ? (
                           <div className="space-y-4 p-6">
                              {[1, 2, 3].map((i) => (
                                 <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                              ))}
                           </div>
                        ) : (walletData?.transactions || []).length === 0 ? (
                           <div className="text-center py-20">
                              <FaExchangeAlt size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">
                                 No transactions recorded yet
                              </p>
                           </div>
                        ) : (
                           <div className="divide-y divide-gray-100 dark:divide-gray-800">
                              {walletData.transactions.map((tx) => (
                                 <div
                                    key={tx.id}
                                    className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div
                                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                             tx.type === "credit" || tx.type === "deposit"
                                                ? "bg-green-50 dark:bg-green-950/20 text-green-600"
                                                : "bg-red-50 dark:bg-red-950/20 text-red-600"
                                          }`}
                                       >
                                          {tx.type === "credit" || tx.type === "deposit" ? (
                                             <FaArrowDown size={14} />
                                          ) : (
                                             <FaArrowUp size={14} />
                                          )}
                                       </div>
                                       <div>
                                          <p className="font-bold text-sm text-gray-900 dark:text-white capitalize">
                                             {tx.description || tx.type}
                                          </p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                             {new Date(tx.created_at).toLocaleDateString()}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p
                                          className={`font-black text-base ${
                                             tx.type === "credit" || tx.type === "deposit"
                                                ? "text-green-600"
                                                : "text-red-600"
                                          }`}
                                       >
                                          {tx.type === "credit" || tx.type === "deposit" ? "+" : "-"}₦
                                          {parseFloat(tx.amount).toLocaleString()}
                                       </p>
                                       <span className="inline-flex text-[9px] font-black uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 mt-1">
                                          {tx.status || "Completed"}
                                       </span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>
            </div>
         )}

         {/* ======================================================== */}
         {/* TAB 4: ANALYTICS & REPORTS                               */}
         {/* ======================================================== */}
         {activeTab === "analytics" && (
            <div className="space-y-8">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     {
                        label: "Total Assigned Orders",
                        value: inputs.length,
                        icon: <FaBoxOpen />,
                        color: "blue",
                     },
                     {
                        label: "Delivered at Farm Gate",
                        value: completedDeliveries,
                        icon: <FaCheckCircle />,
                        color: "emerald",
                     },
                     {
                        label: "Gross Handled Value",
                        value: `₦${totalValueHandled.toLocaleString()}`,
                        icon: <FaCoins />,
                        color: "amber",
                     },
                     {
                        label: "Active In Transit",
                        value: activeDispatches,
                        icon: <FaTruckLoading />,
                        color: "purple",
                     },
                  ].map((metric, i) => (
                     <Card
                        key={i}
                        className="border-none shadow-sm bg-white dark:bg-gray-950 overflow-hidden relative group"
                     >
                        <CardContent className="p-5">
                           <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 text-amber-600 flex items-center justify-center mb-3">
                              {metric.icon}
                           </div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {metric.label}
                           </p>
                           <p className="text-2xl font-black mt-0.5 text-gray-900 dark:text-white">
                              {metric.value}
                           </p>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         )}

         {/* Modal: Confirm Dispatch */}
         {dispatchModalOrder && (
            <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
               <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                     <div>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                              <Truck className="w-4 h-4" />
                           </div>
                           <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              Dispatch Input Requisition
                           </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                           Waybill #{dispatchModalOrder.id.slice(0, 8).toUpperCase()} • {dispatchModalOrder.farmer_fname} {dispatchModalOrder.farmer_lname}
                        </p>
                     </div>
                     <button
                        type="button"
                        onClick={() => setDispatchModalOrder(null)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                     >
                        <XCircle className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 text-xs space-y-1.5">
                     <p className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Destination: {dispatchModalOrder.region || "Regional Destination Hub"}
                     </p>
                     <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                        Transitioning to &quot;In Transit&quot; dispatches an in-app and email notification to the recipient and cluster supervisor to anticipate arrival.
                     </p>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                           Driver / Haulage Courier Phone (Optional)
                        </label>
                        <input
                           type="tel"
                           value={driverPhone}
                           onChange={(e) => setDriverPhone(e.target.value)}
                           placeholder="e.g. +234 812 345 6789"
                           className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                           Waybill Notes / Vehicle Registration (Optional)
                        </label>
                        <input
                           type="text"
                           value={waybillNote}
                           onChange={(e) => setWaybillNote(e.target.value)}
                           placeholder="e.g. Toyota Dyna Van KRD-291XA"
                           className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                     <Button
                        variant="outline"
                        onClick={() => setDispatchModalOrder(null)}
                        className="flex-1 rounded-xl text-xs font-bold py-2.5 cursor-pointer border-slate-200 dark:border-slate-800"
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleUpdateStatus(dispatchModalOrder.id, "dispatched")}
                        disabled={isUpdating === dispatchModalOrder.id}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer shadow-md shadow-blue-500/25"
                     >
                        {isUpdating === dispatchModalOrder.id ? "Dispatching..." : "Confirm Dispatch 🚚"}
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* Modal: Confirm Delivery */}
         {deliverModalOrder && (
            <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
               <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                     <div>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                           <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              Confirm Farm-Gate Delivery
                           </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                           Waybill #{deliverModalOrder.id.slice(0, 8).toUpperCase()} • {deliverModalOrder.farmer_fname} {deliverModalOrder.farmer_lname}
                        </p>
                     </div>
                     <button
                        type="button"
                        onClick={() => setDeliverModalOrder(null)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                     >
                        <XCircle className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1.5">
                     <p className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Trigger Escrow Payout Authorization
                     </p>
                     <p className="text-emerald-700 dark:text-emerald-300 text-[11px] leading-relaxed">
                        Confirming delivery indicates that all assigned input materials have reached the recipient at the farm gate. Institutional Finance will receive this delivery verification in Stage 3 for escrow fund release.
                     </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-2">
                     <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Escrow Settlement</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                           ₦{parseFloat(deliverModalOrder.total_value || deliverModalOrder.total_amount || 0).toLocaleString()}
                        </span>
                     </div>
                     <div className="flex justify-between text-slate-500">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Recipient Entity</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                           {deliverModalOrder.cluster_name ? `Cluster: ${deliverModalOrder.cluster_name}` : "Direct Farmer"}
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                     <Button
                        variant="outline"
                        onClick={() => setDeliverModalOrder(null)}
                        className="flex-1 rounded-xl text-xs font-bold py-2.5 cursor-pointer border-slate-200 dark:border-slate-800"
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => handleUpdateStatus(deliverModalOrder.id, "delivered")}
                        disabled={isUpdating === deliverModalOrder.id}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer shadow-md shadow-emerald-500/25"
                     >
                        {isUpdating === deliverModalOrder.id ? "Processing..." : "Confirm Delivery & Queue Escrow"}
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
