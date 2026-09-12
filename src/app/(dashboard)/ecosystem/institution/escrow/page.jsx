"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, ArrowUpRight, ArrowDownRight, CheckCircle, DollarSign, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function EscrowPage() {
  const [data, setData] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorizingId, setAuthorizingId] = useState(null);

  const fetchData = async () => {
    try {
      const [escrowRes, settRes] = await Promise.all([
        fetch("/api/proxy/admin/institution/escrow"),
        fetch("/api/proxy/pipeline/settlements/pending")
      ]);
      const json = await escrowRes.json();
      if (json.success) setData(json.data || []);

      const settJson = await settRes.json();
      if (settJson.success) setPendingSettlements(settJson.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuthorizeSettlement = async (settlementId) => {
    setAuthorizingId(settlementId);
    try {
      const res = await fetch(`/api/proxy/pipeline/settlements/${settlementId}/execute`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settlement authorized! Debt recovered to Programme & net proceeds disbursed.");
        fetchData();
      } else {
        toast.error(data.error || "Failed to authorize settlement.");
      }
    } catch (error) {
      console.error("Settlement error:", error);
      toast.error("Network error executing settlement.");
    } finally {
      setAuthorizingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">Escrow & Disbursements</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
          Review Harvest Settlements & Manage Financial Interventions
        </p>
      </div>

      {/* Pending Settlement Waterfall Authorization */}
      <Card className="border-none shadow-md bg-white dark:bg-gray-950 overflow-hidden">
        <CardHeader className="bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Pending Harvest Settlement Waterfalls (Step 17 & 18)
            </CardTitle>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
              Human-in-the-loop authorization: verify input loan recovery deductions before final farmer disbursement.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full">
            {pendingSettlements.length} Pending Approval
          </span>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : pendingSettlements.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">
              No off-take settlements awaiting Finance authorization.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
              {pendingSettlements.map((sett) => (
                <div key={sett.settlement_id} className="pt-4 first:pt-0 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                        Batch: {sett.batch_number}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800">
                        {sett.crop} ({sett.quantity_mt} MT)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Producer: <span className="font-semibold text-gray-700 dark:text-gray-300">{sett.company_name || `${sett.fname || ''} ${sett.lname || ''}`.trim() || 'Producer'}</span> ({sett.vendor_role})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-gray-500 font-medium uppercase text-[10px]">Gross Buyer</p>
                      <p className="font-black text-gray-900 dark:text-gray-100 text-sm">₦{parseFloat(sett.buyer_payment || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                      <p className="text-amber-700 font-medium uppercase text-[10px]">Loan Recovery</p>
                      <p className="font-black text-amber-700 text-sm">-₦{parseFloat(sett.loan_deduction || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-gray-500 font-medium uppercase text-[10px]">Storage / Logistics</p>
                      <p className="font-black text-gray-700 text-sm">-₦{(parseFloat(sett.storage_deduction || 0) + parseFloat(sett.logistics_deduction || 0)).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900">
                      <p className="text-emerald-700 font-medium uppercase text-[10px]">Net Payout</p>
                      <p className="font-black text-emerald-700 text-sm">₦{parseFloat(sett.final_balance || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => handleAuthorizeSettlement(sett.settlement_id)}
                      disabled={authorizingId === sett.settlement_id}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {authorizingId === sett.settlement_id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Authorize Settlement
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escrow & Disbursement History */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Disbursement & Escrow Transactions</CardTitle>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search transactions..." className="pl-10 rounded-xl bg-gray-50 border-gray-200" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-l-lg">Type</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Description</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No escrow transactions found.</td></tr>
                  ) : (
                    data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-(--foreground) flex items-center gap-3">
                          {item.type === 'credit' || item.transaction_type === 'recovery' ? (
                            <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className="capitalize">{item.type || item.transaction_type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-lg">₦{parseFloat(item.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600">{item.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
