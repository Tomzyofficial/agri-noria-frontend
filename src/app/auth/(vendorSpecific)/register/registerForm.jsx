"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { registerFormSchema } from "@/_lib/validations/validateSignupSignin";
import { FaSpinner } from "react-icons/fa6";
import { registerBridge } from "@/actions/authActions";
import { Country, State } from "country-state-city";
import { ChevronDown, ChevronRight } from "lucide-react";
import { verifyVendorSession } from "@/actions/session";

const workspaceRoleCategories = {
  ecosystem: [
    {
      name: "Institution",
      roles: [
        "Government",
        "Bank",
        "NGO",
        "DFI",
        "Insurance Firm",
        "Commodity Board",
        "Finance",
        "Distributor",
      ],
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
      roles: [
        "Exporter",
        "Off-taker",
        "Warehouse Buyer",
        "Processor",
        "Logistics Partner",
      ],
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
  ],
};

const workspaceOptions = [
  {
    id: "ecosystem",
    title: "Ecosystem Program",
  },

  {
    id: "marketplace",
    title: "Marketplace",
  },
];

// const roleCategories = [
//   {
//     name: "Institution",
//     roles: [
//       "Government",
//       "Bank",
//       "NGO",
//       "DFI",
//       "Insurance Firm",
//       "Commodity Board",
//       "Finance",
//       "Distributor",
//     ],
//   },
//   {
//     name: "Program Management",
//     roles: ["Program Director", "Regional Manager", "Cluster Supervisor"],
//   },
//   {
//     name: "Field Operations",
//     roles: ["Field Officer", "Agronomist", "Inspector", "Enumerator"],
//   },
//   {
//     name: "Farm Development",
//     roles: ["Farm Development"],
//   },
//   {
//     name: "Farmer",
//     roles: ["Farmer"],
//   },
//   {
//     name: "Logistics & Supply Chain",
//     roles: ["Logistics_Partner"],
//   },
//   {
//     name: "Buyer / Partner",
//     roles: [
//       "Exporter",
//       "Off-taker",
//       "Warehouse Buyer",
//       "Processor",
//       "Logistics Partner",
//     ],
//   },
//   {
//     name: "Aggregator",
//     roles: ["Aggregator"],
//   },
//   {
//     name: "Sales & Distribution",
//     roles: ["Sales Manager", "Logistics Coordinator", "Warehouse Supervisor"],
//   },
//   {
//     name: "Intelligence & Monitoring",
//     roles: ["Data Analyst", "Satellite Monitor", "Field Auditor"],
//   },
// ];

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
    //  account_type: "",
    pword: "",
    confirmPword: "",
    terms_of_service: false,
    country_name: "",
    country_code: "",
    state_code: "",
    state_name: "",
    currency: "",
  });

  // Multistep state
  const [currentStep, setCurrentStep] = useState(0); // Step 0 is Role Selection
  const [expandedCategory, setExpandedCategory] = useState(null);

  const totalSteps = 4;

  const selectedWorkspaceTitle =
    workspaceOptions.find((workspace) => workspace.id === formData.workspace)
      ?.title || "";

  const selectedRoleCategories =
    workspaceRoleCategories[formData.workspace] || [];

  const handleWorkspaceSelect = (workspaceId) => {
    setFormData((prev) => ({
      ...prev,
      workspace: workspaceId,
      role: "",
      // account_type: "",
    }));
    setExpandedCategory(null);
    setCurrentStep(1);
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // account_type: role,
    }));
    setCurrentStep(2);
  };

  const validateWithSchemaForStep = (step) => {
    let schemaForStep = registerFormSchema;

    if (step === 2) {
      schemaForStep = registerFormSchema.pick({
        fname: true,
        lname: true,
        email: true,
        phone: true,
        //   account_type: true,
        country_code: true,
        state_code: true,
      });
    } else if (step === 3) {
      schemaForStep = registerFormSchema
        .pick({ pword: true, confirmPword: true })
        .refine((data) => data.pword === data.confirmPword, {
          path: ["confirmPword"],
          message: "Passwords do not match",
        });
    } else if (step === 4) {
      schemaForStep = registerFormSchema.pick({ terms_of_service: true });
    }

    const result = schemaForStep.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ err: fieldErrors });

      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
      if (firstMsg) toast.error(firstMsg);

      return false;
    }

    setErrors({});
    return true;
  };

  const validateStep = (step) => {
    if (step === 0) return !!formData.workspace;
    if (step === 1) return !!formData.role;
    return validateWithSchemaForStep(step);
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
        newFormData.state_code = ""; // Reset state when country changes
        newFormData.state_name = ""; // Reset state name
      } else if (name === "state_code") {
        const state = State.getStatesOfCountry(newFormData.country_code).find(
          (state) => state.isoCode === value,
        );
        newFormData.state_name = state?.name || "";
      }

      return newFormData;
    });
    setErrors({}); // Clear error on change
  };

  // Schema-based validation per step and final submit
  //   const validateWithSchemaForStep = (step) => {
  //     let schemaForStep = registerFormSchema;
  //     if (step === 1) {
  //       schemaForStep = registerFormSchema.pick({
  //         fname: true,
  //         lname: true,
  //         email: true,
  //       });
  //     } else if (step === 2) {
  //       schemaForStep = registerFormSchema.pick({
  //         phone: true,
  //         account_type: true,
  //         country_code: true,
  //         state_code: true,
  //       });
  //     } else if (step === 3) {
  //       schemaForStep = registerFormSchema
  //         .pick({ pword: true, confirmPword: true })
  //         .refine((data) => data.pword === data.confirmPword, {
  //           path: ["confirmPword"],
  //           message: "Passwords do not match",
  //         });
  //     } else if (step === 4) {
  //       schemaForStep = registerFormSchema.pick({ terms_of_service: true });
  //     }

  //     const result = schemaForStep.safeParse(formData);
  //     if (!result.success) {
  //       const fieldErrors = result.error.flatten().fieldErrors;
  //       setErrors({ err: fieldErrors });
  //       // Show the first error message if available
  //       const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
  //       if (firstMsg) toast.error(firstMsg);
  //       return false;
  //     }
  //     setErrors({});
  //     return true;
  //   };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(totalSteps, s + 1));
    }
  };

  //   const handleBack = () => {
  //     setErrors({});
  //     if (currentStep === 1) {
  //       setCurrentStep(0); // Go back to role selection
  //     } else {
  //       setCurrentStep((s) => Math.max(1, s - 1));
  //     }
  //   };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  // Handle form submission (final step)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedData = {
      ...formData,
      fname: formData.fname.trim(),
      lname: formData.lname.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role.toLowerCase(),
      phone: formData.phone.trim(),
      pword: formData.pword.trim(),
    };

    // If not last step, advance instead of submitting
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    // Clear prev errors
    setErrors({});

    // Final full-schema validation before submit
    const finalCheck = registerFormSchema.safeParse(normalizedData);
    if (!finalCheck.success) {
      const fieldErrors = finalCheck.error.flatten().fieldErrors;
      setErrors({ err: fieldErrors });
      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean);
      if (firstMsg) toast.error(firstMsg);
      return;
    }

    // Call register-auth endpoint to perform registration
    setIsLoading(true);
    try {
      const res = await registerBridge(normalizedData);

      if (!res?.success) {
        setIsLoading(false);
        toast.error([res.error].join(" ") || "Failed to register");
        return;
      }

      setErrors({});

      // clear form fields value on successful submission and registration
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
      console.log(session);

      if (session.authenticated) {
        const { workspace, role } = session;
        if (workspace === "ecosystem") {
          router.push("/onboarding");
        } else {
          router.push(
            `/${workspace}/${role.toLowerCase().replace(/\s+/g, "-")}`,
          );
        }
      }
      router.refresh();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "Internal server error. Please try again.",
      }));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-(--background) flex items-center justify-center p-4 pb-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 text-(--foreground)">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm">Follow the steps to get started</p>
        </div>

        <Card className="px-4 py-5">
          <CardHeader className="pb-4">
            <CardTitle className="font-semibold text-(--foreground)">
              Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress bar */}
            <div className="w-full mb-6">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-(--greenish-color) rounded-full transition-all"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Step 0: Role Selection */}
              {/* Step 0: Workspace Selection */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-center mb-4">
                    Select Your Workspace Type
                  </h3>

                  <div className="space-y-2">
                    {workspaceOptions.map((workspace) => (
                      <button
                        key={workspace.id}
                        type="button"
                        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleWorkspaceSelect(workspace.id)}
                      >
                        <span className="font-medium">{workspace.title}</span>
                        {/* <ChevronRight className="h-4 w-4" /> */}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-center">
                    Select Your Role
                  </h3>

                  <p className="text-sm text-center text-muted-foreground">
                    Workspace: {selectedWorkspaceTitle}
                  </p>

                  <div className="space-y-2">
                    {selectedRoleCategories.map((category) => (
                      <div
                        key={category.name}
                        className="border rounded-md overflow-hidden"
                      >
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === category.name
                                ? null
                                : category.name,
                            )
                          }
                        >
                          <span className="font-medium text-(--foreground)">
                            {category.name}
                          </span>

                          {expandedCategory === category.name ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>

                        {expandedCategory === category.name && (
                          <div className="p-2 bg-white dark:bg-(--background) grid gap-2">
                            {category.roles.map((role) => (
                              <button
                                key={role}
                                type="button"
                                className="w-full text-left p-2 pl-6 hover:bg-(--greenish-color) hover:text-white rounded transition-colors text-sm"
                                onClick={() => handleRoleSelect(role)}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Personal Info */}
              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid md:grid-cols-2 gap-4 rounded-md bg-gray-50 dark:bg-gray-800 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Workspace</p>
                      <p className="font-medium">{selectedWorkspaceTitle}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="font-medium">{formData.role}</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fname" className="text-start block">
                      First Name
                    </label>
                    <Input
                      autoFocus
                      id="fname"
                      type="text"
                      autoComplete="on"
                      className={isLoading ? "opacity-50" : ""}
                      disabled={isLoading}
                      placeholder="Enter your first name"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.err?.fname && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.fname[0] || errors.err.fname}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lname" className="text-start block">
                      Last Name
                    </Label>
                    <Input
                      id="lname"
                      type="text"
                      autoComplete="on"
                      className={isLoading ? "opacity-50" : ""}
                      disabled={isLoading}
                      placeholder="Enter your last name"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.err?.lname && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.lname[0] || errors.err.lname}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email" className="text-start block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="on"
                      placeholder="john@example.com"
                      name="email"
                      className={isLoading ? "opacity-50" : ""}
                      disabled={isLoading}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.err?.email && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.email[0] || errors.err.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Account */}
              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-start block">
                      Phone Number
                    </Label>
                    <Input
                      autoFocus
                      id="phone"
                      autoComplete="on"
                      type="tel"
                      className={isLoading ? "opacity-50" : ""}
                      disabled={isLoading}
                      placeholder="Enter your phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.err?.phone && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.phone[0] || errors.err.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country_code">Country</Label>
                    <select
                      name="country_code"
                      id="country_code"
                      value={formData.country_code}
                      onChange={handleInputChange}
                      required
                    >
                      {Country.getAllCountries().map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    {errors.err?.country_code && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.country_code[0] || errors.err.country_code}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state_code">State</Label>
                    <select
                      name="state_code"
                      id="state_code"
                      value={formData.state_code}
                      onChange={handleInputChange}
                      required
                    >
                      {State.getStatesOfCountry(formData.country_code).map(
                        (state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ),
                      )}
                    </select>
                    {errors.err?.state_code && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.state_code[0] || errors.err.state_code}
                      </p>
                    )}
                  </div>

                  {/* Hidden inputs for country utils data */}
                  <div className="hidden">
                    <input
                      type="hidden"
                      name="country_name"
                      value={
                        Country.getCountryByCode(formData.country_code)?.name ||
                        ""
                      }
                      readOnly
                    />
                    <input
                      type="hidden"
                      name="state_name"
                      value={
                        State.getStatesOfCountry(formData.country_code).find(
                          (state) => state.isoCode === formData.state_code,
                        )?.name || ""
                      }
                      readOnly
                    />
                    <input
                      type="hidden"
                      name="currency"
                      value={
                        Country.getCountryByCode(formData.country_code)
                          ?.currency || ""
                      }
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pword" className="block text-start">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        autoFocus
                        id="pword"
                        autoComplete="off"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className={isLoading ? "opacity-50" : ""}
                        disabled={isLoading}
                        name="pword"
                        value={formData.pword}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.err?.pword && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.pword[0] || errors.err.pword}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPword" className="block text-start">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={isLoading ? "opacity-50" : ""}
                        disabled={isLoading}
                        name="confirmPword"
                        value={formData.confirmPword}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.err?.confirmPword && (
                      <p className="text-start text-red-400 dark:text-red-300 text-sm">
                        {errors.err.confirmPword[0] || errors.err.confirmPword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Terms & Submit */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="checkbox"
                      id="terms_of_service"
                      checked={formData.terms_of_service}
                      disabled={isLoading}
                      name="terms_of_service"
                      className={isLoading ? "opacity-50" : ""}
                      value=""
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          terms_of_service: e.target.checked,
                        }))
                      }
                    />
                    <Label htmlFor="terms_of_service" className="specialLabel">
                      I agree to the{" "}
                      <Link
                        href=""
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href=""
                        className="text-sm text-blue-500 hover:underline "
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.err?.terms_of_service && (
                    <p className="text-start text-red-400 dark:text-red-300 text-sm mb-5">
                      {errors.err.terms_of_service[0] ||
                        errors.err.terms_of_service}
                    </p>
                  )}
                </div>
              )}

              {errors.general && (
                <p className="text-start text-red-400 dark:text-red-300 text-sm">
                  {errors.general}
                </p>
              )}

              {/* Navigation Buttons */}
              {currentStep > 0 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    className={`${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    } bg-gray-200 dark:bg-gray-500 text-(--foreground) px-4 py-2 rounded-md`}
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      className={`${
                        isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } bg-(--greenish-color) text-(--white-fff) px-4 py-2 rounded-md`}
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className={`${
                        isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } transition transition-background w-full bg-(--greenish-color) hover:bg-(--dark-green-color) text-(--white-fff) font-normal p-2 rounded-md`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex justify-center items-center gap-2">
                          <FaSpinner className="h-4 w-4 animate-spin" />
                          <span>Please wait...</span>
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-blue-500 hover:underline"
                >
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
