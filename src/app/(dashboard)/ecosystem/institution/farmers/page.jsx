"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Loader2, Search, MapPin, Phone, UserCircle2, ArrowRight,
  UserPlus, X, CheckCircle2, ShieldCheck, FileSpreadsheet, Download, UploadCloud, Users,
  KeyRound, Copy, History, RotateCcw, RefreshCw, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, Clock
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaSeedling } from "react-icons/fa";

export default function FarmersRegistryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("single"); // "single" | "bulk"
  const [submitting, setSubmitting] = useState(false);
  const [createdFarmerCreds, setCreatedFarmerCreds] = useState(null);
  const [bulkImportResults, setBulkImportResults] = useState(null);

  // Background Queue & Batch Tracking state
  const [importJobs, setImportJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [activeTrackingJob, setActiveTrackingJob] = useState(null);
  const [expandedJobErrors, setExpandedJobErrors] = useState({});
  const [retryingJobId, setRetryingJobId] = useState(null);
  const [rollingBackJobId, setRollingBackJobId] = useState(null);

  // Single Farmer Form
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    phone: "",
    email: "",
    nin: "",
    commodity: "Cassava",
    farm_size_hectares: "2.5",
    membership_number: "",
  });

  // Bulk CSV state
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [accountType, setAccountType] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Check user role for contextual headers
      fetch("/api/proxy/auth/verify-vendor")
        .then(r => r.json())
        .then(d => { if (d?.authenticated) setAccountType(d.role?.toLowerCase() || ""); })
        .catch(() => { });

      let res = await fetch("/api/proxy/admin/institution/members");
      let json = await res.json();
      if (json.success && json.data?.length > 0) {
        setData(json.data);
      } else {
        res = await fetch("/api/proxy/pipeline/farmers");
        json = await res.json();
        if (json.success) setData(json.data || []);
      }
    } catch (error) {
      console.error("Failed to load farmers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch all import jobs for queue & history
  const fetchImportJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/members/import-jobs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setImportJobs(json.data);
        // Automatically track any running or queued jobs
        const active = json.data.find(j => ["queued", "processing"].includes(j.status));
        if (active) {
          setActiveTrackingJob(prev => {
            if (prev && ["queued", "processing"].includes(prev.status)) return prev;
            return active;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch import jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchImportJobs();
  }, [fetchImportJobs]);

  // Real-time polling for active background job (no screen freeze!)
  useEffect(() => {
    if (!activeTrackingJob || !["queued", "processing"].includes(activeTrackingJob.status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/proxy/admin/institution/members/import-jobs/${activeTrackingJob.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setActiveTrackingJob(json.data);

          // When job reaches terminal status, sync members & notify
          if (["completed", "partially_failed", "failed", "rolled_back"].includes(json.data.status)) {
            fetchData();
            fetchImportJobs();
            if (json.data.status === "completed") {
              toast.success(`Batch import complete: ${json.data.success_count} farmers imported!`);
            } else if (json.data.status === "partially_failed") {
              toast.warn(`Batch import completed with errors: ${json.data.success_count} succeeded, ${json.data.failed_count} failed.`);
            } else if (json.data.status === "failed") {
              toast.error(`Batch import failed: ${json.data.failed_count} records failed.`);
            }
          }
        }
      } catch (err) {
        console.warn("Error polling import job:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTrackingJob?.id, activeTrackingJob?.status, fetchData, fetchImportJobs]);

  // Rollback a batch import (Administrative safety feature to undo accidental uploads)
  const handleRollbackBatch = async (job) => {
    const confirmMsg = `⚠️ ROLLBACK CONFIRMATION\n\nBatch File: "${job.file_name}"\n\nAre you sure you want to undo/rollback this batch?\n\n• All ${job.success_count || 0} farmer memberships linked to your organization in this batch will be unlinked.\n• New farmer login accounts created during this batch will be removed.\n\nUse this option if you accidentally uploaded the wrong spreadsheet or need to reverse this import.\n\nDo you want to proceed with the rollback?`;
    if (!window.confirm(confirmMsg)) return;

    setRollingBackJobId(job.id);
    try {
      const res = await fetch(`/api/proxy/admin/institution/members/import-jobs/${job.id}/rollback`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Batch successfully rolled back!");
        fetchData();
        fetchImportJobs();
        if (activeTrackingJob?.id === job.id) {
          setActiveTrackingJob(prev => prev ? { ...prev, status: "rolled_back" } : null);
        }
      } else {
        toast.error(json.error || "Failed to rollback batch");
      }
    } catch {
      toast.error("Network error rolling back batch");
    } finally {
      setRollingBackJobId(null);
    }
  };

  // Retry failed records in background queue
  const handleRetryFailed = async (job) => {
    setRetryingJobId(job.id);
    try {
      const res = await fetch(`/api/proxy/admin/institution/members/import-jobs/${job.id}/retry`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.success) {
        toast.info(json.message || `Queued retry for ${json.count} failed records in background!`);
        setActiveTrackingJob({
          id: json.retryJobId,
          file_name: `Retry: ${job.file_name}`,
          status: "queued",
          total_count: json.count,
          processed_count: 0,
          success_count: 0,
          failed_count: 0,
        });
        fetchImportJobs();
      } else {
        toast.error(json.error || "Failed to retry records");
      }
    } catch {
      toast.error("Network error during retry");
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleCopy = (text, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleDownloadCredentialsCsv = (credentials) => {
    if (!credentials || credentials.length === 0) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const headers = "Name,Phone,Email,Temporary Password,Membership Number,Commodity,Ecosystem Farmer Route\n";
    const rows = credentials.map(c =>
      `"${c.name || ''}","${c.phone || ''}","${c.email || ''}","${c.tempPassword || ''}","${c.membership_number || ''}","${c.commodity || ''}","${origin}/ecosystem/farmer"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agri_noria_farmer_credentials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCredentialsExcel = (credentials) => {
    if (!credentials || credentials.length === 0) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const rows = credentials.map(c => ({
      "Name": c.name || "",
      "Phone": c.phone || "",
      "Email": c.email || "",
      "Temporary Password": c.tempPassword || "",
      "Membership Number": c.membership_number || "",
      "Commodity": c.commodity || "",
      "Ecosystem Farmer Route": `${origin}/ecosystem/farmer`,
      "Sign In Link": `${origin}/auth/signin?redirect=/ecosystem/farmer`
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Farmer Credentials");
    XLSX.writeFile(wb, `agri_noria_farmer_credentials_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleAddSingleFarmer = async (e) => {
    e.preventDefault();
    if (!form.phone && !form.email) {
      toast.error("Phone number or Email is required for farmer digital ID");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/admin/institution/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (json.isNewFarmer) {
          toast.success("New Master Farmer created & linked to your organization!");
          if (json.tempPassword) {
            setCreatedFarmerCreds({
              name: json.name || `${form.fname} ${form.lname}`.trim(),
              email: json.email || form.email,
              phone: json.phone || form.phone,
              tempPassword: json.tempPassword,
            });
          }
        } else {
          toast.info("Existing Agri-Noria Farmer identified — linked to your organization!");
        }
        setShowAddModal(false);
        setForm({
          fname: "",
          lname: "",
          phone: "",
          email: "",
          nin: "",
          commodity: "Cassava",
          farm_size_hectares: "2.5",
          membership_number: "",
        });
        fetchData();
      } else {
        toast.error(json.error || "Failed to add/link farmer");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.type.includes("sheet") || file.type.includes("excel");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result;
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!jsonData || jsonData.length === 0) {
            toast.error("Excel sheet is empty or has no data rows");
            return;
          }

          const parsedRows = jsonData.map((row) => {
            const getVal = (...keys) => {
              for (const k of keys) {
                const foundKey = Object.keys(row).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
                if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
                  return String(row[foundKey]).trim();
                }
              }
              return "";
            };

            return {
              fname: getVal("fname", "first_name", "firstname", "first name") || "Farmer",
              lname: getVal("lname", "last_name", "lastname", "last name", "surname") || "",
              phone: getVal("phone", "phone_number", "phonenumber", "telephone", "mobile") || "",
              email: getVal("email", "email_address", "emailaddress") || "",
              commodity: getVal("commodity", "crop", "produce") || "Cassava",
              farm_size_hectares: getVal("farm_size_hectares", "farm_size", "hectares", "farm size") || "2.0",
              membership_number: getVal("membership_number", "member_id", "member number", "id") || "",
              nin: getVal("nin", "national_id") || "",
            };
          }).filter(r => r.phone || r.email || (r.fname && r.fname !== "Farmer"));

          if (parsedRows.length === 0) {
            toast.error("No valid farmer records found in Excel sheet");
            return;
          }

          setCsvPreview(parsedRows);
          toast.success(`Parsed ${parsedRows.length} farmers from Excel sheet!`);
        } catch (err) {
          console.error("Error parsing Excel file:", err);
          toast.error("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result;
          if (typeof text !== "string") return;

          const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
          if (lines.length <= 1) {
            toast.error("CSV file is empty or missing headers");
            return;
          }

          const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
          const parsedRows = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
            if (values.length >= 2) {
              const rowObj = {};
              headers.forEach((header, index) => {
                rowObj[header] = values[index] || "";
              });
              parsedRows.push({
                fname: rowObj.fname || rowObj.first_name || values[0] || "Farmer",
                lname: rowObj.lname || rowObj.last_name || values[1] || "",
                phone: rowObj.phone || rowObj.phone_number || values[2] || "",
                email: rowObj.email || values[3] || "",
                commodity: rowObj.commodity || rowObj.crop || "Cassava",
                farm_size_hectares: rowObj.farm_size_hectares || rowObj.hectares || "2.0",
                membership_number: rowObj.membership_number || rowObj.member_id || "",
                nin: rowObj.nin || "",
              });
            }
          }

          if (parsedRows.length === 0) {
            toast.error("No valid farmer records found in CSV");
            return;
          }

          setCsvPreview(parsedRows);
          toast.success(`Parsed ${parsedRows.length} farmers from CSV.`);
        } catch (err) {
          console.error("Error parsing CSV:", err);
          toast.error("Failed to parse CSV file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        fname: "Chukwuemeka",
        lname: "Okafor",
        phone: "08012345678",
        email: "c.okafor@example.com",
        commodity: "Cassava",
        farm_size_hectares: 3.5,
        membership_number: "COOP-001",
        nin: "12345678901"
      },
      {
        fname: "Amina",
        lname: "Bello",
        phone: "08023456789",
        email: "amina.bello@example.com",
        commodity: "Maize",
        farm_size_hectares: 2.0,
        membership_number: "COOP-002",
        nin: "23456789012"
      },
      {
        fname: "Emeka",
        lname: "Eze",
        phone: "08034567890",
        email: "emeka.eze@example.com",
        commodity: "Cassava",
        farm_size_hectares: 4.0,
        membership_number: "COOP-003",
        nin: "34567890123"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Farmers");
    XLSX.writeFile(wb, "agri_noria_farmers_sample.xlsx");
  };

  const handleDownloadSampleCsv = () => {
    const sample = "fname,lname,phone,email,commodity,farm_size_hectares,membership_number,nin\nChukwuemeka,Okafor,08012345678,c.okafor@example.com,Cassava,3.5,COOP-001,12345678901\nAmina,Bello,08023456789,amina.bello@example.com,Maize,2.0,COOP-002,23456789012\nEmeka,Eze,08034567890,,Cassava,4.0,COOP-003,34567890123";
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "agri_noria_farmers_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    if (csvPreview.length === 0) {
      toast.error("No valid farmers found in file");
      return;
    }

    setSubmitting(true);
    try {
      const fileName = csvFileName || `Farmers_Batch_${new Date().toISOString().slice(0, 10)}`;
      const res = await fetch("/api/proxy/admin/institution/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmers: csvPreview,
          fileName
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowAddModal(false);
        setCsvPreview([]);
        setCsvFileName("");

        if (json.queued && json.jobId) {
          toast.info(`Batch upload queued in background (${json.totalCount} farmers). Your screen won't freeze!`);
          setActiveTrackingJob({
            id: json.jobId,
            file_name: fileName,
            status: "queued",
            total_count: json.totalCount,
            processed_count: 0,
            success_count: 0,
            failed_count: 0,
          });
          fetchImportJobs();
        } else {
          toast.success(json.message || "Bulk farmers imported successfully!");
          fetchData();
          if (json.credentials && json.credentials.length > 0) {
            setBulkImportResults({
              newCount: json.newCount || json.credentials.length,
              linkedCount: json.linkedCount || 0,
              credentials: json.credentials,
            });
          }
        }
      } else {
        toast.error(json.error || "Failed to process bulk import");
      }
    } catch {
      toast.error("Network error during bulk import");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) =>
    `${item.fname} ${item.lname}`.toLowerCase().includes(search.toLowerCase()) ||
    item.phone?.includes(search) ||
    item.commodity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {accountType === "cooperative" ? "Cooperative Members & Directory" :
                accountType === "producer association" ? "Producer Directory & Farmers" :
                  accountType === "research institution" ? "Participating Research Farmers" :
                    "Farmer Directory & Members"}
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 text-blue-600 dark:text-blue-400">
              {accountType === "cooperative" ? "Registered Cooperative Farmers • Dedicated Institution Cluster Access" :
                accountType === "producer association" ? "Associated Agricultural Producers • Dedicated Institution Cluster Access" :
                  accountType === "research institution" ? "Participating Trial Farmers & Cohorts • Dedicated Institution Cluster Access" :
                    "Verified Master Agricultural Identities (Single Digital ID)"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group max-w-xs w-full">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search name, phone, crop..."
                className="pl-11 h-12 rounded-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              onClick={() => { setShowQueueModal(true); fetchImportJobs(); }}
              variant="outline"
              className="h-12 border-gray-200/80 dark:border-white/10 rounded-xl px-4 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 whitespace-nowrap font-bold text-gray-700 dark:text-gray-200"
            >
              <History size={18} className="text-blue-500" />
              <span>Import Queue & History</span>
              {importJobs.filter(j => ["queued", "processing"].includes(j.status)).length > 0 && (
                <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black animate-pulse">
                  {importJobs.filter(j => ["queued", "processing"].includes(j.status)).length} active
                </span>
              )}
            </Button>

            <Button
              onClick={() => setShowAddModal(true)}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 flex items-center gap-2 shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              <UserPlus size={18} /> Add / Import Farmers
            </Button>
          </div>
        </div>
      </div>

      {/* Active Background Queue Tracking Banner (Live Progress, No Freeze) */}
      {activeTrackingJob && (
        <div className={`relative overflow-hidden rounded-2xl p-5 border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          activeTrackingJob.status === "completed"
            ? "bg-emerald-500/10 dark:bg-emerald-950/25 border-emerald-300/60 dark:border-emerald-800/60"
            : activeTrackingJob.status === "partially_failed"
              ? "bg-amber-500/10 dark:bg-amber-950/25 border-amber-300/60 dark:border-amber-800/60"
              : activeTrackingJob.status === "failed"
                ? "bg-rose-500/10 dark:bg-rose-950/25 border-rose-300/60 dark:border-rose-800/60"
                : activeTrackingJob.status === "rolled_back"
                  ? "bg-gray-500/10 dark:bg-gray-900/40 border-gray-300 dark:border-gray-800"
                  : "bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-950/10 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-gray-950/60 border-blue-200 dark:border-blue-900/50"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                activeTrackingJob.status === "completed"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : activeTrackingJob.status === "partially_failed"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                    : activeTrackingJob.status === "failed"
                      ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                      : activeTrackingJob.status === "rolled_back"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
              }`}>
                {["queued", "processing"].includes(activeTrackingJob.status) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : activeTrackingJob.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : activeTrackingJob.status === "partially_failed" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : activeTrackingJob.status === "rolled_back" ? (
                  <RotateCcw className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    {["queued", "processing"].includes(activeTrackingJob.status) ? "Background Farmer Upload in Progress" : "Farmer Batch Import Summary"}
                  </h4>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    activeTrackingJob.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : activeTrackingJob.status === "partially_failed"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : activeTrackingJob.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : activeTrackingJob.status === "rolled_back"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse"
                  }`}>
                    {activeTrackingJob.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{activeTrackingJob.file_name}</span> • {activeTrackingJob.processed_count || 0} of {activeTrackingJob.total_count || 0} records processed
                  {activeTrackingJob.success_count > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-2">✓ {activeTrackingJob.success_count} succeeded</span>}
                  {activeTrackingJob.failed_count > 0 && <span className="text-red-500 dark:text-red-400 font-bold ml-2">✗ {activeTrackingJob.failed_count} failed</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
              {activeTrackingJob.created_farmers && activeTrackingJob.created_farmers.filter(f => f.tempPassword).length > 0 && (
                <button
                  type="button"
                  onClick={() => handleDownloadCredentialsExcel(activeTrackingJob.created_farmers.filter(f => f.tempPassword))}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                  title="Download Excel spreadsheet with temporary credentials"
                >
                  <Download size={13} /> Download Passwords ({activeTrackingJob.created_farmers.filter(f => f.tempPassword).length})
                </button>
              )}
              {activeTrackingJob.failed_count > 0 && !["rolled_back", "processing"].includes(activeTrackingJob.status) && (
                <button
                  type="button"
                  onClick={() => handleRetryFailed(activeTrackingJob)}
                  disabled={retryingJobId === activeTrackingJob.id}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {retryingJobId === activeTrackingJob.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Retry Failed ({activeTrackingJob.failed_count})
                </button>
              )}
              <button
                type="button"
                onClick={() => { setShowQueueModal(true); fetchImportJobs(); }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-xs transition-all cursor-pointer"
              >
                <History size={13} /> View Audit Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTrackingJob(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200/60 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${activeTrackingJob.status === "completed"
                  ? "bg-emerald-500"
                  : activeTrackingJob.status === "partially_failed"
                    ? "bg-amber-500"
                    : activeTrackingJob.status === "failed"
                      ? "bg-red-500"
                      : "bg-blue-600 animate-pulse"
                }`}
              style={{
                width: `${activeTrackingJob.total_count > 0
                  ? Math.min(100, Math.round(((activeTrackingJob.processed_count || 0) / activeTrackingJob.total_count) * 100))
                  : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 bg-white/60 dark:bg-gray-950/40 backdrop-blur-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10">
        <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-blue-500" />
            Registered Members <span className="ml-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs">{filteredData.length}</span>
          </CardTitle>
          <span className="text-xs font-semibold text-gray-400">
            Auto-deduplicated across organizations & programmes
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing identities...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-transparent">
                  <tr>
                    <th className="px-8 py-5">Farmer Identity</th>
                    <th className="px-6 py-5">Contact</th>
                    <th className="px-6 py-5">Commodity & Area</th>
                    <th className="px-6 py-5">Assigned Group / Cluster</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No identities found</h3>
                        <p className="text-gray-500 mt-1">Add or import your first farmer using the button above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((farmer, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-300"
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-950">
                              <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">
                                {farmer.fname?.[0]}{farmer.lname?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100">
                                {farmer.fname} {farmer.lname}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {farmer.membership_number ? `Mem #${farmer.membership_number}` : `ID: ${farmer.id?.slice(0, 8)}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium text-xs">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {farmer.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-(--foreground)">
                            {farmer.commodity || "Cassava"} • {Number(farmer.farm_size_hectares || 2).toFixed(1)} ha
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {farmer.cluster_name || "Unassigned"}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Import Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-(--foreground)">Add / Import Farmers</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Register new members or link existing Agri-Noria digital IDs
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("single")}
                className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === "single"
                    ? "border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
              >
                <FaSeedling className="w-3.5 h-3.5" />
                Individual Farmer
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === "bulk"
                    ? "border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Bulk Excel / CSV Import
              </button>
            </div>

            {activeTab === "single" ? (
              <form onSubmit={handleAddSingleFarmer} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <span className="leading-relaxed">
                    <strong className="font-black text-emerald-800 dark:text-emerald-300">Single Identity Rule:</strong> If this farmer already exists on Agri-Noria, the system will link their existing profile to your organization without creating duplicate records.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">First Name</Label>
                    <Input
                      placeholder="e.g. Chukwuemeka"
                      value={form.fname}
                      onChange={(e) => setForm({ ...form, fname: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Name</Label>
                    <Input
                      placeholder="e.g. Okafor"
                      value={form.lname}
                      onChange={(e) => setForm({ ...form, lname: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number (Digital Key)</Label>
                    <Input
                      placeholder="e.g. 08012345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">NIN (Optional)</Label>
                    <Input
                      placeholder="National ID Number"
                      value={form.nin}
                      onChange={(e) => setForm({ ...form, nin: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Commodity</Label>
                    <Input
                      placeholder="e.g. Cassava, Maize"
                      value={form.commodity}
                      onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Farm Size (Hectares)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.5"
                      value={form.farm_size_hectares}
                      onChange={(e) => setForm({ ...form, farm_size_hectares: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Membership Number (Optional)</Label>
                  <Input
                    placeholder="e.g. COOP-2026-089"
                    value={form.membership_number}
                    onChange={(e) => setForm({ ...form, membership_number: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="rounded-xl font-bold text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering Farmer...</span>
                      </>
                    ) : (
                      <>
                        <FaSeedling className="w-3.5 h-3.5" />
                        <span>Link / Register Farmer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 dark:from-emerald-950/40 dark:via-gray-900/60 dark:to-blue-950/30 border border-emerald-500/20 dark:border-emerald-500/30 p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                            Download Spreadsheet Templates
                          </p>
                          {/* <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            Ready to use
                          </span> */}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium leading-relaxed">
                          Includes headers for fname, lname, phone, commodity, hectares, etc.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadSampleExcel}
                        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-200 transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        title="Download sample Excel spreadsheet template (.xlsx)"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                          <Download size={14} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                          <span className="block text-xs font-black leading-tight tracking-wide">
                            Excel <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">.xlsx</span>
                          </span>
                          <span className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Template
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-blue-950/60 hover:bg-blue-50 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-700/80 text-blue-800 dark:text-blue-200 transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        title="Download sample CSV text template (.csv)"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                          <Download size={14} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                          <span className="block text-xs font-black leading-tight tracking-wide">
                            CSV <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">.csv</span>
                          </span>
                          <span className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Template
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <label className="group relative border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-200 bg-gradient-to-b from-gray-50/60 to-gray-50/20 dark:from-gray-900/40 dark:to-gray-900/20 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 hover:shadow-lg">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-2 transition-all duration-200">
                    <UploadCloud size={30} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-base font-black text-(--foreground) tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {csvFileName || "Click to upload or drag & drop Excel (.xlsx, .xls) or CSV file"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium max-w-md mx-auto">
                      Supports Microsoft Excel (.xlsx, .xls) and standard CSV format with headers
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preview */}
                {csvPreview.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-(--foreground)">Parsed {csvPreview.length} Farmers</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready to import
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                      {csvPreview.slice(0, 5).map((row, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
                          <span className="font-bold text-(--foreground)">{row.fname} {row.lname}</span>
                          <span className="text-gray-400">{row.phone} • {row.commodity} ({row.farm_size_hectares} ha)</span>
                        </div>
                      ))}
                      {csvPreview.length > 5 && (
                        <div className="p-2 text-center text-gray-400 text-[11px] italic">
                          + {csvPreview.length - 5} more farmers
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="rounded-xl font-bold text-xs uppercase tracking-wider px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <button
                    type="button"
                    disabled={submitting || csvPreview.length === 0}
                    onClick={handleBulkSubmit}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Importing {csvPreview.length} Farmers...</span>
                      </>
                    ) : (
                      <>
                        <FaSeedling className="w-3.5 h-3.5" />
                        <span>Import {csvPreview.length} Farmers</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Farmer Credentials Modal */}
      {createdFarmerCreds && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <KeyRound size={28} />
              </div>
              <h3 className="text-xl font-black text-(--foreground)">Farmer Account Created!</h3>
              <p className="text-xs text-gray-500">
                A new digital identity and login account has been generated for <strong>{createdFarmerCreds.name}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-800">
                <span className="text-gray-500 font-semibold">Login Identifier:</span>
                <span className="font-mono font-bold text-(--foreground)">{createdFarmerCreds.email}</span>
              </div>
              {createdFarmerCreds.phone && (
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50 dark:border-gray-800">
                  <span className="text-gray-500 font-semibold">Phone:</span>
                  <span className="font-mono font-bold text-(--foreground)">{createdFarmerCreds.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-semibold">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {createdFarmerCreds.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdFarmerCreds.tempPassword, "Password copied!")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
                    title="Copy Password"
                  >
                    <Copy size={14} className="text-gray-500 hover:text-(--foreground)" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-200/50 dark:border-gray-800">
                <span className="text-gray-500 font-semibold">Ecosystem Route:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">/ecosystem/farmer</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
              {createdFarmerCreds.email && !createdFarmerCreds.email.endsWith("@agrinoria.eco") ? (
                <>📧 An email with temporary password & direct route (<code>/ecosystem/farmer</code>) has been dispatched to <strong>{createdFarmerCreds.email}</strong>. Logging in will auto-set their <code>isVerified</code> status to true.</>
              ) : (
                <>💡 Farmer does not have an active email address. Please share these temporary credentials directly via SMS or verbal orientation.</>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  const text = `Agri-Noria Farmer Account Credentials\nName: ${createdFarmerCreds.name}\nLogin Email: ${createdFarmerCreds.email}\nPhone: ${createdFarmerCreds.phone || 'N/A'}\nTemporary Password: ${createdFarmerCreds.tempPassword}\nSign In Link: ${origin}/auth/signin?redirect=/ecosystem/farmer\nEcosystem Farmer Route: ${origin}/ecosystem/farmer`;
                  handleCopy(text, "Full credentials copied!");
                }}
                className="flex-1 rounded-xl gap-1.5 text-xs font-bold"
              >
                <Copy size={14} /> Copy Details
              </Button>
              <Button
                type="button"
                onClick={() => setCreatedFarmerCreds(null)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Queue & History Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-(--foreground)">Farmer Import Queue & History</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    Track background batch jobs, retry failed rows, download passwords, or rollback batches
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchImportJobs}
                  disabled={loadingJobs}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={13} className={loadingJobs ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {loadingJobs && importJobs.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-400">Loading batch history...</p>
              </div>
            ) : importJobs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mx-auto flex items-center justify-center text-gray-400">
                  <UploadCloud size={28} />
                </div>
                <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">No batch imports recorded yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When you upload an Excel or CSV file of farmers, the batch job will appear here with live tracking, retry, and rollback controls.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {importJobs.map((job) => {
                  const percent = job.total_count > 0
                    ? Math.min(100, Math.round(((job.processed_count || 0) / job.total_count) * 100))
                    : 0;
                  const isExpanded = !!expandedJobErrors[job.id];
                  const hasCredentials = job.created_farmers && job.created_farmers.filter(f => f.tempPassword).length > 0;
                  const failedRows = Array.isArray(job.failed_rows) ? job.failed_rows : [];

                  return (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 space-y-4 hover:border-gray-200 dark:hover:border-gray-700 transition"
                    >
                      {/* Batch Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 ${job.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : job.status === "partially_failed"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                                : job.status === "failed"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                  : job.status === "rolled_back"
                                    ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 animate-pulse"
                            }`}>
                            {["queued", "processing"].includes(job.status) && <Loader2 size={11} className="animate-spin" />}
                            {job.status === "completed" && <CheckCircle2 size={11} />}
                            {job.status === "partially_failed" && <AlertTriangle size={11} />}
                            {job.status === "rolled_back" && <RotateCcw size={11} />}
                            {job.status.replace("_", " ")}
                          </span>

                          <h5 className="font-black text-sm text-(--foreground)">{job.file_name}</h5>
                        </div>

                        <span className="text-[11px] font-mono text-gray-500">
                          {new Date(job.created_at).toLocaleString()}
                        </span>
                      </div>

                      {/* Progress bar and metrics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-semibold">
                            Progress: {job.processed_count || 0} / {job.total_count} processed ({percent}%)
                          </span>
                          <div className="flex items-center gap-3 font-semibold">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ✓ {job.success_count || 0} succeeded {job.new_count > 0 && `(${job.new_count} new)`}
                            </span>
                            {job.failed_count > 0 && (
                              <span className="text-red-500 dark:text-red-400 font-bold">
                                ✗ {job.failed_count} failed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-gray-200/70 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${job.status === "completed"
                                ? "bg-emerald-500"
                                : job.status === "partially_failed"
                                  ? "bg-amber-500"
                                  : job.status === "failed"
                                    ? "bg-red-500"
                                    : "bg-blue-600 animate-pulse"
                              }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Summary text */}
                      {job.summary_message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          {job.summary_message}
                        </p>
                      )}

                      {/* Batch Actions Toolbar */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-850 gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasCredentials && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDownloadCredentialsExcel(job.created_farmers.filter(f => f.tempPassword))}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-xs transition-colors cursor-pointer"
                                title="Download Excel sheet with temporary farmer passwords"
                              >
                                <Download size={13} /> Passwords (.XLSX)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadCredentialsCsv(job.created_farmers.filter(f => f.tempPassword))}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-xs transition-colors cursor-pointer"
                                title="Download CSV file with temporary farmer passwords"
                              >
                                <Download size={13} /> (.CSV)
                              </button>
                            </>
                          )}

                          {failedRows.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedJobErrors(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/50 shadow-xs transition-colors cursor-pointer"
                            >
                              <AlertCircle size={13} />
                              {isExpanded ? "Hide Errors" : `View Errors (${failedRows.length})`}
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Retry Failed */}
                          {job.failed_count > 0 && !["rolled_back", "processing"].includes(job.status) && (
                            <button
                              type="button"
                              onClick={() => handleRetryFailed(job)}
                              disabled={retryingJobId === job.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {retryingJobId === job.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                              Retry Failed ({job.failed_count})
                            </button>
                          )}

                          {/* Rollback Batch (Administrative safety feature) */}
                          {job.success_count > 0 && !["rolled_back", "processing"].includes(job.status) && (
                            <button
                              type="button"
                              onClick={() => handleRollbackBatch(job)}
                              disabled={rollingBackJobId === job.id}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Undo this batch: removes imported farmers from your organization"
                            >
                              {rollingBackJobId === job.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                              Undo Import (Rollback)
                            </button>
                          )}

                          {job.status === "rolled_back" && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold italic flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg">
                              <RotateCcw size={12} className="text-gray-400" /> Rolled back {job.rolled_back_at ? `on ${new Date(job.rolled_back_at).toLocaleDateString()}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Failed Rows Table */}
                      {isExpanded && failedRows.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 space-y-2 animate-in fade-in duration-200 text-xs">
                          <p className="font-bold text-red-800 dark:text-red-300 text-[11px] uppercase tracking-wider">
                            Failed Farmer Rows ({failedRows.length})
                          </p>
                          <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200/40 dark:border-red-900/20 divide-y divide-red-200/40 dark:divide-red-900/20">
                            <table className="w-full text-left">
                              <thead className="bg-red-100/50 dark:bg-red-900/30 text-red-900 dark:text-red-300 font-bold text-[10px] uppercase">
                                <tr>
                                  <th className="p-2">Row #</th>
                                  <th className="p-2">Farmer</th>
                                  <th className="p-2">Phone / Email</th>
                                  <th className="p-2">Error Reason</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-red-200/30 dark:divide-red-900/20">
                                {failedRows.map((errItem, errIdx) => (
                                  <tr key={errIdx} className="hover:bg-red-100/30 dark:hover:bg-red-900/10">
                                    <td className="p-2 font-mono text-gray-500">{errItem.rowNumber || errIdx + 1}</td>
                                    <td className="p-2 font-bold text-gray-800 dark:text-gray-200">
                                      {errItem.farmerData?.fname} {errItem.farmerData?.lname || ''}
                                    </td>
                                    <td className="p-2 font-mono text-gray-600 dark:text-gray-400">
                                      {errItem.farmerData?.phone || errItem.farmerData?.email || 'N/A'}
                                    </td>
                                    <td className="p-2 text-red-600 dark:text-red-400 font-semibold">
                                      {errItem.error}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-900">
              <Button
                onClick={() => setShowQueueModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Credentials Modal */}
      {bulkImportResults && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-900 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-(--foreground)">Bulk Import Completed!</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    {bulkImportResults.newCount} new accounts created • {bulkImportResults.linkedCount} existing farmers linked
                  </p>
                </div>
              </div>
              <button onClick={() => setBulkImportResults(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {bulkImportResults.credentials && bulkImportResults.credentials.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Temporary Passwords Generated ({bulkImportResults.credentials.length})
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Download spreadsheet to distribute login credentials & ecosystem routes to your farmers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadCredentialsExcel(bulkImportResults.credentials)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 h-9 px-4 whitespace-nowrap inline-flex items-center justify-center cursor-pointer shadow-sm transition-all"
                    >
                      <Download size={14} /> Download (.XLSX)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCredentialsCsv(bulkImportResults.credentials)}
                      className="border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl text-xs font-bold gap-1.5 h-9 px-4 whitespace-nowrap inline-flex items-center justify-center cursor-pointer shadow-xs transition-all"
                    >
                      <Download size={14} /> Download (.CSV)
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 sticky top-0 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Farmer</th>
                        <th className="p-3">Login / Phone</th>
                        <th className="p-3">Temporary Password</th>
                        <th className="p-3">Ecosystem Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {bulkImportResults.credentials.map((cred, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                          <td className="p-3 font-bold text-(--foreground)">{cred.name}</td>
                          <td className="p-3 font-mono text-gray-600 dark:text-gray-400">{cred.phone || cred.email}</td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {cred.tempPassword}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                            /ecosystem/farmer
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300">
                All imported farmers already had existing master accounts on Agri-Noria and have been linked to your organization. No new login passwords were created.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-900">
              <Button
                type="button"
                onClick={() => setBulkImportResults(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
