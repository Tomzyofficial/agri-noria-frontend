"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import {
  Landmark,
  Users,
  Activity,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function InstitutionDashboard() {
  const [stats, setStats] = useState({
    overview: {
      activePrograms: 0,
      totalFarmers: 0,
      totalHectares: 0,
      totalDeployed: 0,
    },
    recentPrograms: [],
    systemHealth: [],
    upcomingDeadlines: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, programsRes] = await Promise.all([
          fetch("/api/proxy/admin/institution/analytics"),
          fetch("/api/proxy/programs"),
        ]);

        const analyticsJson = await analyticsRes.json();
        const programsJson = await programsRes.json();

        if (analyticsJson.success && programsJson.success) {
          setStats({
            overview: analyticsJson.data.overview,
            recentPrograms: programsJson.data.slice(0, 3),
            systemHealth: analyticsJson.data.systemHealth || [],
            upcomingDeadlines: analyticsJson.data.upcomingDeadlines || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-(--foreground) tracking-tight">
            Institution Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Ecosystem orchestration and financial governance center.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl h-12 px-6 font-bold border-gray-200 dark:border-gray-800"
          >
            <FileText className="w-4 h-4 mr-2 text-blue-500" /> Audit Logs
          </Button>
          <Link href="/ecosystem/institution/programs">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
              <Plus className="w-5 h-5 mr-2" /> Launch Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Active Programs",
            value: stats.overview.activePrograms,
            icon: <Landmark />,
            color: "blue",
            sub: "Currently running",
          },
          {
            label: "Enrolled Farmers",
            value: stats.overview.totalFarmers.toLocaleString(),
            icon: <Users />,
            color: "emerald",
            sub: "Across all interventions",
          },
          {
            label: "Total Deployed",
            value: `₦${stats.overview.totalDeployed.toLocaleString()}`,
            icon: <TrendingUp />,
            color: "purple",
            sub: "Approved financing",
          },
          {
            label: "Total Hectares",
            value: stats.overview.totalHectares.toLocaleString(),
            icon: <ShieldCheck />,
            color: "orange",
            sub: "Under cultivation",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden relative group transition-all hover:-translate-y-1"
          >
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-${stat.color}-500`}
            />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 rounded-2xl`}
                >
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black mt-1 text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Programs */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-gray-950">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-bold">Recent Programs</CardTitle>
            <Link
              href="/ecosystem/institution/programs"
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {stats.recentPrograms.map((prog, i) => (
                <div
                  key={i}
                  className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                      {prog.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {prog.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {prog.commodity} — {prog.region}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {prog.target_farmers} Farmers
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">
                      {new Date(prog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentPrograms.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic">
                  No programs launched yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Activity */}
        <Card className="border-none shadow-xl bg-white dark:bg-gray-950">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-bold">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              {stats.systemHealth.map((svc) => (
                <div key={svc.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {svc.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full bg-${svc.color}-500 animate-pulse`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase text-${svc.color}-600`}
                    >
                      {svc.status}
                    </span>
                  </div>
                </div>
              ))}
              {stats.systemHealth.length === 0 && (
                <div className="text-center text-gray-400 italic text-sm">
                  No health data available.
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
                Upcoming Deadlines
              </p>
              {stats.upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-2"
                >
                  <Calendar className="w-8 h-8 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                      {deadline.title}
                    </p>
                    <p className="text-[10px] text-blue-600 font-black">
                      {new Date(deadline.date)
                        .toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.upcomingDeadlines.length === 0 && (
                <div className="text-center text-gray-400 italic text-sm p-4">
                  No upcoming deadlines.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
