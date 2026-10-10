"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { 
   Loader2, Search, Filter, MapPin, CheckCircle, AlertCircle, Clock, Plus,
   Camera, Video, Navigation, X, Eye, ShieldCheck, RefreshCw, UploadCloud, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function InspectionsPage() {
   const [inspections, setInspections] = useState([]);
   const [filteredInspections, setFilteredInspections] = useState([]);
   const [farmers, setFarmers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");

   const [showForm, setShowForm] = useState(false);
   const [formData, setFormData] = useState({
      farmer_id: "",
      status: "verified",
      notes: ""
   });

   // Geospatial & Media Evidence states
   const [mediaFiles, setMediaFiles] = useState([]); // Max 5 media files
   const [gps, setGps] = useState({ latitude: null, longitude: null, accuracy: null, timestamp: null });
   const [gpsLoading, setGpsLoading] = useState(false);
   const [previewMedia, setPreviewMedia] = useState(null);
   const [submitting, setSubmitting] = useState(false);

   const statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "PENDING_REVIEW", "verified", "failed", "pending"];

   const captureGpsLocation = () => {
      if (typeof window === "undefined" || !navigator.geolocation) {
         toast.warn("Geolocation is not supported by your browser");
         return;
      }
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            const coords = {
               latitude: Number(pos.coords.latitude.toFixed(6)),
               longitude: Number(pos.coords.longitude.toFixed(6)),
               accuracy: Math.round(pos.coords.accuracy),
               timestamp: new Date().toISOString()
            };
            setGps(coords);
            setGpsLoading(false);
            toast.success("📍 GPS location locked!");
         },
         (err) => {
            console.warn("GPS capture warning:", err);
            setGpsLoading(false);
            toast.warn("Could not retrieve GPS location automatically. Click 'Refresh GPS' to retry.");
         },
         { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
   };

   useEffect(() => {
      if (showForm) {
         captureGpsLocation();
      }
   }, [showForm]);

   const handleFileChange = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      if (mediaFiles.length + files.length > 5) {
         toast.error(`Maximum 5 media files allowed. You can only add ${5 - mediaFiles.length} more.`);
         return;
      }

      files.forEach((file) => {
         const isVideo = file.type.startsWith("video/");
         const isImage = file.type.startsWith("image/");
         if (!isImage && !isVideo) {
            toast.error(`${file.name} is not a valid image or video file.`);
            return;
         }

         const reader = new FileReader();
         reader.onload = (event) => {
            setMediaFiles((prev) => {
               if (prev.length >= 5) return prev;
               return [
                  ...prev,
                  {
                     id: Math.random().toString(36).substring(2, 9),
                     type: isVideo ? "video" : "image",
                     name: file.name,
                     size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                     url: event.target.result,
                  },
               ];
            });
         };
         reader.readAsDataURL(file);
      });
      e.target.value = "";
   };

   const removeMedia = (id) => {
      setMediaFiles((prev) => prev.filter((m) => m.id !== id));
   };

   const fetchInspections = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/inspections");
         if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
               setInspections(json.data);
               setFilteredInspections(json.data);
            }
         }
      } catch (err) {
         console.error("Failed to fetch live inspections:", err);
      }
   };

   const fetchFarmers = async () => {
      try {
         const res = await fetch("/api/proxy/field-operations/farmers");
         if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
               setFarmers(json.data);
            }
         }
      } catch (err) {
         console.error("Failed to fetch farmers:", err);
      }
   };

   useEffect(() => {
      Promise.all([fetchInspections(), fetchFarmers()]).finally(() => {
         setLoading(false);
      });
   }, []);

   useEffect(() => {
      let filtered = inspections;

      if (searchTerm) {
         filtered = filtered.filter(
            (insp) =>
               insp.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               insp.farmLocation?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (statusFilter) {
         filtered = filtered.filter((insp) => insp.status === statusFilter);
      }

      setFilteredInspections(filtered);
   }, [searchTerm, statusFilter, inspections]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const payload = {
            farmer_id: formData.farmer_id,
            status: formData.status,
            notes: formData.notes,
            latitude: gps.latitude,
            longitude: gps.longitude,
            geospatial_metadata: {
               latitude: gps.latitude,
               longitude: gps.longitude,
               accuracy: gps.accuracy,
               timestamp: gps.timestamp || new Date().toISOString(),
               device: typeof navigator !== "undefined" ? navigator.userAgent : null,
               is_verified_geotag: !!gps.latitude,
            },
            image_urls: mediaFiles.filter((m) => m.type === "image").map((m) => m.url),
            video_url: mediaFiles.find((m) => m.type === "video")?.url || null,
         };

         const res = await fetch("/api/proxy/field-operations/inspections", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
         });
         if (res.ok) {
            toast.success("Inspection recorded with geospatial media successfully!");
            setShowForm(false);
            fetchInspections(); // Refresh data
            setFormData({ farmer_id: "", status: "verified", notes: "" });
            setMediaFiles([]);
            setGps({ latitude: null, longitude: null, accuracy: null, timestamp: null });
         } else {
            toast.error("Failed to record inspection");
         }
      } catch (err) {
         console.error(err);
         toast.error("An error occurred");
      } finally {
         setSubmitting(false);
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case "COMPLETED":
         case "verified":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
         case "IN_PROGRESS":
         case "pending":
            return <Clock className="w-4 h-4 text-orange-500" />;
         case "SCHEDULED":
            return <Clock className="w-4 h-4 text-blue-500" />;
         default:
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case "COMPLETED":
         case "verified":
            return "bg-green-100 text-green-700";
         case "IN_PROGRESS":
         case "pending":
            return "bg-orange-100 text-orange-700";
         case "SCHEDULED":
            return "bg-blue-100 text-blue-700";
         default:
            return "bg-yellow-100 text-yellow-700";
      }
   };

   const getResultColor = (result) => {
      switch (result) {
         case "PASS":
            return "bg-green-100 text-green-700";
         case "FAIL":
            return "bg-red-100 text-red-700";
         default:
            return "bg-gray-100 text-gray-700";
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-400">Farm Inspections</h1>
               <p className="text-gray-500 mt-1 text-lg">Manage and track all farm inspection activities</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-xl px-6 py-6 font-medium text-lg">
               <Plus className="w-5 h-5" /> Record Inspection
            </Button>
         </div>

         {showForm && (
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ring-1 ring-black/5 dark:ring-white/10">
               <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Record New Inspection</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Farmer / Farm</label>
                           <select
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                              value={formData.farmer_id}
                              onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
                              required
                           >
                              <option value="" className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Select Farmer</option>
                              {farmers.map((f, idx) => {
                                 const farmerName = f.name?.trim() || `${f.fname || ''} ${f.lname || ''}`.trim() || f.phone || `Farmer #${String(f.farmer_id || idx).slice(0, 8)}`;
                                 const details = [f.phone, f.commodity].filter(Boolean).join(" • ");
                                 return (
                                    <option 
                                       key={f.farmer_id || idx} 
                                       value={f.farmer_id}
                                       className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1.5"
                                    >
                                       {farmerName}{details ? ` (${details})` : ''}
                                    </option>
                                 );
                              })}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                           <select
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm text-gray-900 dark:text-gray-100 font-medium"
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              required
                           >
                              <option value="verified" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Verified (Pass)</option>
                              <option value="failed" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Failed</option>
                              <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Pending</option>
                           </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                           <textarea
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all outline-none shadow-sm resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              rows={3}
                              placeholder="Add inspection observations, crop health, soil conditions, etc..."
                           />
                        </div>

                        {/* Real-time Geospatial Geolocation Section */}
                        <div className="md:col-span-2 p-5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                 <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                                    <Navigation className="w-5 h-5 animate-pulse" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                                       Geospatial Verification Coordinates
                                       <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                          Real Field GPS
                                       </span>
                                    </h4>
                                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                                       {gps.latitude && gps.longitude
                                          ? `Latitude: ${gps.latitude}° | Longitude: ${gps.longitude}° (Accuracy: ±${gps.accuracy}m)`
                                          : gpsLoading
                                          ? "Capturing high-precision GPS coordinates from your device..."
                                          : "GPS not captured yet. Click refresh to query device location."}
                                    </p>
                                 </div>
                              </div>
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 onClick={captureGpsLocation}
                                 disabled={gpsLoading}
                                 className="border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl text-xs h-9 font-bold flex items-center gap-1.5"
                              >
                                 <RefreshCw className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
                                 {gps.latitude ? "Re-acquire GPS" : "Capture GPS"}
                              </Button>
                           </div>
                        </div>

                        {/* Media Upload Section (Max 5 Images & Videos) */}
                        <div className="md:col-span-2 space-y-3">
                           <div className="flex items-center justify-between">
                              <div>
                                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Inspection Evidence (Photos & Video)
                                 </label>
                                 <p className="text-xs text-gray-500">
                                    Upload real on-site photos or inspection video (Max 5 files total)
                                 </p>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                 {mediaFiles.length} / 5 Max
                              </span>
                           </div>

                           {/* Upload drop/click area */}
                           {mediaFiles.length < 5 && (
                              <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-800/40 hover:bg-emerald-50/20">
                                 <UploadCloud className="w-8 h-8 text-emerald-600 mb-2" />
                                 <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Click or tap to upload images or video
                                 </p>
                                 <p className="text-xs text-gray-400 mt-1">
                                    Supports JPEG, PNG, WEBP, MP4, WEBM (up to 5 items)
                                 </p>
                                 <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                 />
                              </label>
                           )}

                           {/* Previews Grid */}
                           {mediaFiles.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                                 {mediaFiles.map((m) => (
                                    <div
                                       key={m.id}
                                       className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black aspect-video flex items-center justify-center shadow-xs"
                                    >
                                       {m.type === "image" ? (
                                          <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                                       ) : (
                                          <div className="flex flex-col items-center justify-center text-white">
                                             <Video className="w-6 h-6 mb-1 text-emerald-400" />
                                             <span className="text-[10px] font-bold">Video</span>
                                          </div>
                                       )}
                                       <button
                                          type="button"
                                          onClick={() => removeMedia(m.id)}
                                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition shadow-md"
                                          title="Remove file"
                                       >
                                          <X className="w-3.5 h-3.5" />
                                       </button>
                                       <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[9px] text-white truncate">
                                          {m.name}
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-6">
                           Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="rounded-xl px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                           {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                           Save Inspection
                        </Button>
                     </div>
                  </form>
               </CardContent>
            </Card>
         )}

         {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Total Inspections</p>
                  <p className="text-2xl font-bold mt-2">{inspections.length}</p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Completed / Verified</p>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                     {inspections.filter((i) => i.status === "COMPLETED" || i.status === "verified").length}
                  </p>
               </CardContent>
            </Card>
            <Card>
               <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold mt-2 text-orange-600">
                     {inspections.filter((i) => i.status === "IN_PROGRESS" || i.status === "pending").length}
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Filters */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-2">Search</label>
                     <input
                        type="text"
                        placeholder="Farmer name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none shadow-sm font-medium"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-2">Status</label>
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none shadow-sm font-medium"
                     >
                        <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">All Statuses</option>
                        {statuses.map((status) => (
                           <option key={status} value={status} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                              {status.replace(/_/g, " ")}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Inspections Table */}
         <Card>
            <CardHeader>
               <CardTitle>Inspections ({filteredInspections.length})</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b dark:border-gray-700">
                        <tr>
                           <th className="text-left py-3 px-4 font-semibold">Inspection ID</th>
                           <th className="text-left py-3 px-4 font-semibold">Farmer</th>
                           <th className="text-left py-3 px-4 font-semibold">Location</th>
                           <th className="text-left py-3 px-4 font-semibold">Crop & Area</th>
                           <th className="text-left py-3 px-4 font-semibold">Geospatial & Evidence</th>
                           <th className="text-left py-3 px-4 font-semibold">Date</th>
                           <th className="text-left py-3 px-4 font-semibold">Status</th>
                           <th className="text-left py-3 px-4 font-semibold">Result</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredInspections.map((insp) => {
                           const hasGps = insp.latitude != null && insp.longitude != null && !isNaN(Number(insp.latitude)) && !isNaN(Number(insp.longitude));
                           const images = Array.isArray(insp.image_urls) ? insp.image_urls : [];
                           const video = insp.video_url;

                           return (
                              <tr
                                 key={insp.id}
                                 className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                              >
                                 <td className="py-3 px-4 font-mono text-xs">{insp.id.substring(0, 8)}...</td>
                                 <td className="py-3 px-4 font-semibold">{insp.farmerName}</td>
                                 <td className="py-3 px-4 text-sm">
                                    <div className="flex items-center gap-1">
                                       <MapPin className="w-3.5 h-3.5 text-gray-400" /> {insp.farmLocation}
                                    </div>
                                 </td>
                                 <td className="py-3 px-4 text-sm">
                                    <p className="font-semibold">{insp.cropType || "—"}</p>
                                    <p className="text-xs text-gray-500">{insp.areaSize}</p>
                                 </td>
                                 <td className="py-3 px-4">
                                    <div className="space-y-1.5">
                                       {hasGps ? (
                                          <a
                                             href={`https://www.google.com/maps?q=${insp.latitude},${insp.longitude}`}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full hover:underline"
                                             title="Open location on Google Maps"
                                          >
                                             <Navigation className="w-2.5 h-2.5" />
                                             {Number(insp.latitude).toFixed(4)}, {Number(insp.longitude).toFixed(4)}
                                             <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                          </a>
                                       ) : (
                                          <span className="text-[10px] text-gray-400 italic">No GPS tag</span>
                                       )}

                                       {/* Media thumbnails */}
                                       <div className="flex items-center gap-1.5 flex-wrap">
                                          {images.slice(0, 4).map((url, i) => (
                                             <button
                                                key={i}
                                                type="button"
                                                onClick={() => setPreviewMedia({ type: "image", url })}
                                                className="w-7 h-7 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-110 transition shadow-2xs"
                                                title="View photo"
                                             >
                                                <img src={url} alt="Proof" className="w-full h-full object-cover" />
                                             </button>
                                          ))}
                                          {images.length > 4 && (
                                             <span className="text-[10px] font-bold text-gray-400">+{images.length - 4}</span>
                                          )}
                                          {video && (
                                             <button
                                                type="button"
                                                onClick={() => setPreviewMedia({ type: "video", url: video })}
                                                className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1"
                                                title="Watch inspection video"
                                             >
                                                <Video className="w-3 h-3" /> Video
                                             </button>
                                          )}
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-3 px-4 text-sm text-gray-500">{new Date(insp.date).toLocaleDateString()}</td>
                                 <td className="py-3 px-4">
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(insp.status)}`}
                                    >
                                       {getStatusIcon(insp.status)}
                                       {insp.status.replace(/_/g, " ")}
                                    </span>
                                 </td>
                                 <td className="py-3 px-4">
                                    {insp.result && (
                                       <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(insp.result)}`}
                                       >
                                          {insp.result}
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
                  {filteredInspections.length === 0 && (
                     <div className="text-center py-8 text-gray-500">No inspections found</div>
                  )}
               </div>
            </CardContent>
         </Card>

         {/* Lightbox / Media Preview Modal */}
         {previewMedia && (
            <div
               onClick={() => setPreviewMedia(null)}
               className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            >
               <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-3xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
               >
                  <button
                     onClick={() => setPreviewMedia(null)}
                     className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition"
                  >
                     <X className="w-5 h-5" />
                  </button>
                  {previewMedia.type === "image" ? (
                     <img
                        src={previewMedia.url}
                        alt="Evidence Preview"
                        className="w-full max-h-[80vh] object-contain mx-auto"
                     />
                  ) : (
                     <video
                        src={previewMedia.url}
                        controls
                        autoPlay
                        className="w-full max-h-[80vh] mx-auto"
                     />
                  )}
               </div>
            </div>
         )}
      </div>
   );
}
