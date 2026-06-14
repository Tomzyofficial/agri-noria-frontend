"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaCoins,
  FaTruckLoading,
  FaChartLine,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function DistributorAnalyticsPage() {
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchInputs();
  }, []);

  const fetchInputs = async () => {
    try {
      const res = await fetch("/api/proxy/pipeline/inputs/distributor");
      if (res.ok) {
        const data = await res.json();
        setInputs(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to load inputs");
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/proxy/pipeline/distributor/stats");
      if (res.ok) {
        const data = await res.json();
        setStatsData(data.data || null);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
      toast.error("Failed to load analytics data");
    } finally {
      setLoadingStats(false);
    }
  };

  const completedDeliveries = inputs.filter(
    (r) => r.items_status === "delivered",
  ).length;
  const activeDispatches = inputs.filter(
    (r) => r.items_status === "dispatched",
  ).length;
  const pendingDeliveries = inputs.filter(
    (r) => r.items_status !== "delivered" && r.items_status !== "dispatched",
  ).length;
  const totalAssigned = statsData?.summary?.total_assigned ?? inputs.length;
  const successRate = totalAssigned
    ? ((statsData?.summary?.total_delivered ?? completedDeliveries) /
        totalAssigned) *
      100
    : 100;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Distributor <span className="text-amber-500">Analytics</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Track delivery performance, operational efficiency, and payout
            estimates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assigned",
            value: statsData?.summary?.total_assigned ?? totalAssigned,
            icon: <FaBoxOpen />,
            color: "blue",
          },
          {
            label: "Delivered Items",
            value: statsData?.summary?.total_delivered ?? completedDeliveries,
            icon: <FaCheckCircle />,
            color: "emerald",
          },
          {
            label: "Estimated Earnings",
            value: `₦${(statsData?.summary?.estimated_earnings ?? 0).toLocaleString()}`,
            icon: <FaCoins />,
            color: "amber",
          },
          {
            label: "Active In-Transit",
            value: statsData?.summary?.total_dispatched ?? activeDispatches,
            icon: <FaTruckLoading />,
            color: "purple",
          },
        ].map((metric, i) => (
          <Card
            key={i}
            className="border-none shadow-sm bg-white dark:bg-gray-950 overflow-hidden relative group"
          >
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-${metric.color}-500`}
            />
            <CardContent className="p-5">
              <div
                className={`w-9 h-9 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-950/20 text-${metric.color}-600 flex items-center justify-center mb-3`}
              >
                {metric.icon}
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {metric.label}
              </p>
              <p className="text-2xl font-black mt-0.5 text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                Live DB Aggregate
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl bg-white dark:bg-gray-950 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">
              Delivery Performance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Success metrics of assigned farm inputs
            </p>
          </div>
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-full border-8 border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                  {successRate.toFixed(0)}%
                </h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Success Rate
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">
                Value of Goods Handled
              </span>
              <span className="font-black text-gray-900 dark:text-white">
                ₦
                {(
                  statsData?.summary?.total_value_handled ?? 0
                ).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(successRate, 0), 100)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">
              Performance Timeline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Completed input requests compiled by period
            </p>
          </div>
          <CardContent className="p-0">
            {loadingStats ? (
              <div className="space-y-4 p-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : !statsData?.history || statsData.history.length === 0 ? (
              <div className="text-center py-20">
                <FaChartLine
                  size={36}
                  className="text-gray-300 dark:text-gray-700 mx-auto mb-3"
                />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">
                  No timeline data available yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {[
                        "Period",
                        "Completed Count",
                        "Tonnage/Assigned Value",
                      ].map((h) => (
                        <th
                          key={h}
                          className="p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.history.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                      >
                        <td className="p-4 font-bold text-sm text-gray-900 dark:text-white">
                          {row.period}
                        </td>
                        <td className="p-4 font-bold text-sm text-emerald-600">
                          {row.count} Deliveries
                        </td>
                        <td className="p-4 font-black text-sm text-gray-900 dark:text-white">
                          ₦{parseFloat(row.value).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
