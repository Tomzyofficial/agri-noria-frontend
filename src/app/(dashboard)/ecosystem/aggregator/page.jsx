"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaBoxOpen, FaChartLine, FaHandshake, FaUsers, FaWallet } from "react-icons/fa";
import { Clock, ShieldAlert, Lock, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";

export default function AggregatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [inputRequests, setInputRequests] = useState([]);
  const [marketplaceData, setMarketplaceData] = useState([]);

  const fetchSession = async (showToast = false) => {
    try {
      let session;
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          session = await res.json();
        } else {
          session = await verifyVendorSession();
        }
      } catch {
        session = await verifyVendorSession();
      }
      if (session?.authenticated) {
        const approved = session?.approval_status === "approved";
        setIsApproved(approved);
        if (showToast) {
          if (approved) {
            toast.success("Aggregator account is approved and active!");
          } else {
            toast.info("Aggregator account is still awaiting SuperAdmin approval.");
          }
        }
      }
    } catch (e) {
      console.warn("Failed to check aggregator session:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, agreementsRes, walletRes, inputsRes, marketRes, clustersRes] =
          await Promise.all([
            fetch("/api/proxy/aggregator/profile"),
            fetch("/api/proxy/aggregator/agreements"),
            fetch("/api/proxy/pipeline/wallet?type=aggregator"),
            fetch("/api/proxy/inputs/my-requests"),
            fetch("/api/proxy/aggregator/marketplace-data"),
            fetch("/api/proxy/pipeline/clusters"),
          ]);

        if (profileRes.ok) setProfile((await profileRes.json()).data);
        if (agreementsRes.ok) setAgreements((await agreementsRes.json()).data || []);
        if (clustersRes.ok) setClusters((await clustersRes.json()).data || []);
        if (walletRes.ok) setWallet((await walletRes.json()).data?.wallet);
        if (inputsRes.ok) setInputRequests((await inputsRes.json()).data || []);
        if (marketRes.ok) setMarketplaceData((await marketRes.json()).data || []);
      } catch (err) {
        console.error("Error fetching aggregator data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchSession();
  }, []);

  if (loading) {
    return <div className="p-8 text-center animate-pulse font-medium text-gray-500">Loading aggregator dashboard...</div>;
  }

  const walletBalance = Number(wallet?.balance || 0);
  const pendingRequests = inputRequests.filter((request) => request.status === "pending").length;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* PENDING APPROVAL BLUR SCREEN OVERLAY */}
      {!isApproved && (
        <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/75 dark:bg-slate-950/80 rounded-[2.5rem] flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 text-center animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              KYC Submitted • Waiting for SuperAdmin Approval
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Aggregator Console Pending Approval
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Welcome to Agri-Noria Aggregation! Your enterprise KYC dossier has been submitted and is currently being reviewed by Platform Administration. Once approved, you will be authorized to contract with buyers, aggregate produce with farm clusters, and access financing.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Buyer management & off-taker contracting locked</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Cluster aggregation & produce procurement disabled</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Financing facilities & wallet escrow restricted</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/ecosystem/aggregator/onboarding"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/25 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Submitted KYC Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Button
                variant="outline"
                onClick={() => fetchSession(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Check Approval Status</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT (Blurred when !isApproved) */}
      <div className={`space-y-8 ${!isApproved ? "filter blur-sm select-none pointer-events-none transition-all duration-300 opacity-60" : ""}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Welcome back, <span className="text-green-600">{profile?.company_name || "Aggregator"}</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              System Online - Cluster Health: Optimal
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => (window.location.href = "/ecosystem/aggregator/buyers")}
              className="bg-gray-900 text-white hover:bg-black px-6 py-6 rounded-2xl font-bold"
            >
              Manage Buyers
            </Button>
            <Button
              onClick={() => (window.location.href = "/ecosystem/aggregator/clusters")}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-6 rounded-2xl font-bold shadow-lg shadow-green-600/20"
            >
              View Clusters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Active Clusters"
            value={clusters.length.toLocaleString()}
            icon={<FaUsers size={24} />}
            color="bg-green-600"
            gradient="from-white to-green-50 dark:from-gray-900 dark:to-green-950/20"
          />
          <StatCard
            title="Procurement Deals"
            value={agreements.length.toLocaleString()}
            icon={<FaHandshake size={24} />}
            color="bg-blue-600"
            gradient="from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20"
          />
          <StatCard
            title="Wallet Balance"
            value={`NGN ${walletBalance.toLocaleString()}`}
            icon={<FaWallet size={24} />}
            color="bg-amber-600"
            gradient="from-white to-amber-50 dark:from-gray-900 dark:to-amber-950/20"
          />
          <StatCard
            title="Pending Inputs"
            value={pendingRequests.toLocaleString()}
            icon={<FaBoxOpen size={24} />}
            color="bg-purple-600"
            gradient="from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-gray-900 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">Recent Procurement</h3>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/ecosystem/aggregator/buyers")}
                className="text-green-600 font-bold hover:bg-green-50"
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {agreements.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No procurement agreements yet.</p>
              ) : (
                agreements.slice(0, 5).map((agreement) => (
                  <div
                    key={agreement.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {agreement.buyer_name || "Buyer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {agreement.product_details?.commodity || "General"} Procurement
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 dark:text-white">
                        NGN {Number(agreement.financing_amount || 0).toLocaleString()}
                      </p>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {agreement.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-gray-900 text-white p-8">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
              <FaChartLine className="text-green-500" /> Market Glance
            </h3>
            <div className="space-y-6">
              {marketplaceData.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">No live market data available.</p>
              ) : (
                marketplaceData.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-bold">{item.commodity}</p>
                      <p className="text-xs text-gray-500">{item.region}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-400">
                        NGN {Number(item.current_price || 0).toLocaleString()}
                      </p>
                      <p className={`text-[10px] font-bold ${item.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {item.trend === "up" ? "Up" : "Down"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => (window.location.href = "/ecosystem/aggregator/marketplace")}
              className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold"
            >
              Full Market Data
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, gradient }) {
  return (
    <Card className={`rounded-[2rem] border-none shadow-sm bg-gradient-to-br ${gradient} p-8`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`${color} text-white p-4 rounded-2xl shadow-lg`}>{icon}</div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{value}</h3>
    </Card>
  );
}
