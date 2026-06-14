"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FaWallet,
  FaCoins,
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributorWalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

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
      toast.error("Failed to load wallet data");
    } finally {
      setLoadingWallet(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Distributor <span className="text-amber-500">Wallet</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            View your payout balance and recent distributor ledger transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {loadingWallet ? (
            <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
          ) : (
            <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12" />
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black opacity-80">
                    DISTRIBUTOR LEDGER
                  </p>
                  <h4 className="text-sm font-bold mt-1">AgriNoria Pay</h4>
                </div>
                <FaCoins size={28} className="text-amber-100" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Current Balance
                </p>
                <h2 className="text-3xl font-black tracking-tight">
                  ₦
                  {(walletData?.wallet?.balance
                    ? parseFloat(walletData.wallet.balance)
                    : 0
                  ).toLocaleString()}
                </h2>
              </div>
              <div className="mt-10 flex justify-between items-end border-t border-white/20 pt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest opacity-60">
                    Wallet Address ID
                  </p>
                  <p className="text-xs font-mono font-bold mt-0.5 opacity-90">
                    {walletData?.wallet?.id
                      ? `${walletData.wallet.id.slice(0, 8)}...${walletData.wallet.id.slice(-6)}`
                      : "Not Found"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest opacity-60">
                    Status
                  </p>
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mt-0.5">
                    {walletData?.wallet?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold uppercase tracking-widest text-xs">
              <FaWallet /> Wallet Operations
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-300 leading-relaxed font-medium">
              This wallet shows live payout credits and debit history for your
              distributor account.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">
                    Ecosystem Ledger
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recent payout and transaction history for distributor
                    activities.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                  {(walletData?.transactions || []).length} Records
                </span>
              </div>
            </div>
            <CardContent className="p-0">
              {loadingWallet ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (walletData?.transactions || []).length === 0 ? (
                <div className="text-center py-20">
                  <FaExchangeAlt
                    size={36}
                    className="text-gray-300 dark:text-gray-700 mx-auto mb-3"
                  />
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
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                            <FaClock size={8} />{" "}
                            {new Date(tx.created_at).toLocaleDateString()} at{" "}
                            {new Date(tx.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
                          {tx.type === "credit" || tx.type === "deposit"
                            ? "+"
                            : "-"}
                          ₦{parseFloat(tx.amount).toLocaleString()}
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
    </div>
  );
}
