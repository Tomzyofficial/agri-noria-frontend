"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  SlidersHorizontal, 
  Lock, 
  User, 
  Wallet, 
  FileText, 
  Globe, 
  Clock, 
  X,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [copiedIp, setCopiedIp] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchLogs = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await fetch("/api/proxy/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLogs(json.data);
          if (showToast) toast.success("Audit logs refreshed successfully");
        }
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      toast.error("Network error while loading audit logs");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = !searchTerm || 
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === "ALL" || log.action?.toUpperCase().startsWith(actionFilter.toUpperCase());
      const matchesResource = resourceFilter === "ALL" || log.resource?.toLowerCase() === resourceFilter.toLowerCase();

      const logDate = new Date(log.timestamp);
      const matchesStart = !startDate || logDate >= new Date(`${startDate}T00:00:00`);
      const matchesEnd = !endDate || logDate <= new Date(`${endDate}T23:59:59`);

      return matchesSearch && matchesAction && matchesResource && matchesStart && matchesEnd;
    });
  }, [logs, searchTerm, actionFilter, resourceFilter, startDate, endDate]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, resourceFilter, startDate, endDate, pageSize]);

  // Unique resources for dropdown
  const uniqueResources = useMemo(() => {
    const set = new Set();
    logs.forEach(l => { if (l.resource) set.add(l.resource); });
    return Array.from(set).sort();
  }, [logs]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = logs.length;
    const suspensions = logs.filter(l => l.action?.toUpperCase().includes("SUSPEND")).length;
    const updates = logs.filter(l => l.action?.toUpperCase().includes("UPDATE") || l.action?.toUpperCase().includes("APPROVE")).length;
    const uniqueActors = new Set(logs.map(l => l.userEmail).filter(Boolean)).size;
    return { total, suspensions, updates, uniqueActors };
  }, [logs]);

  // Action badge styling
  const getActionBadge = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("SUSPEND") || act.includes("DELETE") || act.includes("REJECT")) {
      return {
        bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900",
        icon: <AlertTriangle size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
      };
    }
    if (act.includes("ACTIVATE") || act.includes("APPROVE") || act.includes("CREATE")) {
      return {
        bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
        icon: <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
      };
    }
    if (act.includes("DISBURSE")) {
      return {
        bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900",
        icon: <Wallet size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
      };
    }
    if (act.includes("UPDATE")) {
      return {
        bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900",
        icon: <SlidersHorizontal size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
      };
    }
    if (act.includes("LOGIN")) {
      return {
        bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900",
        icon: <Lock size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
      };
    }
    return {
      bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      icon: <FileText size={12} className="text-gray-500 shrink-0" />
    };
  };

  // IP formatting
  const renderIpAddress = (rawIp = "") => {
    const cleanIp = rawIp.replace(/^::ffff:/, "");
    const isLocal = cleanIp === "::1" || cleanIp === "127.0.0.1" || cleanIp === "localhost";
    const displayIp = isLocal ? "127.0.0.1" : cleanIp;

    return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{displayIp}</span>
        {isLocal ? (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            Localhost
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(displayIp);
              setCopiedIp(displayIp);
              toast.info(`Copied IP: ${displayIp}`, { autoClose: 1500 });
              setTimeout(() => setCopiedIp(null), 2000);
            }}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            title="Copy IP Address"
          >
            {copiedIp === displayIp ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No records to export");
      return;
    }
    const headers = ["Timestamp", "User Email", "Action", "Resource", "IP Address", "Details"];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${(l.userEmail || "").replace(/"/g, '""')}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.resource || "").replace(/"/g, '""')}"`,
      `"${(l.ipAddress || "").replace(/"/g, '""')}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agri_noria_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit log CSV exported successfully");
  };

  const handleQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Today
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    } else if (days > 0) {
      start.setDate(end.getDate() - days);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    } else {
      // Clear
      setStartDate("");
      setEndDate("");
    }
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setActionFilter("ALL");
    setResourceFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 animate-pulse">
          <ShieldCheck size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <FaSpinner className="animate-spin text-emerald-600" />
          <span>Loading Immutable Audit Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Governance & Compliance
            </span>
            <span className="text-xs text-gray-400 font-semibold">• Tamper-Evident Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            System Audit Logs
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">
            Real-time chronological record of administrative actions, governance overrides, security policies, and ledger adjustments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fetchLogs(true)}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-emerald-600" : "text-gray-500"} />
            <span>Sync Ledger</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Modern Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recorded Events
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
              Full System Trace Active
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Governance Overrides
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.suspensions}
            </div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
              Suspensions & Lockouts Enforced
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Updates & Approvals
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.updates}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              Verified Changes & Approvals
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Admin Actors
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.uniqueActors}
            </div>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
              Distinct Operational Accounts
            </p>
          </div>
        </div>
      </div>

      {/* Modern Filters Hub */}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm space-y-5 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-emerald-600" />
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Search & Filter Engine
            </h3>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 mr-1">Quick Date:</span>
            <button
              type="button"
              onClick={() => handleQuickDate(0)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(7)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 transition"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(30)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 transition"
            >
              30 Days
            </button>
            {(searchTerm || actionFilter !== "ALL" || resourceFilter !== "ALL" || startDate || endDate) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 ml-2"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
          {/* Search bar */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-gray-400">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Email, IP, keywords, resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Action Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-gray-400">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="SUSPEND">SUSPEND / LOCK</option>
              <option value="ACTIVATE">ACTIVATE / UNLOCK</option>
              <option value="APPROVE">APPROVE ROLE</option>
              <option value="UPDATE">UPDATE SETTINGS</option>
              <option value="DISBURSE">DISBURSE FUNDS</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-gray-400">Target Resource</label>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="ALL">All Resources</option>
              {uniqueResources.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-gray-400">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                title="Start Date"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                title="End Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Activity Logs Container */}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="p-6 md:p-7 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              Activity Audit Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {filteredLogs.length} Records
            </span>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Empty state */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Matching Audit Records</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-5">
              No system activity matches your current search criteria or date filters.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-850/60 border-b border-gray-200/80 dark:border-gray-800 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-5">Timestamp</th>
                    <th className="py-4 px-5">Actor / User</th>
                    <th className="py-4 px-5">Action</th>
                    <th className="py-4 px-5">Resource</th>
                    <th className="py-4 px-5">IP Address</th>
                    <th className="py-4 px-5">Details</th>
                    <th className="py-4 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs">
                  {paginatedLogs.map((log) => {
                    const badge = getActionBadge(log.action);
                    const formattedDate = new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true
                    });
                    const initial = (log.userEmail || "A").charAt(0).toUpperCase();

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                      >
                        {/* Timestamp */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-gray-400 shrink-0" />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {formattedDate}
                            </span>
                          </div>
                        </td>

                        {/* Actor / User */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {initial}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]" title={log.userEmail}>
                              {log.userEmail || "System Automation"}
                            </span>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-xs ${badge.bg}`}>
                            {badge.icon}
                            <span>{log.action}</span>
                          </span>
                        </td>

                        {/* Target Resource */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                            {log.resource || "General"}
                          </span>
                        </td>

                        {/* IP Address */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {renderIpAddress(log.ipAddress)}
                        </td>

                        {/* Details */}
                        <td className="py-4 px-5 max-w-xs truncate text-gray-600 dark:text-gray-400 font-medium" title={log.details}>
                          {log.details || "—"}
                        </td>

                        {/* Inspect action */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                            title="Inspect Log Entry"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-500">
              <div>
                Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {Math.min(currentPage * pageSize, filteredLogs.length)}
                </span>{" "}
                of <span className="font-bold text-gray-800 dark:text-gray-200">{filteredLogs.length}</span> entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Audit Event #{selectedLog.id}
                  </h3>
                  <p className="text-[11px] font-bold text-gray-400">Cryptographically Recorded Action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Action Type</span>
                  <p className="font-black text-gray-900 dark:text-white text-sm">{selectedLog.action}</p>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Target Resource</span>
                  <p className="font-black text-gray-900 dark:text-white text-sm">{selectedLog.resource}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Acting Administrator</span>
                <p className="font-black text-gray-900 dark:text-white break-all">{selectedLog.userEmail || "System"}</p>
                {selectedLog.userId && (
                  <p className="text-[10px] text-gray-400 font-mono">User ID: {selectedLog.userId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Client IP</span>
                  <div>{renderIpAddress(selectedLog.ipAddress)}</div>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Timestamp</span>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Event Description & Parameters</span>
                <div className="p-4 rounded-2xl bg-gray-950 text-emerald-400 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {selectedLog.details || "No additional description metadata recorded."}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 transition cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
