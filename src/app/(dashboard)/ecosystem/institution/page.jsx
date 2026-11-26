"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import {
  Landmark, Users, Activity, CheckCircle2, TrendingUp, Calendar,
  ArrowUpRight, ShieldAlert, ShieldCheck, Loader2, FileText, Plus, Globe, BarChart3, Droplets, Leaf,
  Package, Truck, Percent, Wheat, Warehouse, Handshake, MapPin
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
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.irrigationCoverage || "0"}%</h3>
            </div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-xl"><Droplets size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const BankDashboard = () => {
  const [portfolio, setPortfolio] = useState({ activeLoans: 0, repaymentRate: 0, atRisk: 0, enrolledFarmers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/portfolio");
        const json = await res.json();
        if (json.success) {
          setPortfolio(json.data || { activeLoans: 0, repaymentRate: 0, atRisk: 0, enrolledFarmers: 0 });
        }
      } catch (error) {
        console.error("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) return <div className="h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Outstanding Loans</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">₦{parseFloat(portfolio.activeLoans || 0).toLocaleString()}</h3>
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
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{portfolio.repaymentRate}%</h3>
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
                <h3 className="text-3xl font-black mt-2 text-red-500">{portfolio.atRisk}%</h3>
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
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{(portfolio.enrolledFarmers || 0).toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users size={24} /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalHarvests?.toLocaleString() || "0"} <span className="text-sm">MT</span></h3>
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
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.programKpi || "0"}%</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><ArrowUpRight size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
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
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.womenPercentage || "0"}%</h3>
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
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.trainingAdoption || "0"}%</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ProducerAssociationDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Network Producers</p>
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
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Member Cooperatives</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalCooperatives?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Globe size={24} /></div>
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
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Programme KPIs</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.programKpi || "0"}%</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Hub */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Producer Group Management</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Coordinate regional commodity cohorts and assign programmes</p>
          </div>
          <Link href="/ecosystem/institution/producer-groups" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            Manage Groups
          </Link>
        </div>
      </Card>

      <Card className="border-none shadow-sm bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Member Cooperatives Network</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Affiliate independent cooperatives to your association</p>
          </div>
          <Link href="/ecosystem/institution/cooperatives" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            View Network
          </Link>
        </div>
      </Card>
    </div>
  </div>
);

const CooperativeDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Members</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalFarmers?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Users size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Hectares</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalHectares?.toLocaleString() || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Globe size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Financing</p>
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
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Harvests</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalHarvests?.toLocaleString() || "0"} MT</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Leaf size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Hub */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Member Clusters</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Organize cooperative members and request programme inputs</p>
          </div>
          <Link href="/ecosystem/institution/member-clusters" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            Manage Clusters
          </Link>
        </div>
      </Card>

      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Farmer Members Directory</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Add or link verified farmers with single digital identity</p>
          </div>
          <Link href="/ecosystem/institution/farmers" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            View Members
          </Link>
        </div>
      </Card>
    </div>
  </div>
);

const ResearchInstitutionDashboard = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Research Projects</p>
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
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Trial Plots</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalTrialPlots || "0"}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Globe size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Publications</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.totalPublications || "0"}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><FileText size={24} /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Scientific Advisories</p>
              <h3 className="text-3xl font-black mt-2 text-(--foreground)">{stats.overview?.researchAlerts || "0"}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><ShieldAlert size={24} /></div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Quick Hub */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Research Programme Workspace</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Manage experimental cohorts, observations, and grant proposals</p>
          </div>
          <Link href="/ecosystem/institution/research-projects" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            Manage Research
          </Link>
        </div>
      </Card>

      <Card className="border-none shadow-sm bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-(--foreground)">Trial Plots & Field Trials</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">Map geographic trial plots and cultivar performance</p>
          </div>
          <Link href="/ecosystem/institution/trial-plots" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-4 py-2.5 inline-flex items-center justify-center transition-colors">
            View Plots
          </Link>
        </div>
      </Card>
    </div>
  </div>
);

const InputMetricsPanel = ({ inputMetrics }) => {
  if (!inputMetrics) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package size={20} className="text-indigo-600" />
        <h2 className="text-lg font-black text-(--foreground) uppercase tracking-wider">Input Metrics</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inputs Allocated</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{(inputMetrics.inputsAllocated || 0).toLocaleString()}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">₦{parseFloat(inputMetrics.allocatedValue || 0).toLocaleString()} value</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Package size={24} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inputs Delivered</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{(inputMetrics.inputsDelivered || 0).toLocaleString()}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">₦{parseFloat(inputMetrics.deliveredValue || 0).toLocaleString()} value</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Truck size={24} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Supplier Fulfilment</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{inputMetrics.supplierFulfilment || 0}%</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">of assigned requests delivered</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><CheckCircle2 size={24} /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Programme Utilisation</p>
                <h3 className="text-3xl font-black mt-2 text-(--foreground)">{inputMetrics.programmeUtilisation || 0}%</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">of programme funds deployed</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Percent size={24} /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SupplyChainMetricsPanel = ({ metrics }) => {
  if (!metrics) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin size={20} className="text-blue-600" />
        <h2 className="text-lg font-black text-(--foreground) uppercase tracking-wider">Supply Chain Metrics</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Harvest */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Harvest</p>
                <h3 className="text-2xl font-black mt-2 text-(--foreground)">{(metrics.harvestVolume || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">MT</span></h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{metrics.harvestBatches || 0} Batches</p>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Wheat size={20} /></div>
            </div>
          </CardContent>
        </Card>
        {/* Warehouse Inventory */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory</p>
                <h3 className="text-2xl font-black mt-2 text-(--foreground)">{(metrics.inventoryVolume || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">MT</span></h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">₦{parseFloat(metrics.inventoryValue || 0).toLocaleString()} Value</p>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Warehouse size={20} /></div>
            </div>
          </CardContent>
        </Card>
        {/* Logistics */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logistics</p>
                <h3 className="text-2xl font-black mt-2 text-(--foreground)">{metrics.logisticsActive || 0}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{metrics.logisticsDelivered || 0} Delivered</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Truck size={20} /></div>
            </div>
          </CardContent>
        </Card>
        {/* Commodity Sales */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sales</p>
                <h3 className="text-2xl font-black mt-2 text-(--foreground)">₦{parseFloat(metrics.salesValue || 0).toLocaleString()}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total Settlements</p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Activity size={20} /></div>
            </div>
          </CardContent>
        </Card>
        {/* Buyer Activity */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer Activity</p>
                <h3 className="text-2xl font-black mt-2 text-(--foreground)">{metrics.buyerAgreements || 0}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">₦{parseFloat(metrics.buyerFinancing || 0).toLocaleString()} Financed</p>
              </div>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Handshake size={20} /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InstitutionProfitAnalyticsPanel = ({ profitAnalytics, userRole }) => {
  if (!profitAnalytics) return null;
  const isBank = userRole === "bank";
  const breakdown = Array.isArray(profitAnalytics.programProfitBreakdown)
    ? profitAnalytics.programProfitBreakdown
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-600" />
          <h2 className="text-lg font-black text-(--foreground) uppercase tracking-wider">
            {isBank ? "Bank Profit & Interest Analytics" : "Institution Profit Made Analytics"}
          </h2>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          ROI: {profitAnalytics.roiPercent || 0}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Realized Profit Made</p>
            <h3 className="text-2xl font-black mt-2 text-emerald-600">
              ₦{parseFloat(profitAnalytics.totalProfitMade || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">
              {isBank ? "Settled bank interest returns" : "Settled interest & surplus payouts"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {isBank ? "Expected Loan Interest" : "Projected Interest / Yield"}
            </p>
            <h3 className="text-2xl font-black mt-2 text-blue-600">
              ₦{parseFloat(profitAnalytics.expectedInterestProfit || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">
              Across active funded programmes
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Institution Surplus Payouts</p>
            <h3 className="text-2xl font-black mt-2 text-purple-600">
              ₦{parseFloat(profitAnalytics.institutionSurplusEarned || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">
              Pending approval: ₦{parseFloat(profitAnalytics.pendingSurplusProfit || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-gray-950">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Principal Deployed</p>
            <h3 className="text-2xl font-black mt-2 text-(--foreground)">
              ₦{parseFloat(profitAnalytics.totalPrincipalDeployed || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">
              Direct programme capital deployed
            </p>
          </CardContent>
        </Card>
      </div>

      {breakdown.length > 0 && (
        <Card className="border-none shadow-sm bg-white dark:bg-gray-950 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500">
              Programme-by-Programme Profit & Settlement Breakdown
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-black uppercase tracking-wider">
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Principal Funded</th>
                  <th className="px-4 py-3">Bank Interest (%)</th>
                  <th className="px-4 py-3">Expected Profit</th>
                  <th className="px-4 py-3">Settled Interest</th>
                  <th className="px-4 py-3">Institution Surplus</th>
                  <th className="px-4 py-3">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {breakdown.slice(0, 8).map((item) => (
                  <tr key={item.program_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3 font-bold text-(--foreground)">
                      {item.program_name}
                      <span className="block text-[10px] font-normal text-gray-400 capitalize">{item.commodity}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">₦{parseFloat(item.principal_funded || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{item.bank_interest_rate || 0}%</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₦{parseFloat(item.expected_interest || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">₦{parseFloat(item.settled_interest || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-purple-600">₦{parseFloat(item.institution_payout || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.settlement_status === "settled"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.settlement_status === "pending_finance_approval"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {String(item.settlement_status || "active").replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

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
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 font-black rounded-full px-6 py-5 flex items-center gap-2 transition-all duration-300 hover:scale-105">
              {userRole === "bank" ? (
                <>Fund Programme</>
              ) : (
                <>
                  <Plus size={20} strokeWidth={3} /> New Programme
                </>
              )}
            </Button>
          </Link>
      </div>

      {userRole === "government" && <GovernmentDashboard stats={stats} />}
      {userRole === "bank" && <BankDashboard stats={stats} />}
      {userRole === "commodity board" && <CommodityBoardDashboard stats={stats} />}
      {userRole === "dfi" && <DFIDashboard stats={stats} />}
      {userRole === "ngo" && <NGODashboard stats={stats} />}
      
      {userRole === "producer association" && <ProducerAssociationDashboard stats={stats} />}
      {userRole === "cooperative" && <CooperativeDashboard stats={stats} />}
      {userRole === "research institution" && <ResearchInstitutionDashboard stats={stats} />}
      
      {/* Fallback for Generic Institution Role */}
      {(!["government", "bank", "commodity board", "dfi", "ngo", "producer association", "cooperative", "research institution"].includes(userRole)) && (
         <GovernmentDashboard stats={stats} />
      )}

      {/* Profit Made Analytics */}
      <InstitutionProfitAnalyticsPanel profitAnalytics={stats.profitAnalytics} userRole={userRole} />

      {/* Input Metrics - visible to all institution roles */}
      <InputMetricsPanel inputMetrics={stats.inputMetrics} />

      {/* Supply Chain Metrics - visible to all institution roles */}
      <SupplyChainMetricsPanel metrics={stats.supplyChainMetrics} />
    </div>
  );
}
