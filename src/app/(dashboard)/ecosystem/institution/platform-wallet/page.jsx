"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Download, Coins, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { toast } from "react-toastify";

export default function PlatformWalletPage() {
   const [stats, setStats] = useState({
      totalBalance: 0,
      escrowHeld: 0,
      totalDistributed: 0,
      recentTransactions: []
   });
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   
   // Disburse UI State
   const [entityWallets, setEntityWallets] = useState([]);
   const [isDisbursing, setIsDisbursing] = useState(false);
   const [disburseForm, setDisburseForm] = useState({
      targetWalletId: "",
      amount: "",
      description: ""
   });

   const fetchWalletData = async () => {
      try {
         const [statsRes, transRes, walletsRes] = await Promise.all([
            fetch("/api/proxy/admin/dashboard/stats"), 
            fetch("/api/proxy/admin/wallet-transactions"),
            fetch("/api/proxy/admin/entity-wallets")
         ]);
         
         const statsData = await statsRes.json();
         const transData = await transRes.json();
         const walletsData = await walletsRes.json();

         if (statsData.success && transData.success) {
            setStats({
               totalBalance: statsData.data.finance_wallet_balance,
               escrowHeld: statsData.data.escrow_held,
               totalDistributed: 0,
               recentTransactions: transData.data || []
            });
         }
         if (walletsData?.success) {
            setEntityWallets(walletsData.data || []);
         }
      } catch (error) {
         console.error("Error fetching platform wallet data:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchWalletData();
   }, []);

   const handleDisburse = async () => {
      if (!disburseForm.targetWalletId || !disburseForm.amount) return;
      
      setIsDisbursing(true);
      try {
         const res = await fetch("/api/proxy/admin/disburse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(disburseForm)
         });
         
         const data = await res.json();
         if (data.success) {
            toast.success("Funds successfully disbursed!");
            setDisburseForm({ targetWalletId: "", amount: "", description: "" });
            fetchWalletData(); // Refresh all balances and logs
         } else {
            toast.error(data.error || "Failed to disburse funds.");
         }
      } catch (error) {
         console.error(error);
         toast.error("Network error during disbursement.");
      } finally {
         setIsDisbursing(false);
      }
   };

   const filteredTransactions = stats.recentTransactions.filter(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
   };

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Wallet Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Restricted financial data for high-level ecosystem management.</p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-emerald-600 text-white border-none shadow-lg">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Global Balance</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.totalBalance)}</h2>
               <p className="text-emerald-100 text-xs flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> Live Ecosystem Liquidity
               </p>
            </Card>

            <Card className="p-6 bg-amber-600 text-white border-none shadow-lg">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                     <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Escrow Volume</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.escrowHeld)}</h2>
               <p className="text-amber-100 text-xs font-medium">Agreement-secured Capital</p>
            </Card>

            <Card className="p-6 bg-blue-600 text-white border-none shadow-lg">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                     <Coins className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Distributed</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.totalDistributed)}</h2>
               <p className="text-blue-100 text-xs font-medium">Released operational funds</p>
            </Card>
         </div>

         {/* Disburse Funds UI */}
         <Card className="p-6 border-none shadow-md bg-white dark:bg-gray-950">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Disburse Funds</h3>
                  <p className="text-sm text-gray-500">Atomically transfer capital to ecosystem entity wallets</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Target Entity Wallet</label>
                  <select 
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={disburseForm.targetWalletId}
                     onChange={(e) => setDisburseForm({...disburseForm, targetWalletId: e.target.value})}
                  >
                     <option value="">-- Select an entity --</option>
                     {entityWallets.map(w => (
                        <option key={w.id} value={w.id}>
                           {w.owner_type.toUpperCase()} - {w.fname} {w.lname} ({w.company_name || 'Individual'}) - Balance: {formatCurrency(w.balance)}
                        </option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Amount (NGN)</label>
                  <Input 
                     type="number" 
                     placeholder="0.00" 
                     className="h-10"
                     value={disburseForm.amount}
                     onChange={(e) => setDisburseForm({...disburseForm, amount: e.target.value})}
                  />
               </div>
               <div>
                  <Button 
                     className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                     onClick={handleDisburse}
                     disabled={isDisbursing || !disburseForm.targetWalletId || !disburseForm.amount}
                  >
                     {isDisbursing ? 'Transferring...' : 'Credit Wallet'}
                  </Button>
               </div>
            </div>
            <div className="mt-4">
               <Input 
                  placeholder="Optional description/reference..." 
                  className="w-full"
                  value={disburseForm.description}
                  onChange={(e) => setDisburseForm({...disburseForm, description: e.target.value})}
               />
            </div>
         </Card>

         {/* Simple Table for Transactions */}
         <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <h3 className="font-bold">Recent Global Transactions</h3>
               <Search className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-0">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                     <tr>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                     {loading ? (
                        <tr><td colSpan="3" className="p-10 text-center animate-pulse">Loading platform data...</td></tr>
                     ) : filteredTransactions.length === 0 ? (
                        <tr><td colSpan="3" className="p-10 text-center text-gray-500">No recent transactions recorded</td></tr>
                     ) : (
                        filteredTransactions.slice(0, 10).map((tx) => (
                           <tr key={tx.id} className="text-sm">
                              <td className="px-6 py-4 font-semibold">{tx.description}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{tx.owner_type}</td>
                              <td className={`px-6 py-4 text-right font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {formatCurrency(tx.amount)}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
