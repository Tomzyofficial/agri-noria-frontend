"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import {
  MapPin,
  Calendar,
  Users,
  Coins,
  ShieldCheck,
  Sprout,
  Wheat,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building,
  Info,
  X,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { FaSeedling, FaSpinner } from "react-icons/fa6";
import { useFarmerData } from "../useFarmerData";

export default function EnrolledProgramsPage() {
  const {
    loading,
    profile,
    availablePrograms = [],
    isVerified,
    enrollingProgramId,
    handleEnroll,
    myCluster,
  } = useFarmerData();

  // Search, filter, and modal states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [selectedProgramModal, setSelectedProgramModal] = useState(null);

  // Date computations
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const curEnd = profile?.program_end_date ? new Date(profile.program_end_date) : null;
  const curEndDateOnly = curEnd ? new Date(curEnd.getFullYear(), curEnd.getMonth(), curEnd.getDate()) : null;

  const isCurrentProgramEnded = Boolean(
    (curEndDateOnly && todayDateOnly > curEndDateOnly) ||
    profile?.program_status === "completed" ||
    profile?.program_status === "ended"
  );

  const hasActiveOrPendingProgram = Boolean(
    profile?.program_id &&
    !isCurrentProgramEnded &&
    profile?.program_enrollment_status !== "rejected"
  );

  const canEnroll = !hasActiveOrPendingProgram;

  // Active enrolled program match
  const enrolledProgram = useMemo(() => {
    if (!profile?.program_id) return null;
    return availablePrograms?.find((p) => p.id === profile.program_id) || null;
  }, [availablePrograms, profile?.program_id]);

  // Unique commodities for filter
  const commoditiesList = useMemo(() => {
    const set = new Set();
    availablePrograms.forEach((p) => {
      if (p.commodity) set.add(p.commodity.trim());
    });
    return Array.from(set);
  }, [availablePrograms]);

  // Filtered ongoing programs
  const filteredPrograms = useMemo(() => {
    return availablePrograms.filter((prog) => {
      const matchesSearch =
        !searchTerm.trim() ||
        prog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.commodity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prog.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCommodity =
        selectedCommodity === "all" ||
        prog.commodity?.toLowerCase() === selectedCommodity.toLowerCase();

      return matchesSearch && matchesCommodity;
    });
  }, [availablePrograms, searchTerm, selectedCommodity]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shadow-sm">
          <FaSpinner className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Loading Agricultural Programs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Agricultural Programs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Ecosystem
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">
            Manage your enrolled programs and explore open ongoing initiatives
          </p>
        </div>

        {/* Quick stat pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {availablePrograms.length} Ongoing Programs
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ENROLLED PROGRAM (OR NEAT EMPTY STATE WITHOUT REDIRECT BUTTON) */}
      {/* ========================================================================= */}
      {profile?.program_id ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Your Enrolled Program
              </h2>
            </div>
            {profile?.program_enrollment_status && (
              <EnrollmentStatusBadge
                status={profile.program_enrollment_status}
                isEnded={isCurrentProgramEnded}
              />
            )}
          </div>

          <Card className="border border-emerald-200/80 dark:border-emerald-900/50 shadow-lg bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/20 rounded-3xl overflow-hidden text-left relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-32 -mt-32 pointer-events-none" />

            <CardHeader className="p-6 sm:p-8 pb-6 border-b border-gray-100 dark:border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
                  <FaSeedling className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      {profile.program_name || enrolledProgram?.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Active Enrollment
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {profile.region || enrolledProgram?.region || "National Region"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Wheat className="w-3.5 h-3.5 text-amber-500" />
                      {profile.commodity || enrolledProgram?.commodity || "General Commodity"}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      ID: {profile.program_id.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Cluster Status Snippet */}
              <div className="flex items-center gap-3">
                {myCluster ? (
                  <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Assigned Cluster
                    </p>
                    <p className="text-xs font-black text-blue-900 dark:text-blue-200">
                      {myCluster.name || "Active Cluster"}
                    </p>
                  </div>
                ) : (
                  <Link
                    href="/ecosystem/farmer/cluster"
                    className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition inline-flex items-center gap-1.5"
                  >
                    <span>Connect Cluster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <ProgramStat
                  label="Program Fund Balance"
                  value={`₦${parseFloat(enrolledProgram?.wallet_balance || 0).toLocaleString()}`}
                  icon={<Coins className="w-4 h-4 text-emerald-600" />}
                />
                <ProgramStat
                  label="Target Commodity"
                  value={enrolledProgram?.commodity || profile?.program_commodity || profile?.commodity || "Agricultural"}
                  icon={<Wheat className="w-4 h-4 text-amber-500" />}
                />
                <ProgramStat
                  label="Assigned Scale"
                  value={`${parseFloat(profile?.farm_size_hectares || enrolledProgram?.target_hectares || 0).toLocaleString()} Ha`}
                  icon={<Layers className="w-4 h-4 text-blue-500" />}
                />
                <ProgramStat
                  label="Season Start"
                  value={
                    profile.program_start_date || enrolledProgram?.start_date
                      ? new Date(profile.program_start_date || enrolledProgram.start_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Ongoing"
                  }
                  icon={<Calendar className="w-4 h-4 text-purple-500" />}
                />
                <ProgramStat
                  label="Season End"
                  value={
                    profile.program_end_date || enrolledProgram?.end_date
                      ? new Date(profile.program_end_date || enrolledProgram.end_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Open"
                  }
                  icon={<Calendar className="w-4 h-4 text-rose-500" />}
                />
              </div>

              {/* Status Alert Banners */}
              {isCurrentProgramEnded && (
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                        Season Completed
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5 font-medium leading-relaxed">
                        This program has reached its end date. You can now select and apply to join any of the ongoing programs listed below for the next planting season.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isCurrentProgramEnded && profile.program_enrollment_status === "pending_verification" && (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5 text-amber-900 dark:text-amber-200">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Enrollment Pending Director Review</h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 font-medium leading-relaxed">
                      Your application has been received and is currently under review by the Program Directorate. Full input request allowances and cluster allocation will activate immediately once approved.
                    </p>
                  </div>
                </div>
              )}

              {!isCurrentProgramEnded && profile.program_enrollment_status === "rejected" && (
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3.5 text-rose-900 dark:text-rose-200">
                  <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Enrollment Not Approved</h4>
                    <p className="text-xs text-rose-800/90 dark:text-rose-300/90 mt-0.5 font-medium leading-relaxed">
                      Your enrollment application in this program was not verified by the directorate. You are free to apply to another open program listed below.
                    </p>
                  </div>
                </div>
              )}

              {/* Inclusions & Objectives */}
              <div className="p-6 bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      Included Program Subsidies & Benefits
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      Guaranteed Support
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Participation unlocks subsidized certified seeds, crop protection, technical training modules, field inspection scheduling, and structured off-taker market linkage.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Input Financing
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Crop Insurance
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                    <Wheat className="w-3.5 h-3.5 text-purple-600" />
                    Harvest Buyback
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* NEAT NOTICE CARD WHEN NOT YET ENROLLED (NO REDIRECT BUTTON) */
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-white dark:from-emerald-950/30 dark:via-gray-950 dark:to-gray-950 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
              <FaSeedling className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  No Active Program Enrollment
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Ready to Enroll
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl">
                You are not currently enrolled in any agricultural initiative. Browse the available ongoing programs below, choose the program that matches your crop and region, and apply directly to unlock input subsidies, cluster groupings, and verified off-taker guarantees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200/60 dark:border-emerald-900/60 shadow-2xs text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availablePrograms.length} Ongoing Programs Open</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ONGOING AGRICULTURAL PROGRAMS DIRECTLY ON THE SAME PAGE        */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-2">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Ongoing Ecosystem Programs
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Explore open initiatives, compare funding & requirements, and apply directly
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programs, regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-gray-200"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Commodity Filter Chips */}
        {commoditiesList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCommodity("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCommodity === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500"
              }`}
            >
              All Commodities ({availablePrograms.length})
            </button>
            {commoditiesList.map((comm) => (
              <button
                key={comm}
                type="button"
                onClick={() => setSelectedCommodity(comm.toLowerCase())}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCommodity.toLowerCase() === comm.toLowerCase()
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500"
                }`}
              >
                {comm}
              </button>
            ))}
          </div>
        )}

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              No matching programs found
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">
              Try adjusting your search query or reset commodity filters to see all available initiatives.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCommodity("all");
              }}
              className="text-xs font-bold text-emerald-600 hover:underline pt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((prog) => {
              const isThisProgram = profile?.program_id === prog.id;
              const isEnrolledAndApproved =
                isThisProgram &&
                (profile?.program_enrollment_status === "verified" ||
                  profile?.program_enrollment_status === "approved");
              const isPendingApproval =
                isThisProgram && profile?.program_enrollment_status === "pending_verification";
              const isRejected =
                isThisProgram && profile?.program_enrollment_status === "rejected";

              const startDate = prog.start_date ? new Date(prog.start_date) : null;
              const endDate = prog.end_date ? new Date(prog.end_date) : null;
              const isUpcoming = startDate && todayDateOnly < startDate;
              const isEnded = endDate && todayDateOnly > endDate;

              const targetFarmers = parseInt(prog.target_farmers) || 0;
              const enrolledFarmers = parseInt(prog.enrolled_farmers) || 0;
              const isFull = targetFarmers > 0 && enrolledFarmers >= targetFarmers;

              const isEnrolling = enrollingProgramId === prog.id;

              return (
                <Card
                  key={prog.id}
                  className={`rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isEnrolledAndApproved
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                      : isPendingApproval
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                      : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-800"
                  }`}
                >
                  <CardHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800/80">
                    {/* Top Row: Sponsor & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                        <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{prog.institution_name || "Institutional Sponsor"}</span>
                      </span>

                      {/* Status Badges */}
                      {isEnrolledAndApproved ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 shrink-0">
                          Enrolled ✓
                        </span>
                      ) : isPendingApproval ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse shrink-0">
                          Pending Approval ⏳
                        </span>
                      ) : isRejected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 shrink-0">
                          Rejected
                        </span>
                      ) : isEnded ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 shrink-0">
                          Season Ended
                        </span>
                      ) : isFull ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 shrink-0">
                          Capacity Full
                        </span>
                      ) : isUpcoming ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 shrink-0">
                          Starts Soon
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 shrink-0">
                          Open to Join
                        </span>
                      )}
                    </div>

                    {/* Program Title */}
                    <h3 className="font-black text-base text-gray-900 dark:text-white line-clamp-1">
                      {prog.name}
                    </h3>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                        <Wheat className="w-3 h-3 text-emerald-600" />
                        {prog.commodity || "Mixed"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {prog.region || "National"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-4 flex-1 flex flex-col justify-between space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60 text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Funding Pool
                        </p>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate">
                          ₦{parseFloat(prog.wallet_balance || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Target Scale
                        </p>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {parseFloat(prog.target_hectares || 0).toLocaleString()} Ha
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Farmers
                        </p>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {enrolledFarmers} / {targetFarmers || "∞"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Timeline
                        </p>
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {startDate
                            ? startDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
                            : "Open"}
                        </p>
                      </div>
                    </div>

                    {/* Inclusions checklist */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {prog.input_financing && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                          ✓ Inputs
                        </span>
                      )}
                      {prog.insurance_included && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                          ✓ Insurance
                        </span>
                      )}
                      {prog.harvest_financing && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                          ✓ Buyback
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800/80">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedProgramModal(prog)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <Info className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        Details
                      </Button>

                      {isEnrolledAndApproved ? (
                        <Button
                          disabled
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default"
                        >
                          Enrolled ✓
                        </Button>
                      ) : isPendingApproval ? (
                        <Button
                          disabled
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 cursor-default"
                        >
                          Pending ⏳
                        </Button>
                      ) : isEnded ? (
                        <Button
                          disabled
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        >
                          Ended
                        </Button>
                      ) : isFull ? (
                        <Button
                          disabled
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-200 cursor-not-allowed"
                        >
                          Full
                        </Button>
                      ) : isUpcoming ? (
                        <Button
                          disabled
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/30 text-blue-600 border border-blue-200 cursor-not-allowed"
                        >
                          Upcoming
                        </Button>
                      ) : !canEnroll ? (
                        <Button
                          disabled
                          title="You are already enrolled in an active program"
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        >
                          Enrolled Else
                        </Button>
                      ) : !isVerified ? (
                        <Button
                          onClick={() => toast.warning("Please complete farm verification to enroll in programs.")}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                        >
                          🔒 Verify
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleEnroll(prog.id)}
                          disabled={isEnrolling}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
                        >
                          {isEnrolling ? (
                            <span className="flex items-center gap-1.5 justify-center">
                              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                              Applying...
                            </span>
                          ) : (
                            "Apply & Enroll"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PROGRAM DETAILS MODAL                                                     */}
      {/* ========================================================================= */}
      {selectedProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <FaSeedling className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900 dark:text-white">
                    {selectedProgramModal.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {selectedProgramModal.institution_name || "Institutional Sponsor"} • {selectedProgramModal.region}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProgramModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Commodity</p>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                    {selectedProgramModal.commodity || "Agricultural"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Target Scale</p>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                    {parseFloat(selectedProgramModal.target_hectares || 0).toLocaleString()} Ha
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Fund Pool</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    ₦{parseFloat(selectedProgramModal.wallet_balance || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Capacity</p>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                    {selectedProgramModal.enrolled_farmers || 0} / {selectedProgramModal.target_farmers || "Open"}
                  </p>
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                  Program Benefits & Inclusions
                </h4>
                <div className="space-y-2">
                  <BenefitItem
                    title="Input Financing & Seed Subsidies"
                    included={selectedProgramModal.input_financing}
                    desc="Subsidized certified seeds, fertilizers, and agronomy inputs disbursed through verified distributors."
                  />
                  <BenefitItem
                    title="Crop Insurance Coverage"
                    included={selectedProgramModal.insurance_included}
                    desc="Comprehensive yield and weather index insurance to protect against pest infestation or drought."
                  />
                  <BenefitItem
                    title="Harvest Off-taker Buyback"
                    included={selectedProgramModal.harvest_financing}
                    desc="Guaranteed minimum price and structured off-taker purchase upon harvest verification."
                  />
                  <BenefitItem
                    title="GPS Farm Mapping & Field Inspections"
                    included={selectedProgramModal.gps_verification_required !== false}
                    desc="Technical field officers conduct scheduled agronomy visits and digital satellite monitoring."
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
                <p className="font-bold text-blue-900 dark:text-blue-300">Season Schedule</p>
                <p className="text-blue-700 dark:text-blue-400 mt-0.5">
                  Start: {selectedProgramModal.start_date ? new Date(selectedProgramModal.start_date).toLocaleDateString("en-GB") : "Open"}
                  {"  "}•{"  "}
                  End: {selectedProgramModal.end_date ? new Date(selectedProgramModal.end_date).toLocaleDateString("en-GB") : "Season End"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-900 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
              <Button
                variant="outline"
                onClick={() => setSelectedProgramModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold"
              >
                Close
              </Button>

              {canEnroll && isVerified && (
                <Button
                  onClick={() => {
                    handleEnroll(selectedProgramModal.id);
                    setSelectedProgramModal(null);
                  }}
                  disabled={enrollingProgramId === selectedProgramModal.id}
                  className="px-6 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {enrollingProgramId === selectedProgramModal.id ? "Applying..." : "Apply to Enroll"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramStat({ label, value, icon }) {
  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-1.5 transition-all hover:border-emerald-200 dark:hover:border-emerald-800">
      <div className="flex items-center justify-between text-gray-400">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {icon}
      </div>
      <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  );
}

function EnrollmentStatusBadge({ status, isEnded }) {
  if (isEnded) {
    return (
      <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
        ⏹ Season Ended
      </span>
    );
  }
  if (status === "verified" || status === "approved") {
    return (
      <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3" />
        Approved by Directorate
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
        <XCircle className="w-3 h-3" />
        Enrollment Rejected
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5 animate-pulse">
      <Clock className="w-3 h-3" />
      Pending Approval
    </span>
  );
}

function BenefitItem({ title, included, desc }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs">
      <div className={`mt-0.5 ${included ? "text-emerald-600" : "text-gray-400"}`}>
        {included ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      </div>
      <div>
        <p className={`font-bold ${included ? "text-gray-900 dark:text-white" : "text-gray-400 line-through"}`}>
          {title}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
