"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Loader2, Search, Globe, Plus, MapPin, Calendar, Activity, 
  ArrowRight, ShieldCheck, X, Layers, TrendingUp, Sparkles, Leaf
} from "lucide-react";
import { toast } from "react-toastify";

export default function TrialPlotsPage() {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New plot form state
  const [formData, setFormData] = useState({
    plot_name: "",
    location: "",
    crop: "",
    size_hectares: "",
    status: "active",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await fetch("/api/proxy/admin/institution/trial-plots");
        const json = await res.json();
        if (json.success) {
          setPlots(json.data || []);
        }
      } catch (error) {
        console.error("Failed to load trial plots:", error);
        toast.error("Failed to fetch trial plots");
      } finally {
        setLoading(false);
      }
    };
    fetchPlots();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plot_name || !formData.location || !formData.crop) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/trial-plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          size_hectares: parseFloat(formData.size_hectares) || 0,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPlots((prev) => [json.data, ...prev]);
        toast.success("Trial plot initialized successfully!");
        setModalOpen(false);
        setFormData({
          plot_name: "",
          location: "",
          crop: "",
          size_hectares: "",
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
        });
      } else {
        toast.error(json.error || "Failed to create trial plot");
      }
    } catch (error) {
      console.error("Error creating trial plot:", error);
      toast.error("Network error occurred while saving trial plot.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered plots based on search & status
  const filteredPlots = plots.filter((plot) => {
    const matchesSearch = 
      plot.plot_name?.toLowerCase().includes(search.toLowerCase()) ||
      plot.crop?.toLowerCase().includes(search.toLowerCase()) ||
      plot.location?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "ALL" || plot.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs from plots
  const totalPlots = plots.length;
  const totalHectares = plots.reduce((acc, curr) => acc + (parseFloat(curr.size_hectares) || 0), 0);
  const activeExperiments = plots.filter((p) => p.status?.toLowerCase() === "active").length;
  const uniqueCrops = new Set(plots.map((p) => p.crop?.toLowerCase()).filter(Boolean)).size;

  const getStatusBadge = (status) => {
    const s = (status || "active").toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ACTIVE TRIAL
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30">
          COMPLETED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 uppercase">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out pb-12">
      {/* Background ambient lighting */}
      <div className="relative pointer-events-none">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -top-12 right-12 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl -z-10" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Agronomic Research Hub
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Experimental <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600">Trial Plots</span>
          </h1>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
            Monitor agronomic yield experiments, validate hybrid crop stress tolerance, and oversee regional research trial locations in real-time.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black px-6 py-6 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" strokeWidth={3} /> Register Trial Plot
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full transition-all duration-500 group-hover:scale-110 -z-0" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Trial Plots</p>
                <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{loading ? "-" : totalPlots}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-extrabold">
              <span>Verified monitoring units</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full transition-all duration-500 group-hover:scale-110 -z-0" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Active Area (Ha)</p>
                <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">
                  {loading ? "-" : totalHectares.toFixed(1)} <span className="text-lg font-bold text-gray-500">ha</span>
                </h3>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-teal-600 font-extrabold">
              <span>Under controlled trial study</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full transition-all duration-500 group-hover:scale-110 -z-0" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Ongoing Experiments</p>
                <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{loading ? "-" : activeExperiments}</h3>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl shadow-xs">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-600 font-extrabold">
              <span>Telemetry data recording</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl shadow-lg shadow-gray-200/50 dark:shadow-none rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full transition-all duration-500 group-hover:scale-110 -z-0" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Crop Diversity</p>
                <h3 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{loading ? "-" : uniqueCrops} <span className="text-sm font-semibold text-gray-400">species</span></h3>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl shadow-xs">
                <Leaf className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 font-extrabold">
              <span>Varietal stress testing</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-gray-950/50 p-4 rounded-2xl border border-gray-200/60 dark:border-white/10 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {["ALL", "ACTIVE", "COMPLETED", "PLANNED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {status} {status === "ALL" && `(${plots.length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plot name, crop, or state..."
            className="pl-10 h-11 rounded-xl bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-white/10 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Main Data Table Card */}
      <Card className="border-0 bg-white/80 dark:bg-gray-950/70 backdrop-blur-2xl shadow-2xl shadow-gray-200/60 dark:shadow-none rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/10 overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] py-5 px-8">
          <CardTitle className="text-lg font-black flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity className="w-5 h-5 text-emerald-500" />
              Registered Trial Plot Directory
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Showing <strong className="text-gray-900 dark:text-white">{filteredPlots.length}</strong> records
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-sm font-extrabold text-gray-500 animate-pulse tracking-wide uppercase">
                Synchronizing research telemetry...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200/60 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50/30 dark:bg-white/[0.01]">
                    <th className="py-4 px-8">Plot Identity & Code</th>
                    <th className="py-4 px-6">Location / Jurisdiction</th>
                    <th className="py-4 px-6">Crop Variety</th>
                    <th className="py-4 px-6 text-center">Size (Ha)</th>
                    <th className="py-4 px-6">Study Timeline</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                  {filteredPlots.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner">
                            <Leaf className="w-10 h-10 stroke-1" />
                          </div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {search || statusFilter !== "ALL" ? "No matches found" : "No Trial Plots Initialized"}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 max-w-xs text-center leading-relaxed">
                            {search || statusFilter !== "ALL"
                              ? "Try adjusting your filter parameters or search keywords to locate experimental records."
                              : "Get started by initializing your institution's first agricultural yield testing plot and begin gathering real-time telemetry."}
                          </p>
                          {(!search && statusFilter === "ALL") && (
                            <Button
                              onClick={() => setModalOpen(true)}
                              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg transition-all"
                            >
                              Initialize First Trial Plot
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPlots.map((plot) => (
                      <tr
                        key={plot.id}
                        className="group hover:bg-emerald-50/40 dark:hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                              {plot.plot_name?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {plot.plot_name}
                              </p>
                              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                ID: #{plot.id?.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                            <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{plot.location || "N/A"}</span>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-extrabold text-xs text-gray-800 dark:text-gray-200">
                            <Leaf className="w-3.5 h-3.5 text-amber-500" />
                            {plot.crop || "Generic Variety"}
                          </div>
                        </td>

                        <td className="py-5 px-6 text-center">
                          <span className="font-mono font-black text-base text-gray-900 dark:text-white">
                            {parseFloat(plot.size_hectares || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Ha</span>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              {plot.start_date ? new Date(plot.start_date).toLocaleDateString() : "Immediate"} 
                              {plot.end_date ? ` — ${new Date(plot.end_date).toLocaleDateString()}` : " (Ongoing)"}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-6 text-center">
                          {getStatusBadge(plot.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Register New Trial Plot</h3>
                  <p className="text-xs text-emerald-100 font-semibold">Deploy research tracking parameters</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Plot Title / Designation *
                </label>
                <Input
                  name="plot_name"
                  value={formData.plot_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Drought-Resistant Maize Trial #4"
                  required
                  className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Location / Agronomic Zone *
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Kano South Station"
                    required
                    className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Crop Variety *
                  </label>
                  <Input
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    placeholder="e.g. Hybrid Maize (SAMMAZ 52)"
                    required
                    className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Plot Size (Hectares)
                  </label>
                  <Input
                    name="size_hectares"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.size_hectares}
                    onChange={handleInputChange}
                    placeholder="e.g. 2.5"
                    className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 rounded-xl font-bold bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active Trial (Ongoing)</option>
                    <option value="planned">Planned (Upcoming)</option>
                    <option value="completed">Completed (Published)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Start Date
                  </label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Expected Completion
                  </label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full h-11 rounded-xl font-semibold bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  variant="ghost"
                  className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Initializing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Deploy Trial Plot
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
