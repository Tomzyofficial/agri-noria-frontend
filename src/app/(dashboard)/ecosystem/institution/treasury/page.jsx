"use client";
import { useState } from "react";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((res) => res.json());
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Banknote, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search, Send, CheckCircle2, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";

export default function TreasuryLedgerPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedVendorId, setSelectedVendorId] = useState("");
   const [creditAmount, setCreditAmount] = useState("");
   const [creditNote, setCreditNote] = useState("");
   const [funding, setFunding] = useState(false);

   const { data: txData, isLoading: l1, mutate: mutateTx } = useSWR("/api/proxy/pipeline/stats/platform-wallet/transactions", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: statsData, isLoading: l2, mutate: mutateStats } = useSWR("/api/proxy/pipeline/stats/platform-wallet", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: walletsData, isLoading: l3, mutate: mutateWallets } = useSWR("/api/proxy/admin/institution/wallets", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });

   const transactions = txData?.success ? (txData.data || []) : [];
   const stats = statsData?.success ? statsData.data : { balance: 0 };
   const walletsList = walletsData?.success ? (walletsData.data || []) : [];
   const loading = l1 || l2;

   const selectedUser = walletsList.find(w => w.vendor_id === selectedVendorId);

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
   };

   const handleCreditWallet = async (e) => {
      e.preventDefault();
      if (!selectedVendorId) {
         toast.error("Please select a user wallet to fund.");
         return;
      }
      const val = parseFloat(creditAmount);
      if (isNaN(val) || val <= 0) {
         toast.error("Please enter a valid credit amount greater than zero.");
         return;
      }

      setFunding(true);
      try {
         const res = await fetch("/api/proxy/admin/institution/treasury/credit-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               vendor_id: selectedVendorId,
               amount: val,
               note: creditNote || "Ecosystem Treasury Funding"
            })
         });
         const data = await res.json();
         if (data.success) {
            toast.success(`Successfully credited ${formatCurrency(val)} to ${selectedUser?.name || 'wallet'}!`);
            setCreditAmount("");
            setCreditNote("");
            mutateStats();
            mutateTx();
            mutateWallets();
         } else {
            toast.error(data.error || "Failed to credit wallet.");
         }
      } catch (error) {
         console.error("Error crediting wallet:", error);
         toast.error("Network error while crediting wallet.");
      } finally {
         setFunding(false);
      }
   };

   const filteredTx = transactions.filter(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.sender_fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender_lname?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Banknote className="w-8 h-8 text-emerald-500" /> Ecosystem Treasury Ledger
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Global transaction history, platform wallet management, and direct wallet credit.
               </p>
            </div>
         </div>

         {/* Balance Card */}
         <Card className="p-8 bg-black text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Wallet className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10">
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Treasury Funds</p>
               <h2 className="text-5xl font-black">{formatCurrency(stats.ecosystem_treasury || 0)}</h2>
            </div>
         </Card>

         {/* Fund Ecosystem User Wallet Section */}
         <Card className="border border-emerald-500/20 bg-white dark:bg-gray-950 shadow-md">
            <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-4">
               <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Send className="w-5 h-5" /> Direct Wallet Credit from Treasury
               </CardTitle>
               <p className="text-xs text-gray-500 mt-1">
                  Select any verified ecosystem user, view their live balance, and credit their wallet directly from the Treasury.
               </p>
            </CardHeader>
            <CardContent className="p-6">
               <form onSubmit={handleCreditWallet} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Select User Dropdown */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                           Select Ecosystem Wallet / Verified User
                        </label>
                        {l3 ? (
                           <div className="p-3 text-sm text-gray-500 animate-pulse">Loading ecosystem wallets...</div>
                        ) : (
                           <select
                              value={selectedVendorId}
                              onChange={(e) => setSelectedVendorId(e.target.value)}
                              className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 font-semibold focus:ring-2 focus:ring-emerald-500"
                              required
                           >
                              <option value="">-- Choose User Wallet ({walletsList.length} Available) --</option>
                              {walletsList.map((w) => (
                                 <option key={w.vendor_id} value={w.vendor_id}>
                                    {w.name} ({w.role}) - {w.email} | Balance: ₦{Number(w.balance).toLocaleString()}
                                 </option>
                              ))}
                           </select>
                        )}
                     </div>

                     {/* Credit Amount */}
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                           Credit Amount (₦)
                        </label>
                        <Input
                           type="number"
                           step="1000"
                           placeholder="e.g. 250000"
                           value={creditAmount}
                           onChange={(e) => setCreditAmount(e.target.value)}
                           className="h-12 border-gray-200 dark:border-gray-800 font-bold text-lg focus:ring-emerald-500"
                           required
                        />
                     </div>
                  </div>

                  {/* Selected User Details Box */}
                  {selectedUser && (
                     <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                              <User className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 dark:text-white text-base">{selectedUser.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{selectedUser.role} • {selectedUser.email}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs uppercase font-bold text-gray-400">Current Wallet Balance</p>
                           <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(selectedUser.balance)}
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Note & Submit Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                     <Input
                        type="text"
                        placeholder="Optional Note / Funding Purpose (e.g. Programme Advance, Grant, Emergency Operational Fund)"
                        value={creditNote}
                        onChange={(e) => setCreditNote(e.target.value)}
                        className="h-12 border-gray-200 dark:border-gray-800 font-medium flex-1"
                     />
                     <button
                        type="submit"
                        disabled={funding || !selectedVendorId || !creditAmount}
                        className="w-full sm:w-auto px-8 h-12 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                     >
                        {funding ? <FaSpinner className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Fund Wallet
                     </button>
                  </div>
               </form>
            </CardContent>
         </Card>

         {/* Transactions */}
         <div className="pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
               <h3 className="text-lg font-black tracking-tight">Ledger History</h3>
               <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                     placeholder="Search ledger..." 
                     className="pl-9 h-10 border-gray-200 dark:border-gray-800 focus:ring-black"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            {loading ? (
               <div className="p-12 text-center text-gray-500 animate-pulse">Loading treasury ledger...</div>
            ) : filteredTx.length === 0 ? (
               <Card className="border-dashed shadow-none border-gray-200 dark:border-gray-800">
                  <CardContent className="p-12 text-center">
                     <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                     <p className="font-bold text-gray-400">No transactions found</p>
                     <p className="text-xs text-gray-500 mt-1">When the treasury receives or transfers funds, they will appear here.</p>
                  </CardContent>
               </Card>
            ) : (
               <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-950">
                  <div className="divide-y divide-gray-100 dark:divide-gray-900">
                     {filteredTx.map(tx => (
                        <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                 {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-gray-100">
                                    {tx.description}
                                 </p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500 font-medium">
                                       {new Date(tx.created_at).toLocaleDateString('en-GB', { 
                                          day: 'numeric', month: 'short', year: 'numeric', 
                                          hour: '2-digit', minute:'2-digit' 
                                       })}
                                    </p>
                                    {tx.sender_fname && (
                                       <>
                                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full capitalize">
                                             {tx.sender_fname} {tx.sender_lname} • {tx.sender_role}
                                          </span>
                                       </>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-lg font-black tracking-tight ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                 {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </p>
                              <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'}`}>
                                 {tx.status}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            )}
         </div>
      </div>
   );
}
