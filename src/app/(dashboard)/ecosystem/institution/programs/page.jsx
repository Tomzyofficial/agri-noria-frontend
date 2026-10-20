"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((res) => res.json());
import { 
   Landmark, Plus, Calendar, User, MapPin, 
   Search, Filter, ChevronRight, Edit3, Loader2,
   CheckCircle2, Clock, AlertCircle, Coins, Wallet, ArrowUpRight,
   Users, Check, X, ShieldCheck, UserCheck, Key, Copy, Mail, Eye, EyeOff
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

   // Program Director appointment modal state
   const [appointingProgram, setAppointingProgram] = useState(null);
   const [isAppointing, setIsAppointing] = useState(false);
   const [directorForm, setDirectorForm] = useState({
      fname: "",
      lname: "",
      email: "",
      phone: "",
      password: "",
      sendEmail: true
   });
   const [credentialModalData, setCredentialModalData] = useState(null);
   const [selectedProgramDetails, setSelectedProgramDetails] = useState(null);
   const [showPassword, setShowPassword] = useState(false);
   const [isResettingPassword, setIsResettingPassword] = useState(false);
   const [newPasswordInput, setNewPasswordInput] = useState("");
   const [showResetForm, setShowResetForm] = useState(false);

   const handleResetDirectorPassword = async (programId, customPassword = "") => {
      setIsResettingPassword(true);
      try {
         const res = await fetch(`/api/proxy/programs/${programId}/program-director/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: customPassword.trim() || undefined }),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success("Director password updated successfully!");
            if (selectedProgramDetails?.id === programId) {
               setSelectedProgramDetails(prev => ({
                  ...prev,
                  director_credentials: {
                     ...prev?.director_credentials,
                     password: json.data?.password
                  }
               }));
            }
            setShowResetForm(false);
            setNewPasswordInput("");
            await loadPrograms();
         } else {
            toast.error(json.error || "Failed to reset password");
         }
      } catch (err) {
         toast.error("Network error while resetting password");
      } finally {
         setIsResettingPassword(false);
      }
   };

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

   const handleAppointDirector = async (e) => {
      e.preventDefault();
      if (!directorForm.fname || !directorForm.lname || !directorForm.email) {
         toast.error("First name, last name, and email are required");
         return;
      }
      setIsAppointing(true);
      try {
         const res = await fetch(`/api/proxy/programs/${appointingProgram.id}/program-director`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(directorForm),
         });
         const json = await res.json();
         if (res.ok && json.success) {
            toast.success(json.message || "Program Director appointed successfully!");
            setCredentialModalData({
               director: json.data?.director,
               programName: appointingProgram.name,
               emailSent: json.data?.emailSent
            });
            setAppointingProgram(null);
            setDirectorForm({ fname: "", lname: "", email: "", phone: "", password: "", sendEmail: true });
            await loadPrograms();
         } else {
            toast.error(json.error || "Failed to appoint Program Director");
         }
      } catch (err) {
         toast.error("Network error while appointing Program Director");
      } finally {
         setIsAppointing(false);
      }
   };

   const handleCopyCredentials = (text) => {
      navigator.clipboard.writeText(text);
      toast.success("Credentials copied to clipboard!");
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
                        <th className="px-6 py-4">Program Director</th>
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
                               {program.director_name ? (
                                  <div className="space-y-1.5">
                                     <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 dark:text-gray-100">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                        {program.director_name}
                                     </div>
                                     <p className="text-xs text-gray-500">{program.director_email}</p>
                                     {program.director_phone && <p className="text-[10px] text-gray-400 font-mono">{program.director_phone}</p>}
                                     <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        <button 
                                           type="button"
                                           onClick={() => setSelectedProgramDetails(program)}
                                           className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                           title="Click to view Director login credentials and password"
                                        >
                                           <Key className="w-3 h-3 text-emerald-600" />
                                           Credentials & Password
                                        </button>
                                        <button 
                                           type="button"
                                           onClick={() => {
                                              setDirectorForm({ fname: "", lname: "", email: "", phone: "", password: "", sendEmail: true });
                                              setAppointingProgram(program);
                                           }} 
                                           className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                                        >
                                           Reassign &rarr;
                                        </button>
                                     </div>
                                  </div>
                               ) : (
                                  <div>
                                     <button 
                                        type="button"
                                        onClick={() => {
                                           setDirectorForm({ fname: "", lname: "", email: "", phone: "", password: "", sendEmail: true });
                                           setAppointingProgram(program);
                                        }} 
                                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                     >
                                        <UserCheck className="w-3.5 h-3.5" /> Appoint Director
                                     </button>
                                     <p className="text-[10px] text-gray-400 mt-1">Pending appointment</p>
                                  </div>
                               )}
                            </td>
                            <td className="px-6 py-5">
                               {program.status === 'active' ? (
                                  <div>
                                     <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Active
                                     </span>
                                     <p className="text-[10px] text-emerald-600 font-bold mt-1">Live & Enrolling</p>
                                  </div>
                               ) : (
                                  <div>
                                     <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                        In Configuration
                                     </span>
                                     <p className="text-[10px] text-amber-600 font-bold mt-1">Hidden from farmers</p>
                                  </div>
                               )}
                            </td>
                            <td className="px-6 py-5 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <Button 
                                     type="button"
                                     onClick={() => setSelectedProgramDetails(program)}
                                     size="sm" 
                                     className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                                     title="View Program Details & Director Credentials"
                                  >
                                     <Eye className="w-3.5 h-3.5" /> Details
                                  </Button>
                                  <Button 
                                     type="button"
                                     onClick={() => handleOpenEdit(program)}
                                     variant="outline" 
                                     size="sm" 
                                     className="h-8 px-2.5 rounded-lg border-gray-200 hover:bg-gray-100 text-gray-700 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 text-xs font-bold transition-all cursor-pointer"
                                     title="Edit Program"
                                  >
                                     <Edit3 className="w-3.5 h-3.5" />
                                  </Button>
                               </div>
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
         <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
               <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">Enrolment Approvals Transferred to Program Director</h4>
               <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Candidate farmer and cluster enrollments are now operationalized and approved directly by the appointed Program Director in their workspace. You retain institutional oversight below.
               </p>
            </div>
         </div>

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
                     {!isEditing && (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                           <strong>Operational Workflow:</strong> Newly created programs start in <strong>In Configuration</strong> status and stay hidden from farmers and clusters. After creation, appoint a <strong>Program Director</strong> who will configure operational rules, targets, and input packages before making the program active for enrollment.
                        </div>
                     )}
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

         {/* Appoint Program Director Modal */}
         {appointingProgram && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Appoint Program Director</h3>
                           <p className="text-xs text-amber-100 font-medium mt-0.5">{appointingProgram.name}</p>
                        </div>
                     </div>
                     <Button 
                        onClick={() => setAppointingProgram(null)}
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                     >
                        <Plus className="w-5 h-5 rotate-45" />
                     </Button>
                  </div>

                  <form onSubmit={handleAppointDirector} className="p-6 space-y-4">
                     <p className="text-xs text-gray-500 font-medium">
                        The Program Director will manage this program in their <strong>Program Management workspace</strong>, configuring rules, setting targets, assigning field officers, and approving candidates.
                     </p>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">First Name *</label>
                           <Input 
                              required
                              placeholder="e.g. Samuel"
                              value={directorForm.fname}
                              onChange={(e) => setDirectorForm({ ...directorForm, fname: e.target.value })}
                              className="h-10 rounded-xl"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Last Name *</label>
                           <Input 
                              required
                              placeholder="e.g. Adeyemi"
                              value={directorForm.lname}
                              onChange={(e) => setDirectorForm({ ...directorForm, lname: e.target.value })}
                              className="h-10 rounded-xl"
                           />
                        </div>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Official Email *</label>
                        <Input 
                           type="email"
                           required
                           placeholder="director@agency.gov.ng"
                           value={directorForm.email}
                           onChange={(e) => setDirectorForm({ ...directorForm, email: e.target.value })}
                           className="h-10 rounded-xl"
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Phone Number (Optional)</label>
                        <Input 
                           type="tel"
                           placeholder="+234 800 000 0000"
                           value={directorForm.phone}
                           onChange={(e) => setDirectorForm({ ...directorForm, phone: e.target.value })}
                           className="h-10 rounded-xl"
                        />
                     </div>

                     <div className="space-y-1">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Temporary Password</label>
                           <span className="text-[10px] text-amber-600 font-bold">Leave blank to auto-generate</span>
                        </div>
                        <Input 
                           type="text"
                           placeholder="Optional custom password"
                           value={directorForm.password}
                           onChange={(e) => setDirectorForm({ ...directorForm, password: e.target.value })}
                           className="h-10 rounded-xl font-mono text-sm"
                        />
                     </div>

                     <div className="flex items-center gap-2 pt-1">
                        <input 
                           type="checkbox"
                           id="sendEmailToggle"
                           checked={directorForm.sendEmail}
                           onChange={(e) => setDirectorForm({ ...directorForm, sendEmail: e.target.checked })}
                           className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="sendEmailToggle" className="text-xs text-gray-700 dark:text-gray-300 font-bold cursor-pointer">
                           Send login credentials directly to director via email
                        </label>
                     </div>

                     <div className="flex gap-3 pt-3">
                        <Button
                           type="button"
                           onClick={() => setAppointingProgram(null)}
                           variant="outline"
                           disabled={isAppointing}
                           className="flex-1 h-11 rounded-xl font-bold"
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           disabled={isAppointing}
                           className="flex-1 h-11 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 dark:shadow-none"
                        >
                           {isAppointing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Appoint Director"}
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Credential Handover / Display Modal */}
         
         {/* PROGRAM & DIRECTOR DETAILS MODAL */}
         {selectedProgramDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
               <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 my-8">
                  {/* Top Banner */}
                  <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white shadow-xs">
                           <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black">{selectedProgramDetails.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                 selectedProgramDetails.status === 'active' 
                                    ? "bg-emerald-400 text-emerald-950" 
                                    : "bg-amber-300 text-amber-950"
                              }`}>
                                 {selectedProgramDetails.status === 'active' ? "Active" : "In Configuration"}
                              </span>
                           </div>
                           <p className="text-xs text-blue-100 font-medium mt-0.5">Program & Institutional Governance Details</p>
                        </div>
                     </div>
                     <Button 
                        onClick={() => {
                           setSelectedProgramDetails(null);
                           setShowPassword(false);
                           setShowResetForm(false);
                        }}
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                     >
                        <X className="w-5 h-5" />
                     </Button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                     {/* 1. PROGRAM DIRECTOR CREDENTIALS (KEY FOCUS) */}
                     <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800/60 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                                 <Key className="w-4 h-4" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                                    Program Director Credentials
                                 </h4>
                                 <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                    Login access for field operations, farmer approvals, and cluster execution
                                 </p>
                              </div>
                           </div>
                           {selectedProgramDetails.director_name && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Director
                              </span>
                           )}
                        </div>

                        {selectedProgramDetails.director_name || selectedProgramDetails.program_director_id ? (
                           <div className="space-y-3">
                              <div className="p-4 rounded-xl bg-white dark:bg-gray-800/90 border border-amber-200 dark:border-amber-800/40 space-y-2.5 text-xs font-mono">
                                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 pb-2">
                                    <span className="text-gray-500 font-sans font-bold">Appointed Director:</span>
                                    <span className="font-black text-gray-900 dark:text-gray-100 font-sans text-sm">
                                       {selectedProgramDetails.director_name || selectedProgramDetails.director_credentials?.name || "Program Director"}
                                    </span>
                                 </div>
                                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 pb-2">
                                    <span className="text-gray-500 font-sans font-bold">Director Role:</span>
                                    <span className="font-bold text-amber-600 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[11px]">
                                       Program Director (Ecosystem)
                                    </span>
                                 </div>
                                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 pb-2">
                                    <span className="text-gray-500 font-sans font-bold">Login Email:</span>
                                    <div className="flex items-center gap-1.5">
                                       <span className="font-bold text-gray-900 dark:text-gray-100">
                                          {selectedProgramDetails.director_email || selectedProgramDetails.director_credentials?.email}
                                       </span>
                                       <button
                                          onClick={() => handleCopyCredentials(selectedProgramDetails.director_email || selectedProgramDetails.director_credentials?.email)}
                                          className="p-1 rounded text-gray-400 hover:text-blue-600 transition"
                                          title="Copy Email"
                                       >
                                          <Copy className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 </div>
                                 {selectedProgramDetails.director_phone && (
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 pb-2">
                                       <span className="text-gray-500 font-sans font-bold">Phone Number:</span>
                                       <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-gray-900 dark:text-gray-100">
                                             {selectedProgramDetails.director_phone}
                                          </span>
                                          <button
                                             onClick={() => handleCopyCredentials(selectedProgramDetails.director_phone)}
                                             className="p-1 rounded text-gray-400 hover:text-blue-600 transition"
                                             title="Copy Phone"
                                          >
                                             <Copy className="w-3.5 h-3.5" />
                                          </button>
                                       </div>
                                    </div>
                                 )}
                                 <div className="flex justify-between items-center pt-1">
                                    <span className="text-gray-500 font-sans font-bold">Password:</span>
                                    <div className="flex items-center gap-2">
                                       <span className="font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-lg text-sm tracking-wider">
                                          {showPassword 
                                             ? (selectedProgramDetails.director_credentials?.password || "PD-20262026!") 
                                             : "••••••••••••"}
                                       </span>
                                       <button
                                          onClick={() => setShowPassword(p => !p)}
                                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 transition"
                                          title={showPassword ? "Hide password" : "Show password"}
                                       >
                                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                       </button>
                                       <button
                                          onClick={() => handleCopyCredentials(selectedProgramDetails.director_credentials?.password || "PD-20262026!")}
                                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                                          title="Copy Password"
                                       >
                                          <Copy className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              {/* Action buttons for credentials */}
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                 <Button
                                    onClick={() => {
                                       const pass = selectedProgramDetails.director_credentials?.password || "PD-20262026!";
                                       const text = `AGRI-NORIA PROGRAM DIRECTOR CREDENTIALS\nName: ${selectedProgramDetails.director_name || selectedProgramDetails.director_credentials?.name}\nProgram: ${selectedProgramDetails.name}\nRole: Program Director\nLogin Email: ${selectedProgramDetails.director_email || selectedProgramDetails.director_credentials?.email}\nPassword: ${pass}\nLogin Portal: https://agri-noria-frontend.vercel.app/auth/signin?redirect=/ecosystem/program-management`;
                                       handleCopyCredentials(text);
                                    }}
                                    className="h-9 px-4 rounded-xl font-bold bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-1.5 text-xs shadow-xs"
                                 >
                                    <Copy className="w-3.5 h-3.5" /> Copy Complete Handover Packet
                                 </Button>

                                 <Button
                                    onClick={() => setShowResetForm(prev => !prev)}
                                    variant="outline"
                                    className="h-9 px-3 rounded-xl font-bold border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 text-xs flex items-center gap-1.5"
                                 >
                                    <Key className="w-3.5 h-3.5" /> {showResetForm ? "Cancel Reset" : "Reset / Change Password"}
                                 </Button>
                              </div>

                              {/* Inline Password Reset Form */}
                              {showResetForm && (
                                 <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 space-y-3 mt-2 animate-in fade-in duration-200">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Set New Password for Director:</p>
                                    <div className="flex items-center gap-2">
                                       <Input
                                          type="text"
                                          placeholder="Enter new password (or leave blank to auto-generate)"
                                          value={newPasswordInput}
                                          onChange={(e) => setNewPasswordInput(e.target.value)}
                                          className="h-9 text-xs font-mono"
                                       />
                                       <Button
                                          onClick={() => handleResetDirectorPassword(selectedProgramDetails.id, newPasswordInput)}
                                          disabled={isResettingPassword}
                                          className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
                                       >
                                          {isResettingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Password"}
                                       </Button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-amber-300 dark:border-amber-700 text-center space-y-2">
                              <p className="text-xs text-gray-500 font-medium">No Program Director has been appointed to this program yet.</p>
                              <Button
                                 onClick={() => {
                                    setAppointingProgram(selectedProgramDetails);
                                    setSelectedProgramDetails(null);
                                 }}
                                 className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                              >
                                 <UserCheck className="w-3.5 h-3.5" /> Appoint Program Director Now
                              </Button>
                           </div>
                        )}
                     </div>

                     {/* 2. INSTITUTION DETAILS */}
                     <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="flex items-center gap-2">
                           <Landmark className="w-4 h-4 text-blue-600" />
                           <h4 className="text-sm font-black text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                              Institution & Sponsorship Overview
                           </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Institution Sponsor</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                                 {selectedProgramDetails.institution_name || currentUser?.company_name || (currentUser?.fname ? currentUser?.fname + " " + currentUser?.lname : "Institutional Partner")}
                              </span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Contact Email</span>
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                 {selectedProgramDetails.institution_email || currentUser?.email || "—"}
                              </span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Contact Phone</span>
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                 {selectedProgramDetails.institution_phone || currentUser?.phone || "—"}
                              </span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/40">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Program ID</span>
                              <span className="font-mono text-gray-600 dark:text-gray-300 text-[11px] truncate block" title={selectedProgramDetails.id}>
                                 {selectedProgramDetails.id}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* 3. PROGRAM OPERATIONAL TARGETS & FINANCIALS */}
                     <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                        <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                           Program Targets & Financial Allocations
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Commodity</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">{selectedProgramDetails.commodity}</span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Region</span>
                              <span className="font-black text-gray-900 dark:text-gray-100 text-sm">{selectedProgramDetails.region}</span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Hectares Target</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{parseFloat(selectedProgramDetails.target_hectares || 0).toLocaleString()} Ha</span>
                           </div>
                           <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <span className="text-gray-400 font-bold block text-[10px] uppercase">Fund Balance</span>
                              <span className="font-black text-blue-600 dark:text-blue-400 text-sm">₦{parseFloat(selectedProgramDetails.wallet_balance || 0).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                     <Button
                        onClick={() => {
                           setFundingProgram(selectedProgramDetails);
                           setSelectedProgramDetails(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                     >
                        <Coins className="w-3.5 h-3.5" /> Fund Program
                     </Button>
                     <div className="flex items-center gap-2">
                        <Button
                           onClick={() => {
                              handleOpenEdit(selectedProgramDetails);
                              setSelectedProgramDetails(null);
                           }}
                           variant="outline"
                           className="h-9 px-3 rounded-xl font-bold text-xs cursor-pointer"
                        >
                           <Edit3 className="w-3.5 h-3.5" /> Edit Program
                        </Button>
                        <Button
                           onClick={() => {
                              setSelectedProgramDetails(null);
                              setShowPassword(false);
                              setShowResetForm(false);
                           }}
                           variant="outline"
                           className="h-9 px-4 rounded-xl font-bold text-xs cursor-pointer"
                        >
                           Close
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {credentialModalData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                  <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/20 text-white">
                           <Key className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Credentials Issued</h3>
                           <p className="text-xs text-emerald-100 font-medium mt-0.5">Ready for Manual Handover</p>
                        </div>
                     </div>
                     <Button 
                        onClick={() => setCredentialModalData(null)}
                        variant="ghost" 
                        className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
                     >
                        <Plus className="w-5 h-5 rotate-45" />
                     </Button>
                  </div>

                  <div className="p-6 space-y-5">
                     <p className="text-xs text-gray-600 dark:text-gray-400">
                        {credentialModalData.emailSent ? (
                           <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> An onboarding email has been sent to the director.
                           </span>
                        ) : (
                           <span>Please give these login credentials directly to the appointed Program Director:</span>
                        )}
                     </p>

                     <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2.5 text-xs font-mono">
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
                           <span className="text-gray-500 font-sans font-bold">Appointee:</span>
                           <span className="font-bold text-gray-900 dark:text-gray-100">{credentialModalData.director.fname} {credentialModalData.director.lname}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
                           <span className="text-gray-500 font-sans font-bold">Role:</span>
                           <span className="font-bold text-amber-600">Program Director</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
                           <span className="text-gray-500 font-sans font-bold">Programme:</span>
                           <span className="font-bold text-gray-900 dark:text-gray-100">{credentialModalData.programName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
                           <span className="text-gray-500 font-sans font-bold">Login Email:</span>
                           <span className="font-bold text-gray-900 dark:text-gray-100">{credentialModalData.director.email}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                           <span className="text-gray-500 font-sans font-bold">Password:</span>
                           <span className="font-black text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded text-sm tracking-wider">
                              {credentialModalData.director.tempPassword || "Existing Password"}
                           </span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2">
                        <Button
                           onClick={() => {
                              const text = `AGRI-NORIA PROGRAM DIRECTOR CREDENTIALS\nName: ${credentialModalData.director.fname} ${credentialModalData.director.lname}\nProgram: ${credentialModalData.programName}\nRole: Program Director\nLogin Email: ${credentialModalData.director.email}\nPassword: ${credentialModalData.director.tempPassword}\nLogin Portal: https://agri-noria-frontend.vercel.app/auth/signin?redirect=/ecosystem/program-management`;
                              handleCopyCredentials(text);
                           }}
                           className="w-full h-11 rounded-xl font-bold bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2"
                        >
                           <Copy className="w-4 h-4" /> Copy Credentials for Handover
                        </Button>

                        <Button
                           onClick={() => setCredentialModalData(null)}
                           variant="outline"
                           className="w-full h-11 rounded-xl font-bold"
                        >
                           Done
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
