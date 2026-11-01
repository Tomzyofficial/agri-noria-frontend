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
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Building2,
  ExternalLink,
  Copy,
  UserCheck,
  Check,
  Calendar
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

  // Mission Brief & Order Details Modal State
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [acceptingTicketId, setAcceptingTicketId] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatWhatsAppUrl = (phone, ticket) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "234" + clean.slice(1);
    const msg = encodeURIComponent(
      `Hello ${ticket?.entity_name || "Partner"}, this is Agri-Noria Logistics regarding your haulage dispatch #${ticket?.ticket_number} for ${ticket?.quantity_mt} MT ${ticket?.crop || "commodities"}.`
    );
    return `https://wa.me/${clean}?text=${msg}`;
  };

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
    let fetchedSuccessfully = false;
    try {
      if (showToast) setIsRefreshing(true);
      const [statsRes, ticketsRes, sessRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/logistics/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/logistics/tickets"),
        fetch("/api/auth/session").catch(() => null)
      ]);
      const statsData = await statsRes.json().catch(() => ({}));
      const ticketsData = await ticketsRes.json().catch(() => ({}));
      
      if (statsData.success) {
        setStats(statsData.data);
        fetchedSuccessfully = true;
      }
      if (ticketsData.success) {
        setTickets(ticketsData.data);
        fetchedSuccessfully = true;
      }
      if (statsRes.status === 401 || statsRes.status === 403) {
        fetchedSuccessfully = true;
      }

      if (sessRes && sessRes.ok) {
        const sessData = await sessRes.json().catch(() => null);
        if (sessData?.authenticated && !sessData?.networkError) {
          setIsApproved(sessData.approval_status === "approved");
        }
      } else {
        const fallbackSess = await verifyVendorSession().catch(() => null);
        if (fallbackSess?.authenticated && !fallbackSess?.networkError) {
          setIsApproved(fallbackSess.approval_status === "approved");
        }
      }

      if (showToast && fetchedSuccessfully) toast.success("Logistics fleet metrics refreshed");
    } catch (error) {
      console.warn("Retrying logistics data fetch:", error?.message);
    } finally {
      setIsRefreshing(false);
      if (fetchedSuccessfully || showToast) {
        setLoading(false);
      } else {
        setTimeout(() => fetchData(false), 2000);
      }
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
    setAcceptingTicketId(ticket_id);
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/logistics/tickets/${ticket_id}/accept`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        const netCredited = data.data?.net_credited;
        if (netCredited) {
          toast.success(`Fleet Dispatched! ₦${Number(netCredited).toLocaleString()} haulage fee secured & credited.`);
        } else {
          toast.success("Fleet Dispatched & Transit Activated!");
        }
        await fetchData();
      } else {
        toast.error(data.error || "Failed to dispatch fleet");
      }
    } catch (error) {
      toast.error("Network error while dispatching fleet");
    } finally {
      setAcceptingTicketId(null);
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
                  <div className="space-y-2 min-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-base text-gray-900 dark:text-white">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPending
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                            : isInTransit
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      {ticket.farm_id && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {ticket.farm_id}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {ticket.entity_name}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{ticket.entity_role?.replace("_", " ") || "Farmer"}</span>
                    </div>

                    {/* Quick Direct Contact Buttons */}
                    {ticket.entity_phone && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${ticket.entity_phone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] transition shadow-xs"
                          title="Call Requester"
                        >
                          <Phone size={11} className="text-emerald-600 shrink-0" />
                          <span>{ticket.entity_phone}</span>
                        </a>
                        <a
                          href={formatWhatsAppUrl(ticket.entity_phone, ticket)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 font-bold text-[11px] transition shadow-xs"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare size={11} className="shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Middle: Cargo, Assigned Fleet & Route */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 text-xs">
                    {/* Cargo Specs */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cargo & Batch</p>
                        <span className="text-[10px] font-mono text-gray-400">{ticket.batch_number || "BATCH"}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-black text-gray-900 dark:text-white text-sm">
                          {ticket.crop}
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {ticket.quantity_mt} <span className="text-[10px] font-bold text-gray-400">MT</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">~{Math.round(parseFloat(ticket.quantity_mt || 0) * 20)} Bags</p>
                    </div>

                    {/* Assigned Haulage Fleet & Fee */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Assigned Fleet</p>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ₦{Number(ticket.logistics_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-1 truncate flex items-center gap-1.5">
                        <Truck size={13} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{ticket.vehicle_title || "Commercial Haulage Truck"}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Haulage Fee Reserved</p>
                    </div>

                    {/* Transit Corridor */}
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transit Corridor</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                          <MapPin size={11} className="text-amber-500 shrink-0" />
                          <span className="truncate">Pickup: {ticket.pickup_location || ticket.origin || "Farm Hub"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          <Building2 size={11} className="shrink-0 text-emerald-600" />
                          <span className="truncate">Drop: {ticket.destination || "Storage Warehouse"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Geospatial / POD Evidence */}
                  <div className="shrink-0 min-w-[140px]">
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
                  <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketModal(ticket)}
                      className="px-3.5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="View Full Waybill & Dispatch Brief"
                    >
                      <FileText size={13} />
                      <span>Details</span>
                    </button>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => acceptTicket(ticket.ticket_id)}
                        disabled={acceptingTicketId === ticket.ticket_id}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {acceptingTicketId === ticket.ticket_id ? (
                          <>
                            <FaSpinner className="animate-spin text-sm" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Truck size={14} />
                            <span>Accept & Dispatch</span>
                          </>
                        )}
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
                        Delivered
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

      {/* Mission Brief & Dispatch Waybill Modal */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    Haulage Dispatch Waybill & Mission Brief
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                    #{selectedTicketModal.ticket_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedTicketModal.ticket_number, "Ticket Number")}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition"
                    title="Copy Ticket Number"
                  >
                    {copiedField === "Ticket Number" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      selectedTicketModal.status === "pending"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                        : selectedTicketModal.status === "in_transit"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {selectedTicketModal.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
                className="p-2 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-sm">
              {/* Section 1: Consignor / Farmer Pickup Information */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-black text-gray-400 tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Consignor & Origin Farm (Pickup Contact)
                  </span>
                  {selectedTicketModal.farm_id && (
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Farm ID: {selectedTicketModal.farm_id}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                      {selectedTicketModal.entity_name}
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize">
                        ({selectedTicketModal.entity_role?.replace("_", " ") || "Farmer"})
                      </span>
                    </h4>
                    {selectedTicketModal.cooperative_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Cooperative: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedTicketModal.cooperative_name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 flex items-start gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pickup Facility / Farm Address</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {selectedTicketModal.pickup_location || selectedTicketModal.origin || "Pickup Farm Coordinates"}
                    </p>
                  </div>
                </div>

                {/* Direct Farmer Contact Channels */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center gap-2">
                  {selectedTicketModal.entity_phone ? (
                    <>
                      <a
                        href={`tel:${selectedTicketModal.entity_phone}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                      >
                        <Phone size={13} />
                        <span>Call Farmer ({selectedTicketModal.entity_phone})</span>
                      </a>
                      <a
                        href={formatWhatsAppUrl(selectedTicketModal.entity_phone, selectedTicketModal)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Farmer</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedTicketModal.entity_phone, "Farmer Phone")}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs transition"
                        title="Copy Phone Number"
                      >
                        {copiedField === "Farmer Phone" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No phone contact listed</span>
                  )}

                  {selectedTicketModal.entity_email && (
                    <a
                      href={`mailto:${selectedTicketModal.entity_email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs transition"
                    >
                      <Mail size={13} />
                      <span>{selectedTicketModal.entity_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Section 2: Consignee / Certified Storage Warehouse Destination */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-black text-gray-400 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Consignee & Destination Warehouse
                  </span>
                  {selectedTicketModal.storage_ticket_number && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Storage Intake #{selectedTicketModal.storage_ticket_number}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                      {selectedTicketModal.destination || "Certified Storage Facility"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Warehouse Ops / Manager: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedTicketModal.warehouse_manager || "Certified Operations Desk"}</span>
                    </p>
                  </div>
                </div>

                {/* Direct Warehouse Contact Channels */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center gap-2">
                  {selectedTicketModal.warehouse_phone ? (
                    <>
                      <a
                        href={`tel:${selectedTicketModal.warehouse_phone}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                      >
                        <Phone size={13} />
                        <span>Call Warehouse Desk ({selectedTicketModal.warehouse_phone})</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedTicketModal.warehouse_phone, "Warehouse Phone")}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs transition"
                        title="Copy Warehouse Phone"
                      >
                        {copiedField === "Warehouse Phone" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No warehouse phone registered</span>
                  )}

                  {selectedTicketModal.warehouse_email && (
                    <a
                      href={`mailto:${selectedTicketModal.warehouse_email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs transition"
                    >
                      <Mail size={13} />
                      <span>{selectedTicketModal.warehouse_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Section 3: Cargo Manifest & Assigned Haulage Fleet */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Commodity</p>
                  <p className="font-black text-gray-900 dark:text-white text-sm mt-1">{selectedTicketModal.crop}</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">#{selectedTicketModal.batch_number}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Net Weight</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                    {selectedTicketModal.quantity_mt} MT
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    ~{Math.round(parseFloat(selectedTicketModal.quantity_mt || 0) * 20)} Bags (50kg)
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Assigned Fleet</p>
                  <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mt-1 truncate">
                    {selectedTicketModal.vehicle_title || "Haulage Truck"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {selectedTicketModal.estimated_distance_km ? `${selectedTicketModal.estimated_distance_km} km` : "GPS Corridor"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Haulage Fee</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                    ₦{Number(selectedTicketModal.logistics_fee || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Escrow Reserved</p>
                </div>
              </div>

              {/* Delivery Proof Details (Delivered Phase) */}
              {selectedTicketModal.status === "delivered" && selectedTicketModal.delivery_proof_url && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Audited Proof of Delivery (POD)
                    </span>
                    {selectedTicketModal.delivered_at && (
                      <span className="text-[11px] text-gray-400">
                        {new Date(selectedTicketModal.delivered_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setViewingMedia({
                          url: selectedTicketModal.delivery_proof_url,
                          lat: selectedTicketModal.delivery_latitude,
                          lng: selectedTicketModal.delivery_longitude,
                          notes: selectedTicketModal.delivery_notes,
                          delivered_at: selectedTicketModal.delivered_at
                        })
                      }
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 shrink-0 group cursor-pointer"
                    >
                      <img
                        src={selectedTicketModal.delivery_proof_url}
                        alt="POD"
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                    <div className="space-y-1 text-xs">
                      {selectedTicketModal.delivery_latitude && selectedTicketModal.delivery_longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedTicketModal.delivery_latitude},${selectedTicketModal.delivery_longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <MapPin size={12} />
                          {Number(selectedTicketModal.delivery_latitude).toFixed(6)}, {Number(selectedTicketModal.delivery_longitude).toFixed(6)}
                        </a>
                      )}
                      {selectedTicketModal.delivery_notes && (
                        <p className="text-gray-600 dark:text-gray-300 italic">"{selectedTicketModal.delivery_notes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Traceability Notice */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-gray-800 dark:text-gray-200">Anti-Fraud Traceability:</strong> Haulage fees are locked in platform escrow and automatically released upon electronic weighbridge intake confirmation by the receiving certified warehouse and verified Proof of Delivery (POD).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 sticky bottom-0">
              <button
                type="button"
                onClick={() => setSelectedTicketModal(null)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Close Waybill
              </button>

              <div className="flex items-center gap-2">
                {selectedTicketModal.status === "pending" && (
                  <button
                    type="button"
                    onClick={async () => {
                      const id = selectedTicketModal.ticket_id;
                      await acceptTicket(id);
                      setSelectedTicketModal(null);
                    }}
                    disabled={acceptingTicketId === selectedTicketModal.ticket_id}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {acceptingTicketId === selectedTicketModal.ticket_id ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Dispatching Fleet...</span>
                      </>
                    ) : (
                      <>
                        <Truck size={14} />
                        <span>Accept & Dispatch Fleet</span>
                      </>
                    )}
                  </button>
                )}
                {selectedTicketModal.status === "in_transit" && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = selectedTicketModal;
                      setSelectedTicketModal(null);
                      openDeliveryModal(t);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Camera size={14} />
                    <span>Proceed to Delivery & POD</span>
                  </button>
                )}
                {selectedTicketModal.status === "delivered" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2 rounded-2xl shadow-xs">
                    <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Delivery Completed & Audited
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
