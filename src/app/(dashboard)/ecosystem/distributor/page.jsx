"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
   FaTruckLoading, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaBoxOpen,
   FaWallet, FaChartLine, FaExchangeAlt, FaClock, FaArrowDown, FaArrowUp, FaCoins
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributorDashboard() {
   const [inputs, setInputs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isUpdating, setIsUpdating] = useState(null);
   const [activeTab, setActiveTab] = useState("deliveries"); // 'deliveries', 'wallet', 'analytics'
   
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
         toast.error("Failed to load inputs");
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
            body: JSON.stringify({ status })
         });
         if (res.ok) {
            toast.success(`Input marked as ${status}`);
            setInputs(prev => prev.map(req => req.id === id ? { ...req, items_status: status } : req));
            
            // Proactively refresh wallet and performance statistics
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

   // Calculate summary metrics locally as fallback
   const pendingDeliveries = inputs.filter(r => r.items_status !== 'delivered' && r.items_status !== 'dispatched').length;
   const activeDispatches = inputs.filter(r => r.items_status === 'dispatched').length;
   const completedDeliveries = inputs.filter(r => r.items_status === 'delivered').length;

   return (
      <div className="space-y-8 pb-20 max-w-6xl mx-auto">
         {/* Premium Header */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
               <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  Partner <span className="text-amber-500">Portal</span>
               </h1>
               <p className="text-gray-500 mt-2 font-medium">Manage and track your input distributions, performance metrics, and payouts.</p>
            </div>
         </div>

         {/* Premium Nav Tabs */}
         <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl max-w-lg border border-gray-200 dark:border-gray-700/50 shadow-inner">
            <button
               onClick={() => setActiveTab("deliveries")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "deliveries"
                     ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-500 shadow-md scale-100"
                     : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
               }`}
            >
               <FaTruckLoading size={14} />
               Deliveries
               {pendingDeliveries + activeDispatches > 0 && (
                  <span className="ml-1 bg-amber-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                     {pendingDeliveries + activeDispatches}
                  </span>
               )}
            </button>
            <button
               onClick={() => setActiveTab("wallet")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "wallet"
                     ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-500 shadow-md scale-100"
                     : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
               }`}
            >
               <FaWallet size={14} />
               My Wallet
            </button>
            <button
               onClick={() => setActiveTab("analytics")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === "analytics"
                     ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-500 shadow-md scale-100"
                     : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
               }`}
            >
               <FaChartLine size={14} />
               Analytics
            </button>
         </div>

         {/* Deliveries Tab */}
         {activeTab === "deliveries" && (
            <>
               {loading ? (
                  <div className="flex justify-center py-20">
                     <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                  </div>
               ) : inputs.length === 0 ? (
                  <div className="p-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                     <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FaBoxOpen size={24} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Deliveries Yet</h3>
                     <p className="text-gray-500 mt-1">You have no inputs assigned for distribution at the moment.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {inputs.map((req) => (
                        <Card key={req.id} className="border-none shadow-xl shadow-amber-500/5 dark:shadow-none overflow-hidden group bg-white dark:bg-(--card-dark) rounded-2xl relative">
                           <CardContent className="p-0">
                              {/* Status Header */}
                              <div className={`p-4 flex items-center justify-between text-white ${req.items_status === 'delivered' ? 'bg-emerald-500' : req.items_status === 'dispatched' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                                 <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                                    {req.items_status === 'delivered' ? <FaCheckCircle /> : req.items_status === 'dispatched' ? <FaTruckLoading /> : <FaBoxOpen />}
                                    {req.items_status || "Pending Dispatch"}
                                 </div>
                                 <div className="text-xs font-medium opacity-90">
                                    {new Date(req.created_at).toLocaleDateString()}
                                 </div>
                              </div>

                              {/* Content */}
                              <div className="p-6 space-y-4">
                                 <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <div>
                                       <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                          {req.farmer_fname} {req.farmer_lname}
                                          {req.is_cluster_request && (
                                             <span className="ml-2 inline-flex items-center text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black align-middle">
                                                Cluster
                                             </span>
                                          )}
                                       </h3>
                                       <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                          <FaMapMarkerAlt className="text-amber-500" /> {req.region || "Unknown Region"}
                                       </p>
                                    </div>
                                    <a href={`tel:${req.farmer_phone}`} className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center hover:bg-green-100 transition">
                                       <FaPhoneAlt size={14} />
                                    </a>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <div className="col-span-2">
                                       <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Assigned Materials</p>
                                       <div className="flex flex-wrap gap-1">
                                          {(Array.isArray(req.input_items) ? req.input_items : []).map((it, idx) => (
                                             <span key={idx} className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md text-[10px] font-bold border border-gray-100 dark:border-gray-700 shadow-sm">
                                                {typeof it === 'object' && it !== null ? `${it.name || 'Item'} (${it.quantity || 1} ${it.unit || 'pcs'})` : it}
                                             </span>
                                          ))}
                                          {(req.input_items || []).length === 0 && <span className="text-xs italic text-gray-400">No items listed</span>}
                                       </div>
                                    </div>
                                    <div className="pt-2">
                                       <p className="text-xs text-gray-500 font-medium uppercase">Value</p>
                                       <p className="font-bold text-gray-900 dark:text-white mt-1">₦{parseFloat(req.total_value || req.total_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="pt-2">
                                       <p className="text-xs text-gray-500 font-medium uppercase">Farm Size</p>
                                       <p className="font-bold text-gray-900 dark:text-white mt-1">{parseFloat(req.farm_size_hectares || 0).toFixed(1)} Ha</p>
                                    </div>
                                 </div>

                                 {/* Actions */}
                                 {req.items_status !== 'delivered' && (
                                    <div className="pt-2 flex gap-3">
                                       {req.items_status !== 'dispatched' && (
                                          <Button 
                                             onClick={() => handleUpdateStatus(req.id, 'dispatched')} 
                                             disabled={isUpdating === req.id}
                                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-200 dark:shadow-none"
                                          >
                                             Mark Dispatched
                                          </Button>
                                       )}
                                       <Button 
                                          onClick={() => handleUpdateStatus(req.id, 'delivered')} 
                                          disabled={isUpdating === req.id}
                                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-200 dark:shadow-none"
                                       >
                                          Mark Delivered
                                       </Button>
                                    </div>
                                 )}
                              </div>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               )}
            </>
         )}

         {/* Wallet Tab */}
         {activeTab === "wallet" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: Glassmorphic Debit Card & Withdrawal Options */}
               <div className="lg:col-span-1 space-y-6">
                  {loadingWallet ? (
                     <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                  ) : (
                     <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                        {/* Chip & Logo details */}
                        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12" />
                        <div className="flex justify-between items-start mb-12">
                           <div>
                              <p className="text-[10px] uppercase tracking-widest font-black opacity-80">DISTRIBUTOR LEDGER</p>
                              <h4 className="text-sm font-bold mt-1">AgriNoria Pay</h4>
                           </div>
                           <FaCoins size={28} className="text-amber-100" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Current Balance</p>
                           <h2 className="text-3xl font-black tracking-tight">
                              ₦{(walletData?.wallet?.balance ? parseFloat(walletData.wallet.balance) : 0.00).toLocaleString()}
                           </h2>
                        </div>
                        <div className="mt-10 flex justify-between items-end border-t border-white/20 pt-4">
                           <div>
                              <p className="text-[9px] uppercase tracking-widest opacity-60">Wallet Address ID</p>
                              <p className="text-xs font-mono font-bold mt-0.5 opacity-90">
                                 {walletData?.wallet?.id ? `${walletData.wallet.id.slice(0,8)}...${walletData.wallet.id.slice(-6)}` : "Not Found"}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] uppercase tracking-widest opacity-60">Status</p>
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mt-0.5">
                                 {walletData?.wallet?.status || "Active"}
                              </span>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Operational Notes */}
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl space-y-3">
                     <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold uppercase tracking-widest text-xs">
                        <FaCoins /> Wallet Operations
                     </div>
                     <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed font-medium">
                        This wallet displays live, authorized payout disbursements sent by program financial directors. Funds will be directly settled upon successful verification.
                     </p>
                  </div>
               </div>

               {/* Right Column: Ledger / Transaction History */}
               <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
                     <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                        <div>
                           <h3 className="font-black text-lg text-gray-900 dark:text-white">Ecosystem Ledger</h3>
                           <p className="text-xs text-gray-500 mt-0.5">Complete payout and credit transaction history</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                           {(walletData?.transactions || []).length} Records
                        </span>
                     </div>
                     <CardContent className="p-0">
                        {loadingWallet ? (
                           <div className="space-y-4 p-6">
                              {[1, 2, 3].map(i => (
                                 <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                              ))}
                           </div>
                        ) : (walletData?.transactions || []).length === 0 ? (
                           <div className="text-center py-20">
                              <FaExchangeAlt size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No transactions recorded yet</p>
                           </div>
                        ) : (
                           <div className="divide-y divide-gray-100 dark:divide-gray-800">
                              {(walletData.transactions).map((tx) => (
                                 <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                          tx.type === 'credit' || tx.type === 'deposit'
                                             ? "bg-green-50 dark:bg-green-950/20 text-green-600"
                                             : "bg-red-50 dark:bg-red-950/20 text-red-600"
                                       }`}>
                                          {tx.type === 'credit' || tx.type === 'deposit' ? <FaArrowDown size={14} /> : <FaArrowUp size={14} />}
                                       </div>
                                       <div>
                                          <p className="font-bold text-sm text-gray-900 dark:text-white capitalize">{tx.description || tx.type}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                             <FaClock size={8} /> {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className={`font-black text-base ${
                                          tx.type === 'credit' || tx.type === 'deposit' ? "text-green-600" : "text-red-600"
                                       }`}>
                                          {tx.type === 'credit' || tx.type === 'deposit' ? "+" : "-"}₦{parseFloat(tx.amount).toLocaleString()}
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

         {/* Analytics Tab */}
         {activeTab === "analytics" && (
            <div className="space-y-8">
               {/* Metrics Stats Grid */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { 
                        label: "Total Assigned", 
                        value: statsData?.summary?.total_assigned ?? completedDeliveries + activeDispatches + pendingDeliveries, 
                        icon: <FaBoxOpen />, 
                        color: "blue" 
                     },
                     { 
                        label: "Delivered Items", 
                        value: statsData?.summary?.total_delivered ?? completedDeliveries, 
                        icon: <FaCheckCircle />, 
                        color: "emerald" 
                     },
                     { 
                        label: "Estimated Earnings", 
                        value: `₦${(statsData?.summary?.estimated_earnings ?? 0).toLocaleString()}`, 
                        icon: <FaCoins />, 
                        color: "amber" 
                     },
                     { 
                        label: "Active In-Transit", 
                        value: statsData?.summary?.total_dispatched ?? activeDispatches, 
                        icon: <FaTruckLoading />, 
                        color: "purple" 
                     }
                  ].map((metric, i) => (
                     <Card key={i} className="border-none shadow-sm bg-white dark:bg-gray-950 overflow-hidden relative group">
                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-${metric.color}-500`} />
                        <CardContent className="p-5">
                           <div className={`w-9 h-9 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-950/20 text-${metric.color}-600 flex items-center justify-center mb-3`}>
                              {metric.icon}
                           </div>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{metric.label}</p>
                           <p className="text-2xl font-black mt-0.5 text-gray-900 dark:text-white">{metric.value}</p>
                           <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Live DB Aggregate</p>
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {/* Second Section: Progress & Breakdown Charts */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance Rate */}
                  <Card className="border-none shadow-xl bg-white dark:bg-gray-950 p-8 rounded-3xl flex flex-col justify-between">
                     <div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">Delivery Performance</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Success metrics of assigned farm inputs</p>
                     </div>
                     
                     <div className="py-8 flex flex-col items-center justify-center">
                        <div className="relative w-36 h-36 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-full border-8 border-gray-100 dark:border-gray-800">
                           <div className="text-center">
                              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                 {statsData?.summary?.total_assigned 
                                    ? ((statsData.summary.total_delivered / statsData.summary.total_assigned) * 100).toFixed(0)
                                    : inputs.length > 0 
                                       ? ((completedDeliveries / inputs.length) * 100).toFixed(0)
                                       : 100
                                 }%
                              </h2>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Success Rate</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-gray-500 font-medium">Value of Goods Handled</span>
                           <span className="font-black text-gray-900 dark:text-white">
                              ₦{(statsData?.summary?.total_value_handled ?? 0).toLocaleString()}
                           </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                           <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ 
                                 width: `${statsData?.summary?.total_assigned 
                                    ? ((statsData.summary.total_delivered / statsData.summary.total_assigned) * 100).toFixed(0) 
                                    : inputs.length > 0
                                       ? ((completedDeliveries / inputs.length) * 100).toFixed(0)
                                       : 100
                                 }%` 
                              }}
                           />
                        </div>
                     </div>
                  </Card>

                  {/* Monthly Timeline Records */}
                  <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
                     <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">Performance Timeline</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Completed input requests compiled by period</p>
                     </div>
                     <CardContent className="p-0">
                        {loadingStats ? (
                           <div className="space-y-4 p-6">
                              {[1, 2].map(i => (
                                 <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                              ))}
                           </div>
                        ) : (!statsData?.history || statsData.history.length === 0) ? (
                           <div className="text-center py-20">
                              <FaChartLine size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">No timeline data available yet</p>
                           </div>
                        ) : (
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                       {["Period", "Completed Count", "Tonnage/Assigned Value"].map(h => (
                                          <th key={h} className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                       ))}
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {statsData.history.map((row, i) => (
                                       <tr key={i} className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                          <td className="p-4 font-bold text-sm text-gray-900 dark:text-white">{row.period}</td>
                                          <td className="p-4 font-bold text-sm text-emerald-600">{row.count} Deliveries</td>
                                          <td className="p-4 font-black text-sm text-gray-900 dark:text-white">₦{parseFloat(row.value).toLocaleString()}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>
            </div>
         )}
      </div>
   );
}
