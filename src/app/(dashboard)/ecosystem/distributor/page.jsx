"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
   Truck,
   Package,
   CheckCircle2,
   Clock,
   ArrowRight,
   ShieldCheck,
   ShieldAlert,
   Wallet,
   BarChart3,
   RefreshCw,
   Store,
   Sparkles,
   Coins,
   Lock,
   FileText,
   Check,
   Eye,
   Layers,
} from "lucide-react";
import { FaTruckLoading, FaWallet, FaChartLine } from "react-icons/fa6";
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
   const [isApproved, setIsApproved] = useState(false);
   const [walletData, setWalletData] = useState(null);
   const [statsData, setStatsData] = useState(null);
   const [inventoryList, setInventoryList] = useState(DEFAULT_INVENTORY);

   useEffect(() => {
      fetchInputs();
      fetchWallet();
      fetchStats();
      fetchSession();
   }, []);

   const fetchSession = async (showToast = false) => {
      try {
         const res = await fetch("/api/auth/session");
         if (res.ok) {
            const data = await res.json();
            const approved = data?.approval_status === "approved";
            setIsApproved(approved);
            if (showToast) {
               if (approved) {
                  toast.success("Dealership accredited and verified!");
               } else {
                  toast.info("Dealership is still awaiting SuperAdmin accreditation.");
               }
            }
         }
      } catch (e) {
         console.warn("Failed to fetch session:", e);
      }
   };

   const fetchInputs = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/inputs/distributor");
         if (res.ok) {
            const data = await res.json();
            setInputs(data.data || []);
         }
      } catch (err) {
         console.warn("Failed to load assigned deliveries");
      } finally {
         setLoading(false);
      }
   };

   const fetchWallet = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/wallet?type=distributor");
         if (res.ok) {
            const data = await res.json();
            setWalletData(data.data || null);
         }
      } catch (err) {
         console.warn("Failed to load wallet data");
      }
   };

   const fetchStats = async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/stats/distributor");
         if (res.ok) {
            const data = await res.json();
            setStatsData(data.data || null);
         }
      } catch (err) {
         console.warn("Failed to load stats data");
      }
   };

   // Stats calculations
   const totalDeliveries = inputs.length;
   const pendingDeliveries = inputs.filter((i) => !i.dispatched && !i.delivered).length;
   const activeDispatches = inputs.filter((i) => i.dispatched && !i.delivered).length;
   const completedDeliveries = inputs.filter((i) => i.delivered).length;
   const totalValueHandled = inputs.reduce((acc, curr) => acc + (Number(curr.approved_amount) || 0), 0);

   return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
         {/* Top Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/40">
                     Ecosystem Agro-Distribution
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Overview & Analytics
                  </span>
               </div>
               <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Partner <span className="text-amber-500">Distribution Portal</span>
               </h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
                  Operational liquidity, active logistics manifests, and certified catalog inventory overview.
               </p>
            </div>

            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  onClick={() => {
                     fetchInputs();
                     fetchWallet();
                     fetchStats();
                     fetchSession();
                  }}
                  className="rounded-2xl px-4 py-2.5 text-xs font-bold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
               >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Refresh Metrics
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

         {/* WRAPPER FOR STATS & BLUR OVERLAY */}
         <div className="relative">
            {/* PENDING APPROVAL BLUR CARD (When !isApproved) */}
            {!isApproved && (
               <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/75 dark:bg-slate-950/80 rounded-3xl flex items-center justify-center p-4">
                  <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 text-center animate-fade-in">
                     <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
                        <Clock className="w-8 h-8 animate-pulse" />
                     </div>

                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-3">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        Accreditation Under SuperAdmin Review
                     </span>

                     <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Distributor Dashboard Locked
                     </h3>

                     <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        Welcome to Agri-Noria Supply! Your enterprise details, storage facility, and product catalog have been registered and are currently pending review by Platform Administration.
                     </p>

                     <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 text-xs">
                        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                           <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                           <span>Input material allocations & delivery manifests are locked</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                           <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                           <span>Order dispatch & 2-way handover confirmations disabled</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                           <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                           <span>Escrow payout release restricted to accredited distributors</span>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                           href="/ecosystem/distributor/onboarding"
                           className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/25 transition cursor-pointer"
                        >
                           <FileText className="w-4 h-4" />
                           <span>View Submitted Dossier</span>
                           <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <Button
                           variant="outline"
                           onClick={() => fetchSession(true)}
                           className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                           <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                           <span>Check Approval Status</span>
                        </Button>
                     </div>
                  </div>
               </div>
            )}

            {/* DASHBOARD STATS CONTENT (Blurred if unapproved) */}
            <div className={`space-y-6 ${!isApproved ? "filter blur-sm select-none pointer-events-none transition-all duration-300 opacity-60" : ""}`}>
               {/* 5 Top Stats Cards */}
               <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="p-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 bg-white dark:bg-slate-900/90 shadow-xs">
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

                  <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 bg-white dark:bg-slate-900/90 shadow-xs">
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

                  <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 bg-white dark:bg-slate-900/90 shadow-xs">
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

                  <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/5 bg-white dark:bg-slate-900/90 shadow-xs">
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

                  <div className="p-4 rounded-2xl border border-teal-500/25 bg-teal-500/5 bg-white dark:bg-slate-900/90 shadow-xs">
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

               {/* Quick Action Navigation Strip to New Orders Menu */}
               <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
                           <Truck className="w-4 h-4" />
                        </span>
                        <h3 className="font-black text-base text-slate-900 dark:text-white">
                           Assigned Delivery Manifests & Order Actions
                        </h3>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
                        View input orders assigned to your hub by Finance, generate waybills, dispatch transport to clusters, and perform 2-way receipt verifications.
                     </p>
                  </div>
                  <Link
                     href="/ecosystem/distributor/orders"
                     className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-600/25 transition cursor-pointer shrink-0"
                  >
                     <span>Go to Deliveries & Orders</span>
                     <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>

               {/* 3 Detail Cards (Operational Performance, Stock Distribution, Escrow Treasury) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: Logistics Performance */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                           <FaTruckLoading className="w-4 h-4 text-amber-500" />
                           Logistics Performance
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                           Live
                        </span>
                     </div>
                     <div className="space-y-3">
                        <div>
                           <div className="flex justify-between text-xs mb-1 font-bold">
                              <span className="text-slate-500">Fulfillment Completion</span>
                              <span className="text-emerald-600">
                                 {totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0}%
                              </span>
                           </div>
                           <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                 className="h-full bg-emerald-500 rounded-full"
                                 style={{
                                    width: `${totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0}%`,
                                 }}
                              />
                           </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
                           <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">In Transit</p>
                              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{activeDispatches}</p>
                           </div>
                           <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Prep</p>
                              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{pendingDeliveries}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Card 2: Catalog Breakdown */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                           <Store className="w-4 h-4 text-teal-500" />
                           Catalog Breakdown
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                           {inventoryList.length} SKUs
                        </span>
                     </div>
                     <div className="space-y-2">
                        {["Fertilizer", "Seeds", "Mechanical", "Irrigations", "Pesticides"].map((cat) => {
                           const count = inventoryList.filter((i) => i.category === cat).length;
                           return (
                              <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                 <span className="font-semibold text-slate-600 dark:text-slate-400">{cat}</span>
                                 <span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                                    {count} products
                                 </span>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Card 3: Escrow & Wallet Glance */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                           <FaWallet className="w-4 h-4 text-purple-500" />
                           Escrow & Wallet
                        </h4>
                        <Link
                           href="/ecosystem/distributor/wallet"
                           className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                           <span>Wallet</span>
                           <ArrowRight className="w-3 h-3" />
                        </Link>
                     </div>
                     <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-2">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                           Guaranteed in Escrow
                        </p>
                        <p className="text-2xl font-black text-amber-400">
                           ₦{totalValueHandled.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                           Released to payout balance upon 2-way verified destination receipt.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
