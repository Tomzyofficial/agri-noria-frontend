"use client";
import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, Search, Coins, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/Modal";

export default function WalletView({ role, walletType = "personal" }) {
   const [walletData, setWalletData] = useState({
      balance: 0,
      locked: 0,
      transactions: []
   });
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
   const [transferAmount, setTransferAmount] = useState("");
   const [isTransferring, setIsTransferring] = useState(false);

   const fetchWallet = async () => {
      setLoading(true);
      try {
         const response = await fetch(`/api/proxy/pipeline/wallet?type=${role}`);
         if (response.ok) {
            const data = await response.json();
            if (data.success) {
               setWalletData({
                  balance: data.data?.wallet?.balance || 0,
                  locked: data.data?.wallet?.locked_balance || 0,
                  transactions: data.data?.transactions || []
               });
            }
         } else {
            console.error("Failed to fetch wallet, status:", response.status);
         }
      } catch (error) {
         console.error("Error fetching wallet:", error);
         // Don't toast on first load if it's just missing data
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchWallet();
   }, [role]);

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
   };

   const handleTransfer = async () => {
      if (!transferAmount || isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
         return toast.error("Please enter a valid amount");
      }
      if (parseFloat(transferAmount) > walletData.balance) {
         return toast.error("Insufficient balance");
      }

      setIsTransferring(true);
      try {
         const response = await fetch("/api/proxy/pipeline/wallet/transfer/ecosystem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
               amount: transferAmount,
               wallet_type: role 
            })
         });
         
         const data = await response.json();
         if (response.ok && data.success) {
            toast.success(data.message || "Transfer successful!");
            setIsTransferModalOpen(false);
            setTransferAmount("");
            fetchWallet();
         } else {
            toast.error(data.error || "Transfer failed");
         }
      } catch (error) {
         console.error("Transfer error:", error);
         toast.error("Failed to process transfer");
      } finally {
         setIsTransferring(false);
      }
   };

   const filteredTransactions = walletData.transactions.filter(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-black tracking-tight capitalize">{walletType} Wallet</h1>
               <p className="text-gray-500 dark:text-gray-400">Manage your earnings, payouts and transaction history.</p>
            </div>
            <Button onClick={fetchWallet} variant="outline" size="icon" className="rounded-full">
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
         </div>

         {/* Transfer Modal */}
         <Modal isOpen={isTransferModalOpen} onClick={() => setIsTransferModalOpen(false)}>
            <div className="p-6">
               <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                     Transfer to Ecosystem Treasury
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     Contribute directly from your institutional wallet balance.
                  </p>
               </div>
               
               <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(walletData.balance)}</span>
               </div>

               <div className="mb-6">
                  <Label htmlFor="transferAmount" className="text-gray-700 dark:text-gray-300 font-medium">Amount (₦)</Label>
                  <Input 
                     id="transferAmount"
                     type="number" 
                     placeholder="e.g. 50000"
                     value={transferAmount}
                     onChange={(e) => setTransferAmount(e.target.value)}
                     className="mt-2 text-lg"
                     max={walletData.balance}
                  />
               </div>
               
               <Button 
                  onClick={handleTransfer} 
                  className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isTransferring || !transferAmount || walletData.balance <= 0}
               >
                  {isTransferring ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Transfer"}
               </Button>
            </div>
         </Modal>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Balance Card */}
            <Card className="p-8 bg-black text-white border-none shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                  <h2 className="text-5xl font-black mb-6">{formatCurrency(walletData.balance)}</h2>
                  <div className="flex gap-4">
                     <Button className="bg-white text-black hover:bg-gray-200 border-none font-black px-8">Withdraw</Button>
                     <Button 
                        onClick={() => setIsTransferModalOpen(true)}
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10 font-black"
                     >
                        Transfer
                     </Button>
                  </div>
               </div>
            </Card>

            {/* Stats Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Card className="p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center gap-3 mb-2 text-amber-600 dark:text-amber-400">
                     <Clock className="w-5 h-5" />
                     <span className="font-bold text-sm uppercase tracking-wider">Locked Funds</span>
                  </div>
                  <h3 className="text-2xl font-black">{formatCurrency(walletData.locked)}</h3>
                  <p className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-1">Held in active contracts</p>
               </Card>

               <Card className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
                     <TrendingUp className="w-5 h-5" />
                     <span className="font-bold text-sm uppercase tracking-wider">Monthly Income</span>
                  </div>
                  <h3 className="text-2xl font-black">{formatCurrency(0)}</h3>
                  <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 mt-1">+0% from last month</p>
               </Card>
            </div>
         </div>

         {/* Transactions */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold">Recent Transactions</h3>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                     placeholder="Search history..." 
                     className="pl-10 h-10 w-64 bg-transparent"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-3">
               {loading ? (
                  [1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)
               ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                     <Coins className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                     <p className="text-gray-500 font-medium">No transactions yet</p>
                  </div>
               ) : (
                  filteredTransactions.map(tx => (
                     <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-950 border border-gray-50 dark:border-gray-900 rounded-2xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                           </div>
                           <div>
                              <p className="font-bold">{tx.description}</p>
                              <p className="text-xs text-gray-500 font-medium">{new Date(tx.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                           </p>
                           <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{tx.status}</p>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
}
