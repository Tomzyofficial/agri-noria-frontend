"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
   UploadCloud,
   Camera,
   ShieldCheck,
   CheckCircle2,
   ArrowLeft,
   FileText,
   AlertCircle,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa6";

export default function EcosystemRoleOnboarding({
   roleTitle,
   roleBadge,
   roleIcon,
   description,
   dashboardRoute = "/ecosystem",
   renderRoleFields,
   initialRoleData = {},
   documentLabels = {
      license: "Official License / Certificate",
      licenseDesc: "CAC Certificate, Operating License, or Appointment Letter",
   },
}) {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [uploadingField, setUploadingField] = useState(null);

   const [formData, setFormData] = useState({
      ...initialRoleData,
      license_url: "",
      appointment_letter_url: "",
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

   const setVideoElement = useCallback((node) => {
      videoRef.current = node;
      if (node && streamRef.current) {
         node.srcObject = streamRef.current;
         node.play().catch((err) => console.warn("Video auto-play warning:", err));
      }
   }, []);

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
            setCameraError("No camera found on this device. Please upload a photo from your files.");
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
         const file = new File([blob], `biometric_kyc_${Date.now()}.jpg`, { type: "image/jpeg" });
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
            setFormData((prev) => ({
               ...prev,
               [fieldName]: result.data.url,
               // Keep license_url and appointment_letter_url in sync if one is updated
               ...(fieldName === "appointment_letter_url" ? { license_url: result.data.url } : {}),
               ...(fieldName === "license_url" ? { appointment_letter_url: result.data.url } : {}),
            }));
            toast.success("Document uploaded successfully");
         } else {
            toast.error(result.error || "Failed to upload document");
         }
      } catch (e) {
         console.error("Upload error:", e);
         toast.error("Failed to upload document. Please retry.");
      } finally {
         setUploadingField(null);
      }
   };

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      const effectiveDoc = formData.appointment_letter_url || formData.license_url;
      if (!effectiveDoc) {
         return toast.error(`Please upload your ${documentLabels.license || "official authorization document"}`);
      }
      if (!formData.id_front_url) {
         return toast.error("Please upload your national ID card (front)");
      }
      if (!formData.live_selfie_url) {
         return toast.error("Please complete your live biometric selfie verification");
      }

      setIsSubmitting(true);
      try {
         const res = await fetch("/api/proxy/vendor/onboarding/ecosystem-kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               ...formData,
               license_url: effectiveDoc,
               appointment_letter_url: effectiveDoc,
            }),
         });

         const data = await res.json();
         if (data.success) {
            toast.success("KYC dossier submitted successfully! Awaiting SuperAdmin verification.");
            router.push(dashboardRoute);
         } else {
            toast.error(data.error || "Submission failed. Please check the fields and try again.");
         }
      } catch (err) {
         console.error("Submission error:", err);
         toast.error("Failed to submit verification dossier. Please retry.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
               <button
                  type="button"
                  onClick={() => router.push(dashboardRoute)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
               >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
               </button>
               <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {roleBadge || "Ecosystem Verification"}
               </span>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
               <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-black">
                        {roleIcon || <ShieldCheck className="w-6 h-6" />}
                     </div>
                     <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                           {roleTitle}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                           {description || "Complete your operational specifications, authorization credentials, and live biometric identity to unlock platform operations."}
                        </p>
                     </div>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Role-Specific Operational Profile */}
                  {renderRoleFields && renderRoleFields({ formData, handleChange, handleFileUpload, uploadingField, setFormData })}

                  {/* Section 2: Official Accreditation & Identity Documents */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Official Accreditation & Identity Verification
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Official Document / License */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {documentLabels.license || "Official Authorization Document"} <span className="text-red-500">*</span>
                           </span>
                           {formData.license_url || formData.appointment_letter_url ? (
                              <div className="space-y-2">
                                 {(formData.license_url || formData.appointment_letter_url).toLowerCase().includes(".pdf") ? (
                                    <div className="w-24 h-24 rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950 flex flex-col items-center justify-center text-emerald-600 p-2">
                                       <FileText className="w-8 h-8" />
                                       <span className="text-[10px] font-bold mt-1">PDF File</span>
                                    </div>
                                 ) : (
                                    <img
                                       src={formData.license_url || formData.appointment_letter_url}
                                       alt="Credential"
                                       className="w-24 h-24 object-cover rounded-xl border border-emerald-500"
                                    />
                                 )}
                                 <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                                 </p>
                              </div>
                           ) : (
                              <label className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                                 {uploadingField === "license_url" || uploadingField === "appointment_letter_url" ? (
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
                           <p className="text-[10px] text-gray-400">{documentLabels.licenseDesc || "PDF or Image"}</p>
                        </div>

                        {/* ID Front */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              National ID Card (Front) <span className="text-red-500">*</span>
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
                           <p className="text-[10px] text-gray-400">NIN, Voter ID, Driver's License</p>
                        </div>

                        {/* ID Back */}
                        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gray-50/50 dark:bg-gray-950/50">
                           <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              National ID Card (Back)
                           </span>
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
                           <p className="text-[10px] text-gray-400">Optional reverse side</p>
                        </div>
                     </div>
                  </div>

                  {/* Section 3: Live Biometric Identity Verification */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        Live Biometric Identity Verification <span className="text-red-500">*</span>
                     </h3>

                     <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 space-y-4">
                        <p className="text-xs text-gray-500 leading-relaxed">
                           To prevent identity impersonation, ecosystem participants are required to complete live biometric face capture or upload an immediate selfie.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                           {/* Preview Box */}
                           <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/30 relative shrink-0">
                              {formData.live_selfie_url ? (
                                 <img
                                    src={formData.live_selfie_url}
                                    alt="Live Selfie"
                                    className="w-full h-full object-cover"
                                 />
                              ) : cameraActive ? (
                                 <video
                                    ref={setVideoElement}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={() => setIsVideoReady(true)}
                                    className="w-full h-full object-cover -scale-x-100"
                                 />
                              ) : (
                                 <div className="text-center p-3 text-gray-400 space-y-1">
                                    <Camera className="w-8 h-8 mx-auto opacity-50" />
                                    <span className="text-[11px] block font-semibold">No Biometric Photo</span>
                                 </div>
                              )}
                              <canvas ref={canvasRef} className="hidden" />
                           </div>

                           {/* Controls */}
                           <div className="space-y-3 flex-1">
                              {cameraActive ? (
                                 <div className="flex flex-wrap items-center gap-2">
                                    <button
                                       type="button"
                                       onClick={captureSelfie}
                                       disabled={!isVideoReady}
                                       className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                       <Camera className="w-4 h-4" />
                                       <span>Capture Selfie Snapshot</span>
                                    </button>
                                    <button
                                       type="button"
                                       onClick={stopCamera}
                                       className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 transition cursor-pointer"
                                    >
                                       Cancel Camera
                                    </button>
                                 </div>
                              ) : (
                                 <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                       <button
                                          type="button"
                                          onClick={startCamera}
                                          disabled={cameraLoading}
                                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                       >
                                          {cameraLoading ? (
                                             <FaSpinner className="w-4 h-4 animate-spin" />
                                          ) : (
                                             <Camera className="w-4 h-4" />
                                          )}
                                          <span>{formData.live_selfie_url ? "Retake Biometric Selfie" : "Start Live Webcam"}</span>
                                       </button>

                                       <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">or</span>

                                       <label className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer flex items-center gap-2">
                                          {uploadingField === "live_selfie_url" ? (
                                             <FaSpinner className="w-4 h-4 animate-spin text-emerald-600" />
                                          ) : (
                                             <UploadCloud className="w-4 h-4" />
                                          )}
                                          <span>Upload Selfie File</span>
                                          <input
                                             type="file"
                                             accept="image/*"
                                             capture="user"
                                             className="hidden"
                                             onChange={(e) => handleFileUpload(e.target.files[0], "live_selfie_url")}
                                          />
                                       </label>
                                    </div>
                                    {cameraError && (
                                       <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                          {cameraError}
                                       </p>
                                    )}
                                 </div>
                              )}
                              {formData.live_selfie_url && (
                                 <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Biometric portrait verified & attached
                                 </p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Submission Notice & Action */}
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                     <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600" />
                        <div>
                           <p className="font-bold">SuperAdmin Verification Protocol</p>
                           <p className="mt-0.5 leading-relaxed text-amber-700 dark:text-amber-400">
                              Upon submission, your credentials and identity documents will be reviewed by the Agri-Noria platform administration. Once approved, full platform operations and trading features will be unlocked.
                           </p>
                        </div>
                     </div>

                     <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => router.push(dashboardRoute)}
                           className="px-6 py-3 rounded-2xl text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                           {isSubmitting ? (
                              <>
                                 <FaSpinner className="w-4 h-4 animate-spin" />
                                 <span>Submitting Dossier...</span>
                              </>
                           ) : (
                              <span>Submit KYC Dossier for Approval</span>
                           )}
                        </button>
                     </div>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}

