"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Camera, 
  Navigation, 
  AlertCircle, 
  Eye, 
  X, 
  UploadCloud, 
  Lock,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Box,
  Package,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";

export default function LogisticsDashboard() {
  const [stats, setStats] = useState({
    active_transit: 0,
    pending_dispatches: 0,
    total_volume_moved: 0,
    success_rate: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [ticketSearch, setTicketSearch] = useState("");

  // Delivery Modal State
  const [deliveryModalTicket, setDeliveryModalTicket] = useState(null);
  const [podFile, setPodFile] = useState(null);
  const [podPreview, setPodPreview] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [geoLoc, setGeoLoc] = useState({ lat: null, lng: null, accuracy: null, timestamp: null, error: null, fetching: false });
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Lightbox State
  const [viewingMedia, setViewingMedia] = useState(null);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const [statsRes, ticketsRes, sessRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/logistics/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/logistics/tickets"),
        fetch("/api/auth/session").catch(() => null)
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);

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

      if (showToast) toast.success("Logistics fleet metrics refreshed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load logistics data");
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

  const openDeliveryModal = (ticket) => {
    if (!isApproved) {
      toast.warning("⏳ Account Pending SuperAdmin Approval: Dispatch delivery confirmation is locked until approved.");
      return;
    }
    setDeliveryModalTicket(ticket);
    setPodFile(null);
    setPodPreview(null);
    setDeliveryNotes("");
    captureGPS();
  };

  const closeDeliveryModal = () => {
    setDeliveryModalTicket(null);
    setPodFile(null);
    setPodPreview(null);
    setDeliveryNotes("");
  };

  const handlePodChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPodFile(file);
      setPodPreview(URL.createObjectURL(file));
      if (!geoLoc.lat && !geoLoc.fetching) {
        captureGPS();
      }
    }
  };

  const acceptTicket = async (ticket_id) => {
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/logistics/tickets/${ticket_id}/accept`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Fleet Dispatched & Fee Deducted!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to dispatch fleet");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const submitCompleteDelivery = async () => {
    if (!deliveryModalTicket) return;

    if (!podFile) {
      toast.warning("Please upload a Proof of Delivery (POD) photo.");
      return;
    }

    setIsSubmittingDelivery(true);
    try {
      // 1. Upload POD image
      let uploadedUrl = null;
      const uploadData = new FormData();
      uploadData.append("file", podFile);

      const uploadRes = await fetch("/api/proxy/vendor/upload/document", {
        method: "POST",
        body: uploadData
      });
      const uploadJson = await uploadRes.json();
      if (uploadRes.ok && uploadJson.success) {
        uploadedUrl = uploadJson.data.url;
      } else {
        toast.error(uploadJson.error || "Failed to upload Proof of Delivery photo");
        setIsSubmittingDelivery(false);
        return;
      }

      // 2. Submit delivery confirmation with geospatial verification
      const payload = {
        delivery_proof_url: uploadedUrl,
        delivery_latitude: geoLoc.lat,
        delivery_longitude: geoLoc.lng,
        delivery_geospatial_metadata: {
          accuracy_meters: geoLoc.accuracy,
          captured_at: geoLoc.timestamp || new Date().toISOString(),
          geotagged: !!(geoLoc.lat && geoLoc.lng)
        },
        delivery_notes: deliveryNotes
      };

      const res = await fetch(`/api/proxy/vendor/commodity-operations/logistics/tickets/${deliveryModalTicket.ticket_id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Delivery verified with geospatial proof and completed!");
        closeDeliveryModal();
        fetchData();
      } else {
        toast.error(data.error || "Failed to complete delivery");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while completing delivery.");
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 animate-pulse">
          <Truck size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <FaSpinner className="animate-spin text-emerald-600" />
          <span>Synchronizing Fleet Telemetry...</span>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !ticketSearch ||
      ticket.ticket_number?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.crop?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.origin?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.destination?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.entity_name?.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesFilter = ticketFilter === "all" || ticket.status === ticketFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const inTransitCount = tickets.filter((t) => t.status === "in_transit").length;
  const deliveredCount = tickets.filter((t) => t.status === "delivered").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            {isApproved ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Freight Operations Node Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Pending Verification • Node Inactive
              </span>
            )}
            <span className="text-xs text-gray-400 font-semibold">• Live GPS Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Logistics & Fleet Operations
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">
            Live transit radar, haulage load allocation, and cryptographically verified proof of delivery (POD)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-emerald-600" : "text-gray-500"} />
            <span>Sync Fleet Radar</span>
          </button>
          <Link
            href="/ecosystem/logistics/vehicles"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2"
          >
            <Truck size={14} />
            <span>Manage Fleet & Vehicles</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* 4 Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Transit */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Active Transit
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.active_transit}
            </div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Vehicles Currently En Route
            </p>
          </div>
        </div>

        {/* Pending Dispatches */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending Dispatches
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.pending_dispatches}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Requires Vehicle Assignment
            </p>
          </div>
        </div>

        {/* Total Volume Moved */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Volume Moved
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Box size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {Number(stats.total_volume_moved).toLocaleString()} <span className="text-base font-bold text-gray-400">MT</span>
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1.5">
              <TrendingUp size={13} />
              Aggregated Haulage This Cycle
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Delivery Success
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {stats.success_rate}%
            </div>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Geotagged & POD Audited
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Dispatches & Transit Hub */}
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden backdrop-blur-sm">
        {/* Header with Search and Filter Tabs */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Pending Dispatches & Active Transit
                </h2>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Real-time transport missions, GPS-verified delivery check-ins, and proof-of-delivery archival
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 self-start md:self-auto flex-wrap">
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
                onClick={() => setTicketFilter("in_transit")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === "in_transit"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketFilter === "in_transit" ? "bg-white" : "bg-blue-500"}`} />
                En Route ({inTransitCount})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketFilter === "pending" ? "bg-white" : "bg-amber-500"}`} />
                Pending Dispatch ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter("delivered")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  ticketFilter === "delivered"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketFilter === "delivered" ? "bg-white" : "bg-emerald-500"}`} />
                Delivered ({deliveredCount})
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
              placeholder="Search by ticket #, cargo crop, origin, destination, entity..."
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
              <Truck size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {ticketSearch || ticketFilter !== "all" ? "No matching logistics missions" : "No logistics tickets yet"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              {ticketSearch || ticketFilter !== "all"
                ? "Try adjusting your search criteria or resetting the status filter above."
                : "Active commodity haulage requests and dispatch assignments will appear here."}
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
              const isPending = ticket.status === "pending";
              const isInTransit = ticket.status === "in_transit";
              const isDelivered = ticket.status === "delivered";

              return (
                <div
                  key={ticket.ticket_id}
                  className="p-6 md:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  {/* Left: Identification & Entity */}
                  <div className="space-y-2 min-w-[240px]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-base text-gray-900 dark:text-white">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPending
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                            : isInTransit
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {ticket.entity_name}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{ticket.entity_role?.replace("_", " ")}</span>
                    </div>
                  </div>

                  {/* Middle: Cargo, Route & Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
                    {/* Cargo Specs */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cargo & Quantity</p>
                        <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5">
                          {ticket.crop}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {ticket.quantity_mt} <span className="text-xs font-bold text-gray-400">MT</span>
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium">Net Weight</p>
                      </div>
                    </div>

                    {/* Route Specs */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transit Corridor</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                        <span className="truncate">{ticket.origin || "Origin Warehouse"}</span>
                        <ArrowRight size={12} className="text-emerald-600 shrink-0" />
                        <span className="text-emerald-600 dark:text-emerald-400 truncate">
                          {ticket.destination || "Destination Hub"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Geospatial / POD Evidence */}
                  <div className="shrink-0 min-w-[160px]">
                    {ticket.delivery_proof_url ? (
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setViewingMedia({
                              url: ticket.delivery_proof_url,
                              lat: ticket.delivery_latitude,
                              lng: ticket.delivery_longitude,
                              notes: ticket.delivery_notes,
                              delivered_at: ticket.delivered_at
                            })
                          }
                          className="relative group/thumb w-12 h-12 rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 shadow-xs shrink-0"
                        >
                          <img
                            src={ticket.delivery_proof_url}
                            alt="POD"
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                        <div className="space-y-0.5 text-left">
                          {ticket.delivery_latitude && ticket.delivery_longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${ticket.delivery_latitude},${ticket.delivery_longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1 font-bold"
                            >
                              <MapPin className="w-3 h-3 text-emerald-500" />
                              {Number(ticket.delivery_latitude).toFixed(3)}, {Number(ticket.delivery_longitude).toFixed(3)}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">POD Photo</span>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 block font-medium">
                            Audited Delivery Proof
                          </span>
                        </div>
                      </div>
                    ) : isInTransit ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold">
                        <Navigation size={13} className="text-blue-500 animate-pulse" />
                        <span>Awaiting Offload POD</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Pre-Dispatch Phase</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-auto">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => acceptTicket(ticket.ticket_id)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Truck size={14} />
                        Accept & Dispatch
                      </button>
                    )}
                    {isInTransit && (
                      <button
                        type="button"
                        onClick={() => openDeliveryModal(ticket)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Camera size={14} />
                        Mark Delivered & POD
                      </button>
                    )}
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 rounded-2xl shadow-xs">
                        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                        Delivered & Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Geospatial Delivery Confirmation Modal */}
      {deliveryModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30">
              <div>
                <h3 className="text-lg font-black text-(--foreground) flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Confirm Delivery with Geospatial Proof
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ticket #{deliveryModalTicket.ticket_number} • {deliveryModalTicket.crop} ({deliveryModalTicket.quantity_mt} MT)
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeliveryModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* POD Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Proof of Delivery Photo (POD) *
                </label>
                {podPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-48 group">
                    <img src={podPreview} alt="POD Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPodFile(null); setPodPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Photo Selected
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition">
                    <UploadCloud className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-sm font-bold text-(--foreground)">Upload Offloaded Cargo Photo</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG or Camera capture</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePodChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Real-time Geospatial Tagging */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" /> Real Device Geotagging
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
                        Accuracy: ±{Math.round(geoLoc.accuracy)}m • Timestamp: {new Date(geoLoc.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : geoLoc.fetching ? (
                  <p className="text-xs text-blue-500 flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Acquiring high-precision GPS satellites...
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {geoLoc.error || "Click Refresh GPS to attach device coordinates."}
                  </p>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Delivered directly to Warehouse Supervisor, bags intact."
                  className="w-full p-2.5 rounded-lg border text-sm bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeliveryModal}
                  disabled={isSubmittingDelivery}
                  className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitCompleteDelivery}
                  disabled={isSubmittingDelivery || !podFile}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow disabled:opacity-50"
                >
                  {isSubmittingDelivery ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Verifying & Submitting...
                    </>
                  ) : (
                    "Confirm & Mark Delivered"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for POD Image */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white dark:bg-gray-900 border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Proof of Delivery Geotagged Evidence</h4>
                {viewingMedia.delivered_at && (
                  <p className="text-xs text-gray-400">Delivered: {new Date(viewingMedia.delivered_at).toLocaleString()}</p>
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
              <img src={viewingMedia.url} alt="Proof of Delivery" className="max-h-[60vh] object-contain rounded-lg" />
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
              {viewingMedia.notes && (
                <p className="text-gray-500 italic max-w-xs truncate">"{viewingMedia.notes}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
