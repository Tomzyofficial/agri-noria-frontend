"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import {
  Landmark, Users, Activity, CheckCircle2, TrendingUp, Calendar,
  ArrowUpRight, ShieldAlert, ShieldCheck, Loader2, FileText, Plus, Globe, BarChart3, Droplets, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const GovernmentDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Registered Farmers</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cultivated Hectares</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalHectares?.toLocaleString() || "0"} <span className="text-sm">ha</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Globe size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Programmes</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.activePrograms || "0"}</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Landmark size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Irrigation Coverage</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">12.4%</h3>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-xl"><Droplets size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm"><CardHeader><CardTitle>National Crop Distribution</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">Map/Chart Placeholder</CardContent></Card>
      <Card className="border-none shadow-sm"><CardHeader><CardTitle>Climate Risk Matrix</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">Matrix Placeholder</CardContent></Card>
    </div>
  </div>
);

const BankDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Outstanding Loans</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">₦{stats.overview?.totalDeployed?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Repayment Rate</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">87.5%</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Portfolio at Risk</p>
              <h3 className="text-3xl font-black mt-2 text-red-500">12.5%</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl"><ShieldAlert size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Farmer Profiles</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const CommodityBoardDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Enrolled Farmers</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Production Forecast</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">2,450 <span className="text-sm">MT</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><BarChart3 size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Export Readiness</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">68%</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><ArrowUpRight size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card className="border-none shadow-sm"><CardHeader><CardTitle>Harvest Calendar</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">Calendar Placeholder</CardContent></Card>
  </div>
);

const DFIDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.activePrograms || "0"}</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Landmark size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Farmers Reached</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Women Reached</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">42%</h3>
            </div>
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Funds Disbursed</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">₦{stats.overview?.totalDeployed?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm"><CardHeader><CardTitle>Carbon & Climate Indicators</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">ESG Analytics Placeholder</CardContent></Card>
      <Card className="border-none shadow-sm"><CardHeader><CardTitle>SDG Reporting Matrix</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">SDG Matrix Placeholder</CardContent></Card>
    </div>
  </div>
);

const NGODashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Beneficiaries</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.activePrograms || "0"}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Landmark size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Training Adoption</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">76%</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card className="border-none shadow-sm"><CardHeader><CardTitle>Communities Reached</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-gray-400">Map Placeholder</CardContent></Card>
  </div>
);

export default function InstitutionDashboard() {
  const [userRole, setUserRole] = useState("");
  const [stats, setStats] = useState({
    overview: { activePrograms: 0, totalFarmers: 0, totalHectares: 0, totalDeployed: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, authRes] = await Promise.all([
          fetch("/api/proxy/admin/institution/analytics"),
          fetch("/api/proxy/auth/verify-vendor"),
        ]);

        const analyticsJson = await analyticsRes.json();
        const authJson = await authRes.json();

        if (authJson?.authenticated) {
          setUserRole(authJson.role?.toLowerCase() || "");
        }
        if (analyticsJson.success) {
          setStats(analyticsJson.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight capitalize">
            {userRole} Workspace
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
            Program-Centric Command Center
          </p>
        </div>
        <Link href="/ecosystem/institution/programs">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2">
            <Plus size={18} /> New Programme
          </Button>
        </Link>
      </div>

      {userRole === "government" && <GovernmentDashboard stats={stats} />}
      {userRole === "bank" && <BankDashboard stats={stats} />}
      {userRole === "commodity board" && <CommodityBoardDashboard stats={stats} />}
      {userRole === "dfi" && <DFIDashboard stats={stats} />}
      {userRole === "ngo" && <NGODashboard stats={stats} />}
      
      {/* Fallback for Generic Institution Role */}
      {(!["government", "bank", "commodity board", "dfi", "ngo"].includes(userRole)) && (
         <GovernmentDashboard stats={stats} />
      )}
    </div>
  );
}
