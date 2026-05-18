"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Download, Coins, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { toast } from "react-toastify";

export default function SuperAdminWalletPage() {
   const [stats, setStats] = useState({
      totalBalance: 0,
      escrowHeld: 0,
      totalDistributed: 0,
      recentTransactions: []
   });
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");

   useEffect(() => {
      const fetchWalletData = async () => {
         try {
            const [statsRes, transRes] = await Promise.all([
               fetch("/api/proxy/admin/dashboard/stats"),
               fetch("/api/proxy/admin/wallet-transactions")
            ]);
            
            const statsData = await statsRes.json();
            const transData = await transRes.json();

            if (statsData.success && transData.success) {
               setStats({
                  totalBalance: statsData.data.total_balance || statsData.data.finance_wallet_balance || 0,
                  escrowHeld: statsData.data.escrow_held || 0,
                  totalDistributed: 0,
                  recentTransactions: transData.data || []
               });
            }
         } catch (error) {
            console.error("Error fetching wallet data:", error);
            toast.error("Failed to load platform wallet data");
         } finally {
            setLoading(false);
         }
      };

      fetchWalletData();
   }, []);

   const filteredTransactions = stats.recentTransactions.filter(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
   };

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/super-admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Platform Wallet</h1>
               <p className="text-gray-500 dark:text-gray-400">Global financial overview of the AgriConnect Industrial Ecosystem.</p>
            </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-xl">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Total Balance</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.totalBalance)}</h2>
               <p className="text-emerald-100 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +12.5% from last month
               </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-xl">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                     <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Held in Escrow</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.escrowHeld)}</h2>
               <p className="text-amber-100 text-sm">Funds secured for active agreements</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                     <Coins className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Total Distributed</span>
               </div>
               <h2 className="text-3xl font-black mb-1">{formatCurrency(stats.totalDistributed)}</h2>
               <p className="text-blue-100 text-sm flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" /> Program disbursements
               </p>
            </Card>
         </div>

         {/* Transactions Section */}
         <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-md-center gap-4">
               <h3 className="font-bold text-lg">Global Transactions</h3>
               <div className="flex gap-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input 
                        placeholder="Search transactions..." 
                        className="pl-9 h-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon"><Download className="w-4 h-4" /></Button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-widest">
                        <th className="px-6 py-4">Transaction Details</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Date</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {loading ? (
                        [1,2,3].map(i => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan="5" className="px-6 py-4 h-16 bg-gray-50/50"></td>
                           </tr>
                        ))
                     ) : filteredTransactions.length === 0 ? (
                        <tr>
                           <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No transactions found</td>
                        </tr>
                     ) : (
                        filteredTransactions.map((tx) => (
                           <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                       {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                       <p className="font-bold text-sm">{tx.description || "Platform Transaction"}</p>
                                       <p className="text-xs text-gray-500 uppercase font-medium">{tx.owner_type || "System"}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 capitalize text-sm font-medium">{tx.type}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                 }`}>
                                    {tx.status}
                                 </span>
                              </td>
                              <td className={`px-6 py-4 font-black text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-500 text-sm font-medium">
                                 {new Date(tx.created_at).toLocaleDateString()}
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
