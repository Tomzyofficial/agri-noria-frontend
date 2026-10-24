"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Sprout,
  Plus,
  Search,
  MapPin,
  Truck,
  ShieldCheck,
  Box,
  X,
  Warehouse,
  Scale,
  Droplets,
  Calendar,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Sparkles,
  FileCheck2,
  Camera,
  Lock,
  Layers,
  Filter,
  ArrowRight,
  Wallet,
  Award,
  Building2,
  RefreshCw,
  Mic,
  Volume2,
  HelpCircle,
  CreditCard,
  Users,
} from "lucide-react";
import { HarvestRequestModals } from "@/components/harvest/HarvestRequestModals";
import {
  NIGERIA_STATES_DATA,
  NIGERIA_STATE_LIST,
  parseAddressIntoStructured,
  reverseGeocodePlainLocation,
  VOICE_GUIDE_SCRIPTS,
} from "@/components/harvest/nigeriaAgriLocations";
import { useFarmerData } from "../useFarmerData";

// Agronomic reference data: realistic max yield (MT/ha), standard moisture, & common varieties
const CROP_CATALOG = {
  Maize: {
    maxYieldPerHa: 7.5,
    optimalMoisture: 13.0,
    varieties: ["SAMMAZ 15 (White)", "Oba Super 2 (Yellow)", "SAMMAZ 51", "Local Hybrid Maize"],
  },
  Rice: {
    maxYieldPerHa: 8.0,
    optimalMoisture: 13.5,
    varieties: ["FARO 44 (Long Grain)", "FARO 52", "FARO 61", "Ofada Local"],
  },
  Soybeans: {
    maxYieldPerHa: 4.0,
    optimalMoisture: 12.0,
    varieties: ["TGx 1448-2E", "TGx 1951-3F", "TGx 1835-10E", "SAMSOY 2"],
  },
  Wheat: {
    maxYieldPerHa: 6.0,
    optimalMoisture: 12.5,
    varieties: ["Norman Borlaug", "Reyna-28", "Atilla Gan Atilla", "LACRIWHIT-4"],
  },
  Sorghum: {
    maxYieldPerHa: 4.5,
    optimalMoisture: 12.5,
    varieties: ["SAMSORG 45", "SAMSORG 17 (Red)", "White Guinea Corn", "CSR-01"],
  },
  Sesame: {
    maxYieldPerHa: 2.5,
    optimalMoisture: 8.0,
    varieties: ["NCRIBEN 01M (White)", "NCRIBEN 04E", "Kano White Export", "Brown Sesame"],
  },
  Cassava: {
    maxYieldPerHa: 28.0,
    optimalMoisture: 14.0,
    varieties: ["TME 419", "TMS 30572", "UMUCASS 36 (Yellow)", "NR 8082"],
  },
  Ginger: {
    maxYieldPerHa: 18.0,
    optimalMoisture: 10.0,
    varieties: ["UG1 (Tafin Giwa)", "UG2 (Yatsun Biri)", "Dried Split Ginger"],
  },
  Cocoa: {
    maxYieldPerHa: 3.0,
    optimalMoisture: 7.5,
    varieties: ["CRIN Tc1-Tc8", "F3 Amazon", "Amelonado Grade 1"],
  },
  Cowpea: {
    maxYieldPerHa: 3.5,
    optimalMoisture: 12.0,
    varieties: ["SAMPEA 14", "SAMPEA 11 (White Beans)", "Oloyin Brown", "IT99K-573-1-1"],
  },
};

const NIGERIA_AGRI_HUBS = [
  "Kano — Dawanau International Grain Hub",
  "Kaduna — Zaria / Giwa Aggregation Corridor",
  "Benue — Makurdi / Gboko Food Basket Hub",
  "Niger — Minna / Bida Grain Corridor",
  "Plateau — Jos Agro-Commodity Hub",
  "Kebbi — Birnin Kebbi Rice Belt",
  "Taraba — Jalingo / Wukari Produce Zone",
  "Nasarawa — Lafia / Keffi Aggregation Point",
  "Oyo — Ibadan / Ogbomosho Agro Zone",
  "Lagos — Ikorodu / Mile 12 Commodity Terminal",
  "FCT Abuja — Gwagwalada Central Silo Hub",
  "Enugu — Nsukka / Abakaliki Produce Corridor",
];

const PIPELINE_STEPS = [
  { key: "declared", label: "Harvest Declared" },
  { key: "storage", label: "Storage Reserved" },
  { key: "logistics", label: "Logistics Dispatched" },
  { key: "stored", label: "Warehouse Intake & NWR" },
  { key: "insured", label: "Insured & Market Ready" },
];

function getBatchStepIndex(batch) {
  if (batch.insurance_status === "active") return 4;
  if (batch.status === "stored") return 3;
  if (batch.logistics_ticket_number) return 2;
  if (batch.status === "storage_reserved" || batch.storage_ticket_number) return 1;
  return 0;
}

export default function FarmerHarvestPage() {
  const { profile } = useFarmerData();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingDeclare, setSubmittingDeclare] = useState(false);
  const [uploadingPhotoIdx, setUploadingPhotoIdx] = useState(null);
  const [detectingGpsIdx, setDetectingGpsIdx] = useState(null);
  const [listeningVoiceIdx, setListeningVoiceIdx] = useState(null);
  const [speakingLang, setSpeakingLang] = useState(null);
  const [showIlliterateHelp, setShowIlliterateHelp] = useState(false);
  const [fraudAttested, setFraudAttested] = useState(true);

  // Filters & search
  const [activeTab, setActiveTab] = useState("all"); // all | declared | storage_reserved | in_transit | stored
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropFilter, setSelectedCropFilter] = useState("all");

  // Request modal state (Storage / Logistics)
  const [requestModal, setRequestModal] = useState({ isOpen: false, type: "", batch: null });

  // Structured human-readable location from farmer's onboarding profile (NO raw lat/lng numbers!)
  const defaultStructuredLocation = useMemo(() => {
    return parseAddressIntoStructured(
      profile?.location_address || profile?.location || "",
      profile?.latitude,
      profile?.longitude
    );
  }, [profile]);

  const verifiedFarmLocation = useMemo(() => {
    const cleanText =
      profile?.location_address &&
      !/^\s*farm\s*gate\s*\([0-9.,\s-]+\)/i.test(String(profile.location_address))
        ? String(profile.location_address).trim()
        : profile?.location && !/^\s*farm\s*gate\s*\([0-9.,\s-]+\)/i.test(String(profile.location))
        ? String(profile.location).trim()
        : "";

    if (cleanText) return cleanText;

    const parts = [
      defaultStructuredLocation.landmark,
      defaultStructuredLocation.lga ? `${defaultStructuredLocation.lga} LGA` : null,
      defaultStructuredLocation.region,
      defaultStructuredLocation.state ? `${defaultStructuredLocation.state} State` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Verified Farm Gate";
  }, [profile, defaultStructuredLocation]);

  const verifiedGpsCoords = useMemo(() => {
    if (profile?.latitude && profile?.longitude) {
      return `${Number(profile.latitude).toFixed(5)}, ${Number(profile.longitude).toFixed(5)}`;
    }
    return "";
  }, [profile]);

  const defaultCrop = useMemo(() => {
    const c = profile?.commodity || "Maize";
    const matched = Object.keys(CROP_CATALOG).find(
      (k) => k.toLowerCase() === String(c).trim().toLowerCase()
    );
    return matched || "Maize";
  }, [profile]);

  const buildCombinedLocationString = (state, region, lga, landmark) => {
    const parts = [
      landmark ? String(landmark).trim() : "",
      lga ? `${String(lga).replace(/\s+lga$/i, "").trim()} LGA` : "",
      region ? String(region).trim() : "",
      state ? `${String(state).replace(/\s+state$/i, "").trim()} State` : "",
    ].filter(Boolean);
    return parts.join(", ");
  };

  const createDefaultProduceItem = () => ({
    crop: defaultCrop,
    variety: CROP_CATALOG[defaultCrop]?.varieties?.[0] || "",
    bag_weight_kg: 50,
    bag_count: "",
    quantity_mt: "",
    quality_grade: "Grade A",
    moisture_pct: String(CROP_CATALOG[defaultCrop]?.optimalMoisture || 12.5),
    packaging_type: "50kg Polypropylene Bags",
    state: defaultStructuredLocation.state || "Kaduna",
    region_name:
      defaultStructuredLocation.region ||
      NIGERIA_STATES_DATA[defaultStructuredLocation.state || "Kaduna"]?.region ||
      "North-West Grain Corridor",
    lga:
      defaultStructuredLocation.lga ||
      NIGERIA_STATES_DATA[defaultStructuredLocation.state || "Kaduna"]?.lgas?.[0] ||
      "",
    landmark_note: defaultStructuredLocation.landmark || "",
    location: buildCombinedLocationString(
      defaultStructuredLocation.state || "Kaduna",
      defaultStructuredLocation.region || "North-West Grain Corridor",
      defaultStructuredLocation.lga || "",
      defaultStructuredLocation.landmark || ""
    ),
    gps_coordinates: verifiedGpsCoords,
    harvest_date: new Date().toISOString().split("T")[0],
    evidence_photo_url: "",
    notes: "",
  });

  const [produces, setProduces] = useState([createDefaultProduceItem()]);

  // Keep default farm location updated when profile loads
  useEffect(() => {
    if (profile && !isModalOpen) {
      setProduces([createDefaultProduceItem()]);
    }
  }, [profile, verifiedFarmLocation, verifiedGpsCoords, defaultCrop]);

  const fetchBatches = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/batches");
      const data = await res.json();
      if (data.success) {
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load harvest batches");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Update a single field in produces[index] with automatic Bags <-> MT conversion & structured location sync
  const updateProduceItem = (index, field, value) => {
    setProduces((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      if (field === "crop") {
        const cat = CROP_CATALOG[value] || CROP_CATALOG.Maize;
        item.variety = cat.varieties?.[0] || "";
        item.moisture_pct = String(cat.optimalMoisture || 12.5);
      }

      if (field === "bag_weight_kg") {
        const bw = parseInt(value, 10) || 50;
        item.packaging_type =
          bw === 100
            ? "100kg Jute Sacks"
            : bw === 25
            ? "25kg Sealed Sacks"
            : "50kg Polypropylene Bags";
        if (item.bag_count) {
          item.quantity_mt = ((parseFloat(item.bag_count) * bw) / 1000).toFixed(2);
        }
      }

      if (field === "bag_count") {
        const bags = parseFloat(value);
        const bw = parseInt(item.bag_weight_kg, 10) || 50;
        if (!isNaN(bags) && bags > 0) {
          item.quantity_mt = ((bags * bw) / 1000).toFixed(2);
        } else {
          item.quantity_mt = "";
        }
      }

      if (field === "quantity_mt") {
        const mt = parseFloat(value);
        const bw = parseInt(item.bag_weight_kg, 10) || 50;
        if (!isNaN(mt) && mt > 0) {
          item.bag_count = String(Math.round((mt * 1000) / bw));
        } else {
          item.bag_count = "";
        }
      }

      // Structured State -> Region & LGA cascade
      if (field === "state") {
        const stInfo = NIGERIA_STATES_DATA[value];
        if (stInfo) {
          item.region_name = stInfo.region;
          item.lga = stInfo.lgas?.[0] || "";
        }
        item.location = buildCombinedLocationString(
          item.state,
          item.region_name,
          item.lga,
          item.landmark_note
        );
      }

      if (field === "region_name" || field === "lga" || field === "landmark_note") {
        item.location = buildCombinedLocationString(
          item.state,
          item.region_name,
          item.lga,
          item.landmark_note
        );
      }

      next[index] = item;
      return next;
    });
  };

  // 1-Tap Auto-Fill State, Region, LGA & Village from Phone (No confusing coordinates!)
  const handleCaptureLiveGps = (index) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Phone location is not supported on this browser.");
      return;
    }
    setDetectingGpsIdx(index);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coordsStr = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        const resolved = await reverseGeocodePlainLocation(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setProduces((prev) => {
          const next = [...prev];
          const current = { ...next[index] };
          current.state = resolved.state;
          current.region_name = resolved.region;
          current.lga = resolved.lga;
          current.landmark_note = resolved.landmark || current.landmark_note;
          current.gps_coordinates = coordsStr;
          current.location = buildCombinedLocationString(
            current.state,
            current.region_name,
            current.lga,
            current.landmark_note
          );
          next[index] = current;
          return next;
        });
        setDetectingGpsIdx(null);
        toast.success(
          `Location Auto-Filled: ${resolved.lga} LGA, ${resolved.state} State!`
        );
      },
      async () => {
        // Fallback to farmer's onboarding coordinates if browser GPS permission is declined
        if (profile?.latitude && profile?.longitude) {
          const resolved = await reverseGeocodePlainLocation(
            profile.latitude,
            profile.longitude
          );
          setProduces((prev) => {
            const next = [...prev];
            const current = { ...next[index] };
            current.state = resolved.state;
            current.region_name = resolved.region;
            current.lga = resolved.lga;
            current.landmark_note = resolved.landmark || current.landmark_note;
            current.location = buildCombinedLocationString(
              current.state,
              current.region_name,
              current.lga,
              current.landmark_note
            );
            next[index] = current;
            return next;
          });
          setDetectingGpsIdx(null);
          toast.info(
            `Filled from your registered farm record: ${resolved.lga} LGA, ${resolved.state} State.`
          );
        } else {
          setDetectingGpsIdx(null);
          toast.warning("Please select your State from the dropdown or tap the Microphone to speak it.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 1-Tap Voice-to-Text Dictation for Non-Literate Farmers
  const handleVoiceDictateLocation = (index) => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info(
        "Voice microphone input is supported on Chrome/Edge/Android browsers. You can also tap 'Auto-Fill from Phone'!"
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-NG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setListeningVoiceIdx(index);
      toast.info("🎙️ Listening... Speak your State, Local Government, and Village name now.");

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        setListeningVoiceIdx(null);
        if (!transcript.trim()) return;

        const lower = transcript.toLowerCase();
        let matchedState = null;
        let matchedLga = null;

        for (const [stName, stInfo] of Object.entries(NIGERIA_STATES_DATA)) {
          if (lower.includes(stName.toLowerCase())) {
            matchedState = stName;
            matchedLga =
              stInfo.lgas.find((l) => lower.includes(l.toLowerCase())) || stInfo.lgas[0];
            break;
          }
          const foundLga = stInfo.lgas.find((l) => lower.includes(l.toLowerCase()));
          if (foundLga) {
            matchedState = stName;
            matchedLga = foundLga;
            break;
          }
        }

        setProduces((prev) => {
          const next = [...prev];
          const current = { ...next[index] };
          if (matchedState) {
            current.state = matchedState;
            current.region_name = NIGERIA_STATES_DATA[matchedState]?.region || current.region_name;
          }
          if (matchedLga) {
            current.lga = matchedLga;
          }
          current.landmark_note = transcript.trim();
          current.location = buildCombinedLocationString(
            current.state,
            current.region_name,
            current.lga,
            current.landmark_note
          );
          next[index] = current;
          return next;
        });

        toast.success(`Heard: "${transcript}" — Location updated!`);
      };

      recognition.onerror = () => {
        setListeningVoiceIdx(null);
        toast.warning("Could not hear clearly. Please try speaking again or select your State.");
      };

      recognition.onend = () => {
        setListeningVoiceIdx(null);
      };

      recognition.start();
    } catch {
      setListeningVoiceIdx(null);
    }
  };

  // Multi-Language Spoken Audio Guide (English, Pidgin, Hausa, Yoruba, Igbo)
  const handlePlayVoiceGuide = (langKey) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info(VOICE_GUIDE_SCRIPTS[langKey]?.text || "");
      return;
    }
    window.speechSynthesis.cancel();
    if (speakingLang === langKey) {
      setSpeakingLang(null);
      return;
    }
    const script = VOICE_GUIDE_SCRIPTS[langKey];
    if (!script) return;
    const utterance = new SpeechSynthesisUtterance(script.text);
    utterance.lang = script.lang || "en-NG";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingLang(null);
    utterance.onerror = () => setSpeakingLang(null);
    setSpeakingLang(langKey);
    window.speechSynthesis.speak(utterance);
  };

  // Optional harvest bag/weighbridge photo upload
  const handlePhotoUpload = async (index, file) => {
    if (!file) return;
    setUploadingPhotoIdx(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/proxy/vendor/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data?.url || data?.secure_url || data?.data?.url;
      if (res.ok && uploadedUrl) {
        updateProduceItem(index, "evidence_photo_url", uploadedUrl);
        toast.success("Harvest evidence photo uploaded!");
      } else {
        toast.error(data?.error || "Failed to upload photo");
      }
    } catch {
      toast.error("Network error uploading photo");
    } finally {
      setUploadingPhotoIdx(null);
    }
  };

  // Agronomic & Anti-Fraud Yield Calculations
  const verifiedHectares = Math.max(1, parseFloat(profile?.farm_size_hectares || 0) || 5);
  const maxYieldPerHaForDefault = CROP_CATALOG[defaultCrop]?.maxYieldPerHa || 7.5;
  const maxPlausibleYieldMt = Math.round(verifiedHectares * maxYieldPerHaForDefault * 10) / 10;

  const totalDeclaredMt = useMemo(
    () => batches.reduce((sum, b) => sum + (parseFloat(b.quantity_mt) || 0), 0),
    [batches]
  );
  const totalDeclaredBags = useMemo(
    () =>
      batches.reduce(
        (sum, b) =>
          sum +
          (parseInt(b.bag_count, 10) ||
            Math.round(((parseFloat(b.quantity_mt) || 0) * 1000) / (b.bag_weight_kg || 50))),
        0
      ),
    [batches]
  );
  const modalEnteringMt = useMemo(
    () => produces.reduce((sum, p) => sum + (parseFloat(p.quantity_mt) || 0), 0),
    [produces]
  );
  const modalEnteringBags = useMemo(
    () => produces.reduce((sum, p) => sum + (parseInt(p.bag_count, 10) || 0), 0),
    [produces]
  );

  const combinedYieldMt = totalDeclaredMt + modalEnteringMt;
  const yieldUtilizationPct = Math.min(
    100,
    Math.round((totalDeclaredMt / Math.max(1, maxPlausibleYieldMt)) * 100)
  );
  const exceedsPlausibleYield = combinedYieldMt > maxPlausibleYieldMt * 1.25;

  const handleDeclare = async (e) => {
    e.preventDefault();
    if (!fraudAttested) {
      toast.warning("Please confirm the Anti-Fraud Origin Attestation checkbox.");
      return;
    }

    for (const item of produces) {
      const qty = parseFloat(item.quantity_mt);
      if (!qty || qty <= 0) {
        toast.error(`Please enter a valid quantity (Bags or Metric Tons) for ${item.crop}.`);
        return;
      }
      if (!item.location || !item.location.trim()) {
        toast.error(`Please specify the collection location for ${item.crop}.`);
        return;
      }
    }

    setSubmittingDeclare(true);
    try {
      const payloadProduces = produces.map((p) => ({
        crop: p.crop,
        variety: p.variety,
        quantity_mt: parseFloat(p.quantity_mt),
        bag_count:
          parseInt(p.bag_count, 10) ||
          Math.round(
            (parseFloat(p.quantity_mt) * 1000) / (parseInt(p.bag_weight_kg, 10) || 50)
          ),
        bag_weight_kg: parseInt(p.bag_weight_kg, 10) || 50,
        quality_grade: p.quality_grade,
        moisture_pct: parseFloat(p.moisture_pct) || 12.5,
        packaging_type: p.packaging_type,
        state: p.state || null,
        region_name: p.region_name || null,
        lga: p.lga || null,
        landmark: p.landmark_note || null,
        location:
          p.location ||
          buildCombinedLocationString(p.state, p.region_name, p.lga, p.landmark_note),
        gps_coordinates: p.gps_coordinates || verifiedGpsCoords,
        farm_id: profile?.farm_id || null,
        evidence_photo_url: p.evidence_photo_url || null,
        notes: p.notes || p.landmark_note || null,
        harvest_date: p.harvest_date,
      }));

      const res = await fetch("/api/proxy/vendor/commodity-operations/harvest/declare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produces: payloadProduces }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `Harvest declared! ${payloadProduces.length} traceable batch(es) registered in the pipeline.`
        );
        setIsModalOpen(false);
        setProduces([createDefaultProduceItem()]);
        fetchBatches(true);
      } else {
        toast.error(data.error || "Failed to declare harvest");
      }
    } catch {
      toast.error("Network error while declaring harvest");
    } finally {
      setSubmittingDeclare(false);
    }
  };

  const openRequestModal = (type, batch) => {
    setRequestModal({ isOpen: true, type, batch });
  };

  const acceptInsurance = async (policy_id) => {
    try {
      const res = await fetch("/api/proxy/vendor/commodity-operations/insurance/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Insurance Quote accepted! Policy activated for this batch.");
        fetchBatches(true);
      } else {
        toast.error(data.error || "Failed to accept insurance quote");
      }
    } catch {
      toast.error("Failed to accept insurance");
    }
  };

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (activeTab === "declared" && b.status !== "harvest_declared") return false;
      if (
        activeTab === "storage_reserved" &&
        b.status !== "storage_reserved" &&
        !b.storage_ticket_number
      )
        return false;
      if (activeTab === "in_transit" && !b.logistics_ticket_number) return false;
      if (
        activeTab === "stored" &&
        b.status !== "stored" &&
        b.insurance_status !== "active"
      )
        return false;

      if (
        selectedCropFilter !== "all" &&
        b.crop?.toLowerCase() !== selectedCropFilter.toLowerCase()
      ) {
        return false;
      }

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const match =
          b.batch_number?.toLowerCase().includes(q) ||
          b.crop?.toLowerCase().includes(q) ||
          b.variety?.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q) ||
          b.storage_ticket_number?.toLowerCase().includes(q) ||
          b.logistics_ticket_number?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [batches, activeTab, selectedCropFilter, searchQuery]);

  // Summary metrics
  const storedCount = batches.filter(
    (b) => b.status === "stored" || b.status === "storage_reserved" || b.storage_ticket_number
  ).length;
  const inTransitCount = batches.filter((b) => Boolean(b.logistics_ticket_number)).length;
  const insuredCount = batches.filter((b) => b.insurance_status === "active").length;
  const totalWalletBalance = batches.reduce(
    (sum, b) => sum + (parseFloat(b.wallet_balance) || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & VERIFIED FARM TRACEABILITY STRIP */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Sprout className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Harvest & Commodity Operations
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Geotagged Anti-Fraud Pipeline
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Declare farm-gate harvests with automatic bag-to-tonnage conversion, book certified warehouse storage (e-NWR), and dispatch GPS-tracked haulage.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchBatches(true)}
              disabled={refreshing}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProduces([createDefaultProduceItem()]);
                setIsModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Declare Harvest Batch</span>
            </button>
          </div>
        </div>

        {/* Verified Farm Traceability Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {profile?.farm_id && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 font-mono font-black text-emerald-800 dark:text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Farm ID: {profile.farm_id}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Origin Farm: {profile?.farm_name || "Main Farm"} — {verifiedFarmLocation}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Verified Land Area: {verifiedHectares} Ha</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span>Max Seasonal Yield Ceiling:</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-black">
              ~{maxPlausibleYieldMt.toLocaleString()} MT ({defaultCrop})
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX MODERN PRODUCTION & ANTI-FRAUD KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Batches */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Declared Batches
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{batches.length}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Traceable farm-gate lots
            </p>
          </div>
        </div>

        {/* Card 2: Total Tonnage & Bags */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Total Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {totalDeclaredMt.toLocaleString()}{" "}
              <span className="text-xs font-bold text-emerald-500">MT</span>
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              ~{totalDeclaredBags.toLocaleString()} standard bags
            </p>
          </div>
        </div>

        {/* Card 3: Anti-Fraud Yield Ceiling */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Yield Quota Used
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {yieldUtilizationPct}%
              </p>
              <span className="text-[10px] font-bold text-slate-400">
                of {maxPlausibleYieldMt} MT max
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  yieldUtilizationPct > 90
                    ? "bg-rose-500"
                    : yieldUtilizationPct > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, yieldUtilizationPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Storage & NWR */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Storage & Silos
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{storedCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Reserved / Stored batches
            </p>
          </div>
        </div>

        {/* Card 5: Logistics Dispatches */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Haulage Fleet
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{inTransitCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Active transport tickets
            </p>
          </div>
        </div>

        {/* Card 6: Insured & Escrow */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Insured Batches
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{insuredCount}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              Escrow: ₦{totalWalletBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PIPELINE FILTER TABS & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: "all", label: `All Batches (${batches.length})` },
            {
              id: "declared",
              label: `Harvest Declared (${batches.filter((b) => b.status === "harvest_declared").length})`,
            },
            { id: "storage_reserved", label: `Storage Reserved (${storedCount})` },
            { id: "in_transit", label: `Logistics Booked (${inTransitCount})` },
            { id: "stored", label: `Stored & Insured (${insuredCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Batch ID, crop, ticket..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Commodities</option>
            {Object.keys(CROP_CATALOG).map((cropName) => (
              <option key={cropName} value={cropName}>
                {cropName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HARVEST BATCHES PIPELINE LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-slate-950 p-16 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Loading Harvest Pipeline & Warehouse Tickets...
            </p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 p-12 sm:p-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {batches.length === 0 ? "No Harvest Batches Declared Yet" : "No Matching Batches"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {batches.length === 0
                  ? "When your farm produce is ready for harvest, declare your batch here to generate a traceable Batch ID, reserve certified silo storage, and dispatch fleet transport."
                  : "No harvest batches match your current filter or search criteria."}
              </p>
            </div>
            {batches.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setProduces([createDefaultProduceItem()]);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Declare Your First Harvest</span>
              </button>
            )}
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const stepIdx = getBatchStepIndex(batch);
            const qtyMt = parseFloat(batch.quantity_mt || 0);
            const bagWeight = parseInt(batch.bag_weight_kg, 10) || 50;
            const bags =
              parseInt(batch.bag_count, 10) || Math.round((qtyMt * 1000) / bagWeight);

            return (
              <div
                key={batch.batch_id}
                className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:border-emerald-500/40 transition-all"
              >
                {/* Top Main Row */}
                <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-mono font-black text-sm bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-300 px-3 py-1 rounded-xl border border-slate-700">
                        <span>{batch.batch_number}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(batch.batch_number);
                            toast.success(`Copied ${batch.batch_number}`);
                          }}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title="Copy Batch ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>

                      <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {batch.status?.replace(/_/g, " ") || "HARVEST DECLARED"}
                      </span>

                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {batch.quality_grade || "Grade A"}
                      </span>

                      {batch.moisture_pct && (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> {batch.moisture_pct}% Moisture
                        </span>
                      )}

                      {batch.insurance_status === "active" && (
                        <span className="px-2.5 py-1 text-[11px] font-black rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Insured Policy Active
                        </span>
                      )}
                    </div>

                    {/* Details Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Commodity & Variety
                        </span>
                        <span className="font-black text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                          <Sprout className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            {batch.crop} {batch.variety ? `• ${batch.variety}` : ""}
                          </span>
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Quantity & Bag Count
                        </span>
                        <span className="font-black text-slate-900 dark:text-white text-sm mt-0.5 flex items-center gap-1.5">
                          <Box className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>
                            {qtyMt} MT{" "}
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              ({bags.toLocaleString()} × {bagWeight}kg bags)
                            </span>
                          </span>
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Geotagged Farm Origin
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate" title={batch.location}>
                            {batch.location}
                          </span>
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Harvest Date & Packaging
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">
                            {batch.harvest_date
                              ? new Date(batch.harvest_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}{" "}
                            • {batch.packaging_type || "50kg Bags"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
                    {(batch.status === "harvest_declared" ||
                      batch.status === "storage_reserved") && (
                      <>
                        <button
                          type="button"
                          onClick={() => openRequestModal("storage", batch)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                        >
                          <Warehouse className="w-4 h-4" />
                          <span>
                            {batch.storage_ticket_number ? "Update Storage" : "Request Storage"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openRequestModal("logistics", batch)}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>
                            {batch.logistics_ticket_number
                              ? "Dispatch Another Truck"
                              : "Request Logistics"}
                          </span>
                        </button>
                      </>
                    )}

                    {batch.status === "stored" && batch.insurance_status === "quoted" && (
                      <button
                        type="button"
                        onClick={() => acceptInsurance(batch.policy_id)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Accept Insurance Quote</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Linked Storage & Logistics Tickets Strip (if any exist) */}
                {(batch.storage_ticket_number || batch.logistics_ticket_number) && (
                  <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {batch.storage_ticket_number && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Warehouse className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-emerald-800 dark:text-emerald-300">
                                {batch.storage_ticket_number}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                                {batch.storage_ticket_status || "Reserved"}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-semibold truncate mt-0.5">
                              {batch.warehouse_name || "Certified Ecosystem Warehouse"} •{" "}
                              {batch.storage_duration_days || 30} Days
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Storage Fee
                          </span>
                          <span className="font-black text-emerald-700 dark:text-emerald-300">
                            ₦{Number(batch.storage_fee || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {batch.logistics_ticket_number && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-indigo-800 dark:text-indigo-300">
                                {batch.logistics_ticket_number}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                                {batch.logistics_ticket_status || "Dispatched"}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-semibold truncate mt-0.5">
                              {batch.logistics_carrier_name || "Verified Carrier"} (
                              {batch.logistics_vehicle_title || "Haulage Truck"}) →{" "}
                              {batch.logistics_destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Haulage Fee
                          </span>
                          <span className="font-black text-indigo-700 dark:text-indigo-300">
                            ₦{Number(batch.logistics_fee || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5-Stage Visual Pipeline Progress Footer */}
                <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {PIPELINE_STEPS.map((st, idx) => {
                      const done = idx <= stepIdx;
                      const current = idx === stepIdx;
                      return (
                        <div key={st.key} className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              current
                                ? "bg-emerald-600 text-white shadow-xs"
                                : done
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-200/70 dark:bg-slate-800 text-slate-400"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{st.label}</span>
                          </span>
                          {idx < PIPELINE_STEPS.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    {batch.gps_coordinates && (
                      <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                        GPS: {batch.gps_coordinates}
                      </span>
                    )}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      Batch Operations Escrow:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        ₦{Number(batch.wallet_balance || 0).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. PRODUCTION-GRADE, ANTI-FRAUD "DECLARE HARVEST" MODAL (IMAGE 2) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-3xl max-w-3xl w-full max-h-[93vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 shrink-0">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Declare Farm-Gate Harvest Batch
                    </h2>
                    {profile?.farm_id && (
                      <span className="font-mono text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Farm ID: {profile.farm_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Enter your harvest in <strong>Bags</strong> or <strong>Metric Tons</strong>. Your verified farm location and GPS coordinates are pre-filled to prevent mistakes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anti-Fraud Yield Plausibility Meter Banner */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    exceedsPlausibleYield ? "text-amber-500" : "text-emerald-500"
                  }`}
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Verified Farm Size: <strong>{verifiedHectares} Ha</strong> • Plausible Max Yield:{" "}
                  <strong>~{maxPlausibleYieldMt} MT</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  Declaring Now:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {modalEnteringMt.toFixed(2)} MT ({modalEnteringBags.toLocaleString()} bags)
                  </strong>
                </span>
                {exceedsPlausibleYield && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    High Yield Flag
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleDeclare} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              {produces.map((prod, index) => {
                const cropInfo = CROP_CATALOG[prod.crop] || CROP_CATALOG.Maize;
                const moistureVal = parseFloat(prod.moisture_pct || 0);
                const isMoistureSafe = moistureVal > 0 && moistureVal <= cropInfo.optimalMoisture + 1.0;

                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black">
                          Batch Lot #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {prod.crop} {prod.variety ? `• ${prod.variety}` : ""}
                        </span>
                      </div>

                      {produces.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...produces];
                            next.splice(index, 1);
                            setProduces(next);
                          }}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Remove Lot
                        </button>
                      )}
                    </div>

                    {/* Row 1: Commodity, Variety & Harvest Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Crop Commodity *
                        </label>
                        <select
                          value={prod.crop}
                          onChange={(e) => updateProduceItem(index, "crop", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        >
                          {Object.keys(CROP_CATALOG).map((cropName) => (
                            <option key={cropName} value={cropName}>
                              {cropName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Seed / Crop Variety
                        </label>
                        <input
                          type="text"
                          list={`varieties-${index}`}
                          value={prod.variety}
                          onChange={(e) => updateProduceItem(index, "variety", e.target.value)}
                          placeholder="Select or type variety"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <datalist id={`varieties-${index}`}>
                          {(cropInfo.varieties || []).map((v) => (
                            <option key={v} value={v} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Harvest Date *
                        </label>
                        <input
                          type="date"
                          value={prod.harvest_date}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateProduceItem(index, "harvest_date", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 2: Smart Bag <-> Metric Ton Calculator (Designed for 400,000 Farmers!) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          <span>Smart Harvest Quantity Calculator (Enter Bags OR Metric Tons)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          20 × 50kg Bags = 1.00 Metric Ton
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Standard Bag Size
                          </label>
                          <select
                            value={prod.bag_weight_kg}
                            onChange={(e) =>
                              updateProduceItem(index, "bag_weight_kg", parseInt(e.target.value, 10))
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                          >
                            <option value={50}>50 kg Standard Bag</option>
                            <option value={100}>100 kg Jute Sack</option>
                            <option value={25}>25 kg Sealed Sack</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Number of Bags Harvested *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={prod.bag_count}
                            onChange={(e) => updateProduceItem(index, "bag_count", e.target.value)}
                            placeholder="e.g. 200 bags"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Equivalent Metric Tons (MT) *
                          </label>
                          <input
                            type="number"
                            min="0.05"
                            step="0.01"
                            value={prod.quantity_mt}
                            onChange={(e) => updateProduceItem(index, "quantity_mt", e.target.value)}
                            placeholder="e.g. 10.00 MT"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-950 text-xs font-black text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Quality Grade, Moisture Content & Packaging */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Quality Grade
                        </label>
                        <select
                          value={prod.quality_grade}
                          onChange={(e) =>
                            updateProduceItem(index, "quality_grade", e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="Grade A">Grade A (Export / Premium Clean)</option>
                          <option value="Grade B">Grade B (Standard Commercial)</option>
                          <option value="Grade C">Grade C (Industrial / Feed Mill)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Moisture (%)
                          </label>
                          <span
                            className={`text-[10px] font-bold ${
                              isMoistureSafe ? "text-emerald-600" : "text-amber-500"
                            }`}
                          >
                            {isMoistureSafe ? "✓ Storage Safe" : "Needs Drying"}
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          min="5"
                          max="35"
                          value={prod.moisture_pct}
                          onChange={(e) =>
                            updateProduceItem(index, "moisture_pct", e.target.value)
                          }
                          placeholder="e.g. 12.5"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Packaging Type
                        </label>
                        <select
                          value={prod.packaging_type}
                          onChange={(e) =>
                            updateProduceItem(index, "packaging_type", e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="50kg Polypropylene Bags">50kg Polypropylene Bags</option>
                          <option value="100kg Jute Sacks">100kg Breathable Jute Sacks</option>
                          <option value="Hermetic PICS Bags">Hermetic PICS Storage Bags</option>
                          <option value="25kg Sealed Sacks">25kg Sealed Sacks</option>
                          <option value="Plastic Field Crates">Ventilated Plastic Crates</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Structured State Dropdown, Region, Local Government (LGA), Manual Entry & Non-Literate Farmer Assistant */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                      {/* Header & 1-Tap Assist Buttons */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Farm & Harvest Pickup Location (State, Region & Local Government) *</span>
                          </label>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Select your <strong>State</strong> from the dropdown, then enter or pick your <strong>Region</strong>, <strong>Local Government (LGA)</strong>, and <strong>Village / Landmark</strong>.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCaptureLiveGps(index)}
                            disabled={detectingGpsIdx === index}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>
                              {detectingGpsIdx === index
                                ? "Finding Your Town & LGA..."
                                : "📍 Auto-Fill My State & LGA"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVoiceDictateLocation(index)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1.5 transition cursor-pointer ${
                              listeningVoiceIdx === index
                                ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                                : "bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              {listeningVoiceIdx === index
                                ? "Listening... Speak Now"
                                : "🎙️ Speak Location"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowIlliterateHelp((v) => !v)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                              showIlliterateHelp
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Easy Help & Voice Guide</span>
                          </button>
                        </div>
                      </div>

                      {/* Multi-Language Audio Guide Strip (Always visible for easy 1-tap listening) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/50">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                          <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Listen to Spoken Instructions (Local Languages):</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(VOICE_GUIDE_SCRIPTS).map(([langKey, info]) => (
                            <button
                              key={langKey}
                              type="button"
                              onClick={() => handlePlayVoiceGuide(langKey)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                                speakingLang === langKey
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-slate-700 hover:border-emerald-500"
                              }`}
                            >
                              {speakingLang === langKey ? `⏹ Stop ${langKey}` : info.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expandable Visual Guide for Non-Literate / Rural Farmers */}
                      {showIlliterateHelp && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 space-y-2.5 text-xs">
                          <div className="font-black text-amber-900 dark:text-amber-200 flex items-center justify-between">
                            <span>4 Easy Ways to Fill Your Farm Location (If You Cannot Read/Write):</span>
                            <button
                              type="button"
                              onClick={() => setShowIlliterateHelp(false)}
                              className="text-[11px] underline cursor-pointer"
                            >
                              Hide
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-700 dark:text-slate-300">
                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 flex items-start gap-2">
                              <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="block text-slate-900 dark:text-white">
                                  1. Tap &ldquo;Auto-Fill My State &amp; LGA&rdquo;
                                </strong>
                                Press the green button above while at your farm—your phone will automatically fill your State, Region, and Local Government in plain words.
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 flex items-start gap-2">
                              <Mic className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="block text-slate-900 dark:text-white">
                                  2. Tap &ldquo;Speak Location&rdquo; (Microphone)
                                </strong>
                                Tap the microphone button and speak your State, Local Government, and Village name out loud (e.g. &ldquo;Kaduna, Zaria, Dambo Village&rdquo;).
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 flex items-start gap-2">
                              <CreditCard className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="block text-slate-900 dark:text-white">
                                  3. Check Voter&apos;s Card (PVC) or NIN Slip
                                </strong>
                                Your <strong>State</strong>, <strong>LGA (Local Government)</strong>, and <strong>Ward/Town</strong> are written at the very top of your Voter&apos;s Card or NIN slip.
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 flex items-start gap-2">
                              <Users className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="block text-slate-900 dark:text-white">
                                  4. Cooperative / Extension Officer Help
                                </strong>
                                Show your phone or Farm ID (<strong>{profile?.farm_id || "Registered"}</strong>) to your Cluster Lead, neighbor, or child to select your State &amp; LGA.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4 Structured Fields: State (Dropdown) + Region (Manual/Suggested) + Local Government (Dropdown + Manual) + Village/Landmark (Manual) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Field 1: State Dropdown */}
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            1. State (Select) *
                          </label>
                          <select
                            value={prod.state || "Kaduna"}
                            onChange={(e) => updateProduceItem(index, "state", e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          >
                            {NIGERIA_STATE_LIST.map((stName) => (
                              <option key={stName} value={stName}>
                                {stName} State
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Field 2: Region / Agricultural Zone (Manual Entry + Suggestions) */}
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            2. Region / Zone (Type or Pick) *
                          </label>
                          <input
                            type="text"
                            list={`regions-list-${index}`}
                            value={prod.region_name || ""}
                            onChange={(e) => updateProduceItem(index, "region_name", e.target.value)}
                            placeholder="e.g. Northern Zone / District"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                          <datalist id={`regions-list-${index}`}>
                            <option value={NIGERIA_STATES_DATA[prod.state]?.region || "North-West Grain Corridor"} />
                            <option value={`${prod.state || ""} North Senatorial Zone`} />
                            <option value={`${prod.state || ""} Central Agricultural Zone`} />
                            <option value={`${prod.state || ""} South Agricultural Zone`} />
                          </datalist>
                        </div>

                        {/* Field 3: Local Government Area (LGA) — Manual Input + State LGA Suggestions */}
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            3. Local Government (LGA) *
                          </label>
                          <input
                            type="text"
                            list={`lga-list-${index}`}
                            value={prod.lga || ""}
                            onChange={(e) => updateProduceItem(index, "lga", e.target.value)}
                            placeholder="Select or type your LGA"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                          <datalist id={`lga-list-${index}`}>
                            {(NIGERIA_STATES_DATA[prod.state]?.lgas || []).map((lgaName) => (
                              <option key={lgaName} value={lgaName} />
                            ))}
                          </datalist>
                        </div>

                        {/* Field 4: Village, Community or Nearest Popular Landmark (Manual Input) */}
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            4. Village / Nearest Landmark
                          </label>
                          <input
                            type="text"
                            value={prod.landmark_note || ""}
                            onChange={(e) => updateProduceItem(index, "landmark_note", e.target.value)}
                            placeholder="e.g. Beside Market / Primary School"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Full Editable Address Line (Never shows confusing lat/lng numbers) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Full Farm / Pickup Address (You can also edit or type manually here):
                          </label>
                          {prod.lga && prod.state && (
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                              ✓ Verified: {prod.lga} LGA, {prod.state} State
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={prod.location}
                          onChange={(e) => updateProduceItem(index, "location", e.target.value)}
                          placeholder="e.g. Shika Village, Giwa LGA, North-West Grain Corridor, Kaduna State"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 5: Optional Harvest Bag Photo Evidence */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <Camera className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>
                          Optional: Upload a live photo of stacked harvest bags at farm gate for faster warehouse clearance.
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {prod.evidence_photo_url ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                          </span>
                        ) : null}
                        <label className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition">
                          {uploadingPhotoIdx === index ? "Uploading..." : "Upload Bag Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(index, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setProduces([...produces, createDefaultProduceItem()])}
                className="w-full py-2.5 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Another Crop Batch to This Declaration
              </button>

              {/* Anti-Fraud Attestation Box */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fraudAttested}
                  onChange={(e) => setFraudAttested(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <strong className="font-black text-slate-900 dark:text-white">
                    Anti-Fraud Origin Attestation:
                  </strong>{" "}
                  I certify that the declared commodity lot(s) were harvested from my verified farm (
                  <strong>{profile?.farm_id || "Registered Farm"}</strong>) and the bag count is physically ready for inspection and weighbridge verification.
                </span>
              </label>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDeclare}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer transition-all flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>
                    {submittingDeclare
                      ? "Registering Batch..."
                      : `Declare Harvest (${modalEnteringMt.toFixed(2)} MT)`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. STORAGE & LOGISTICS REQUEST MODALS (IMAGES 3 & 4) */}
      {/* ========================================================================= */}
      <HarvestRequestModals
        isOpen={requestModal.isOpen}
        type={requestModal.type}
        batch={requestModal.batch}
        onClose={() => setRequestModal({ isOpen: false, type: "", batch: null })}
        onSuccess={() => fetchBatches(true)}
      />
    </div>
  );
}
