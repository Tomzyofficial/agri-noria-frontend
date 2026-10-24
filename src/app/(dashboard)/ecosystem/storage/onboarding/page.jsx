"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
   Building2,
   UploadCloud,
   Camera,
   ShieldCheck,
   CheckCircle2,
   RefreshCw,
   ArrowLeft,
   FileText,
   AlertCircle,
   Warehouse,
   DollarSign,
   Layers,
   Info,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa6";

const STORAGE_TYPES = [
   "Grain Silo Complex",
   "Dry Bulk Commodity Warehouse",
   "Temperature-Controlled Cold Storage",
   "Hermetic Silo / Cocoa & Coffee Facility",
   "Bonded Customs Agricultural Warehouse",
   "General Ambient Produce Store",
];

export default function StorageOnboardingPage() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [uploadingField, setUploadingField] = useState(null);

   const [formData, setFormData] = useState({
      business_name: "",
      cac_number: "",
      address: "",
      storage_type: "Grain Silo Complex",
      total_capacity_mt: "",
      price_per_mt_month: "",
      description: "",
      license_url: "",
      id_front_url: "",
      id_back_url: "",
      live_selfie_url: "",
   });

   // Biometric Webcam States
   const videoRef = useRef(null);
   const canvasRef = useRef(null);
   const streamRef = useRef(null);
   const [cameraActive, setCameraActive] = useState(false);
   const [cameraLoading, setCameraLoading] = useState(false);
   const [cameraError, setCameraError] = useState(null);
   const [isVideoReady, setIsVideoReady] = useState(false);

   const stopCamera = useCallback(() => {
      if (streamRef.current) {
         streamRef.current.getTracks().forEach((track) => track.stop());
         streamRef.current = null;
      }
      if (videoRef.current) {
         videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setIsVideoReady(false);
   }, []);

   // Callback ref ensures stream is immediately attached to <video> when mounted
   const setVideoElement = useCallback((node) => {
      videoRef.current = node;
      if (node && streamRef.current) {
         node.srcObject = streamRef.current;
         node.play().catch((err) => console.warn("Video auto-play warning:", err));
      }
   }, []);

   // Fallback effect when cameraActive changes
   useEffect(() => {
      if (cameraActive && streamRef.current && videoRef.current) {
         videoRef.current.srcObject = streamRef.current;
         videoRef.current.play().catch((err) => console.warn("Video auto-play warning:", err));
      }
   }, [cameraActive]);

   const startCamera = async () => {
      setCameraError(null);
      setCameraLoading(true);
      setIsVideoReady(false);
      try {
         if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera capture is not supported on this browser.");
            setCameraLoading(false);
            return;
         }
         stopCamera();
         // Mount camera view first so video element ref is ready
         setCameraActive(true);

         const stream = await navigator.mediaDevices.getUserMedia({
            video: {
               facingMode: "user",
               width: { ideal: 1280 },
               height: { ideal: 720 },
            },
            audio: false,
         });

         streamRef.current = stream;
         if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
         }
      } catch (err) {
         console.error("Camera access error:", err);
         stopCamera();
         if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraError("Camera permission denied. Please allow camera access in your browser or upload a photo.");
         } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setCameraError("No camera found on this device. Please upload a photo from files.");
         } else {
            setCameraError("Unable to access your camera: " + (err.message || "Unknown error"));
         }
      } finally {
         setCameraLoading(false);
      }
   };

   useEffect(() => {
      return () => {
         stopCamera();
      };
   }, [stopCamera]);

   const captureSelfie = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video.videoWidth || video.videoWidth === 0) {
         toast.warning("Camera is still warming up. Please wait a moment and click capture again.");
         return;
      }

      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Flip horizontally so captured selfie matches mirrored webcam view
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      canvas.toBlob(async (blob) => {
         if (!blob) {
            toast.error("Failed to capture image snapshot. Please retry.");
            return;
         }
         stopCamera();
         const file = new File([blob], `storage_operator_selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
         await handleFileUpload(file, "live_selfie_url");
      }, "image/jpeg", 0.92);
   };

   const handleFileUpload = async (file, fieldName) => {
      if (!file) return;
      setUploadingField(fieldName);
      const data = new FormData();
      data.append("file", file);

      try {
         const res = await fetch("/api/proxy/vendor/upload/document", {
            method: "POST",
            body: data,
         });
         const result = await res.json();
         if (result.success && result.data?.url) {
            setFormData((prev) => ({ ...prev, [fieldName]: result.data.url }));
            toast.success("Document uploaded successfully");
         } else {
            toast.error(result.error || "Failed to upload document");
         }
      } catch (e) {
         console.error("Upload error:", e);
         toast.error("Network error during file upload");
      } finally {
         setUploadingField(null);
      }
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.business_name.trim()) return toast.error("Please enter your warehouse / facility name");
      if (!formData.cac_number.trim()) return toast.error("Please provide CAC / RC registration number");
      if (!formData.address.trim()) return toast.error("Please provide your physical warehouse location");
      if (!formData.total_capacity_mt) return toast.error("Please enter your total facility capacity in MT");
      if (!formData.license_url) return toast.error("Please upload your CAC or Warehouse Operating License");
      if (!formData.id_front_url) return toast.error("Please upload your national ID card (front)");
      if (!formData.live_selfie_url) return toast.error("Please capture your live biometric selfie");

      setIsSubmitting(true);
      try {
         const res = await fetch("/api/proxy/vendor/onboarding/storage-kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         const data = await res.json();
         if (data.success) {
            toast.success("Storage facility KYC submitted successfully!");
            router.push("/ecosystem/storage");
         } else {
            toast.error(data.error || "Submission failed. Please check the fields and try again.");
         }
      } catch (err) {
         console.error("Submission error:", err);
         toast.error("Failed to submit storage verification. Please retry.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
               <button
                  type="button"
                  onClick={() => router.push("/ecosystem/storage")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
               >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
               </button>
               <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Storage Facility Verification
               </span>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
               <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
                        <Warehouse className="w-6 h-6" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                           Storage Facility KYC & Warehouse Registration
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                           Register your grain silos or warehouses to participate in commodity aggregation, e-NWR issuance, and ecosystem intake.
                        </p>
                     </div>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Facility Profile */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        1. Warehouse Facility Information
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Warehouse / Facility Name <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="business_name"
                              value={formData.business_name}
                              onChange={handleChange}
                              placeholder="e.g. Northern Agro Silos Ltd"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              CAC / RC Registration Number <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="cac_number"
                              value={formData.cac_number}
                              onChange={handleChange}
                              placeholder="e.g. RC-1928374"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Warehouse Classification
                           </label>
                           <select
                              name="storage_type"
                              value={formData.storage_type}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                           >
                              {STORAGE_TYPES.map((t) => (
                                 <option key={t} value={t}>
                                    {t}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Total Capacity (Metric Tons - MT) <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="number"
                              name="total_capacity_mt"
                              value={formData.total_capacity_mt}
                              onChange={handleChange}
                              placeholder="e.g. 5000"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Monthly Fee Rate per MT (NGN / USD)
                           </label>
                           <input
                              type="number"
                              name="price_per_mt_month"
                              value={formData.price_per_mt_month}
                              onChange={handleChange}
                              placeholder="e.g. 2500"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Physical Facility Address & State <span className="text-red-500">*</span>
                           </label>
                           <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="e.g. Km 12 Zaria Agro Corridor, Kaduna State"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                              required
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                           Facility Description & Security Features
                        </label>
                        <textarea
                           name="description"
                           value={formData.description}
                           onChange={handleChange}
                           rows={3}
                           placeholder="Describe warehouse features: e.g. 24/7 security, digital weighbridge, moisture aeration, pest treatment cycle..."
                           className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm focus:border-emerald-500 focus:outline-hidden"
                        />
                     </div>
                  </div>

                  {/* Section 2: Certifications & ID */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        2. CAC Certificate & Identity Documents
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* CAC / Operating License */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              CAC / License Certificate <span className="text-red-500">*</span>
                           </span>
                           {formData.license_url ? (
                              <div className="space-y-2">
                                 <img
                                    src={formData.license_url}
                                    alt="CAC License"
                                    className="w-24 h-24 object-cover rounded-xl border border-emerald-500"
                                 />
                                 <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                                 </p>
                              </div>
                           ) : (
                              <label className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                                 {uploadingField === "license_url" ? (
                                    <FaSpinner className="w-5 h-5 text-emerald-600 animate-spin" />
                                 ) : (
                                    <>
                                       <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                       <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Choose File</span>
                                    </>
                                 )}
                                 <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], "license_url")}
                                 />
                              </label>
                           )}
                        </div>

                        {/* ID Front */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              National ID (Front) <span className="text-red-500">*</span>
                           </span>
                           {formData.id_front_url ? (
                              <div className="space-y-2">
                                 <img
                                    src={formData.id_front_url}
                                    alt="ID Front"
                                    className="w-24 h-24 object-cover rounded-xl border border-emerald-500"
                                 />
                                 <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                                 </p>
                              </div>
                           ) : (
                              <label className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                                 {uploadingField === "id_front_url" ? (
                                    <FaSpinner className="w-5 h-5 text-emerald-600 animate-spin" />
                                 ) : (
                                    <>
                                       <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                       <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Choose File</span>
                                    </>
                                 )}
                                 <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], "id_front_url")}
                                 />
                              </label>
                           )}
                        </div>

                        {/* ID Back */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">National ID (Back)</span>
                           {formData.id_back_url ? (
                              <div className="space-y-2">
                                 <img
                                    src={formData.id_back_url}
                                    alt="ID Back"
                                    className="w-24 h-24 object-cover rounded-xl border border-emerald-500"
                                 />
                                 <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                                 </p>
                              </div>
                           ) : (
                              <label className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                                 {uploadingField === "id_back_url" ? (
                                    <FaSpinner className="w-5 h-5 text-emerald-600 animate-spin" />
                                 ) : (
                                    <>
                                       <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                       <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Choose File</span>
                                    </>
                                 )}
                                 <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], "id_back_url")}
                                 />
                              </label>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Section 3: Live Biometric Webcam Selfie */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        3. Live Biometric Face Capture <span className="text-red-500">*</span>
                     </h3>

                     <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-950/50">
                        {cameraActive ? (
                           <div className="space-y-4">
                              <div className="relative max-w-sm mx-auto h-72 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-emerald-500 shadow-xl">
                                 {cameraLoading && (
                                    <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-white gap-2">
                                       <FaSpinner className="w-6 h-6 animate-spin text-emerald-400" />
                                       <span className="text-xs font-bold text-gray-300">Initializing camera feed...</span>
                                    </div>
                                 )}
                                 <video
                                    ref={setVideoElement}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={(e) => {
                                       setIsVideoReady(true);
                                       e.target.play().catch(() => {});
                                    }}
                                    onCanPlay={() => setIsVideoReady(true)}
                                    className="w-full h-full object-cover transform -scale-x-100"
                                 />
                                 {/* Oval alignment HUD frame */}
                                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                                    <div className="w-44 h-56 rounded-full border-2 border-dashed border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse flex items-center justify-center">
                                       <div className="absolute -top-3 left-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black tracking-widest uppercase text-white shadow">
                                          Align Face Here
                                       </div>
                                    </div>
                                 </div>
                                 <div className="absolute top-2 left-2 bg-black/60 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 z-10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE BIOMETRIC FEED
                                 </div>
                              </div>
                              <canvas ref={canvasRef} className="hidden" />

                              {/* Prominent camera capture / shutter controls */}
                              <div className="flex flex-col items-center gap-2">
                                 <div className="flex items-center justify-center gap-3">
                                    <button
                                       type="button"
                                       onClick={captureSelfie}
                                       className="px-6 py-3 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                                    >
                                       <Camera className="w-4 h-4" />
                                       <span>Capture Facial Snapshot</span>
                                    </button>
                                    <button
                                       type="button"
                                       onClick={stopCamera}
                                       className="px-4 py-3 rounded-2xl text-xs font-bold bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                                    >
                                       Cancel
                                    </button>
                                 </div>
                                 <p className="text-[11px] text-gray-400 font-medium">Position your face inside the oval and click Capture</p>
                              </div>
                           </div>
                        ) : formData.live_selfie_url ? (
                           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                 <img
                                    src={formData.live_selfie_url}
                                    alt="Live Biometric Capture"
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                                 />
                                 <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                                       <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Biometric Selfie Verified
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                       Live facial photo captured and linked to your facility operator record.
                                    </p>
                                 </div>
                              </div>
                              <button
                                 type="button"
                                 onClick={startCamera}
                                 className="px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition cursor-pointer flex items-center gap-1.5"
                              >
                                 <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                 <span>Retake Photo</span>
                              </button>
                           </div>
                        ) : (
                           <div className="text-center py-6 space-y-3">
                              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                 <Camera className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-gray-900 dark:text-white">Live Facial Verification</h4>
                                 <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                                    Please use your camera to capture a live facial selfie. This verifies warehouse authorized personnel and prevents fraudulent facility claims.
                                 </p>
                              </div>
                              {cameraError && (
                                 <p className="text-xs text-red-500 font-medium">{cameraError}</p>
                              )}
                              <div className="flex items-center justify-center gap-3 pt-2">
                                 <button
                                    type="button"
                                    onClick={startCamera}
                                    disabled={cameraLoading}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow transition cursor-pointer flex items-center gap-2"
                                 >
                                    {cameraLoading ? <FaSpinner className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                                    <span>Start Live Camera</span>
                                 </button>
                                 <label className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition cursor-pointer">
                                    Upload Photo
                                    <input
                                       type="file"
                                       accept="image/*"
                                       className="hidden"
                                       onChange={(e) => handleFileUpload(e.target.files[0], "live_selfie_url")}
                                    />
                                 </label>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-end gap-4">
                     <button
                        type="button"
                        onClick={() => router.push("/ecosystem/storage")}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                     >
                        {isSubmitting ? (
                           <>
                              <FaSpinner className="w-4 h-4 animate-spin" />
                              <span>Submitting KYC Details...</span>
                           </>
                        ) : (
                           <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Submit Facility for SuperAdmin Review</span>
                           </>
                        )}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}
