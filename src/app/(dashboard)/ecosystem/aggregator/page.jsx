"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaBoxOpen, FaChartLine, FaHandshake, FaUsers, FaWallet } from "react-icons/fa";

export default function AggregatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [inputRequests, setInputRequests] = useState([]);
  const [marketplaceData, setMarketplaceData] = useState([]);

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
  }, []);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading aggregator dashboard...</div>;
  }

  const walletBalance = Number(wallet?.balance || 0);
  const pendingRequests = inputRequests.filter((request) => request.status === "pending").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
