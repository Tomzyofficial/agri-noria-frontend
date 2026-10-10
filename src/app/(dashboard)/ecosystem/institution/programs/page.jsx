"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((res) => res.json());
import { 
   Landmark, Plus, Calendar, User, MapPin, 
   Search, Filter, ChevronRight, Edit3, Loader2,
   CheckCircle2, Clock, AlertCircle, Coins, Wallet, ArrowUpRight,
   Users, Check, X, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ProgramsPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [selectedProgram, setSelectedProgram] = useState(null);
   const [saving, setSaving] = useState(false);
   const [activeTab, setActiveTab] = useState("programs"); // "programs" | "verifications"
   const [verifyingId, setVerifyingId] = useState(null);

   // Funding modal state
   const [fundingProgram, setFundingProgram] = useState(null);
   const [fundAmount, setFundAmount] = useState("");
   const [isFunding, setIsFunding] = useState(false);

   const { data: progData, isLoading: loading, mutate: mutatePrograms } = useSWR("/api/proxy/programs/mine", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: userData } = useSWR("/api/proxy/auth/verify-vendor", fetcher, { revalidateOnFocus: false });
   const { data: enrollData, mutate: mutateEnrollments } = useSWR("/api/proxy/programs/institution/enrollments", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });

   const programs = progData?.success ? (progData.data || []) : [];
   const currentUser = userData?.authenticated ? userData : null;

   const enrolledFarmers = enrollData?.data?.farmers || [];
   const enrolledClusters = enrollData?.data?.clusters || [];
   const pendingFarmers = enrolledFarmers.filter(f => f.enrollment_status === 'pending_verification');
   const pendingClusters = enrolledClusters.filter(c => c.enrollment_status === 'pending_verification');
   const totalPending = pendingFarmers.length + pendingClusters.length;

   const handleVerifyEnrollment = async (type, id, status) => {
      setVerifyingId(id);
      try {
         const res = await fetch("/api/proxy/programs/enrollments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, id, status }),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(json.message || `Enrollment marked as ${status}`);
            await mutateEnrollments();
         } else {
            toast.error(json.error || "Failed to update enrollment verification");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setVerifyingId(null);
      }
   };

   // Form state
   const [formData, setFormData] = useState({
      name: "",
      region: "",
      commodity: "",
      target_farmers: "",
      target_hectares: "",
      start_date: "",
      end_date: "",
   });

   const loadPrograms = async () => {
      await mutatePrograms();
   };

   const handleOpenCreate = () => {
      setFormData({
         name: "", region: "", commodity: "", 
         target_farmers: "", target_hectares: "",
         start_date: "", end_date: ""
      });
      setIsEditing(false);
      setIsModalOpen(true);
   };

   const handleOpenEdit = (program) => {
      if (program.created_by !== currentUser?.id) {
         toast.error("You can only modify programs you created");
         return;
      }
      setFormData({
         name: program.name,
         region: program.region,
         commodity: program.commodity,
         target_farmers: program.target_farmers,
         target_hectares: program.target_hectares,
         start_date: program.start_date ? program.start_date.split('T')[0] : "",
         end_date: program.end_date ? program.end_date.split('T')[0] : "",
      });
      setSelectedProgram(program);
      setIsEditing(true);
      setIsModalOpen(true);
   };

   const handleFundSubmit = async (e) => {
      e.preventDefault();
      if (!fundAmount || isNaN(fundAmount) || parseFloat(fundAmount) <= 0) {
         toast.error("Please enter a valid funding amount");
         return;
      }

      setIsFunding(true);
      try {
         const res = await fetch(`/api/proxy/programs/${fundingProgram.id}/fund`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: parseFloat(fundAmount) }),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(`Successfully allocated ₦${parseFloat(fundAmount).toLocaleString()} to '${fundingProgram.name}'!`);
            setFundingProgram(null);
            setFundAmount("");
            await loadPrograms();
         } else {
            toast.error(json.error || "Failed to fund programme.");
         }
      } catch (error) {
         toast.error("Network error while allocating funds.");
      } finally {
         setIsFunding(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const url = isEditing 
            ? `/api/proxy/programs/${selectedProgram.id}` 
            : "/api/proxy/programs/create";
         const method = isEditing ? "PUT" : "POST";

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         const json = await res.json();
         if (json.success) {
            toast.success(`Program ${isEditing ? 'updated' : 'created'} successfully`);
            setIsModalOpen(false);
            await loadPrograms();
         } else {
            toast.error(json.error || "Failed to save program");
         }
      } catch (error) {
         toast.error("An error occurred");
      } finally {
         setSaving(false);
      }
   };

   const filteredPrograms = programs.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase())
   );

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-black text-(--foreground) flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl text-white">
                     <Landmark className="w-6 h-6" />
                  </div>
                  Institutional Programs
               </h1>
               <p className="text-gray-500 mt-1 font-medium">Manage and orchestrate agricultural value chain interventions and program financing.</p>
            </div>
            <Button 
               onClick={handleOpenCreate}
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95"
            >
               <Plus className="w-5 h-5" />
               <span className="font-bold">Launch New Program</span>
            </Button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6">
            <button
               onClick={() => setActiveTab("programs")}
               className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "programs"
                     ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                     : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
               }`}
            >
               <Landmark className="w-4 h-4" />
               Programs ({programs.length})
            </button>
            <button
               onClick={() => setActiveTab("verifications")}
               className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "verifications"
                     ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                     : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
               }`}
            >
               <ShieldCheck className="w-4 h-4" />
               Enrollment Verifications
               {totalPending > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                     {totalPending} Pending
                  </span>
               ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                     {enrolledFarmers.length + enrolledClusters.length}
                  </span>
               )}
            </button>
         </div>

         {activeTab === "programs" ? (
            <>
               {/* Stats */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-900/20">
                     <CardContent className="p-6">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active Programs</p>
                        <p className="text-3xl font-black mt-1 text-blue-900 dark:text-blue-100">{programs.length}</p>
                     </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/20">
                     <CardContent className="p-6">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Programme Funds</p>
                        <p className="text-3xl font-black mt-1 text-emerald-900 dark:text-emerald-100">
                           ₦{programs.reduce((acc, p) => acc + (parseFloat(p.wallet_balance) || 0), 0).toLocaleString()}
                        </p>
                     </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-900/20">
                     <CardContent className="p-6">
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Total Reach</p>
                        <p className="text-3xl font-black mt-1 text-purple-900 dark:text-purple-100">
                           {programs.reduce((acc, p) => acc + (parseInt(p.enrolled_farmers) || 0), 0).toLocaleString()}
                        </p>
                     </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-900/20">
                     <CardContent className="p-6">
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Impact Area</p>
                        <p className="text-3xl font-black mt-1 text-amber-900 dark:text-amber-100">
                           {programs.reduce((acc, p) => acc + (parseFloat(p.target_hectares) || 0), 0).toLocaleString()} <span className="text-sm font-bold">Ha</span>
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {/* List */}
               <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-950">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-md-center gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                     placeholder="Search programs..." 
                     className="pl-9 h-11 w-80 rounded-xl"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-2 items-center">
                  <Link href="/ecosystem/institution/wallet" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">
                     <Wallet className="w-4 h-4" /> Go to Institutional Wallet <ArrowUpRight className="w-3 h-3" />
                  </Link>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Program Details</th>
                        <th className="px-6 py-4">Commodity & Region</th>
                        <th className="px-6 py-4">Targets</th>
                        <th className="px-6 py-4">Fund Balance</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {filteredPrograms.map((program) => (
                        <tr key={program.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                    {program.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{program.name}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                       <Calendar className="w-3 h-3" />
                                       {new Date(program.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{program.commodity}</p>
                                 <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" /> {program.region}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold">{program.enrolled_farmers} <span className="text-[10px] text-gray-400 font-normal">/ {program.target_farmers} Farmers</span></p>
                                 <p className="text-sm font-bold">{program.target_hectares} <span className="text-[10px] text-gray-400 font-normal">Hectares</span></p>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                 <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-200/50 dark:border-emerald-800">
                                    ₦{parseFloat(program.wallet_balance || 0).toLocaleString()}
                                 </div>
                                 <Button 
                                    onClick={() => setFundingProgram(program)}
                                    size="sm" 
                                    className="h-8 px-3 rounded-lg bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all flex items-center gap-1"
                                 >
                                    <Coins className="w-3.5 h-3.5" /> Fund
                                 </Button>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                 program.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                 {program.status}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-right">
                              {program.created_by === currentUser?.id ? (
                                 <Button 
                                    onClick={() => handleOpenEdit(program)}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 w-9 p-0 rounded-lg hover:bg-blue-50 text-blue-600"
                                 >
                                    <Edit3 className="w-4 h-4" />
                                 </Button>
                              ) : (
                                 <AlertCircle className="w-4 h-4 text-gray-300 ml-auto" />
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>
      </>
   ) : (
      <div className="space-y-6">
         {/* Farmers Verifications */}
         <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-950">
            <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                     <User className="w-5 h-5 text-blue-600" /> Farmer Program Enrollments ({enrolledFarmers.length})
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Review and verify individual farmers who have joined your intervention programs.</p>
               </div>
               {pendingFarmers.length > 0 && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black rounded-full">
                     {pendingFarmers.length} Awaiting Verification
                  </span>
               )}
            </CardHeader>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Farmer</th>
                        <th className="px-6 py-4">Program</th>
                        <th className="px-6 py-4">Farm Size</th>
                        <th className="px-6 py-4">Enrolled Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {enrolledFarmers.map((f) => {
                        const isVerified = f.enrollment_status === 'verified';
                        const isPending = f.enrollment_status === 'pending_verification';

                        return (
                           <tr key={f.farmer_profile_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="px-6 py-4">
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{f.fname} {f.lname}</p>
                                    <p className="text-xs text-gray-500">{f.email || f.phone || "—"}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{f.program_name}</p>
                                 <span className="text-xs text-gray-500 capitalize">{f.program_commodity || f.commodity}</span>
                              </td>
                              <td className="px-6 py-4 font-bold text-sm">
                                 {f.farm_size_hectares ? `${f.farm_size_hectares} Ha` : "—"}
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500">
                                 {f.enrolled_at ? new Date(f.enrolled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                              </td>
                              <td className="px-6 py-4">
                                 {isVerified ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                       Verified
                                    </span>
                                 ) : f.enrollment_status === 'rejected' ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                       Rejected
                                    </span>
                                 ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                       Pending Verification
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    {!isVerified && (
                                       <Button
                                          size="sm"
                                          disabled={verifyingId === f.farmer_profile_id}
                                          onClick={() => handleVerifyEnrollment('farmer', f.farmer_profile_id, 'verified')}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-lg font-bold flex items-center gap-1 shadow-xs"
                                       >
                                          {verifyingId === f.farmer_profile_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                          Verify
                                       </Button>
                                    )}
                                    {f.enrollment_status !== 'rejected' && (
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={verifyingId === f.farmer_profile_id}
                                          onClick={() => handleVerifyEnrollment('farmer', f.farmer_profile_id, 'rejected')}
                                          className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs h-8 px-3 rounded-lg font-bold"
                                       >
                                          Reject
                                       </Button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                     {enrolledFarmers.length === 0 && (
                        <tr>
                           <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">
                              No farmers enrolled in your programs yet.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </Card>

         {/* Clusters Verifications */}
         <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-gray-950">
            <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                     <Users className="w-5 h-5 text-purple-600" /> Cluster Program Enrollments ({enrolledClusters.length})
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Review and verify farmer clusters enrolled in your agricultural intervention programs.</p>
               </div>
               {pendingClusters.length > 0 && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black rounded-full">
                     {pendingClusters.length} Awaiting Verification
                  </span>
               )}
            </CardHeader>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Cluster Name</th>
                        <th className="px-6 py-4">Program</th>
                        <th className="px-6 py-4">Supervisor</th>
                        <th className="px-6 py-4">Farmers in Cluster</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {enrolledClusters.map((c) => {
                        const isVerified = c.enrollment_status === 'verified';

                        return (
                           <tr key={c.cluster_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="px-6 py-4">
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{c.cluster_name}</p>
                                    <p className="text-xs text-gray-500">{c.region || "All Regions"}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="font-bold text-sm text-purple-600 dark:text-purple-400">{c.program_name}</p>
                                 <span className="text-xs text-gray-500 capitalize">{c.program_commodity}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {c.supervisor_fname ? `${c.supervisor_fname} ${c.supervisor_lname || ''}` : "Assigned Supervisor"}
                                 </p>
                                 <p className="text-xs text-gray-500">{c.supervisor_phone || ""}</p>
                              </td>
                              <td className="px-6 py-4 font-bold text-sm">
                                 {c.farmer_count || 0} Farmers
                              </td>
                              <td className="px-6 py-4">
                                 {isVerified ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                       Verified
                                    </span>
                                 ) : c.enrollment_status === 'rejected' ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                       Rejected
                                    </span>
                                 ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                       Pending Verification
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    {!isVerified && (
                                       <Button
                                          size="sm"
                                          disabled={verifyingId === c.cluster_id}
                                          onClick={() => handleVerifyEnrollment('cluster', c.cluster_id, 'verified')}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-lg font-bold flex items-center gap-1 shadow-xs"
                                       >
                                          {verifyingId === c.cluster_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                          Verify
                                       </Button>
                                    )}
                                    {c.enrollment_status !== 'rejected' && (
                                       <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={verifyingId === c.cluster_id}
                                          onClick={() => handleVerifyEnrollment('cluster', c.cluster_id, 'rejected')}
                                          className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs h-8 px-3 rounded-lg font-bold"
                                       >
                                          Reject
                                       </Button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                     {enrolledClusters.length === 0 && (
                        <tr>
                           <td colSpan="6" className="text-center py-8 text-gray-500 font-medium">
                              No clusters enrolled in your programs yet.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
   )}

         {/* Fund Programme Modal */}
         {fundingProgram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <Coins className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Fund Programme</h3>
                           <p className="text-xs text-emerald-100 font-medium mt-0.5">{fundingProgram.name}</p>
                        </div>
                     </div>
                     <Button 
                        onClick={() => setFundingProgram(null)}
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                     >
                        <Plus className="w-5 h-5 rotate-45" />
                     </Button>
                  </div>

                  <form onSubmit={handleFundSubmit} className="p-6 space-y-6">
                     <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/50 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                           <span>Current Programme Fund</span>
                           <span className="text-emerald-600 dark:text-emerald-400 font-black">₦{parseFloat(fundingProgram.wallet_balance || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                           Funds will be directly deducted from your institutional entity wallet and allocated exclusively to settlements and input financing for this programme.
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-wider">Amount to Allocate (NGN)</label>
                        <Input 
                           type="number"
                           required
                           placeholder="e.g. 5000000"
                           value={fundAmount}
                           onChange={(e) => setFundAmount(e.target.value)}
                           className="h-12 rounded-xl text-lg font-black text-gray-900 dark:text-white"
                           autoFocus
                        />
                     </div>

                     <div className="flex gap-3 pt-2">
                        <Button
                           type="button"
                           onClick={() => setFundingProgram(null)}
                           variant="outline"
                           disabled={isFunding}
                           className="flex-1 h-12 rounded-2xl font-bold"
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           disabled={isFunding || !fundAmount}
                           className="flex-1 h-12 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                           {isFunding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Allocate Funds"}
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Create/Edit Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
               <div className="bg-white dark:bg-gray-950 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                     <div>
                        <h2 className="text-2xl font-black">{isEditing ? "Edit Program" : "Launch Program"}</h2>
                        <p className="text-blue-100 text-sm mt-1">Define the parameters of your intervention.</p>
                     </div>
                     <Button 
                        onClick={() => setIsModalOpen(false)}
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
                     >
                        <Plus className="w-6 h-6 rotate-45" />
                     </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Program Name</label>
                           <Input 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. 2024 Rice Enhancement Scheme" 
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Target Region</label>
                           <Input 
                              required
                              value={formData.region}
                              onChange={(e) => setFormData({...formData, region: e.target.value})}
                              placeholder="e.g. Kaduna State" 
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Commodity</label>
                           <Input 
                              required
                              value={formData.commodity}
                              onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                              placeholder="e.g. Paddy Rice" 
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Target Farmers</label>
                           <Input 
                              type="number"
                              required
                              value={formData.target_farmers}
                              onChange={(e) => setFormData({...formData, target_farmers: e.target.value})}
                              placeholder="500" 
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Target Hectares</label>
                           <Input 
                              type="number"
                              required
                              value={formData.target_hectares}
                              onChange={(e) => setFormData({...formData, target_hectares: e.target.value})}
                              placeholder="1000" 
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Start Date</label>
                           <Input 
                              type="date"
                              required
                              value={formData.start_date}
                              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                              className="h-12 rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">End Date</label>
                           <Input 
                              type="date"
                              required
                              value={formData.end_date}
                              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                              className="h-12 rounded-xl"
                           />
                        </div>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <Button 
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           variant="outline" 
                           className="flex-1 h-12 rounded-2xl font-bold"
                        >
                           Cancel
                        </Button>
                        <Button 
                           type="submit"
                           disabled={saving}
                           className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-200"
                        >
                           {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Update Program" : "Launch Program")}
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
