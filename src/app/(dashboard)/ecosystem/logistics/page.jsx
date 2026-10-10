"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Truck, MapPin, CheckCircle, Clock, Camera, Navigation, AlertCircle, Eye, X, UploadCloud } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function LogisticsDashboard() {
  const [stats, setStats] = useState({
    active_transit: 0,
    pending_dispatches: 0,
    total_volume_moved: 0,
    success_rate: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery Modal State
  const [deliveryModalTicket, setDeliveryModalTicket] = useState(null);
  const [podFile, setPodFile] = useState(null);
  const [podPreview, setPodPreview] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [geoLoc, setGeoLoc] = useState({ lat: null, lng: null, accuracy: null, timestamp: null, error: null, fetching: false });
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  // Lightbox State
  const [viewingMedia, setViewingMedia] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch("/api/proxy/vendor/commodity-operations/logistics/dashboard"),
        fetch("/api/proxy/vendor/commodity-operations/logistics/tickets")
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load logistics data");
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

  const openDeliveryModal = (ticket) => {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-(--greenish-color)" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-black text-(--foreground) tracking-tight">
          Logistics Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Track transit status, fleet availability, and dispatch requests with verified geospatial proof of delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Transit
            </CardTitle>
            <Truck className="w-5 h-5 text-(--greenish-color)" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.active_transit}</div>
            <p className="text-xs font-medium text-green-600 mt-1">Vehicles En Route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Pending Dispatches
            </CardTitle>
            <Clock className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.pending_dispatches}</div>
            <p className="text-xs font-medium text-orange-600 mt-1">Requires assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Volume Moved
            </CardTitle>
            <MapPin className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.total_volume_moved} MT</div>
            <p className="text-xs font-medium text-blue-600 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Successful Deliveries
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-(--foreground)">{stats.success_rate}%</div>
            <p className="text-xs font-medium text-gray-500 mt-1">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Pending Dispatches & Active Transit</h2>
        <div className="bg-white dark:bg-(--background) rounded-xl border overflow-hidden shadow-sm">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No logistics tickets available.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                  <th className="p-4 font-bold text-sm text-gray-600">Ticket #</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Entity Details</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Route & Cargo</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Status</th>
                  <th className="p-4 font-bold text-sm text-gray-600">Geospatial / Evidence</th>
                  <th className="p-4 font-bold text-sm text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                    <td className="p-4 font-mono text-sm font-semibold">{ticket.ticket_number}</td>
                    <td className="p-4">
                      <p className="font-bold">{ticket.entity_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{ticket.entity_role?.replace('_', ' ')}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-sm">{ticket.crop} ({ticket.quantity_mt} MT)</p>
                      <p className="text-xs text-gray-500">From: {ticket.origin} &rarr; To: {ticket.destination}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        ticket.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {ticket.delivery_proof_url ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingMedia({
                              url: ticket.delivery_proof_url,
                              lat: ticket.delivery_latitude,
                              lng: ticket.delivery_longitude,
                              notes: ticket.delivery_notes,
                              delivered_at: ticket.delivered_at
                            })}
                            className="relative group w-10 h-10 rounded-lg overflow-hidden border border-emerald-300 shadow-sm shrink-0"
                          >
                            <img src={ticket.delivery_proof_url} alt="POD" className="w-full h-full object-cover group-hover:scale-110 transition" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                          <div>
                            {ticket.delivery_latitude && ticket.delivery_longitude ? (
                              <a
                                href={`https://www.google.com/maps?q=${ticket.delivery_latitude},${ticket.delivery_longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1 font-semibold"
                              >
                                <MapPin className="w-3 h-3 text-emerald-500" />
                                {Number(ticket.delivery_latitude).toFixed(4)}, {Number(ticket.delivery_longitude).toFixed(4)}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">Photo Attached</span>
                            )}
                            <span className="text-[10px] text-gray-400 block">Verified Real POD</span>
                          </div>
                        </div>
                      ) : ticket.status === 'in_transit' ? (
                        <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                          <Navigation className="w-3 h-3 animate-pulse" /> Awaiting Offload POD
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {ticket.status === 'pending' && (
                        <button
                          onClick={() => acceptTicket(ticket.ticket_id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow"
                        >
                          Accept & Dispatch
                        </button>
                      )}
                      {ticket.status === 'in_transit' && (
                        <button
                          onClick={() => openDeliveryModal(ticket)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow flex items-center gap-1.5 ml-auto"
                        >
                          <Camera className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      )}
                      {ticket.status === 'delivered' && (
                        <span className="text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200">
                          Delivered ✓
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
