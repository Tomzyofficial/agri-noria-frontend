"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldAlert, Activity, FileText, CheckCircle, Search, ChevronDown } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function InsuranceDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "policies"
  
  const [riskRequests, setRiskRequests] = useState([]);
  const [activePolicies, setActivePolicies] = useState([]);
  const [quotingId, setQuotingId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ premium: "", terms: "" });

  const fetchData = async () => {
    try {
      const [reqRes, polRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/insurance/requests"),
        fetch("/api/proxy/vendor/commodity-operations/insurance/policies")
      ]);
      const reqData = await reqRes.json();
      const polData = await polRes.json();
      
      if (reqData.success) setRiskRequests(reqData.data || []);
      if (polData.success) setActivePolicies(polData.data || []);
    } catch (error) {
      console.error("Error fetching insurance data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProvideQuote = (id) => {
    setQuotingId(id);
    setQuoteForm({ premium: "", terms: "" });
  };

  const submitQuote = async (e, id) => {
    e.preventDefault();
    if (!quoteForm.premium) {
      toast.error("Please enter a premium amount");
      return;
    }
    
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/insurance/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: id, premium: quoteForm.premium, terms: quoteForm.terms })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Quote submitted successfully!");
        setQuotingId(null);
        fetchData(); // Refresh data
      } else {
        toast.error(data.error || "Failed to submit quote");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Underwriting Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Review incoming risk requests, provide quotes, and manage active policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Pending Requests
            </CardTitle>
            <ShieldAlert className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">
              {riskRequests.filter(r => r.status === "pending").length}
            </div>
            <p className="text-xs font-medium text-orange-600 mt-1">Requires quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Policies
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-(--greenish-color)" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{activePolicies.length}</div>
            <p className="text-xs font-medium text-green-600 mt-1">Total active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Covered Value
            </CardTitle>
            <Activity className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">
              ₦{(activePolicies.reduce((sum, p) => sum + Number(p.coverage_amount || 0), 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs font-medium text-blue-600 mt-1">Across all policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Pending Claims
            </CardTitle>
            <FileText className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">0</div>
            <p className="text-xs font-medium text-gray-500 mt-1">No claims to review</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-(--background) rounded-xl border overflow-hidden">
        <div className="flex border-b">
          <button 
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "requests" ? "border-b-2 border-(--greenish-color) text-(--greenish-color)" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            onClick={() => setActiveTab("requests")}
          >
            Marketplace Requests
          </button>
          <button 
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "policies" ? "border-b-2 border-(--greenish-color) text-(--greenish-color)" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            onClick={() => setActiveTab("policies")}
          >
            Active Policies
          </button>
        </div>

        <div className="p-6">
          {activeTab === "requests" && (
            <div className="space-y-4">

              {riskRequests.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldAlert className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-500">No Pending Requests</h3>
                  <p className="text-sm text-gray-400 mb-6">There are currently no risk requests from the ecosystem.</p>
                </div>
              ) : (
                riskRequests.map((req) => (
                <div key={req.id} className="border rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-lg text-(--foreground)">{req.id}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {req.status === 'pending' ? 'Needs Quote' : 'Quote Submitted'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Commodity</p>
                          <p className="font-medium text-sm">{req.commodity} ({req.quantity})</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Batch Value</p>
                          <p className="font-medium text-sm text-(--greenish-color)">{req.value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Location/Route</p>
                          <p className="font-medium text-sm">{req.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Risk Type</p>
                          <p className="font-medium text-sm text-red-600">{req.riskType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-72 mt-4 lg:mt-0">
                      {req.status === "pending" && quotingId !== req.id ? (
                        <button 
                          onClick={() => handleProvideQuote(req.id)}
                          className="w-full bg-(--greenish-color) text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition"
                        >
                          Provide Quote
                        </button>
                      ) : req.status === "pending" && quotingId === req.id ? (
                        <form onSubmit={(e) => submitQuote(e, req.id)} className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Premium Amount (₦)</label>
                            <input 
                              type="number" 
                              required
                              value={quoteForm.premium}
                              onChange={(e) => setQuoteForm({...quoteForm, premium: e.target.value})}
                              placeholder="e.g. 150000" 
                              className="w-full border rounded-lg p-2 text-sm bg-white dark:bg-(--background)" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Terms / Deductible</label>
                            <input 
                              type="text" 
                              value={quoteForm.terms}
                              onChange={(e) => setQuoteForm({...quoteForm, terms: e.target.value})}
                              placeholder="e.g. 10% Deductible" 
                              className="w-full border rounded-lg p-2 text-sm bg-white dark:bg-(--background)" 
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-(--greenish-color) text-white py-2 rounded-lg text-sm font-bold">Submit</button>
                            <button type="button" onClick={() => setQuotingId(null)} className="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 text-center">
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Your Quote</p>
                          <p className="text-xl font-black text-(--foreground)">₦{Number(req.premium).toLocaleString()}</p>
                          <p className="text-xs text-blue-600 mt-2">Awaiting user acceptance</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )))}
            </div>
          )}

          {activeTab === "policies" && (
            <div className="text-center py-12">
              <ShieldAlert className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-500">Active Policies will appear here</h3>
              <p className="text-sm text-gray-400">Once a user accepts your quote, the policy is generated automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
