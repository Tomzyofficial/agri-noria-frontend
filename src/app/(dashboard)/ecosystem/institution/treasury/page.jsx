"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Banknote, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function TreasuryLedgerPage() {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [stats, setStats] = useState({ balance: 0 });

   const fetchData = async () => {
      setLoading(true);
      try {
         const [txRes, statsRes] = await Promise.all([
            fetch("/api/proxy/pipeline/stats/platform-wallet/transactions"),
            fetch("/api/proxy/pipeline/stats/platform-wallet")
         ]);
         
         if (txRes.ok) {
            const txData = await txRes.json();
            if (txData.success) setTransactions(txData.data || []);
         }
         
         if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.data);
         }
      } catch (error) {
         console.error("Failed to load treasury data:", error);
         toast.error("Failed to load treasury data");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
   };

   const filteredTx = transactions.filter(tx => 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.sender_fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender_lname?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         {/* Header */}
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Banknote className="w-8 h-8 text-emerald-500" /> Ecosystem Treasury Ledger
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Global transaction history and funding log.
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
                     <p className="text-xs text-gray-500 mt-1">When the treasury receives funds, they will appear here.</p>
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
