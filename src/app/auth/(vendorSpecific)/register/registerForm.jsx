"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import { Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { registerFormSchema } from "@/_lib/validations/validateSignupSignin";
import { FaSeedling, FaSpinner, FaChevronLeft } from "react-icons/fa6";
import { registerBridge } from "@/actions/authActions";
import { Country, State } from "country-state-city";
import { verifyVendorSession } from "@/actions/session";
import { resolveRedirectPath } from "@/utils/routeResolver";

const workspaceRoleCategories = {
   ecosystem: [
      {
         name: "Institution",
         roles: ["Government", "Bank", "NGO", "DFI", "Commodity Board", "Finance", "Producer Association", "Cooperative", "Research Institution"],
      },
      {
         name: "Insurance",
         roles: ["Insurance"],
      },
      {
         name: "Storage",
         roles: ["Storage"],
      },
      {
         name: "Logistics",
         roles: ["Logistics"],
      },
      {
         name: "Distributor",
         roles: ["Distributor"],
      },
      {
         name: "Program Management",
         roles: ["Program Director", "Regional Manager", "Cluster Supervisor"],
      },
      {
         name: "Field Operations",
         roles: ["Field Officer", "Agronomist", "Inspector", "Enumerator"],
      },
      {
         name: "Farmer",
         roles: ["Farmer"],
      },
      {
         name: "Buyer / Partner",
         roles: ["Exporter", "Off-taker", "Warehouse Buyer", "Processor", "Logistics Partner"],
      },
      {
         name: "Aggregator",
         roles: ["Aggregator"],
      },
      {
         name: "Sales & Distribution",
         roles: ["Sales Manager", "Logistics Coordinator", "Warehouse Supervisor"],
      },
      {
         name: "Intelligence & Monitoring",
         roles: ["Data Analyst", "Satellite Monitor", "Field Auditor"],
      },
   ],

   marketplace: [
      {
         name: "Marketplace Sellers",
         roles: ["Seller"],
      },
      {
         name: "Logistics & Fulfillment",
         roles: ["Logistics"],
      },
      {
         name: "Drone Marketplace & Services",
         roles: ["Drone"],
      },
      {
         name: "Storage & Warehousing",
         roles: ["Storage Facility"],
      },
      {
         name: "Farmers",
         roles: ["Farmer"],
      },
      {
         name: "Agricultural Trainers",
         roles: ["Trainer"],
      },
      {
         name: "Farm Development",
         roles: ["Farm Development"],
      },
   ],
};

const workspaceOptions = [
   {
      id: "ecosystem",
      title: "Ecosystem Program",
      description: "Join national and regional agricultural programs, institutions, and cooperative networks.",
   },
   {
      id: "marketplace",
      title: "Marketplace & Services",
      description: "Buy, sell produce, agro-inputs, logistics, drone services, and warehousing.",
   },
];

export function RegisterForm() {
   const router = useRouter();
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState({});

   const [formData, setFormData] = useState({
      workspace: "",
      role: "",
      fname: "",
      lname: "",
      email: "",
      phone: "",
      pword: "",
      confirmPword: "",
      terms_of_service: false,
      country_name: "",
      country_code: "",
      state_code: "",
      state_name: "",
      currency: "",
   });

   // Multistep state: 0 = Workspace, 1 = Role, 2 = Account & Security (Email + Password unified)
   const [currentStep, setCurrentStep] = useState(0);
   const availableStates = formData.country_code ? State.getStatesOfCountry(formData.country_code) : [];
   const [expandedCategory, setExpandedCategory] = useState(null);
   const [ecosystemSettings, setEcosystemSettings] = useState({
      platformName: "Agri-Noria",
      platformEmail: "support@agrinoria.com",
      supportPhone: "+234 800 2474 66742",
      maintenanceMode: false,
      allowNewRegistrations: true,
   });

   useEffect(() => {
      fetch("/api/proxy/ecosystem/settings", { cache: "no-store" })
         .then((res) => (res.ok ? res.json() : null))
         .then((json) => {
            if (json?.data) {
               setEcosystemSettings((prev) => ({ ...prev, ...json.data }));
            }
         })
         .catch(() => {});
   }, []);

   const totalSteps = 2;

   const selectedWorkspaceTitle = workspaceOptions.find((workspace) => workspace.id === formData.workspace)?.title || "";
   const selectedRoleCategories = workspaceRoleCategories[formData.workspace] || [];

   const handleWorkspaceSelect = (workspaceId) => {
      if (workspaceId === "ecosystem") {
         if (ecosystemSettings.maintenanceMode) {
            toast.error(
               `${ecosystemSettings.platformName} Ecosystem is currently under Emergency Maintenance Mode. Please try again later or contact ${ecosystemSettings.platformEmail}.`
            );
            return;
         }
         if (ecosystemSettings.allowNewRegistrations === false) {
            toast.error(
               `Public registrations for the ${ecosystemSettings.platformName} Ecosystem are currently closed by Platform Governance. Contact ${ecosystemSettings.platformEmail} (${ecosystemSettings.supportPhone}) for institutional onboarding.`
            );
            return;
         }
      }
      setFormData((prev) => ({
         ...prev,
         workspace: workspaceId,
         role: "",
      }));
      setExpandedCategory(null);
      setCurrentStep(1);
   };

   const handleRoleSelect = (role) => {
      setFormData((prev) => ({
         ...prev,
         role,
      }));
      setCurrentStep(2);
   };

   const validateStep = (step) => {
      if (step === 0) return !!formData.workspace;
      if (step === 1) return !!formData.role;
      if (step === 2) {
         const schemaWithMatch = registerFormSchema.refine((data) => data.pword === data.confirmPword, {
            path: ["confirmPword"],
            message: "Passwords do not match",
         });

         const result = schemaWithMatch.safeParse(formData);
         if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({ err: fieldErrors });

            const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
            if (firstMsg) toast.error(firstMsg);
            return false;
         }
         setErrors({});
         return true;
      }
      return true;
   };

   // Handle input field change
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => {
         const newFormData = { ...prev, [name]: value };

         // Auto-populate country utils when country or state changes
         if (name === "country_code") {
            const country = Country.getCountryByCode(value);
            newFormData.country_name = country?.name || "";
            newFormData.currency = country?.currency || "";
            const states = value ? State.getStatesOfCountry(value) : [];
            if (value && states.length === 0) {
               newFormData.state_code = value;
               newFormData.state_name = country?.name || "National";
            } else {
               newFormData.state_code = "";
               newFormData.state_name = "";
            }
         } else if (name === "state_code") {
            const states = newFormData.country_code ? State.getStatesOfCountry(newFormData.country_code) : [];
            const state = states.find((s) => s.isoCode === value);
            newFormData.state_name = state?.name || (states.length === 0 ? newFormData.country_name : "");
         }

         return newFormData;
      });
      setErrors({});
   };

   const handleBack = () => {
      setErrors({});
      setCurrentStep((step) => Math.max(0, step - 1));
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (currentStep < totalSteps) {
         if (validateStep(currentStep)) {
            setCurrentStep((s) => Math.min(totalSteps, s + 1));
         }
         return;
      }

      const normalizedData = {
         ...formData,
         fname: formData.fname.trim(),
         lname: formData.lname.trim(),
         email: formData.email.trim().toLowerCase(),
         role: formData.role.toLowerCase(),
         phone: formData.phone.trim(),
         pword: formData.pword.trim(),
      };

      setErrors({});

      const schemaWithMatch = registerFormSchema.refine((data) => data.pword === data.confirmPword, {
         path: ["confirmPword"],
         message: "Passwords do not match",
      });

      const finalCheck = schemaWithMatch.safeParse(normalizedData);
      if (!finalCheck.success) {
         const fieldErrors = finalCheck.error.flatten().fieldErrors;
         setErrors({ err: fieldErrors });
         const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
         if (firstMsg) toast.error(firstMsg);
         return;
      }

      setIsLoading(true);
      try {
         const res = await registerBridge(normalizedData);

         if (!res?.success) {
            setIsLoading(false);
            const errorMsg = Array.isArray(res.error) ? res.error.join(" ") : String(res.error || "Failed to register");
            if (errorMsg.toLowerCase().includes("already in use") || errorMsg.toLowerCase().includes("already registered")) {
               toast.info("An account with this email already exists! You can sign in directly.", { autoClose: 5000 });
               setErrors({ general: "This email is already registered. Please sign in with your credentials." });
            } else {
               toast.error(errorMsg);
            }
            return;
         }

         setErrors({});
         setFormData({
            workspace: "",
            role: "",
            fname: "",
            lname: "",
            email: "",
            phone: "",
            state_code: "",
            country_name: "",
            country_code: "",
            state_name: "",
            currency: "",
            pword: "",
            confirmPword: "",
            terms_of_service: false,
         });

         setShowPassword(false);
         setShowConfirmPassword(false);
         toast.success("Account created successfully!");

         const session = await verifyVendorSession();

         if (session.authenticated) {
            const { workspace, role } = session;
            const normRole = role?.toLowerCase();
            if (workspace?.toLowerCase() === "ecosystem" && normRole === "farmer") {
               router.push("/ecosystem/farmer/onboarding");
            } else if (workspace?.toLowerCase() === "ecosystem" && ["storage", "storage facility", "storage_facility"].includes(normRole)) {
               router.push("/ecosystem/storage/onboarding");
            } else if (workspace?.toLowerCase() === "ecosystem" && ["logistics", "logistics partner", "logistic"].includes(normRole)) {
               router.push("/ecosystem/logistics/onboarding");
            } else {
               router.push(resolveRedirectPath(role, workspace));
            }
         }
         router.refresh();
      } catch (err) {
         setErrors((prev) => ({
            ...prev,
            general: "Internal server error. Please try again.",
         }));
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-(--background) flex items-center justify-center p-4 py-12">
         <div className="w-full max-w-2xl">
            {/* Header with agricultural brand icon */}
            <div className="text-center mb-6">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
                  <FaSeedling className="w-7 h-7" />
               </div>
               <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create your account</h1>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                  Join the Agri-Noria ecosystem to empower agricultural trade and operations
               </p>
            </div>

            <Card className="border border-emerald-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden p-2 sm:p-4">
               <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-900">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {currentStep === 0 && "Step 1: Choose Workspace"}
                        {currentStep === 1 && "Step 2: Choose Your Role"}
                        {currentStep === 2 && "Step 3: Account & Security Details"}
                     </CardTitle>
                     <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Step {currentStep + 1} of {totalSteps + 1}
                     </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full mt-3">
                     <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                           className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                           style={{ width: `${((currentStep + 1) / (totalSteps + 1)) * 100}%` }}
                        />
                     </div>
                  </div>
               </CardHeader>

               <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} noValidate>
                     {/* Step 0: Workspace Selection */}
                     {currentStep === 0 && (
                        <div className="space-y-4">
                           <div className="text-center mb-4">
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">Select Your Workspace Type</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Pick how you interact with the Agri-Noria agricultural network</p>
                           </div>

                           <div className="grid gap-3">
                              {workspaceOptions.map((workspace) => {
                                 const isEcosystemBlocked =
                                    workspace.id === "ecosystem" &&
                                    (ecosystemSettings.maintenanceMode || ecosystemSettings.allowNewRegistrations === false);
                                 return (
                                    <button
                                       key={workspace.id}
                                       type="button"
                                       className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                          isEcosystemBlocked
                                             ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 opacity-80 cursor-not-allowed"
                                             : "border-emerald-50 dark:border-gray-800 bg-emerald-50/30 dark:bg-gray-900/40 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/60"
                                       }`}
                                       onClick={() => handleWorkspaceSelect(workspace.id)}
                                    >
                                       <div className="space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                             <span className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 block text-sm sm:text-base">
                                                {workspace.title}
                                             </span>
                                             {workspace.id === "ecosystem" && ecosystemSettings.maintenanceMode && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white">
                                                   503 Maintenance
                                                </span>
                                             )}
                                             {workspace.id === "ecosystem" && !ecosystemSettings.maintenanceMode && ecosystemSettings.allowNewRegistrations === false && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-600 text-white">
                                                   Registrations Closed
                                                </span>
                                             )}
                                          </div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                             {workspace.description}
                                          </p>
                                       </div>
                                       <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all ml-3 shrink-0">
                                          <ChevronRight className="h-4 w-4" />
                                       </div>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Step 1: Role Selection */}
                     {currentStep === 1 && (
                        <div className="space-y-4">
                           <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                              <div className="text-xs">
                                 <span className="text-gray-500">Selected Workspace: </span>
                                 <span className="font-bold text-emerald-800 dark:text-emerald-300">{selectedWorkspaceTitle}</span>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => setCurrentStep(0)}
                                 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                              >
                                 Change
                              </button>
                           </div>

                           <div className="text-center">
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">Select Your Organization Role</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Click your category to select your exact operational title</p>
                           </div>

                           <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {selectedRoleCategories.map((category) => (
                                 <div key={category.name} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                                    <button
                                       type="button"
                                       className="w-full flex items-center justify-between p-3.5 hover:bg-emerald-50/40 dark:hover:bg-gray-800/60 transition-colors"
                                       onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                                    >
                                       <span className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">{category.name}</span>
                                       {expandedCategory === category.name ? (
                                          <ChevronDown className="w-4 h-4 text-emerald-600" />
                                       ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-400" />
                                       )}
                                    </button>

                                    {expandedCategory === category.name && (
                                       <div className="p-2.5 pt-0 grid gap-1.5 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                                          {category.roles.map((role) => (
                                             <button
                                                key={role}
                                                type="button"
                                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-between group"
                                                onClick={() => handleRoleSelect(role)}
                                             >
                                                <span>{role}</span>
                                                <FaSeedling className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                             </button>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Step 2: Account Details & Security (EMAIL & PASSWORD IN SAME PLACE) */}
                     {currentStep === 2 && (
                        <div className="space-y-5">
                           {/* Workspace & Role Summary Chips */}
                           <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                              <div className="flex items-center gap-2">
                                 <span className="font-medium text-gray-600 dark:text-gray-400">Workspace:</span>
                                 <span className="font-bold text-emerald-800 dark:text-emerald-300">{selectedWorkspaceTitle}</span>
                                 <span className="text-gray-300 dark:text-gray-700">|</span>
                                 <span className="font-medium text-gray-600 dark:text-gray-400">Role:</span>
                                 <span className="font-bold text-emerald-800 dark:text-emerald-300">{formData.role}</span>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => setCurrentStep(1)}
                                 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                              >
                                 Change Role
                              </button>
                           </div>

                           {/* Names */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <Label htmlFor="fname" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    First Name
                                 </Label>
                                 <Input
                                    autoFocus
                                    id="fname"
                                    type="text"
                                    autoComplete="given-name"
                                    className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                    disabled={isLoading}
                                    placeholder="e.g. Samuel"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    required
                                 />
                                 {errors.err?.fname && <p className="text-rose-500 text-xs font-bold">{errors.err.fname[0] || errors.err.fname}</p>}
                              </div>

                              <div className="space-y-1.5">
                                 <Label htmlFor="lname" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Last Name
                                 </Label>
                                 <Input
                                    id="lname"
                                    type="text"
                                    autoComplete="family-name"
                                    className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                    disabled={isLoading}
                                    placeholder="e.g. Adeleke"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    required
                                 />
                                 {errors.err?.lname && <p className="text-rose-500 text-xs font-bold">{errors.err.lname[0] || errors.err.lname}</p>}
                              </div>
                           </div>

                           {/* Contact Info (Email & Phone) */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Email Address
                                 </Label>
                                 <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="farmer@agrinoria.eco"
                                    name="email"
                                    className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                    disabled={isLoading}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                 />
                                 {errors.err?.email && <p className="text-rose-500 text-xs font-bold">{errors.err.email[0] || errors.err.email}</p>}
                              </div>

                              <div className="space-y-1.5">
                                 <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Phone Number
                                 </Label>
                                 <Input
                                    id="phone"
                                    autoComplete="tel"
                                    type="tel"
                                    className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                    disabled={isLoading}
                                    placeholder="08012345678"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                 />
                                 {errors.err?.phone && <p className="text-rose-500 text-xs font-bold">{errors.err.phone[0] || errors.err.phone}</p>}
                              </div>
                           </div>

                           {/* Country & State */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <Label htmlFor="country_code" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Country
                                 </Label>
                                 <select
                                    name="country_code"
                                    id="country_code"
                                    value={formData.country_code}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoading}
                                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                 >
                                    <option value="">Select Country</option>
                                    {Country.getAllCountries().map((country) => (
                                       <option key={country.isoCode} value={country.isoCode}>
                                          {country.name}
                                       </option>
                                    ))}
                                 </select>
                                 {errors.err?.country_code && <p className="text-rose-500 text-xs font-bold">{errors.err.country_code[0] || errors.err.country_code}</p>}
                              </div>

                              <div className="space-y-1.5">
                                 <div className="flex justify-between items-center">
                                    <Label htmlFor={availableStates.length > 0 ? "state_code" : "state_name"} className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                       State / Region
                                    </Label>
                                    {formData.country_code && availableStates.length === 0 && (
                                       <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                          Auto-detected
                                       </span>
                                    )}
                                 </div>

                                 {availableStates.length > 0 ? (
                                    <select
                                       name="state_code"
                                       id="state_code"
                                       value={formData.state_code}
                                       onChange={handleInputChange}
                                       required
                                       disabled={isLoading}
                                       className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    >
                                       <option value="">Select State / Province</option>
                                       {availableStates.map((state) => (
                                          <option key={state.isoCode} value={state.isoCode}>
                                             {state.name}
                                          </option>
                                       ))}
                                    </select>
                                 ) : formData.country_code ? (
                                    <Input
                                       id="state_name"
                                       name="state_name"
                                       type="text"
                                       placeholder={formData.country_name ? `${formData.country_name} (National)` : "Enter State or Region"}
                                       value={formData.state_name}
                                       onChange={(e) => {
                                          const val = e.target.value;
                                          setFormData((prev) => ({
                                             ...prev,
                                             state_name: val,
                                             state_code: val ? (prev.country_code || "NA") : "",
                                          }));
                                       }}
                                       required
                                       className={`h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                       disabled={isLoading}
                                    />
                                 ) : (
                                    <select disabled className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-400 cursor-not-allowed">
                                       <option>Select country first</option>
                                    </select>
                                 )}

                                 {errors.err?.state_code && (
                                    <p className="text-rose-500 text-xs font-bold">
                                       {errors.err.state_code[0] || errors.err.state_code}
                                    </p>
                                 )}
                              </div>
                           </div>

                           {/* Passwords (IN SAME PLACE WITH EMAIL) */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1.5">
                                 <Label htmlFor="pword" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Password
                                 </Label>
                                 <div className="relative">
                                    <Input
                                       id="pword"
                                       autoComplete="new-password"
                                       type={showPassword ? "text" : "password"}
                                       placeholder="Min. 8 chars, 1 number & symbol"
                                       className={`h-11 pr-10 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                       disabled={isLoading}
                                       name="pword"
                                       value={formData.pword}
                                       onChange={handleInputChange}
                                       required
                                    />
                                    <Button
                                       type="button"
                                       className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0"
                                       onClick={() => setShowPassword(!showPassword)}
                                    >
                                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                 </div>
                                 {errors.err?.pword && <p className="text-rose-500 text-xs font-bold">{errors.err.pword[0] || errors.err.pword}</p>}
                              </div>

                              <div className="space-y-1.5">
                                 <Label htmlFor="confirmPword" className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    Confirm Password
                                 </Label>
                                 <div className="relative">
                                    <Input
                                       id="confirmPword"
                                       type={showConfirmPassword ? "text" : "password"}
                                       placeholder="Re-enter your password"
                                       className={`h-11 pr-10 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 ${isLoading ? "opacity-50" : ""}`}
                                       disabled={isLoading}
                                       name="confirmPword"
                                       value={formData.confirmPword}
                                       onChange={handleInputChange}
                                       required
                                    />
                                    <Button
                                       type="button"
                                       className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0"
                                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                       {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                 </div>
                                 {errors.err?.confirmPword && <p className="text-rose-500 text-xs font-bold">{errors.err.confirmPword[0] || errors.err.confirmPword}</p>}
                              </div>
                           </div>

                           {/* Terms of Service */}
                           <div className="pt-2">
                              <div className="flex items-center space-x-2.5">
                                 <input
                                    type="checkbox"
                                    id="terms_of_service"
                                    checked={formData.terms_of_service}
                                    disabled={isLoading}
                                    name="terms_of_service"
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 cursor-pointer"
                                    onChange={(e) =>
                                       setFormData((prev) => ({
                                          ...prev,
                                          terms_of_service: e.target.checked,
                                       }))
                                    }
                                 />
                                 <Label htmlFor="terms_of_service" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                       Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                                       Privacy Policy
                                    </Link>
                                 </Label>
                              </div>
                              {errors.err?.terms_of_service && (
                                 <p className="text-rose-500 text-xs font-bold mt-1">{errors.err.terms_of_service[0] || errors.err.terms_of_service}</p>
                              )}
                           </div>
                        </div>
                     )}

                     {errors.general && (
                        <div className="p-3 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold">
                           {errors.general}
                        </div>
                     )}

                     {/* Navigation / Action Buttons */}
                     <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between gap-3">
                        {currentStep > 0 ? (
                           <Button
                              type="button"
                              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                              onClick={handleBack}
                              disabled={isLoading}
                           >
                              <FaChevronLeft className="w-3 h-3" /> Back
                           </Button>
                        ) : (
                           <div></div>
                        )}

                        {currentStep < totalSteps ? (
                           <Button
                              type="button"
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all ml-auto"
                              onClick={() => {
                                 if (validateStep(currentStep)) {
                                    setCurrentStep((s) => s + 1);
                                 }
                              }}
                              disabled={isLoading}
                           >
                              <span>Next Step</span>
                              <ChevronRight className="w-4 h-4" />
                           </Button>
                        ) : (
                           <Button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all w-full sm:w-auto ml-auto"
                              disabled={isLoading}
                           >
                              {isLoading ? (
                                 <span className="flex items-center gap-2">
                                    <FaSpinner className="h-4 w-4 animate-spin" />
                                    <span>Creating Account...</span>
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-2">
                                    <FaSeedling className="w-4 h-4" />
                                    <span>Create Account</span>
                                 </span>
                              )}
                           </Button>
                        )}
                     </div>
                  </form>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 text-center">
                     <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                           Sign In
                        </Link>
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
