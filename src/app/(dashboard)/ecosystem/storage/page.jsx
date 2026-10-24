"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Box, Boxes, Package, FileText, CheckCircle, MapPin, Camera, Navigation, AlertCircle, Eye, X, UploadCloud, Lock, Warehouse, RefreshCw, Search, ArrowUpRight, ShieldCheck, Calendar, Layers, SlidersHorizontal, Sparkles, TrendingUp, Settings } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";

export default function StorageDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");
  const [stats, setStats] = useState({
    total_capacity: 0,
    active_tickets: 0,
    stored_inventory: 0,
    expected_arrivals: 0
  });
  const [tickets, setTickets] = useState([]);
  const [preHarvestListings, setPreHarvestListings] = useState([]);

  // Intake Verification Modal State
  const [intakeTicket, setIntakeTicket] = useState(null);
  const [intakeForm, setIntakeForm] = useState({
    grade: "Grade A",
    moisture_pct: 12.5,
    foreign_matter_pct: 1.0,
    notes: "Standard warehouse intake inspection & moisture testing"
  });
  const [intakeFile, setIntakeFile] = useState(null);
  const [intakePreview, setIntakePreview] = useState(null);
  const [geoLoc, setGeoLoc] = useState({ lat: null, lng: null, accuracy: null, timestamp: null, error: null, fetching: false });
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);

  // Lightbox State
  const [viewingMedia, setViewingMedia] = useState(null);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const [statsRes, ticketsRes, preHarvestRes, sessRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/storage/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/storage/tickets"),
        fetch("/api/proxy/pipeline/preharvest/opportunities"),
        fetch("/api/auth/session").catch(() => null)
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      const preHarvestData = await preHarvestRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
      if (preHarvestData.success) setPreHarvestListings(preHarvestData.data);

      if (sessRes && sessRes.ok) {
        const sessData = await sessRes.json().catch(() => null);
        if (sessData?.authenticated) {
          setIsApproved(sessData.approval_status === "approved");
        }
      } else {
        const fallbackSess = await verifyVendorSession().catch(() => null);
        if (fallbackSess?.authenticated) {
          setIsApproved(fallbackSess.approval_status === "approved");
        }
      }

      if (showToast) toast.success("Storage metrics synced");
    } catch (error) {
      console.error("Error fetching storage data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setGeoLoc(prev => ({ ...prev, error: "Geolocation is not supported by your browser." }));
      return;
    }
    setGeoLoc(prev => ({ ...prev, fetching: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date(pos.timestamp).toISOString(),
          error: null,
          fetching: false
        });
      },
      (err) => {
        setGeoLoc(prev => ({
          ...prev,
          fetching: false,
          error: err.message || "Failed to retrieve device location."
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const openIntakeModal = (ticket) => {
    if (!isApproved) {
      toast.warning("⏳ Account Pending SuperAdmin Approval: Warehouse intake processing is locked until approved.");
      return;
    }
    setIntakeTicket(ticket);
    setIntakeFile(null);
    setIntakePreview(null);
    setIntakeForm({
      grade: "Grade A",
      moisture_pct: 12.5,
      foreign_matter_pct: 1.0,
      notes: "Standard warehouse intake inspection & moisture testing"
    });
    captureGPS();
  };

  const closeIntakeModal = () => {
    setIntakeTicket(null);
    setIntakeFile(null);
    setIntakePreview(null);
  };

  const handleIntakeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIntakeFile(file);
      setIntakePreview(URL.createObjectURL(file));
      if (!geoLoc.lat && !geoLoc.fetching) {
        captureGPS();
      }
    }
  };

  const submitIntakeVerification = async () => {
    if (!intakeTicket) return;

    setIsSubmittingIntake(true);
    try {
      let uploadedUrl = null;
      if (intakeFile) {
        const uploadData = new FormData();
        uploadData.append("file", intakeFile);
        const uploadRes = await fetch("/api/proxy/vendor/upload/document", {
          method: "POST",
          body: uploadData
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.success) {
          uploadedUrl = uploadJson.data.url;
        } else {
          toast.error(uploadJson.error || "Failed to upload intake inspection photo");
          setIsSubmittingIntake(false);
          return;
        }
      }

      const payload = {
        grade: intakeForm.grade,
        moisture_pct: parseFloat(intakeForm.moisture_pct) || 12.5,
        foreign_matter_pct: parseFloat(intakeForm.foreign_matter_pct) || 1.0,
        notes: intakeForm.notes,
        intake_proof_url: uploadedUrl,
        intake_latitude: geoLoc.lat,
        intake_longitude: geoLoc.lng,
        intake_geospatial_metadata: {
          accuracy_meters: geoLoc.accuracy,
          captured_at: geoLoc.timestamp || new Date().toISOString(),
          geotagged: !!(geoLoc.lat && geoLoc.lng)
        }
      };

      const res = await fetch(`/api/proxy/vendor/commodity-operations/storage/tickets/${intakeTicket.ticket_id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Storage batch verified and e-NWR issued!`);
        closeIntakeModal();
        fetchData();
      } else {
        toast.error(data.error || "Failed to accept storage ticket.");
      }
    } catch (error) {
      console.error("Error accepting ticket:", error);
      toast.error("Network error while accepting ticket.");
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  const handleIssueNwr = async (ticketId) => {
    if (!isApproved) {
      toast.warning("🔒 Account Pending SuperAdmin Approval: e-NWR issuance is locked until verified.");
      return;
    }
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/storage/tickets/${ticketId}/issue-nwr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: "Grade A", moisture_pct: 12.5 })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`e-NWR ${data.data.nwr_number} successfully issued!`);
        fetchData();
      } else {
        toast.error(data.error || "Failed to issue e-NWR.");
      }
    } catch (error) {
      console.error("Error issuing e-NWR:", error);
      toast.error("Network error while issuing e-NWR.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  const utilization = stats.total_capacity > 0 ? ((stats.stored_inventory / stats.total_capacity) * 100).toFixed(1) : 0;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = !ticketSearch || 
      ticket.ticket_number?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.crop?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.entity_name?.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesFilter = ticketFilter === "all" || ticket.status === ticketFilter;
    return matchesSearch && matchesFilter;
  });

  const reservedCount = tickets.filter(t => t.status === "reserved").length;
  const activeCount = tickets.filter(t => t.status === "active").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Storage Hub • Node Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Verification • Operations Locked
              </span>
            )}
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Electronic Warehouse Receipts (e-NWR)</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Storage & Warehouse Portal
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            Real-time warehouse capacity management, incoming cluster harvest intakes, moisture testing, and electronic warehouse receipt (e-NWR) generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 shadow-xs transition-all cursor-pointer"
            title="Refresh metrics from backend"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-emerald-600" : "text-gray-500"} />
            <span>Sync</span>
          </button>

          <Link
            href="/ecosystem/storage/calendar"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80 shadow-xs transition-all cursor-pointer"
          >
            <Calendar size={13} className="text-emerald-600" />
            <span>Availability Windows</span>
          </Link>

          <Link
            href="/ecosystem/storage/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Settings size={13} />
            <span>Facility Config</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Capacity Card */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Capacity</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Warehouse size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {Number(stats.total_capacity).toLocaleString()} <span className="text-base font-bold text-gray-400">MT</span>
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">{utilization}% Utilized</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Number(stats.stored_inventory).toLocaleString()} MT Filled</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Tickets Card */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Tickets</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.active_tickets}
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {reservedCount > 0 ? `${reservedCount} awaiting verification` : "All current batches verified"}
            </p>
          </div>
        </div>

        {/* Expected Arrivals Card */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Arrivals</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.expected_arrivals}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Pending Intake Inspection
            </p>
          </div>
        </div>

        {/* Stored Inventory Card */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stored Inventory</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {Number(stats.stored_inventory).toLocaleString()} <span className="text-base font-bold text-gray-400">MT</span>
            </div>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Quality & Moisture Audited
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Tickets & Intake Queue */}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden backdrop-blur-sm">
        {/* Header with Search and Filter Tabs */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Active Storage Tickets & Intake Queue
                </h2>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Real-time inventory receipting, quality grading verification, and cryptographic e-NWR issuance
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setTicketFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ticketFilter === "all"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter("reserved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === "reserved"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketFilter === "reserved" ? "bg-white" : "bg-amber-500"}`} />
                Pending Intake ({reservedCount})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketFilter === "active" ? "bg-white" : "bg-emerald-500"}`} />
                In Storage ({activeCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="Search by ticket #, farmer/depositor name, crop commodity..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            {ticketSearch && (
              <button
                type="button"
                onClick={() => setTicketSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Warehouse size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {ticketSearch || ticketFilter !== "all" ? "No matching tickets found" : "No storage tickets yet"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              {ticketSearch || ticketFilter !== "all"
                ? "Try adjusting your search criteria or resetting the status filter above."
                : "Active commodity intake requests and reservations assigned to this storage hub will appear here."}
            </p>
            {(ticketSearch || ticketFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setTicketSearch("");
                  setTicketFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTickets.map((ticket) => {
              const isReserved = ticket.status === "reserved";
              return (
                <div
                  key={ticket.ticket_id}
                  className="p-6 md:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  {/* Left: Identification & Depositor */}
                  <div className="space-y-2 min-w-[260px]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-base text-gray-900 dark:text-white">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isReserved
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        }`}
                      >
                        {ticket.status}
                      </span>
                      {ticket.nwr_number && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <CheckCircle size={11} className="text-blue-500" />
                          e-NWR: {ticket.nwr_number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {ticket.entity_name}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{ticket.entity_role}</span>
                    </div>
                  </div>

                  {/* Middle: Crop Specs & Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 flex-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Crop Commodity</p>
                      <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5">{ticket.crop}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Volume</p>
                      <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5">
                        {ticket.reserved_volume_mt} <span className="text-[11px] font-bold text-gray-400">MT</span>
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Holding Period</p>
                      <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5">
                        {ticket.storage_duration_days} <span className="text-[11px] font-bold text-gray-400">Days</span>
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Quality Specs</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                        {ticket.grade || "Ungraded"} {ticket.moisture_pct ? `(${ticket.moisture_pct}% M)` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Geotagged Intake Evidence */}
                  {ticket.intake_proof_url && (
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setViewingMedia({
                            url: ticket.intake_proof_url,
                            lat: ticket.intake_latitude,
                            lng: ticket.intake_longitude,
                            verified_at: ticket.intake_verified_at
                          })
                        }
                        className="relative group/thumb w-12 h-12 rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 shadow-xs shrink-0"
                      >
                        <img
                          src={ticket.intake_proof_url}
                          alt="Intake Proof"
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                      <div className="space-y-0.5 text-left">
                        {ticket.intake_latitude && ticket.intake_longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${ticket.intake_latitude},${ticket.intake_longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1 font-bold"
                          >
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            {Number(ticket.intake_latitude).toFixed(3)}, {Number(ticket.intake_longitude).toFixed(3)}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Intake Photo</span>
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block font-medium">
                          Geotagged & Audited
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-auto">
                    {ticket.status === "reserved" && (
                      <button
                        type="button"
                        onClick={() => openIntakeModal(ticket)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Camera size={14} />
                        Verify & Issue e-NWR
                      </button>
                    )}
                    {ticket.status === "active" && !ticket.nwr_number && (
                      <button
                        type="button"
                        onClick={() => handleIssueNwr(ticket.ticket_id)}
                        className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <FileText size={14} />
                        Issue e-NWR
                      </button>
                    )}
                    {ticket.status === "active" && ticket.nwr_number && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 rounded-2xl shadow-xs">
                        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                        e-NWR Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pre-Harvest Inflow Forecast Radar */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Predictive Intelligence
              </span>
              <span className="text-xs text-emerald-400/80 font-semibold">• Cluster Harvest Radar</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Expected Inflow Forecast (Pre-Harvest)
            </h2>
            <p className="text-xs text-emerald-200/70">
              Upcoming field harvests tracked across registered farmer clusters to pre-allocate bay capacity
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-emerald-200 self-start md:self-auto">
            {preHarvestListings.length} Pipeline Batches Detected
          </div>
        </div>

        {preHarvestListings.length === 0 ? (
          <div className="relative z-10 text-center py-12 px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Boxes className="w-10 h-10 text-emerald-400/50 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No pending harvest inflows detected</p>
            <p className="text-xs text-emerald-200/60 max-w-sm mx-auto mt-1">
              When cluster supervisors log seasonal harvest forecasts in your radius, intake estimates will sync here automatically.
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {preHarvestListings.map((listing) => (
              <div
                key={listing.id}
                className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-white tracking-tight">{listing.commodity}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Forecasted
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/70 font-medium mt-1">
                      Lead Supervisor: <span className="text-white font-semibold">{listing.supervisor_name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-300">
                      {listing.estimated_yield_tons} <span className="text-xs font-bold text-emerald-400/80">MT</span>
                    </span>
                    <p className="text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider">Est. Yield</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/80">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-emerald-400" />
                    Target Harvest: {new Date(listing.expected_harvest_date).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Reserve Bay Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geospatial Intake & Quality Verification Modal */}
      {intakeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30">
              <div>
                <h3 className="text-lg font-black text-(--foreground) flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Intake Inspection & Issue e-NWR
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ticket #{intakeTicket.ticket_number} • {intakeTicket.crop} ({intakeTicket.reserved_volume_mt} MT)
                </p>
              </div>
              <button
                type="button"
                onClick={closeIntakeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Quality Grade & Moisture Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Quality Grade
                  </label>
                  <select
                    value={intakeForm.grade}
                    onChange={(e) => setIntakeForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border text-sm bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Commercial)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={intakeForm.moisture_pct}
                    onChange={(e) => setIntakeForm(prev => ({ ...prev, moisture_pct: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border text-sm bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Intake Inspection Photo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Intake Commodity Photo
                </label>
                {intakePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-44 group">
                    <img src={intakePreview} alt="Intake Preview" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setIntakeFile(null); setIntakePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Photo Attached
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition">
                    <UploadCloud className="w-7 h-7 text-emerald-600 mb-1" />
                    <span className="text-sm font-bold text-(--foreground)">Upload Intake Grain / Batch Photo</span>
                    <span className="text-xs text-gray-400">Verifies physical receipt at warehouse</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleIntakeFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Real-time Geospatial Tagging */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" /> Warehouse Location Tag
                  </span>
                  <button
                    type="button"
                    onClick={captureGPS}
                    disabled={geoLoc.fetching}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {geoLoc.fetching ? <FaSpinner className="animate-spin text-xs" /> : "Refresh GPS"}
                  </button>
                </div>

                {geoLoc.lat && geoLoc.lng ? (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Lat: {Number(geoLoc.lat).toFixed(6)}, Lng: {Number(geoLoc.lng).toFixed(6)}
                    </div>
                    {geoLoc.accuracy && (
                      <p className="text-[11px] text-gray-500">
                        Accuracy: ±{Math.round(geoLoc.accuracy)}m • Geotagged at {new Date(geoLoc.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : geoLoc.fetching ? (
                  <p className="text-xs text-blue-500 flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Acquiring warehouse coordinates...
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {geoLoc.error || "Click Refresh GPS to attach warehouse coordinates."}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Intake Notes
                </label>
                <textarea
                  rows={2}
                  value={intakeForm.notes}
                  onChange={(e) => setIntakeForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border text-sm bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeIntakeModal}
                  disabled={isSubmittingIntake}
                  className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitIntakeVerification}
                  disabled={isSubmittingIntake}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow disabled:opacity-50"
                >
                  {isSubmittingIntake ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Issuing e-NWR...
                    </>
                  ) : (
                    "Verify & Issue e-NWR"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Intake Image */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white dark:bg-gray-900 border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Warehouse Intake Geotagged Evidence</h4>
                {viewingMedia.verified_at && (
                  <p className="text-xs text-gray-400">Verified: {new Date(viewingMedia.verified_at).toLocaleString()}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewingMedia(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center">
              <img src={viewingMedia.url} alt="Intake Evidence" className="max-h-[60vh] object-contain rounded-lg" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-xs">
              {viewingMedia.lat && viewingMedia.lng ? (
                <a
                  href={`https://www.google.com/maps?q=${viewingMedia.lat},${viewingMedia.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:underline font-mono font-bold flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  View GPS on Google Maps ({Number(viewingMedia.lat).toFixed(6)}, {Number(viewingMedia.lng).toFixed(6)})
                </a>
              ) : (
                <span className="text-gray-400">No GPS coordinates recorded</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
