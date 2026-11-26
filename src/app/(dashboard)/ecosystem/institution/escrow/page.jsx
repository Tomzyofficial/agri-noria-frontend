"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Search, ArrowUpRight, ArrowDownRight, CheckCircle, DollarSign, ShieldAlert, Landmark, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function EscrowPage() {
  const [data, setData] = useState([]);
  const [pendingSettlements, setPendingSettlements] = useState([]);
  const [bankDirectory, setBankDirectory] = useState({ companyAccount: null, escrowAccount: null, accounts: [] });
  const [acctSearch, setAcctSearch] = useState("");
  const [acctTypeFilter, setAcctTypeFilter] = useState("all");
  const [provisioning, setProvisioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorizingId, setAuthorizingId] = useState(null);

  const fetchData = async () => {
    try {
      const [escrowRes, settRes, bankRes] = await Promise.all([
        fetch("/api/proxy/admin/institution/escrow"),
        fetch("/api/proxy/pipeline/settlements/pending"),
        fetch("/api/proxy/admin/institution/bank-accounts"),
      ]);
      const json = await escrowRes.json();
      if (json.success) setData(json.data || []);

      const settJson = await settRes.json();
      if (settJson.success) setPendingSettlements(settJson.data || []);

      const bankJson = await bankRes.json();
      if (bankJson.success && bankJson.data) setBankDirectory(bankJson.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionAccounts = async () => {
    setProvisioning(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/bank-accounts/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Ecosystem bank accounts provisioned!");
        fetchData();
      } else {
        toast.error(json.error || "Failed to provision accounts");
      }
    } catch {
      toast.error("Network error provisioning accounts");
    } finally {
      setProvisioning(false);
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

      {/* Company & Escrow Trust Bank Accounts + Ecosystem Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-blue-950 text-white">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">Agri-Noria Company Account</span>
              <Landmark className="w-5 h-5 text-blue-300" />
            </div>
            <h3 className="text-3xl font-black">₦{parseFloat(bankDirectory.companyAccount?.balance || 0).toLocaleString()}</h3>
            <p className="text-xs font-mono text-blue-200">
              Acct: {bankDirectory.companyAccount?.account_number || "Pending"} • {bankDirectory.companyAccount?.bank_name || "Agri-Noria Partner Bank"}
            </p>
            <p className="text-xs text-slate-300">
              Held in Escrow Reserves: <strong>₦{parseFloat(bankDirectory.companyAccount?.held_in_escrow || 0).toLocaleString()}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-emerald-900 to-teal-950 text-white">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">Escrow Trust Account</span>
              <Button
                size="sm"
                onClick={handleProvisionAccounts}
                disabled={provisioning}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[11px] font-black rounded-xl"
              >
                {provisioning ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                Sync / Issue All Bank Accounts
              </Button>
            </div>
            <h3 className="text-2xl font-black">{bankDirectory.escrowAccount?.account_name || "Agri-Noria Escrow Trust Account"}</h3>
            <p className="text-xs font-mono text-emerald-200">
              Acct: {bankDirectory.escrowAccount?.account_number || "Pending"} • {bankDirectory.escrowAccount?.bank_name || "Agri-Noria Escrow Trust Bank"}
            </p>
            <p className="text-xs text-emerald-100">
              Total Ecosystem Accounts Provisioned: <strong>{(bankDirectory.accounts || []).length}</strong> (Non-withdrawable clusters & escrow locked)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ecosystem Bank Accounts Directory */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black">Ecosystem Bank Accounts Registry</CardTitle>
            <p className="text-xs text-gray-500">Every ecosystem member, cluster, escrow pool, and Agri-Noria company account.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={acctTypeFilter}
              onChange={(e) => setAcctTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
            >
              <option value="all">All Account Types</option>
              <option value="cluster">Clusters (Non-Withdrawable)</option>
              <option value="farmer">Farmers</option>
              <option value="field officer">Field Officers</option>
              <option value="agronomist">Agronomists</option>
              <option value="bank">Banks</option>
              <option value="company">Company</option>
              <option value="escrow">Escrow</option>
            </select>
            <Input
              placeholder="Search account or name..."
              value={acctSearch}
              onChange={(e) => setAcctSearch(e.target.value)}
              className="h-9 w-52 rounded-xl text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-black">
                <tr>
                  <th className="px-4 py-2.5">Account Name</th>
                  <th className="px-4 py-2.5">Role / Type</th>
                  <th className="px-4 py-2.5">Account Number</th>
                  <th className="px-4 py-2.5">Bank</th>
                  <th className="px-4 py-2.5">Balance</th>
                  <th className="px-4 py-2.5">Withdrawal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(bankDirectory.accounts || [])
                  .filter((a) => acctTypeFilter === "all" || String(a.owner_type || "").toLowerCase() === acctTypeFilter)
                  .filter((a) => !acctSearch || String(a.account_name || "").toLowerCase().includes(acctSearch.toLowerCase()) || String(a.account_number || "").includes(acctSearch))
                  .slice(0, 30)
                  .map((a, idx) => (
                    <tr key={`${a.id || a.owner_id}-${idx}`}>
                      <td className="px-4 py-2.5 font-bold">{a.account_name}</td>
                      <td className="px-4 py-2.5 uppercase font-bold text-blue-600">{a.owner_type}</td>
                      <td className="px-4 py-2.5 font-mono font-bold">{a.account_number || "Pending"}</td>
                      <td className="px-4 py-2.5 text-gray-500">{a.bank_name}</td>
                      <td className="px-4 py-2.5 font-black">₦{parseFloat(a.balance || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        {a.allow_withdrawal === false ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">Locked</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">Allowed</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Settlement Waterfall Authorization */}
      <Card className="border-none shadow-md bg-white dark:bg-gray-950 overflow-hidden">
        <CardHeader className="bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Pending Harvest Settlement Waterfalls
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
