"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { signinSchema } from "@/_lib/validations/validateSignupSignin";
import { useRouter } from "next/navigation";

// import { FcGoogle } from "react-icons/fc";

/************* Lucide Icons *************/
import { Eye, EyeOff } from "lucide-react";
import { FaSpinner } from "react-icons/fa6";
import { signinBridge } from "@/actions/authActions";
import { verifyVendorSession } from "@/actions/session";

export function SigninForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const roleConfig = {
    // Institution
    government: {
      category: "Institution",
    },
    bank: {
      category: "Institution",
    },
    ngo: {
      category: "Institution",
    },
    dfi: {
      category: "Institution",
    },
    "insurance firm": {
      category: "Institution",
    },
    "commodity board": {
      category: "Institution",
    },
    finance: {
      category: "Institution",
    },
    distributor: {
      category: "Distributor",
    },
    // Program Management
    "program director": {
      category: "Program Management",
    },
    "regional manager": {
      category: "Program Management",
    },
    "cluster supervisor": {
      category: "Program Management",
    },
    // Field Operations
    "field officer": {
      category: "Field Operations",
    },
    agronomist: {
      category: "Field Operations",
    },
    inspector: {
      category: "Field Operations",
    },
    enumerator: {
      category: "Field Operations",
    },
    // Farmer
    farmer: {
      category: "Farmer",
    },
    // Buyer / Partner
    exporter: {
      category: "Buyer / Partner",
    },
    "off-taker": {
      category: "Buyer / Partner",
    },
    "warehouse buyer": {
      category: "Buyer / Partner",
    },
    processor: {
      category: "Buyer / Partner",
    },
    "logistics partner": {
      category: "Buyer / Partner",
    },
    seller: {
      category: "Buyer / Partner",
    },
    logistics: {
      category: "Buyer / Partner",
    },
    storage_facility: {
      category: "Buyer / Partner",
    },
    // Aggregator
    aggregator: {
      category: "Aggregator",
    },
    // Sales & Distribution
    "sales manager": {
      category: "Sales & Distribution",
    },
    "logistics coordinator": {
      category: "Sales & Distribution",
    },
    "warehouse supervisor": {
      category: "Sales & Distribution",
    },
    // Intelligence & Monitoring
    "data analyst": {
      category: "Intelligence & Monitoring",
    },
    "satellite monitor": {
      category: "Intelligence & Monitoring",
    },
    "field auditor": {
      category: "Intelligence & Monitoring",
    },
  };

  const ecosystemRoleRoutes = {
    distributor: "distributor",
    "program director": "program-management",
    "regional manager": "program-management",
    "cluster supervisor": "program-management",
    "field officer": "field-operations",
    agronomist: "field-operations",
    inspector: "field-operations",
    enumerator: "field-operations",
    farmer: "farmer",
    exporter: "buyer-partner",
    "off-taker": "buyer-partner",
    "warehouse buyer": "buyer-partner",
    processor: "buyer-partner",
    "logistics partner": "logistics",
    logistics: "logistics",
    aggregator: "aggregator",
    "sales manager": "sales-&-distribution",
    "logistics coordinator": "sales-&-distribution",
    "warehouse supervisor": "sales-&-distribution",
    "data analyst": "intelligence-&-monitoring",
    "satellite monitor": "intelligence-&-monitoring",
    "field auditor": "intelligence-&-monitoring",
  };

  const marketplaceRoleRoutes = {
    seller: "store",
    farmer: "store",
    logistics: "logistics",
    "logistics partner": "logistics",
    "storage facility": "storage-facility",
    trainer: "trainer",
  };

  const toRouteSegment = (value) =>
    value
      ?.toLowerCase()
      .trim()
      .replace(/\s*\/\s*/g, "-")
      .replace(/\s+/g, "-") || "";

  const getDefaultWorkspace = (role) => {
    const normalizedRole = role?.toLowerCase().trim();
    const marketplaceRoles = ["seller", "logistics", "storage facility", "trainer", "farmer"];
    return marketplaceRoles.includes(normalizedRole) ? "marketplace" : "ecosystem";
  };

  const resolveRedirectPath = (role, workspace) => {
    const normalizedRole = role?.toLowerCase().trim();
    const normalizedWorkspace = workspace?.toLowerCase().trim() || getDefaultWorkspace(normalizedRole);

    if (normalizedWorkspace === "ecosystem") {
      const rolePath = ecosystemRoleRoutes[normalizedRole];
      if (rolePath) return `/${normalizedWorkspace}/${rolePath}`;
      const category = roleConfig[normalizedRole]?.category;
      return `/${normalizedWorkspace}/${toRouteSegment(category) || toRouteSegment(normalizedRole) || "other"}`;
    }

    if (normalizedWorkspace === "marketplace") {
      const rolePath = marketplaceRoleRoutes[normalizedRole];
      return `/${normalizedWorkspace}/${rolePath || "store"}`;
    }

    return `/${normalizedWorkspace}/${toRouteSegment(normalizedRole) || "dashboard"}`;
  };

  // Handle input field change
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors({});
  };

  // Per-step validation
  const validateWithSchemaForStep = (step) => {
    let schemaForStep = signinSchema;
    if (step === 1) {
      schemaForStep = signinSchema.pick({ email: true });
    }
    if (step === 2) {
      schemaForStep = signinSchema.pick({ password: true });
    }

    const validationResult = schemaForStep.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({ err: fieldErrors });
      // Show the first error message if available
      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
      if (firstMsg) toast.error(firstMsg);
      return false;
    }
    setErrors({});
    return true;
  };

  // Per-step client-side validation using schema picks
  const validateStep = (step) => validateWithSchemaForStep(step);

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.max(1, s + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedData = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
    };

    // Clear previous errors
    setErrors({});

    // Final full-schema validation before submit
    const finalCheck = signinSchema.safeParse(normalizedData);

    if (!finalCheck.success) {
      const fieldErrors = finalCheck.error.flatten().fieldErrors;
      setErrors({ err: fieldErrors });
      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean);
      if (firstMsg) toast.error(firstMsg);
      return;
    }

    try {
      setIsLoading(true);
      const result = await signinBridge(normalizedData);

      if (!result?.success) {
        toast.error([result.error].join(" ") || "Failed to login");
        return;
      }

      setErrors({});
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      const session = await verifyVendorSession();

      if (session.authenticated) {
        const { workspace, role, onboarding_status, onboarding_level } = session;
        // Ecosystem farmers who haven't completed onboarding go directly there
        if (
          workspace?.toLowerCase() === "ecosystem" &&
          role?.toLowerCase() === "farmer" &&
          onboarding_status !== "completed" &&
          onboarding_status !== "verified" &&
          !(onboarding_level >= 3)
        ) {
          router.push("/ecosystem/farmer/onboarding");
        } else if (onboarding_status === "pending") {
          router.push("/onboarding");
        } else {
          router.push(resolveRedirectPath(role, workspace));
        }
      }
      router.refresh();
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 text-(--foreground)">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm">We're happy to see you again</p>
        </div>

        <Card className="px-4 py-5">
          <CardHeader className="space-y-2 text-(--foreground)">
            <h2 className="text-lg font-semibold">Sign in to your account</h2>
          </CardHeader>

          <CardContent>
            {/* Progress bar */}
            <div className="w-full mb-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-(--greenish-color) rounded-full transition-all" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4" noValidate>
              {/* Step 1: Email */}
              {currentStep === 1 && (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input autoFocus id="email" type="email" autoComplete="on" className={isLoading ? "opacity-50" : ""} disabled={isLoading} placeholder="Enter your email address" name="email" value={formData.email} onChange={handleInputChange} required />
                  {errors.err?.email && <p className="text-start text-red-400 dark:text-red-300 text-sm">{errors.err.email[0] || errors.err.email}</p>}
                </div>
              )}

              {/* Step 2: Password & Remember */}
              {currentStep === 2 && (
                <>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input autoFocus id="password" autoComplete="off" className={isLoading ? "opacity-50" : ""} type={showPassword ? "text" : "password"} disabled={isLoading} placeholder="Enter your password" value={formData.password} name="password" onChange={handleInputChange} required />

                      <Button type="button" className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.err?.password && <p className="text-start text-red-400 dark:text-red-300 text-sm">{errors.err.password[0] || errors.err.password}</p>}

                    {errors.general && <p className="text-start text-red-400 dark:text-red-300 text-sm">{errors.general}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="checkbox"
                        id="remember"
                        checked={formData.rememberMe}
                        name="rememberMe"
                        className={isLoading ? "opacity-50" : ""}
                        disabled={isLoading}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            rememberMe: e.target.checked,
                          }));
                        }}
                      />
                      <Label htmlFor="remember" className="specialLabel">
                        Remember me
                      </Label>
                    </div>
                    <Button className="p-0 h-auto text-sm">Forgot password?</Button>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <Button type="button" className={`${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} bg-gray-200 dark:bg-gray-500 text-(--foreground) px-4 py-2 rounded-md`} onClick={handleBack} disabled={isLoading || currentStep === 1}>
                  Back
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" className={`${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} bg-(--greenish-color) text-(--white-fff) px-4 py-2 rounded-md`} onClick={handleNext} disabled={isLoading}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className={`${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} transition transition-background w-full bg-(--greenish-color) hover:bg-(--dark-green-color) text-(--white-fff) font-normal p-2 rounded-md`} disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex justify-center items-center gap-2">
                        <FaSpinner className="h-4 w-4 animate-spin" />
                        <span>Please wait...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-500 hover:underline">
                  Register
                </Link>
              </p>
            </div>

            {/* <Button className="bg-[#fafafa] cursor-pointer border-1 border-gray-200 hover:shadow hover:shadow-sm my-4 p-2 gap-2 rounded w-full flex items-center justify-center">
                  <FcGoogle className="w-5 h-5" /> Continue with Google
               </Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
