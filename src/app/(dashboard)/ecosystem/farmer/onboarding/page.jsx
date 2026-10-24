"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    CheckCircle2,
    UploadCloud,
    MapPin,
    ShieldCheck,
    Sprout,
    Tractor,
    FileText,
    Camera,
    User,
    Users,
    Calendar,
    ChevronRight,
    ArrowLeft,
    Check,
    AlertCircle,
    Trash2,
    Sparkles,
    ExternalLink,
    Lock,
    RefreshCw,
    Building2,
    Award,
    Layers,
    FileCheck,
    Navigation,
    Info,
    CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";

// Dynamic import for Leaflet map to prevent SSR window errors
const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="h-[380px] w-full rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse flex items-center justify-center text-gray-400">
            <div className="flex items-center gap-2 font-bold text-sm">
                <MapPin className="animate-bounce text-emerald-500" size={20} />
                <span>Loading Agricultural Map Engine...</span>
            </div>
        </div>
    )
});

const STEP_METADATA = {
    1: { title: "Welcome & Setup", short: "Overview" },
    2: { title: "Date of Birth & Demographics", short: "Bio Details" },
    3: { title: "Government Identity Document", short: "ID Document" },
    4: { title: "Live Facial Selfie Verification", short: "Live Selfie" },
    5: { title: "Family & Household Details", short: "Household" },
    6: { title: "Farming Specialization & Experience", short: "Experience" },
    7: { title: "Cooperative & Group Membership", short: "Cooperative" },
    8: { title: "Farm Property Details", short: "Farm Info" },
    9: { title: "Farm Geographic Location (GPS Pin)", short: "Location Pin" },
    10: { title: "Farm Boundary Mapping (Polygon)", short: "Boundary Map" },
    11: { title: "Land Title & Proof of Tenure", short: "Land Title" },
    12: { title: "Physical Farm Evidence Photos", short: "Farm Photos" },
    13: { title: "Primary Crop Specification", short: "Crops" },
    14: { title: "Agronomic Production History", short: "History" },
    15: { title: "Farm Machinery & Equipment", short: "Equipment" },
    16: { title: "Agricultural Inputs & Seed Suppliers", short: "Inputs" },
    17: { title: "Financial & Banking Setup", short: "Banking" },
    20: { title: "Verification Completed", short: "Completed" }
};

const SECTION_TO_STEPS = {
    personal_info: [2],
    identity_docs: [3],
    live_selfie: [4],
    identity: [3, 4],
    farm_info: [8, 9],
    boundary: [10],
    land_title: [11],
    farm_photos: [12],
    crops: [13],
    production: [14, 15],
    banking: [17],
};

const DEFAULT_FORM_DATA = {
    // Level 1: Basic Identity
    middle_name: "",
    gender: "",
    dob: "",
    phone: "",
    selected_id_type: "nin",
    nin: "",
    voter_id: "",
    passport_id: "",
    drivers_license: "",
    id_front_url: "",
    id_back_url: "",
    live_selfie_url: "",
    marital_status: "",
    household_size: "",
    dependents: "",
    years_of_experience: "",
    primary_activity: "Crop Farming",
    cooperative_name: "",
    farmer_group: "",
    association: "",
    crop: "Maize",
    variety: "",
    planting_date: "",
    expected_harvest_date: "",

    // Level 2: Farm Verification & Mapping
    farm_name: "Main Production Farm",
    ownership_type: "Owned",
    location_address: "",
    latitude: "",
    longitude: "",
    farm_size_hectares: "",
    boundary_polygon: "",
    boundary_file_url: "",
    land_title_url: "",
    lease_agreement_url: "",
    community_attestation_url: "",
    farm_entrance_photo_url: "",
    farm_interior_photo_url: "",
    crop_photo_url: "",
    farm_evidence_geospatial: null,

    // Level 3: Full Passport
    historical_productions: [
        { season_name: "Past Season 1", crop: "Maize", yield_amount: "4.5", area_hectares: "2.0" }
    ],
    equipment_type: "None",
    seed_supplier: "",
    fertilizer_usage: "",
    agrochemical_usage: "",
    bank_name: "",
    account_number: "",
    mobile_money: "",
    previous_agricultural_loan: false,
    insurance_history: false
};

export default function FarmerOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [localPreviews, setLocalPreviews] = useState({});
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [autoSaveStatus, setAutoSaveStatus] = useState("saved"); // 'saving', 'saved', 'error'
    const saveTimeoutRef = useRef(null);

    // Live Selfie Camera Refs & States
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError("Camera is not supported on this browser or connection. Please use file upload.");
                return;
            }
            stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraActive(false);
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setCameraError("Camera permission denied. Please allow camera access in your browser or upload a photo.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setCameraError("No camera device found. Please upload a photo from your device.");
            } else {
                setCameraError("Could not access camera: " + (err.message || "Unknown error"));
            }
        }
    }, [stopCamera]);

    useEffect(() => {
        if (step === 4 && !(localPreviews.live_selfie_url || formData.live_selfie_url)) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [step, localPreviews.live_selfie_url, formData.live_selfie_url, startCamera, stopCamera]);

    const captureSelfie = () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsCapturing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            setIsCapturing(false);
            if (!blob) {
                toast.error("Failed to capture image");
                return;
            }
            stopCamera();
            const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
            await handleFileUpload(file, "live_selfie_url");
        }, "image/jpeg", 0.92);
    };

    const handleRetakeSelfie = () => {
        setFormData(p => ({ ...p, live_selfie_url: "" }));
        setLocalPreviews(p => ({ ...p, live_selfie_url: null }));
        startCamera();
    };

    // Sync draft to backend and localStorage
    const persistDraft = useCallback(async (currentStep, currentFormData) => {
        try {
            setAutoSaveStatus("saving");
            if (typeof window !== "undefined") {
                localStorage.setItem("farmer_onboarding_draft", JSON.stringify(currentFormData));
                localStorage.setItem("farmer_onboarding_step", String(currentStep));
            }
            await fetch("/api/proxy/vendor/onboarding/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: currentStep, draft: currentFormData })
            });
            setAutoSaveStatus("saved");
        } catch (e) {
            console.warn("Auto-save draft warning:", e);
            setAutoSaveStatus("saved"); // fail silently for UX
        }
    }, []);

    // Debounced draft auto-save on field change
    const triggerDebouncedSave = (newFormData, currentStep) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setAutoSaveStatus("saving");
        saveTimeoutRef.current = setTimeout(() => {
            persistDraft(currentStep, newFormData);
        }, 1200);
    };

    // Load initial profile and resume at the correct stage
    useEffect(() => {
        let isMounted = true;

        const initializeFlow = async () => {
            try {
                // 1. Check URL parameters
                const params = new URLSearchParams(window.location.search);
                const queryStep = parseInt(params.get("step"), 10);
                const hasValidQueryStep = queryStep && !isNaN(queryStep) && queryStep >= 1 && queryStep <= 20;

                // 2. Load LocalStorage draft if present
                let localDraft = {};
                let localSavedStep = 1;
                try {
                    const savedDraftStr = localStorage.getItem("farmer_onboarding_draft");
                    if (savedDraftStr) localDraft = JSON.parse(savedDraftStr);
                    const savedStepStr = localStorage.getItem("farmer_onboarding_step");
                    if (savedStepStr) localSavedStep = parseInt(savedStepStr, 10);
                } catch (e) {
                    console.warn("Could not read local draft:", e);
                }

                // 3. Fetch backend profile
                const res = await fetch("/api/proxy/pipeline/farmer-profile/me");
                let p = null;
                if (res.ok) {
                    const json = await res.json();
                    p = json?.data || null;
                    if (isMounted) setProfileData(p);
                }

                // Merge data: default -> localDraft -> backend draft -> backend profile
                const backendDraft = p?.onboarding_draft && typeof p.onboarding_draft === "object" ? p.onboarding_draft : {};
                
                const merged = {
                    ...DEFAULT_FORM_DATA,
                    ...localDraft,
                    ...backendDraft,
                    middle_name: p?.middle_name || localDraft.middle_name || DEFAULT_FORM_DATA.middle_name,
                    gender: p?.gender || localDraft.gender || DEFAULT_FORM_DATA.gender,
                    dob: p?.dob ? (p.dob.includes("T") ? p.dob.split("T")[0] : p.dob) : (localDraft.dob || DEFAULT_FORM_DATA.dob),
                    phone: p?.phone || localDraft.phone || DEFAULT_FORM_DATA.phone,
                    nin: p?.nin || localDraft.nin || DEFAULT_FORM_DATA.nin,
                    voter_id: p?.voter_id || localDraft.voter_id || DEFAULT_FORM_DATA.voter_id,
                    passport_id: p?.passport_id || localDraft.passport_id || DEFAULT_FORM_DATA.passport_id,
                    drivers_license: p?.drivers_license || localDraft.drivers_license || DEFAULT_FORM_DATA.drivers_license,
                    id_front_url: p?.id_front_url || localDraft.id_front_url || DEFAULT_FORM_DATA.id_front_url,
                    id_back_url: p?.id_back_url || localDraft.id_back_url || DEFAULT_FORM_DATA.id_back_url,
                    live_selfie_url: p?.live_selfie_url || localDraft.live_selfie_url || DEFAULT_FORM_DATA.live_selfie_url,
                    marital_status: p?.marital_status || localDraft.marital_status || DEFAULT_FORM_DATA.marital_status,
                    household_size: p?.household_size ?? localDraft.household_size ?? DEFAULT_FORM_DATA.household_size,
                    dependents: p?.dependents ?? localDraft.dependents ?? DEFAULT_FORM_DATA.dependents,
                    years_of_experience: p?.years_of_experience ?? localDraft.years_of_experience ?? DEFAULT_FORM_DATA.years_of_experience,
                    primary_activity: p?.primary_activity || localDraft.primary_activity || DEFAULT_FORM_DATA.primary_activity,
                    cooperative_name: p?.cooperative_name || localDraft.cooperative_name || DEFAULT_FORM_DATA.cooperative_name,
                    farmer_group: p?.farmer_group || localDraft.farmer_group || DEFAULT_FORM_DATA.farmer_group,
                    association: p?.association || localDraft.association || DEFAULT_FORM_DATA.association,
                    crop: p?.commodity || localDraft.crop || DEFAULT_FORM_DATA.crop,
                    farm_name: p?.farm_name || localDraft.farm_name || DEFAULT_FORM_DATA.farm_name,
                    ownership_type: p?.ownership_type || localDraft.ownership_type || DEFAULT_FORM_DATA.ownership_type,
                    latitude: p?.latitude || p?.gps_latitude || localDraft.latitude || DEFAULT_FORM_DATA.latitude,
                    longitude: p?.longitude || p?.gps_longitude || localDraft.longitude || DEFAULT_FORM_DATA.longitude,
                    location_address: p?.location_address || localDraft.location_address || DEFAULT_FORM_DATA.location_address,
                    farm_size_hectares: p?.farm_size_hectares ?? localDraft.farm_size_hectares ?? DEFAULT_FORM_DATA.farm_size_hectares,
                    boundary_polygon: p?.boundary_polygon || localDraft.boundary_polygon || DEFAULT_FORM_DATA.boundary_polygon,
                    boundary_file_url: p?.boundary_file_url || localDraft.boundary_file_url || DEFAULT_FORM_DATA.boundary_file_url,
                    land_title_url: p?.land_title_url || localDraft.land_title_url || DEFAULT_FORM_DATA.land_title_url,
                    lease_agreement_url: p?.lease_agreement_url || localDraft.lease_agreement_url || DEFAULT_FORM_DATA.lease_agreement_url,
                    community_attestation_url: p?.community_attestation_url || localDraft.community_attestation_url || DEFAULT_FORM_DATA.community_attestation_url,
                    farm_entrance_photo_url: p?.farm_entrance_photo_url || localDraft.farm_entrance_photo_url || DEFAULT_FORM_DATA.farm_entrance_photo_url,
                    farm_interior_photo_url: p?.farm_interior_photo_url || localDraft.farm_interior_photo_url || DEFAULT_FORM_DATA.farm_interior_photo_url,
                    crop_photo_url: p?.crop_photo_url || localDraft.crop_photo_url || DEFAULT_FORM_DATA.crop_photo_url,
                };

                if (isMounted) {
                    setFormData(merged);
                }

                // Check if rejected or in revision mode
                const isRev = Boolean(
                    p?.approval_status === "rejected" ||
                    p?.vendor_approval_status === "rejected" ||
                    p?.onboarding_status === "rejected" ||
                    p?.vendor_onboarding_status === "rejected" ||
                    params.get("revision") === "true"
                );

                // Determine the correct step to resume at
                let calculatedStep = 1;
                if (isRev) {
                    let pSections = [];
                    if (Array.isArray(p?.rejected_sections)) {
                        pSections = p.rejected_sections;
                    } else if (typeof p?.rejected_sections === "string") {
                        try { pSections = JSON.parse(p.rejected_sections); } catch {}
                    }
                    const revSteps = pSections.length > 0
                        ? Array.from(new Set(pSections.flatMap(s => SECTION_TO_STEPS[s] || []))).sort((a, b) => a - b)
                        : [10, 11];
                    const targetRev = revSteps.length > 0 ? revSteps : [10, 11];
                    calculatedStep = hasValidQueryStep && targetRev.includes(queryStep) ? queryStep : targetRev[0];
                } else if (hasValidQueryStep) {
                    calculatedStep = queryStep;
                } else if (p) {
                    const level = p.vendor_onboarding_level || p.onboarding_level || 0;
                    const status = p.vendor_onboarding_status || p.onboarding_status;
                    const dbStep = p.onboarding_step || 1;

                    if (level >= 3 || status === "completed" || dbStep === 20) {
                        calculatedStep = 20;
                    } else if (dbStep > 1) {
                        calculatedStep = dbStep;
                    } else if (level >= 2 || status === "verified") {
                        calculatedStep = 14; // Start of Level 3
                    } else if (level >= 1 || (status && status !== "pending")) {
                        calculatedStep = 8; // Start of Level 2 (Farm Verification)
                    } else if (localSavedStep > 1 && localSavedStep <= 20) {
                        calculatedStep = localSavedStep;
                    }
                } else if (localSavedStep > 1 && localSavedStep <= 20) {
                    calculatedStep = localSavedStep;
                }

                if (isMounted) {
                    setStep(calculatedStep);
                    setInitialLoading(false);
                }
            } catch (err) {
                console.error("Initialization error in onboarding:", err);
                if (isMounted) setInitialLoading(false);
            }
        };

        initializeFlow();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === "checkbox" ? checked : value
            };
            triggerDebouncedSave(updated, step);
            return updated;
        });
    };

    const handleFileUpload = async (file, fieldName) => {
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldName]: localUrl }));
        setIsLoading(true);

        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/proxy/vendor/upload/document", {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.success) {
                const fileUrl = result.data.url;
                setFormData(prev => {
                    const updated = { ...prev, [fieldName]: fileUrl };
                    persistDraft(step, updated);
                    return updated;
                });
                toast.success("Document uploaded successfully");

                // Capture geotag for entrance or interior farm photos if geolocation is enabled
                if (["farm_entrance_photo_url", "farm_interior_photo_url"].includes(fieldName) && typeof window !== "undefined" && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        setFormData(prev => {
                            const updated = {
                                ...prev,
                                farm_evidence_geospatial: {
                                    latitude: pos.coords.latitude,
                                    longitude: pos.coords.longitude,
                                    accuracy: pos.coords.accuracy,
                                    timestamp: new Date(pos.timestamp).toISOString(),
                                    geotagged: true
                                }
                            };
                            persistDraft(step, updated);
                            return updated;
                        });
                    }, () => {}, { enableHighAccuracy: true, timeout: 8000 });
                }
            } else {
                toast.error(result.error || "Upload failed");
                setLocalPreviews(prev => ({ ...prev, [fieldName]: null }));
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("File upload failed. Please try again.");
            setLocalPreviews(prev => ({ ...prev, [fieldName]: null }));
        } finally {
            setIsLoading(false);
        }
    };

    const submitLevel = async (level) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/proxy/vendor/onboarding/level${level}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                if (level === 1) {
                    toast.success("🎉 Level 1 Basic Identity saved! Your farmer profile is ready.");
                    persistDraft(8, formData);
                    setStep(8); // Move to Level 2: Farm Verification
                    return;
                }
                if (level === 2) {
                    toast.success("🌾 Level 2 Farm Mapping submitted and verified!");
                    persistDraft(14, formData);
                    setStep(14); // Move to Level 3: Full Passport
                    return;
                }
                if (level === 3) {
                    toast.success("🏆 Level 3 Agricultural Passport fully finalized!");
                    persistDraft(20, formData);
                    setStep(20); // Complete
                    return;
                }
            } else {
                toast.error(result.error || "Submission failed");
            }
        } catch (error) {
            console.error("Level submission error:", error);
            toast.error("Server error while submitting onboarding level");
        } finally {
            setIsLoading(false);
        }
    };

    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const birthDate = new Date(dobString);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getMaxDobAllowed = () => {
        const today = new Date();
        const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return d.toISOString().split("T")[0];
    };

    // Revision Mode: Check if application was returned / rejected by SuperAdmin
    const isRevisionMode = Boolean(
        profileData?.approval_status === "rejected" ||
        profileData?.vendor_approval_status === "rejected" ||
        profileData?.onboarding_status === "rejected" ||
        profileData?.vendor_onboarding_status === "rejected" ||
        (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("revision") === "true")
    );

    const revisionSteps = (() => {
        let parsedRejected = [];
        if (Array.isArray(profileData?.rejected_sections)) {
            parsedRejected = profileData.rejected_sections;
        } else if (typeof profileData?.rejected_sections === "string") {
            try { parsedRejected = JSON.parse(profileData.rejected_sections); } catch {}
        }

        if (parsedRejected.length === 0) {
            return [10, 11]; // default to boundary & land title
        }

        const steps = Array.from(
            new Set(parsedRejected.flatMap((sec) => SECTION_TO_STEPS[sec] || []))
        ).sort((a, b) => a - b);

        return steps.length > 0 ? steps : [10, 11];
    })();

    const currentRevisionIndex = isRevisionMode ? revisionSteps.indexOf(step) : -1;
    const isLastRevisionStep = isRevisionMode && (currentRevisionIndex >= revisionSteps.length - 1 || currentRevisionIndex === -1);

    const handleResubmitRevision = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/proxy/vendor/onboarding/resubmit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updatedFields: formData })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                toast.success("🎉 Revisions submitted! Your updated application is now pending SuperAdmin approval.");
                if (typeof window !== "undefined") {
                    localStorage.removeItem("farmer_onboarding_draft");
                }
                router.push("/ecosystem/farmer");
            } else {
                toast.error(result.error || "Failed to submit revised onboarding.");
            }
        } catch (err) {
            console.error("Resubmit error:", err);
            toast.error("Failed to resubmit application. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = async () => {
        // Enforce 18+ validation on Step 2
        if (step === 2) {
            if (!formData.dob) {
                toast.error("Please enter your date of birth to proceed.");
                return;
            }
            const age = calculateAge(formData.dob);
            if (age === null || isNaN(age)) {
                toast.error("Please enter a valid date of birth.");
                return;
            }
            if (age < 18) {
                toast.error(`You must be at least 18 years old to register. (Calculated age: ${age} years)`);
                return;
            }
            if (!formData.gender) {
                toast.error("Please select your gender.");
                return;
            }
        }

        // Enforce live selfie capture on Step 4
        if (step === 4) {
            if (!formData.live_selfie_url && !localPreviews.live_selfie_url) {
                toast.error("Please capture your live selfie to proceed.");
                return;
            }
        }

        // Handle Revision Mode Navigation
        if (isRevisionMode) {
            if (!isLastRevisionStep && currentRevisionIndex >= 0) {
                const newStep = revisionSteps[currentRevisionIndex + 1];
                setStep(newStep);
                persistDraft(newStep, formData);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                await handleResubmitRevision();
            }
            return;
        }

        if (step === 7) {
            submitLevel(1);
        } else if (step === 13) {
            submitLevel(2);
        } else if (step === 17) {
            submitLevel(3);
        } else {
            const newStep = step + 1;
            setStep(newStep);
            persistDraft(newStep, formData);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevStep = () => {
        if (isRevisionMode) {
            if (currentRevisionIndex > 0) {
                const newStep = revisionSteps[currentRevisionIndex - 1];
                setStep(newStep);
                persistDraft(newStep, formData);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                router.push("/ecosystem/farmer");
            }
            return;
        }

        if (step > 1) {
            const newStep = step - 1;
            setStep(newStep);
            persistDraft(newStep, formData);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const currentLevel = step <= 7 ? 1 : step <= 13 ? 2 : step <= 19 ? 3 : 4;
    const progressPercent = isRevisionMode
        ? Math.min(100, Math.round(((Math.max(0, currentRevisionIndex) + 1) / Math.max(1, revisionSteps.length)) * 100))
        : Math.min(100, Math.round((step / 20) * 100));

    if (initialLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 animate-pulse">
                    <Sprout className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Restoring Your Onboarding Stage...</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Retrieving verified agricultural identity data</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
            {/* Header Navigation & Level Progress */}
            <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            {isRevisionMode ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    <AlertCircle size={12} />
                                    Correction & Revision Desk
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <Sparkles size={12} />
                                    Agricultural Passport Onboarding
                                </span>
                            )}
                            {autoSaveStatus === "saving" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                                    <RefreshCw size={11} className="animate-spin text-emerald-500" />
                                    Saving draft...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <Check size={12} />
                                    Progress auto-saved
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-2">
                            {isRevisionMode
                                ? (STEP_METADATA[step]?.title || `Correction: Step ${step}`)
                                : currentLevel === 1 ? "Level 1: Basic Identity & Bio-Data"
                                : currentLevel === 2 ? "Level 2: Farm Mapping & Verification"
                                : currentLevel === 3 ? "Level 3: Agricultural Passport & History"
                                : "Onboarding Completed"}
                        </h1>
                        {isRevisionMode && (
                            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1">
                                Updating Part {Math.max(1, currentRevisionIndex + 1)} of {revisionSteps.length} requiring revision. All other submitted information remains intact.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {(isRevisionMode || profileData?.onboarding_level >= 1 || step >= 8) && (
                            <button
                                type="button"
                                onClick={() => router.push("/ecosystem/farmer")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                            >
                                <span>Go to Dashboard</span>
                                <ExternalLink size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Revision Notice Banner */}
                {isRevisionMode && profileData?.rejection_reason && (
                    <div className="mb-5 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
                        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold mb-1">
                            <AlertCircle size={14} className="shrink-0 text-rose-600" />
                            <span>SuperAdmin Review Feedback:</span>
                        </div>
                        <p className="text-slate-700 dark:text-gray-300 font-medium italic">
                            "{profileData.rejection_reason}"
                        </p>
                    </div>
                )}

                {/* Stepper Tabs: Revision Mode vs Standard Level Stepper */}
                {isRevisionMode ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                        {revisionSteps.map((revStep, idx) => {
                            const isActive = step === revStep;
                            const isPast = currentRevisionIndex > idx;
                            return (
                                <button
                                    key={revStep}
                                    type="button"
                                    onClick={() => {
                                        setStep(revStep);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className={`px-4 py-2.5 rounded-2xl border text-left shrink-0 transition flex items-center gap-2 cursor-pointer ${
                                        isActive
                                            ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20"
                                            : isPast
                                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                                                : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                        isActive
                                            ? "bg-white text-rose-600"
                                            : isPast
                                                ? "bg-emerald-600 text-white"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    }`}>
                                        {isPast ? "✓" : idx + 1}
                                    </span>
                                    <span className="text-xs font-bold">{STEP_METADATA[revStep]?.short || `Part ${idx + 1}`}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                        <div className={`p-3 md:p-4 rounded-2xl border transition-all ${
                            currentLevel === 1 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                                : currentLevel > 1 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400" 
                                : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400"
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Level 1</span>
                                {currentLevel > 1 ? (
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <User size={16} />
                                )}
                            </div>
                            <p className="text-xs md:text-sm font-black mt-1 truncate">Basic Identity</p>
                        </div>

                        <div className={`p-3 md:p-4 rounded-2xl border transition-all ${
                            currentLevel === 2 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                                : currentLevel > 2 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400" 
                                : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400"
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Level 2</span>
                                {currentLevel > 2 ? (
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <MapPin size={16} />
                                )}
                            </div>
                            <p className="text-xs md:text-sm font-black mt-1 truncate">Farm Mapping</p>
                        </div>

                        <div className={`p-3 md:p-4 rounded-2xl border transition-all ${
                            currentLevel === 3 
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                                : currentLevel > 3 
                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400" 
                                : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400"
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Level 3</span>
                                {currentLevel > 3 ? (
                                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Award size={16} />
                                )}
                            </div>
                            <p className="text-xs md:text-sm font-black mt-1 truncate">Full Passport</p>
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        {isRevisionMode ? (
                            <span>Correction {Math.max(1, currentRevisionIndex + 1)} of {revisionSteps.length}</span>
                        ) : (
                            <span>Step {step} of 20</span>
                        )}
                        <span>{progressPercent}% Complete</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 rounded-full ${
                                isRevisionMode 
                                    ? "bg-gradient-to-r from-rose-500 to-amber-500" 
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Step Body Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-gray-200/30 dark:shadow-none min-h-[460px] flex flex-col justify-between">
                <div>
                    {/* STEP 1: Hero Welcome */}
                    {step === 1 && (
                        <div className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
                                <Sprout size={40} />
                            </div>
                            <div className="max-w-xl mx-auto space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Build Your Official Agricultural Identity
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    Your verified farmer passport unlocks guaranteed institutional access, zero-collateral input financing, certified cluster aggregations, and direct market offtake contracts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
                                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                                    <ShieldCheck className="text-emerald-600 mb-2" size={24} />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Credit & Financing</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">Direct access to institutional agri-loans and inputs.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                                    <MapPin className="text-emerald-600 mb-2" size={24} />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Farm Polygon Mapping</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">Satellite proof of cultivation and yield projections.</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                                    <Award className="text-emerald-600 mb-2" size={24} />
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Cluster Offtake</h4>
                                    <p className="text-[11px] text-gray-500 mt-1">Guaranteed buying contracts at verified harvest dates.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Farmer Bio Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Farmer Personal Details</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Enter your legal personal identification info matching your government documents.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Middle Name (Optional)</label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={formData.middle_name}
                                        onChange={handleChange}
                                        placeholder="Enter middle name"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Date of Birth (Minimum 18 Years)</label>
                                        {formData.dob && calculateAge(formData.dob) !== null && (
                                            <span className={`text-[11px] font-black ${
                                                calculateAge(formData.dob) >= 18 
                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                    : "text-red-500 animate-pulse"
                                            }`}>
                                                {calculateAge(formData.dob) >= 18 
                                                    ? `✓ Age: ${calculateAge(formData.dob)} years old` 
                                                    : `⚠️ Age: ${calculateAge(formData.dob)} years old (Must be 18+)`}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="date"
                                        name="dob"
                                        max={getMaxDobAllowed()}
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none transition ${
                                            formData.dob && calculateAge(formData.dob) !== null && calculateAge(formData.dob) < 18
                                                ? "border-red-500 bg-red-50/20 text-red-900 dark:text-red-300 focus:ring-2 focus:ring-red-500/20"
                                                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        }`}
                                    />
                                    {formData.dob && calculateAge(formData.dob) !== null && calculateAge(formData.dob) < 18 && (
                                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>You must be at least 18 years old to proceed with farmer registration.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Identity Verification & ID Upload */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Legal Identity Document</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Select and upload your acceptable government identification document.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Document Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: "nin", label: "National ID (NIN)" },
                                            { id: "voter_id", label: "Voter's Card" },
                                            { id: "drivers_license", label: "Driver's License" },
                                            { id: "passport_id", label: "Passport" }
                                        ].map(doc => (
                                            <button
                                                key={doc.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, selected_id_type: doc.id }))}
                                                className={`p-3 rounded-2xl border text-xs font-black transition cursor-pointer text-center ${
                                                    (formData.selected_id_type || "nin") === doc.id
                                                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                                                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                                }`}
                                            >
                                                {doc.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {formData.selected_id_type === "drivers_license" && "Driver's License Number"}
                                        {formData.selected_id_type === "voter_id" && "Voter's Card VIN / Number"}
                                        {formData.selected_id_type === "passport_id" && "International Passport Number"}
                                        {(!formData.selected_id_type || formData.selected_id_type === "nin") && "National Identification Number (NIN)"}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter document number"
                                        value={
                                            formData.selected_id_type === "drivers_license" ? formData.drivers_license :
                                            formData.selected_id_type === "voter_id" ? formData.voter_id :
                                            formData.selected_id_type === "passport_id" ? formData.passport_id :
                                            formData.nin || ""
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const t = formData.selected_id_type || "nin";
                                            setFormData(prev => ({
                                                ...prev,
                                                nin: t === "nin" ? val : prev.nin,
                                                drivers_license: t === "drivers_license" ? val : prev.drivers_license,
                                                voter_id: t === "voter_id" ? val : prev.voter_id,
                                                passport_id: t === "passport_id" ? val : prev.passport_id,
                                            }));
                                        }}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {/* ID Front */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">ID Document Front</label>
                                        {!(localPreviews.id_front_url || formData.id_front_url) ? (
                                            <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10">
                                                <UploadCloud className="text-emerald-500" size={28} />
                                                <span className="text-xs font-black text-gray-700 dark:text-gray-200">Upload Front</span>
                                                <span className="text-[10px] text-gray-400">PNG, JPG or PDF up to 10MB</span>
                                                <input type="file" accept="image/*,.pdf" hidden onChange={e => handleFileUpload(e.target.files[0], "id_front_url")} />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-emerald-50/20 p-2">
                                                <img src={localPreviews.id_front_url || formData.id_front_url} alt="ID Front" className="h-32 w-full object-cover rounded-xl" />
                                                <div className="flex items-center justify-between mt-2 px-1">
                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 size={13} /> Front Uploaded
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, id_front_url: "" }));
                                                            setLocalPreviews(p => ({ ...p, id_front_url: null }));
                                                        }}
                                                        className="text-xs text-red-500 hover:underline font-bold"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ID Back */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">ID Document Back</label>
                                        {!(localPreviews.id_back_url || formData.id_back_url) ? (
                                            <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10">
                                                <UploadCloud className="text-emerald-500" size={28} />
                                                <span className="text-xs font-black text-gray-700 dark:text-gray-200">Upload Back</span>
                                                <span className="text-[10px] text-gray-400">PNG, JPG or PDF up to 10MB</span>
                                                <input type="file" accept="image/*,.pdf" hidden onChange={e => handleFileUpload(e.target.files[0], "id_back_url")} />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-emerald-50/20 p-2">
                                                <img src={localPreviews.id_back_url || formData.id_back_url} alt="ID Back" className="h-32 w-full object-cover rounded-xl" />
                                                <div className="flex items-center justify-between mt-2 px-1">
                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 size={13} /> Back Uploaded
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(p => ({ ...p, id_back_url: "" }));
                                                            setLocalPreviews(p => ({ ...p, id_back_url: null }));
                                                        }}
                                                        className="text-xs text-red-500 hover:underline font-bold"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Live Selfie Face Match */}
                    {step === 4 && (
                        <div className="space-y-6 text-center max-w-lg mx-auto">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Live Farmer Selfie Capture</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    Align your face within the frame and capture a live photo to verify biometric identity against your official ID.
                                </p>
                            </div>

                            {/* Hidden canvas for capturing video snapshot */}
                            <canvas ref={canvasRef} className="hidden" />

                            {!(localPreviews.live_selfie_url || formData.live_selfie_url) ? (
                                <div className="space-y-4">
                                    {cameraError ? (
                                        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-4 text-center">
                                            <AlertCircle size={32} className="mx-auto text-amber-600 dark:text-amber-400" />
                                            <div>
                                                <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">Camera Access Notice</h4>
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-sm mx-auto">{cameraError}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={startCamera}
                                                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <RefreshCw size={13} />
                                                    <span>Retry Camera</span>
                                                </button>
                                                <label className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition cursor-pointer flex items-center gap-1.5">
                                                    <UploadCloud size={13} />
                                                    <span>Upload Selfie File</span>
                                                    <input type="file" accept="image/*" capture="user" hidden onChange={e => handleFileUpload(e.target.files[0], "live_selfie_url")} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-3xl overflow-hidden bg-gray-950 border-2 border-emerald-500/40 shadow-2xl aspect-[4/3] max-w-md mx-auto flex items-center justify-center">
                                            {/* Video Stream */}
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover transform -scale-x-100"
                                            />

                                            {/* Biometric Oval Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="relative w-48 h-60 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black tracking-widest uppercase text-white shadow">
                                                        Align Face
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shutter Capture Button */}
                                            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                                                <button
                                                    type="button"
                                                    onClick={captureSelfie}
                                                    disabled={isCapturing || isLoading || !cameraActive}
                                                    className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer border-4 border-emerald-500 disabled:opacity-50"
                                                    title="Capture Photo"
                                                >
                                                    {isCapturing || isLoading ? (
                                                        <RefreshCw size={24} className="animate-spin text-emerald-600" />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition">
                                                            <Camera size={22} />
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fallback upload trigger */}
                                    <div className="pt-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer inline-flex items-center gap-1.5 transition">
                                            <UploadCloud size={14} />
                                            <span>Trouble with camera? Click here to upload from files</span>
                                            <input type="file" accept="image/*" capture="user" hidden onChange={e => handleFileUpload(e.target.files[0], "live_selfie_url")} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-emerald-500 mx-auto shadow-2xl shadow-emerald-500/20 bg-gray-100 dark:bg-gray-800">
                                        <img src={localPreviews.live_selfie_url || formData.live_selfie_url} alt="Live Selfie" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 inset-x-0 flex justify-center">
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleRetakeSelfie}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-red-400 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-red-500 transition cursor-pointer"
                                        >
                                            <RefreshCw size={13} />
                                            <span>Retake Photo</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 5: Family & Household Demographics */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Family & Household Information</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Tell us about your household and who relies on your farming income for daily living.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Marital Status</label>
                                    <select
                                        name="marital_status"
                                        value={formData.marital_status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Widowed">Widowed</option>
                                        <option value="Divorced">Divorced</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Household Size</label>
                                        <span className="text-[11px] text-gray-400">Total in home</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        name="household_size"
                                        value={formData.household_size}
                                        onChange={handleChange}
                                        placeholder="e.g. 7"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Total number of people living under your roof (including yourself).</p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            People Depending on You <span className="font-normal text-gray-400 dark:text-gray-500">(Optional)</span>
                                        </label>
                                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                            Optional
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        name="dependents"
                                        value={formData.dependents}
                                        onChange={handleChange}
                                        placeholder="Optional — leave blank or enter number"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Optional. Family members who rely on your income for daily care. You can skip this or leave it blank.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Farming Profile */}
                    {step === 6 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Farming Experience & Specialization</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Specify your agricultural background and primary activity domain.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Years of Farming Experience</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="years_of_experience"
                                        value={formData.years_of_experience}
                                        onChange={handleChange}
                                        placeholder="e.g. 6"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Primary Agricultural Activity</label>
                                    <select
                                        name="primary_activity"
                                        value={formData.primary_activity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                                    >
                                        <option value="Crop Farming">Crop Farming</option>
                                        <option value="Livestock">Livestock</option>
                                        <option value="Aquaculture">Aquaculture</option>
                                        <option value="Mixed Farming">Mixed Farming</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: Organization & Submit Level 1 */}
                    {step === 7 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Cooperative & Organization Membership</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">If you belong to a farmers cooperative or group, provide their name for cluster synchronization.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Cooperative Name (Optional)</label>
                                    <input
                                        type="text"
                                        name="cooperative_name"
                                        value={formData.cooperative_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Green Valley Farmers Cooperative"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                                    <Info className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                                        <strong className="font-black">Ready to Finalize Level 1!</strong>
                                        <p className="mt-0.5">Clicking continue will submit your basic identity bio-data and unlock your farmer dashboard profile.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 8: Add Farm (Level 2 Start) */}
                    {step === 8 && (
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase mb-1">
                                    Level 2: Farm Verification
                                </span>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Register Farm Profile</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Specify farm property name and tenure ownership structure.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Farm Name / Identifier</label>
                                    <input
                                        type="text"
                                        name="farm_name"
                                        value={formData.farm_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Sunrise Agribusiness Farm"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Land Ownership Type</label>
                                    <select
                                        name="ownership_type"
                                        value={formData.ownership_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                                    >
                                        <option value="Owned">Freehold / Owned</option>
                                        <option value="Leased">Leased / Rented</option>
                                        <option value="Family Land">Family / Customary Land</option>
                                        <option value="Community">Community Allotment</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 9: Farm Location Pin Drop */}
                    {step === 9 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Farm Geographic Location</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Drop a pin on your farmland location, or click "Use Current GPS" if you are currently at the farm.</p>
                            </div>

                            <MapComponent
                                mode="location"
                                initialPosition={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                                onChange={(coords) => {
                                    setFormData(p => {
                                        const updated = { ...p, latitude: coords.lat, longitude: coords.lng };
                                        persistDraft(step, updated);
                                        return updated;
                                    });
                                }}
                            />

                            {formData.latitude && (
                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Captured Coordinates: {Number(formData.latitude).toFixed(5)}, {Number(formData.longitude).toFixed(5)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 10: Farm Boundary Polygon */}
                    {step === 10 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Farm Boundary Mapping</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Click perimeter points on the map to draw your farm polygon boundary. Area is calculated automatically.</p>
                            </div>

                            <MapComponent
                                mode="boundary"
                                initialPolygon={formData.boundary_polygon}
                                onChange={(val) => {
                                    setFormData(p => {
                                        const updated = {
                                            ...p,
                                            boundary_polygon: JSON.stringify(val.polygon),
                                            farm_size_hectares: val.area_hectares
                                        };
                                        persistDraft(step, updated);
                                        return updated;
                                    });
                                }}
                            />
                        </div>
                    )}

                    {/* STEP 11: Land Title / Lease Verification */}
                    {step === 11 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Land Title & Proof of Tenure</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Upload a Certificate of Occupancy, Deed of Transfer, Lease Agreement, or Community Chief Attestation.</p>
                            </div>

                            {!(localPreviews.land_title_url || formData.land_title_url) ? (
                                <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition hover:bg-emerald-50/20">
                                    <UploadCloud className="text-emerald-500" size={36} />
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-100">Upload Land Document</span>
                                    <span className="text-xs text-gray-400">PDF, JPG, or PNG up to 15MB</span>
                                    <input type="file" accept="image/*,.pdf" hidden onChange={e => handleFileUpload(e.target.files[0], "land_title_url")} />
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-3xl border border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10 overflow-hidden shadow-xs">
                                        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
                                                <FileCheck size={20} className="text-emerald-600 shrink-0" />
                                                <span>Land Document Uploaded</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={localPreviews.land_title_url || formData.land_title_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                                                >
                                                    <ExternalLink size={14} />
                                                    <span>View Original</span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(p => ({ ...p, land_title_url: "" }));
                                                        setLocalPreviews(p => ({ ...p, land_title_url: null }));
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Preview / PDF Viewer */}
                                        <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900/60 min-h-[220px]">
                                            {typeof (localPreviews.land_title_url || formData.land_title_url) === "string" &&
                                            (localPreviews.land_title_url || formData.land_title_url).toLowerCase().includes(".pdf") ? (
                                                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shadow-xs">
                                                        <FileText size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white">PDF Document Attached</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Land Title Deed / Lease Agreement</p>
                                                    </div>
                                                    <a
                                                        href={localPreviews.land_title_url || formData.land_title_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 transition shadow-xs flex items-center gap-1.5"
                                                    >
                                                        <ExternalLink size={14} />
                                                        <span>Open Document in New Tab</span>
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="relative group max-w-lg w-full flex items-center justify-center rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/40 p-2 shadow-xs">
                                                    <img
                                                        src={localPreviews.land_title_url || formData.land_title_url}
                                                        alt="Land Title Document Preview"
                                                        className="w-full max-h-72 object-contain rounded-xl transition duration-200 group-hover:scale-102"
                                                    />
                                                    <a
                                                        href={localPreviews.land_title_url || formData.land_title_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-900 shadow-lg flex items-center gap-1.5">
                                                            <ExternalLink size={14} /> View High-Res Document
                                                        </span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 12: Farm Evidence Photos & Geotag */}
                    {step === 12 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Physical Farm Evidence</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Upload on-site evidence showing the farm entrance and cultivated field.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Farm Entrance Photo</label>
                                    {!(localPreviews.farm_entrance_photo_url || formData.farm_entrance_photo_url) ? (
                                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:bg-emerald-50/20">
                                            <Camera className="text-emerald-500" size={28} />
                                            <span className="text-xs font-black">Upload Entrance Photo</span>
                                            <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(e.target.files[0], "farm_entrance_photo_url")} />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 p-2 bg-emerald-50/20">
                                            <img src={localPreviews.farm_entrance_photo_url || formData.farm_entrance_photo_url} alt="Entrance" className="h-32 w-full object-cover rounded-xl" />
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={13} /> Entrance Added</span>
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, farm_entrance_photo_url: "" }))} className="text-xs text-red-500 font-bold">Change</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Farm Field / Interior Photo</label>
                                    {!(localPreviews.farm_interior_photo_url || formData.farm_interior_photo_url) ? (
                                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:bg-emerald-50/20">
                                            <Camera className="text-emerald-500" size={28} />
                                            <span className="text-xs font-black">Upload Field Photo</span>
                                            <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(e.target.files[0], "farm_interior_photo_url")} />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 p-2 bg-emerald-50/20">
                                            <img src={localPreviews.farm_interior_photo_url || formData.farm_interior_photo_url} alt="Interior" className="h-32 w-full object-cover rounded-xl" />
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={13} /> Field Added</span>
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, farm_interior_photo_url: "" }))} className="text-xs text-red-500 font-bold">Change</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {formData.farm_evidence_geospatial?.latitude && (
                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-mono font-bold text-emerald-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                                    <span>🛰️ Geotagged Camera Coordinates: {Number(formData.farm_evidence_geospatial.latitude).toFixed(4)}, {Number(formData.farm_evidence_geospatial.longitude).toFixed(4)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 13: Current Crop & Level 2 Submit */}
                    {step === 13 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Active Crop & Planting Season</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Specify your current primary crop and target planting calendar.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Primary Commodity / Crop</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {["Maize", "Rice", "Cassava", "Tomato", "Soybeans"].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, crop: c }))}
                                                className={`p-3 rounded-2xl border text-xs font-black transition cursor-pointer text-center ${
                                                    formData.crop === c
                                                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                                                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Planting Date</label>
                                        <input
                                            type="date"
                                            name="planting_date"
                                            value={formData.planting_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Expected Harvest Date</label>
                                        <input
                                            type="date"
                                            name="expected_harvest_date"
                                            value={formData.expected_harvest_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 mt-4">
                                    <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={18} />
                                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                                        <strong className="font-black">Submit Level 2 Verification</strong>
                                        <p className="mt-0.5">Clicking continue will finalize farm mapping and verification, assigning your official Farm ID.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 14: Historical Production (Level 3 Start) */}
                    {step === 14 && (
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase mb-1">
                                    Level 3: Full Passport
                                </span>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Historical Yield Performance</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Past production history strengthens your farmer creditworthiness and yield risk rating.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Past Season Crop</label>
                                    <input
                                        type="text"
                                        value={formData.historical_productions[0]?.crop || ""}
                                        onChange={e => {
                                            const newHist = [...formData.historical_productions];
                                            newHist[0].crop = e.target.value;
                                            setFormData(p => ({ ...p, historical_productions: newHist }));
                                        }}
                                        placeholder="e.g. Maize"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Yield Achieved (Metric Tons)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.historical_productions[0]?.yield_amount || ""}
                                        onChange={e => {
                                            const newHist = [...formData.historical_productions];
                                            newHist[0].yield_amount = e.target.value;
                                            setFormData(p => ({ ...p, historical_productions: newHist }));
                                        }}
                                        placeholder="e.g. 5.2"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 15: Mechanization */}
                    {step === 15 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Mechanization & Equipment</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Select any farm equipment you own or have operating access to.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {["None", "Tractor", "Planter", "Harvester"].map(eq => (
                                    <button
                                        key={eq}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, equipment_type: eq }))}
                                        className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                                            formData.equipment_type === eq
                                                ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Tractor size={24} className="mx-auto mb-2 opacity-80" />
                                        <span className="text-xs font-black">{eq}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 16: Input Usage */}
                    {step === 16 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Input Usage Profile</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Specify your current seed and fertilizer suppliers.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Seed Supplier</label>
                                    <input
                                        type="text"
                                        name="seed_supplier"
                                        value={formData.seed_supplier}
                                        onChange={handleChange}
                                        placeholder="e.g. Certified Seed Co."
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Fertilizer Brand / Type</label>
                                    <input
                                        type="text"
                                        name="fertilizer_usage"
                                        value={formData.fertilizer_usage}
                                        onChange={handleChange}
                                        placeholder="e.g. NPK 15-15-15, Urea"
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 17: Review Summary & Submit Level 3 */}
                    {step === 17 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Final Review & Passport Generation</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Please review your complete agricultural passport summary before final sign-off.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Level 1 Identity</span>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white mt-1">{formData.middle_name || "Verified Identity"}</h4>
                                    <p className="text-xs text-gray-500">{formData.primary_activity || "Farmer"}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Level 2 Farmland</span>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white mt-1">{formData.farm_name || "Main Farm"}</h4>
                                    <p className="text-xs text-gray-500">{formData.farm_size_hectares ? `${formData.farm_size_hectares} Ha` : "Mapped Polygon"}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Level 3 Production</span>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white mt-1">{formData.crop || "Maize"}</h4>
                                    <p className="text-xs text-gray-500">{formData.equipment_type || "Mechanized"}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-gray-500">Projected Trust Score Bonus</span>
                                    <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+100 Trust Points</h4>
                                </div>
                                <Award className="text-emerald-600" size={32} />
                            </div>
                        </div>
                    )}

                    {/* STEP 20: Completion & Success */}
                    {step === 20 && (
                        <div className="space-y-6 text-center py-6 max-w-lg mx-auto">
                            <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                                <CheckCircle size={44} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Agricultural Identity Verified!</h2>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Your verified farmer passport has been generated in the Agri-Noria ecosystem. Your farm mapping, satellite polygon, and bio-data are now active.
                                </p>
                            </div>

                            <div className="space-y-2 text-left pt-2">
                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>Official Farm ID & Boundary Generated</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>Full Agricultural Passport Created</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>Institutional Programs & Subsidies Unlocked</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push("/ecosystem/farmer")}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                            >
                                Enter Farmer Dashboard →
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Control Buttons */}
                {step < 20 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-6 border-t border-gray-100 dark:border-gray-800">
                        {isRevisionMode ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={isLoading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                <span>{currentRevisionIndex > 0 ? "Previous Item" : "Return to Dashboard"}</span>
                            </button>
                        ) : step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={isLoading}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                <span>Previous Step</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={
                                    isLoading ||
                                    (step === 2 && formData.dob && calculateAge(formData.dob) !== null && calculateAge(formData.dob) < 18) ||
                                    (step === 4 && !(localPreviews.live_selfie_url || formData.live_selfie_url))
                                }
                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl ${
                                    (step === 2 && formData.dob && calculateAge(formData.dob) !== null && calculateAge(formData.dob) < 18) ||
                                    (step === 4 && !(localPreviews.live_selfie_url || formData.live_selfie_url))
                                        ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none"
                                        : isRevisionMode && isLastRevisionStep
                                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                            : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                } text-xs font-black uppercase tracking-wider transition`}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw size={15} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : isRevisionMode ? (
                                    isLastRevisionStep ? (
                                        <>
                                            <span>Resubmit Application for Approval</span>
                                            <CheckCircle2 size={16} />
                                        </>
                                    ) : (
                                        <>
                                            <span>Save & Next Item ({currentRevisionIndex + 1}/{revisionSteps.length})</span>
                                            <ChevronRight size={16} />
                                        </>
                                    )
                                ) : (step === 7 || step === 13 || step === 17) ? (
                                    <>
                                        <span>Submit {step === 7 ? "Level 1" : step === 13 ? "Level 2" : "Level 3"}</span>
                                        <CheckCircle2 size={16} />
                                    </>
                                ) : step === 1 ? (
                                    <>
                                        <span>Begin Registration</span>
                                        <ChevronRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <span>Save & Continue</span>
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
