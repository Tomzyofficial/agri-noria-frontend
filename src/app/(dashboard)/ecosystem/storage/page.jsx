"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Box, Package, FileText, CheckCircle, MapPin, Camera, Navigation, AlertCircle, Eye, X, UploadCloud } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function StorageDashboard() {
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes, preHarvestRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/storage/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/storage/tickets"),
        fetch("/api/proxy/pipeline/preharvest/opportunities")
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      const preHarvestData = await preHarvestRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
      if (preHarvestData.success) setPreHarvestListings(preHarvestData.data);
    } catch (error) {
      console.error("Error fetching storage data:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Storage Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Manage warehouse capacity, active storage tickets, and incoming batches with verified intake geolocation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Capacity
            </CardTitle>
            <Box className="w-5 h-5 text-(--greenish-color)" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{Number(stats.total_capacity).toLocaleString()} MT</div>
            <p className="text-xs font-medium text-green-600 mt-1">{utilization}% Utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Tickets
            </CardTitle>
            <FileText className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.active_tickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Expected Arrivals
            </CardTitle>
            <Package className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.expected_arrivals}</div>
            <p className="text-xs font-medium text-orange-600 mt-1">Pending Check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Stored Inventory
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{Number(stats.stored_inventory).toLocaleString()} MT</div>
            <p className="text-xs font-medium text-gray-500 mt-1">Currently verified</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-(--background) border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-(--foreground)">Storage Requests & Active Tickets</h2>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No storage tickets currently assigned to your facility.</p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${ticket.status === 'reserved' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {ticket.status}
                    </span>
                    {ticket.nwr_number && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        e-NWR: {ticket.nwr_number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {ticket.entity_name} ({ticket.entity_role})
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Produce</p>
                    <p className="font-semibold">{ticket.crop}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Volume</p>
                    <p className="font-semibold">{ticket.reserved_volume_mt} MT</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Duration</p>
                    <p className="font-semibold">{ticket.storage_duration_days} Days</p>
                  </div>
                  {ticket.grade && (
                    <div>
                      <p className="text-gray-500 uppercase text-xs font-bold mb-1">Grade</p>
                      <p className="font-semibold text-emerald-600">{ticket.grade}</p>
                    </div>
                  )}
                  {ticket.moisture_pct && (
                    <div>
                      <p className="text-gray-500 uppercase text-xs font-bold mb-1">Moisture</p>
                      <p className="font-semibold">{ticket.moisture_pct}%</p>
                    </div>
                  )}

                  {/* Geotagged Intake Evidence */}
                  {ticket.intake_proof_url && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingMedia({
                          url: ticket.intake_proof_url,
                          lat: ticket.intake_latitude,
                          lng: ticket.intake_longitude,
                          verified_at: ticket.intake_verified_at
                        })}
                        className="relative group w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 shadow-sm shrink-0"
                      >
                        <img src={ticket.intake_proof_url} alt="Intake Proof" className="w-full h-full object-cover group-hover:scale-110 transition" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                      <div>
                        {ticket.intake_latitude && ticket.intake_longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${ticket.intake_latitude},${ticket.intake_longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1 font-semibold"
                          >
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            {Number(ticket.intake_latitude).toFixed(4)}, {Number(ticket.intake_longitude).toFixed(4)}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Intake Photo</span>
                        )}
                        <span className="text-[10px] text-gray-400 block">Warehouse Geotagged</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {ticket.status === 'reserved' && (
                    <button 
                      onClick={() => openIntakeModal(ticket)}
                      className="px-4 py-2 bg-(--greenish-color) text-white font-bold rounded-lg hover:opacity-90 transition text-sm shadow flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      Verify & Issue e-NWR
                    </button>
                  )}
                  {ticket.status === 'active' && !ticket.nwr_number && (
                    <button 
                      onClick={() => handleIssueNwr(ticket.ticket_id)}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-xs shadow"
                    >
                      Issue e-NWR
                    </button>
                  )}
                  {ticket.status === 'active' && ticket.nwr_number && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200">
                      Receipt Verified ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-(--background) border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-amber-50 dark:bg-amber-900/10">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
            Expected Inflow Forecast (Pre-Harvest)
          </h2>
          <p className="text-xs text-amber-600 mt-1 uppercase tracking-widest font-black">Upcoming harvests tracked by clusters</p>
        </div>
        
        {preHarvestListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No expected inflow forecasts available.</p>
          </div>
        ) : (
          <div className="divide-y">
            {preHarvestListings.map((listing) => (
              <div key={listing.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{listing.commodity}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold uppercase">
                      Forecast
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Supervisor: {listing.supervisor_name}
                  </p>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Expected Vol</p>
                    <p className="font-semibold text-amber-600">{listing.estimated_yield_tons} MT</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Est. Harvest</p>
                    <p className="font-semibold">{new Date(listing.expected_harvest_date).toLocaleDateString()}</p>
                  </div>
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
