"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Box, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  MapPin, 
  Tag,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Warehouse,
  Sparkles,
  Check
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const fetcher = (url) => fetch(url).then((res) => res.json());

const AVAILABLE_COMMODITIES = ["Maize", "Rice", "Soybeans", "Wheat", "Sorghum", "Millet", "Cowpea"];

export default function StorageCalendarPage() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    "/api/proxy/vendor/commodity-operations/storage/calendar", 
    fetcher
  );

  const schedules = data?.data?.schedules || [];
  const reservations = data?.data?.reservations || [];
  const facilities = data?.data?.facilities || [];

  // View state
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "cards"
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  // Month navigation for interactive calendar
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, schedule: null, deleting: false });
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    facility_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    available_capacity_mt: 1500,
    price_per_mt_month: 1200,
    accepted_commodities: ["Maize", "Rice", "Soybeans"],
    status: "available",
    notes: "Dry bulk silos ready for harvest intake with certified moisture monitoring."
  });

  // Calculate high-level KPIs
  const totalScheduledCapacity = useMemo(() => {
    return schedules.reduce((sum, s) => sum + parseFloat(s.available_capacity_mt || 0), 0);
  }, [schedules]);

  const totalReservedMt = useMemo(() => {
    return reservations.reduce((sum, r) => sum + parseFloat(r.reserved_volume_mt || 0), 0);
  }, [reservations]);

  const utilizationRate = useMemo(() => {
    if (totalScheduledCapacity <= 0) return 0;
    return Math.min(100, Math.round((totalReservedMt / totalScheduledCapacity) * 100));
  }, [totalScheduledCapacity, totalReservedMt]);

  const remainingCapacity = Math.max(0, totalScheduledCapacity - totalReservedMt);

  // Interactive Calendar Generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday as 0, Sunday as 6
    const startDayIndex = (firstDay.getDay() + 6) % 7;

    const days = [];

    // Previous month padding
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        date: d,
        dateString: d.toISOString().split("T")[0],
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split("T")[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: dateObj,
        dateString: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding to complete 7-day grid
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        date: nextDate,
        dateString: nextDate.toISOString().split("T")[0],
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentDate]);

  // Calendar Day Status Resolver
  const getDayDetails = (dateString) => {
    const activeSchedules = schedules.filter(s => {
      if (!s.start_date || !s.end_date) return false;
      const sStart = new Date(s.start_date).toISOString().split("T")[0];
      const sEnd = new Date(s.end_date).toISOString().split("T")[0];
      return dateString >= sStart && dateString <= sEnd;
    });

    const activeReservations = reservations.filter(r => {
      if (!r.start_date) return false;
      const rStart = new Date(r.start_date).toISOString().split("T")[0];
      const rEnd = r.end_date ? new Date(r.end_date).toISOString().split("T")[0] : rStart;
      return dateString >= rStart && dateString <= rEnd;
    });

    return {
      hasSchedule: activeSchedules.length > 0,
      schedules: activeSchedules,
      hasReservation: activeReservations.length > 0,
      reservations: activeReservations
    };
  };

  const handleCommodityToggle = (crop) => {
    setForm(prev => {
      const exists = prev.accepted_commodities.includes(crop);
      if (exists) {
        return { ...prev, accepted_commodities: prev.accepted_commodities.filter(c => c !== crop) };
      } else {
        return { ...prev, accepted_commodities: [...prev.accepted_commodities, crop] };
      }
    });
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date) {
      toast.error("Please select valid start and end dates.");
      return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }
    if (!form.available_capacity_mt || form.available_capacity_mt <= 0) {
      toast.error("Available capacity must be greater than 0 MT.");
      return;
    }
    if (form.accepted_commodities.length === 0) {
      toast.error("Please select at least one accepted commodity.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/storage/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Storage availability window published successfully!");
        setIsModalOpen(false);
        mutate();
      } else {
        toast.error(result.error || "Failed to publish schedule");
      }
    } catch (err) {
      console.error("Error creating schedule:", err);
      toast.error("Server error while publishing schedule");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteSchedule = async () => {
    if (!deleteModalState.schedule) return;
    setDeleteModalState(prev => ({ ...prev, deleting: true }));
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/storage/calendar/${deleteModalState.schedule.id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Availability window removed.");
        setDeleteModalState({ isOpen: false, schedule: null, deleting: false });
        mutate();
      } else {
        toast.error(result.error || "Failed to remove window");
        setDeleteModalState(prev => ({ ...prev, deleting: false }));
      }
    } catch (err) {
      toast.error("Failed to delete schedule");
      setDeleteModalState(prev => ({ ...prev, deleting: false }));
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="font-sans p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7 text-left antialiased">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-gray-900/90 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Storage Availability Calendar
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Intake Scheduling
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">
                Publish intake windows for harvest grains. Farmers and off-taker clusters see these dates when reserving warehouse storage.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-gray-800/80 border border-slate-200/70 dark:border-gray-700/80">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule Cards</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400 cursor-pointer transition shadow-2xs disabled:opacity-50"
            title="Refresh Data"
            aria-label="Refresh storage calendar"
          >
            <RefreshCw className={`w-4 h-4 ${isValidating ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Availability Window</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Open Availability Windows */}
        <div className="bg-white dark:bg-gray-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Open Availability Windows</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {schedules.length}
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-400 font-medium mt-1">
              Active intake windows published
            </p>
          </div>
        </div>

        {/* Card 2: Scheduled Capacity */}
        <div className="bg-white dark:bg-gray-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Intake Capacity</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              <span>{totalScheduledCapacity.toLocaleString()}</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">MT</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-400 font-medium mt-1">
              Scheduled silo intake quota
            </p>
          </div>
        </div>

        {/* Card 3: Booked Harvest Batches */}
        <div className="bg-white dark:bg-gray-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Booked Harvest Batches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-baseline gap-2">
              <span>{reservations.length}</span>
              <span className="text-xs font-bold text-slate-400">({totalReservedMt.toLocaleString()} MT)</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-400 font-medium mt-1">
              Reserved tickets & stored batches
            </p>
          </div>
        </div>

        {/* Card 4: Remaining Capacity & Gauge */}
        <div className="bg-white dark:bg-gray-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Capacity Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-900 dark:text-white font-black text-xl">{utilizationRate}%</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {remainingCapacity.toLocaleString()} MT free
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-gray-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(utilizationRate, totalScheduledCapacity > 0 ? 4 : 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5">
              {totalScheduledCapacity > 0 ? "Ready for farmers to book" : "No active capacity published"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-start">
        {/* Left Column: Interactive Calendar or Published Windows List (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Interactive Monthly Visual Calendar View */}
          {viewMode === "calendar" && (
            <div className="bg-white dark:bg-gray-900/90 rounded-3xl border border-slate-200/80 dark:border-gray-800 shadow-sm p-5 sm:p-7 space-y-5">
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight capitalize">
                    {monthYearLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={jumpToToday}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 transition cursor-pointer"
                    title="Previous Month"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 transition cursor-pointer"
                    title="Next Month"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70">Sat</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70">Sun</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarDays.map((day, idx) => {
                  const status = getDayDetails(day.dateString);
                  const isSelected = selectedScheduleId && status.schedules.some(s => s.id === selectedScheduleId);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (status.schedules.length > 0) {
                          setSelectedScheduleId(status.schedules[0].id);
                        }
                      }}
                      className={`min-h-[72px] sm:min-h-[82px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        !day.isCurrentMonth
                          ? "bg-slate-50/40 dark:bg-gray-950/30 border-transparent opacity-35"
                          : status.hasSchedule
                          ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/35 hover:border-emerald-500 cursor-pointer shadow-2xs"
                          : "bg-slate-50/60 dark:bg-gray-950/50 border-slate-100 dark:border-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700"
                      } ${day.isToday ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900" : ""} ${
                        isSelected ? "ring-2 ring-emerald-600 dark:ring-emerald-400 scale-[1.02]" : ""
                      }`}
                    >
                      {/* Day number header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${
                          day.isToday 
                            ? "text-emerald-600 dark:text-emerald-400 font-black" 
                            : day.isCurrentMonth 
                            ? "text-slate-800 dark:text-gray-200" 
                            : "text-slate-400 dark:text-gray-600"
                        }`}>
                          {day.dayNumber}
                        </span>
                        {day.isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>

                      {/* Day Intake / Reservation Status Badges */}
                      <div className="space-y-1">
                        {status.hasSchedule && (
                          <div className="truncate px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold text-[9px] tracking-tight">
                            <span>Open</span>
                            <span className="hidden sm:inline"> • {status.schedules[0].available_capacity_mt}MT</span>
                          </div>
                        )}
                        {status.hasReservation && (
                          <div className="truncate px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-800 dark:text-blue-300 font-extrabold text-[9px]">
                            <span>{status.reservations.length} Booked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-gray-800 text-xs">
                <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-500/25 border border-emerald-500/40 inline-block" />
                    <span>Intake Open</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-500/25 border border-blue-500/40 inline-block" />
                    <span>Harvest Reserved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 inline-block" />
                    <span>Unscheduled</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">
                  Click any green day slot to highlight published window
                </p>
              </div>
            </div>
          )}

          {/* Published Availability Windows Cards Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Published Availability Windows</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Active seasonal intake periods open for grain deposits
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
              {schedules.length} {schedules.length === 1 ? "window" : "windows"} active
            </span>
          </div>

          {/* Cards List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900/90 rounded-3xl border border-slate-200/80 dark:border-gray-800 space-y-3">
              <FaSpinner className="animate-spin text-2xl text-emerald-600" />
              <p className="text-xs text-slate-400 font-medium">Loading published availability schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white dark:bg-gray-900/90 p-10 sm:p-14 rounded-3xl border border-dashed border-slate-200 dark:border-gray-800 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900 dark:text-white">No Open Availability Windows</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto font-medium">
                  You have not published any seasonal availability dates yet. Add the dates your warehouse can accept grains so farmers and aggregators can book space.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Publish First Intake Window
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((sch) => {
                const startDate = new Date(sch.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const endDate = new Date(sch.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                
                // Days calculation
                const diffTime = Math.abs(new Date(sch.end_date) - new Date(sch.start_date));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isSelected = selectedScheduleId === sch.id;

                const facilityObj = facilities.find(f => String(f.id) === String(sch.facility_id));

                return (
                  <div
                    key={sch.id}
                    id={`schedule-${sch.id}`}
                    className={`bg-white dark:bg-gray-900/90 rounded-3xl border shadow-xs transition-all space-y-4 p-6 sm:p-7 ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 dark:ring-emerald-500/10 shadow-md"
                        : "border-slate-200/80 dark:border-gray-800 hover:border-emerald-500/40"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {sch.status || "Available"}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                            • Open for Intake Bookings
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
                            {diffDays} Days Duration
                          </span>
                        </div>

                        {/* Prominent Dates in Sans-Serif */}
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight pt-0.5">
                          {startDate} <span className="text-slate-400 font-light mx-1">—</span> {endDate}
                        </h3>

                        {facilityObj && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
                            <Warehouse className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{facilityObj.listing_name} ({facilityObj.storage_type}) • {facilityObj.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setDeleteModalState({ isOpen: true, schedule: sch, deleting: false })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors cursor-pointer"
                          title="Remove Window"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* 3 Detail Boxes (Theme Harmonized - High Contrast) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Box 1: Available Intake Capacity */}
                      <div className="bg-slate-50 dark:bg-gray-950/80 p-4 rounded-2xl border border-slate-100 dark:border-gray-800/80 flex flex-col justify-between">
                        <span className="text-slate-400 dark:text-gray-400 font-black text-[10px] uppercase tracking-wider block">
                          Available Intake
                        </span>
                        <div className="mt-1">
                          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {Number(sch.available_capacity_mt || 0).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">MT</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Ready for harvest deposit</span>
                      </div>

                      {/* Box 2: Monthly Storage Rate */}
                      <div className="bg-slate-50 dark:bg-gray-950/80 p-4 rounded-2xl border border-slate-100 dark:border-gray-800/80 flex flex-col justify-between">
                        <span className="text-slate-400 dark:text-gray-400 font-black text-[10px] uppercase tracking-wider block">
                          Monthly Storage Rate
                        </span>
                        <div className="mt-1">
                          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            ₦{Number(sch.price_per_mt_month || 1200).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">/ MT</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Tier 1 certified billing</span>
                      </div>

                      {/* Box 3: Accepted Grains */}
                      <div className="bg-slate-50 dark:bg-gray-950/80 p-4 rounded-2xl border border-slate-100 dark:border-gray-800/80 flex flex-col justify-between">
                        <span className="text-slate-400 dark:text-gray-400 font-black text-[10px] uppercase tracking-wider block">
                          Accepted Grains
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Array.isArray(sch.accepted_commodities) && sch.accepted_commodities.length > 0 ? (
                            sch.accepted_commodities.map((crop, i) => (
                              <span 
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-200 border border-slate-200/80 dark:border-gray-800 shadow-2xs"
                              >
                                {crop}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-bold text-slate-700 dark:text-gray-300">All Dry Grains</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">Multi-commodity handling</span>
                      </div>
                    </div>

                    {/* Quality Notes / Specifications */}
                    {sch.notes && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-emerald-200/90 font-medium">
                        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          "{sch.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Incoming Reservations (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Incoming Reservations</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Farmer & cluster intake requests
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300">
              {reservations.length} total
            </span>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white dark:bg-gray-900/90 p-8 rounded-3xl border border-slate-200/80 dark:border-gray-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-gray-800 text-slate-400 flex items-center justify-center mx-auto">
                <Box className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white">No Active Reservations</h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                No active grain reservations yet. When farmers or regional aggregators book storage during your open dates, their tickets and batch receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {reservations.map((res) => (
                <div
                  key={res.ticket_id}
                  className="bg-white dark:bg-gray-900/90 p-5 rounded-3xl border border-slate-200/80 dark:border-gray-800 text-xs space-y-3 shadow-xs hover:border-emerald-500/40 transition-all"
                >
                  {/* Reservation Ticket Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-gray-900 dark:text-gray-200">
                      <span>{res.ticket_number}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(res.ticket_number);
                          toast.success(`Copied ticket #${res.ticket_number}`);
                        }}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                        title="Copy ticket number"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {res.status}
                    </span>
                  </div>

                  {/* Volume & Fee */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-gray-950/80 border border-slate-100 dark:border-gray-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intake Batch</span>
                      <span className="font-black text-sm text-gray-900 dark:text-white">
                        {res.crop} • {res.reserved_volume_mt} MT
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage Escrow</span>
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₦{Number(res.storage_fee || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Requester & Schedule details */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-gray-400 font-medium pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Requester:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">{res.entity_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Storage Duration:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{res.storage_duration_days} Days</span>
                    </div>
                    {res.start_date && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Intake Window:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {new Date(res.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {res.end_date ? new Date(res.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'TBD'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD AVAILABILITY WINDOW MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-950 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto custom-horizontal-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                    Publish Availability Window
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    Configure dates and storage rate for incoming harvest grains
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs font-bold">
              {facilities.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Linked Facility (Optional)
                  </label>
                  <select
                    value={form.facility_id}
                    onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="">Default Warehouse / Primary Facility</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.listing_name} ({fac.storage_type}) - {fac.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Intake Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Intake End Date *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Capacity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Available Capacity (MT) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.available_capacity_mt}
                    onChange={(e) => setForm({ ...form, available_capacity_mt: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                  {/* Capacity Presets */}
                  <div className="flex gap-1.5 pt-1">
                    {[500, 1000, 1500, 2500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setForm({ ...form, available_capacity_mt: amt })}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-gray-800 hover:bg-emerald-50 text-slate-600 dark:text-gray-300 hover:text-emerald-700 transition"
                      >
                        {amt.toLocaleString()} MT
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Monthly Rate (₦ / MT / Month) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={form.price_per_mt_month}
                    onChange={(e) => setForm({ ...form, price_per_mt_month: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-medium pt-1">Standard rate charged per 30-day storage cycle</p>
                </div>
              </div>

              {/* Commodities Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    Accepted Commodities ({form.accepted_commodities.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.accepted_commodities.length === AVAILABLE_COMMODITIES.length) {
                        setForm({ ...form, accepted_commodities: [] });
                      } else {
                        setForm({ ...form, accepted_commodities: [...AVAILABLE_COMMODITIES] });
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {form.accepted_commodities.length === AVAILABLE_COMMODITIES.length ? "Clear All" : "Select All"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_COMMODITIES.map((crop) => {
                    const isSelected = form.accepted_commodities.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleCommodityToggle(crop)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs scale-102"
                            : "bg-slate-100 text-slate-700 dark:bg-gray-850 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-800 border border-slate-200/80 dark:border-gray-800"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{crop}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Intake Notes & Specifications
                </label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Certified hermetic silo, max 13% moisture on intake, 24/7 security guard"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {saving ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{saving ? "Publishing..." : "Publish Window"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL (NO BROWSER ALERT) */}
      {/* ========================================================================= */}
      {deleteModalState.isOpen && deleteModalState.schedule && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setDeleteModalState({ isOpen: false, schedule: null, deleting: false })}
        >
          <div 
            className="bg-white dark:bg-gray-950 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Remove Availability Window?
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                Are you sure you want to remove the intake window from{" "}
                <strong className="text-gray-900 dark:text-white">
                  {new Date(deleteModalState.schedule.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — {new Date(deleteModalState.schedule.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </strong>?
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1">
                Farmers will no longer be able to submit storage requests for this period.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, schedule: null, deleting: false })}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModalState.deleting}
                onClick={confirmDeleteSchedule}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {deleteModalState.deleting ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleteModalState.deleting ? "Removing..." : "Confirm Removal"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
