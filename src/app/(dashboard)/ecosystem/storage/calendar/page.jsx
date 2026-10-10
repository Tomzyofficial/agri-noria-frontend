"use client";

import { useState } from "react";
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
  Tag 
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StorageCalendarPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/proxy/vendor/commodity-operations/storage/calendar", fetcher);

  const schedules = data?.data?.schedules || [];
  const reservations = data?.data?.reservations || [];
  const facilities = data?.data?.facilities || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const availableCommodities = ["Maize", "Rice", "Soybeans", "Wheat", "Sorghum", "Millet", "Cowpea"];

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

    setSaving(true);
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/storage/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Storage availability window published!");
        setIsModalOpen(false);
        mutate();
      } else {
        toast.error(result.error || "Failed to publish schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to remove this availability window?")) return;
    try {
      const res = await fetch(`/api/proxy/vendor/commodity-operations/storage/calendar/${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Availability window removed");
        mutate();
      } else {
        toast.error(result.error || "Failed to delete schedule");
      }
    } catch (err) {
      toast.error("Failed to delete schedule");
    }
  };

  const totalScheduledCapacity = schedules.reduce((sum, s) => sum + parseFloat(s.available_capacity_mt || 0), 0);
  const totalReservedMt = reservations.reduce((sum, r) => sum + parseFloat(r.reserved_volume_mt || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-(--foreground) tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-(--greenish-color)" />
            Storage Availability Calendar
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Publish the exact dates your storage is open to receive harvest grains. Farmers and clusters see these windows when booking storage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-(--greenish-color) hover:opacity-95 text-white font-bold text-sm shadow-md shadow-green-900/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Add Availability Window
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Open Availability Windows</span>
            <CalendarIcon className="w-5 h-5 text-(--greenish-color)" />
          </div>
          <div className="text-3xl font-black text-(--foreground)">{schedules.length}</div>
          <p className="text-xs text-gray-400 mt-1">Active seasonal & operational slots</p>
        </div>

        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Capacity</span>
            <Box className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-(--foreground)">
            {totalScheduledCapacity.toLocaleString()} <span className="text-sm font-semibold text-gray-500">MT</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Ready for grain intake</p>
        </div>

        <div className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Booked Harvest Batches</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {reservations.length} <span className="text-sm font-semibold text-gray-500">({totalReservedMt.toLocaleString()} MT)</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Reserved storage tickets</p>
        </div>
      </div>

      {/* Main Grid: Availability Windows & Incoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Windows (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-(--greenish-color)" />
              Published Availability Windows
            </h2>
            <span className="text-xs font-semibold text-gray-400">{schedules.length} windows active</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-(--background) rounded-2xl border">
              <FaSpinner className="animate-spin text-2xl text-(--greenish-color)" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white dark:bg-(--background) p-10 rounded-2xl border border-dashed text-center">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">No Open Availability Windows</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
                Add the dates your facility is open to accept grains so farmers and aggregators can book your facility.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-(--greenish-color) text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Date Range
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((sch) => {
                const startDate = new Date(sch.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const endDate = new Date(sch.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                return (
                  <div
                    key={sch.id}
                    className="bg-white dark:bg-(--background) p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs hover:border-(--greenish-color) transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {sch.status || "Available"}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">• Open for Booking</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">
                          {startDate} — {endDate}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Remove Window"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Available Intake</span>
                        <span className="font-extrabold text-gray-800 dark:text-gray-100 text-sm">
                          {Number(sch.available_capacity_mt || 0).toLocaleString()} MT
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Rate / MT / Month</span>
                        <span className="font-extrabold text-emerald-600 text-sm">
                          ₦{Number(sch.price_per_mt_month || 1200).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Accepted Grains</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300 truncate block">
                          {Array.isArray(sch.accepted_commodities) ? sch.accepted_commodities.join(", ") : "All Dry Grains"}
                        </span>
                      </div>
                    </div>

                    {sch.notes && (
                      <p className="text-xs text-gray-500 bg-gray-50/50 dark:bg-gray-850/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 italic">
                        "{sch.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookings / Incoming Reservations (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Incoming Reservations
            </h2>
            <span className="text-xs font-semibold text-gray-400">{reservations.length} total</span>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white dark:bg-(--background) p-8 rounded-2xl border text-center text-sm text-gray-500">
              <Box className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              No active reservations yet. When farmers or clusters request storage, their bookings will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div
                  key={res.ticket_id}
                  className="bg-white dark:bg-(--background) p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{res.ticket_number}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {res.status}
                    </span>
                  </div>

                  <div className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{res.crop} • {res.reserved_volume_mt} MT</span>
                    <span className="text-emerald-600 font-bold">₦{Number(res.storage_fee || 0).toLocaleString()}</span>
                  </div>

                  <div className="text-gray-500 space-y-0.5 text-[11px] pt-1 border-t border-gray-100 dark:border-gray-800">
                    <p><strong className="text-gray-700 dark:text-gray-300">Requester:</strong> {res.entity_name}</p>
                    <p><strong className="text-gray-700 dark:text-gray-300">Duration:</strong> {res.storage_duration_days} Days</p>
                    {res.start_date && (
                      <p><strong className="text-gray-700 dark:text-gray-300">Dates:</strong> {new Date(res.start_date).toLocaleDateString()} – {res.end_date ? new Date(res.end_date).toLocaleDateString() : 'TBD'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Availability Window Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-(--background) rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-(--greenish-color)" />
                Publish Availability Window
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              {facilities.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Select Facility
                  </label>
                  <select
                    value={form.facility_id}
                    onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold"
                  >
                    <option value="">Default Warehouse / All Facilities</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.listing_name} ({fac.storage_type}) - {fac.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Available Capacity (MT) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.available_capacity_mt}
                    onChange={(e) => setForm({ ...form, available_capacity_mt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Price (₦ / MT / Month) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={form.price_per_mt_month}
                    onChange={(e) => setForm({ ...form, price_per_mt_month: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                  Accepted Commodities
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCommodities.map((crop) => {
                    const isSelected = form.accepted_commodities.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleCommodityToggle(crop)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-(--greenish-color) text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Intake Notes / Specifications
                </label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Certified hermetic silo, max 13% moisture on intake"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-(--greenish-color) hover:opacity-95 text-white font-bold text-sm shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? "Publishing..." : "Publish Window"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
