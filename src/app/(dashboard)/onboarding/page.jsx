"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa6";
import {
  FaGlobe,
  FaLandmark,
  FaUserTie,
  FaSeedling,
  FaTruckMoving,
  FaClipboardList,
  FaLock,
  FaHandshake,
} from "react-icons/fa";
import { verifyVendorSession } from "@/actions/session";

// Role icon & color mapping
const roleConfig = {
  // Institution
  government: {
    icon: <FaLandmark />,
    color: "text-blue-400",
    category: "Institution",
  },
  bank: {
    icon: <FaLandmark />,
    color: "text-emerald-400",
    category: "Institution",
  },
  ngo: {
    icon: <FaLandmark />,
    color: "text-teal-400",
    category: "Institution",
  },
  dfi: {
    icon: <FaLandmark />,
    color: "text-cyan-400",
    category: "Institution",
  },
  "insurance firm": {
    icon: <FaLandmark />,
    color: "text-indigo-400",
    category: "Institution",
  },
  "commodity board": {
    icon: <FaLandmark />,
    color: "text-violet-400",
    category: "Institution",
  },
  finance: {
    icon: <FaLandmark />,
    color: "text-blue-500",
    category: "Institution",
  },
  distributor: {
    icon: <FaTruckMoving />,
    color: "text-amber-500",
    category: "Distributor",
  },
  // Program Management
  "program director": {
    icon: <FaUserTie />,
    color: "text-amber-400",
    category: "Program Management",
  },
  "regional manager": {
    icon: <FaUserTie />,
    color: "text-orange-400",
    category: "Program Management",
  },
  "cluster supervisor": {
    icon: <FaUserTie />,
    color: "text-yellow-400",
    category: "Program Management",
  },
  // Field Operations
  "field officer": {
    icon: <FaClipboardList />,
    color: "text-lime-400",
    category: "Field Operations",
  },
  agronomist: {
    icon: <FaSeedling />,
    color: "text-green-400",
    category: "Field Operations",
  },
  inspector: {
    icon: <FaClipboardList />,
    color: "text-emerald-400",
    category: "Field Operations",
  },
  enumerator: {
    icon: <FaClipboardList />,
    color: "text-teal-400",
    category: "Field Operations",
  },
  // Farmer
  farmer: { icon: <FaSeedling />, color: "text-green-500", category: "Farmer" },
  // Buyer / Partner
  exporter: {
    icon: <FaTruckMoving />,
    color: "text-sky-400",
    category: "Buyer / Partner",
  },
  "off-taker": {
    icon: <FaTruckMoving />,
    color: "text-blue-400",
    category: "Buyer / Partner",
  },
  "warehouse buyer": {
    icon: <FaTruckMoving />,
    color: "text-indigo-400",
    category: "Buyer / Partner",
  },
  processor: {
    icon: <FaTruckMoving />,
    color: "text-purple-400",
    category: "Buyer / Partner",
  },
  "logistics partner": {
    icon: <FaTruckMoving />,
    color: "text-violet-400",
    category: "Buyer / Partner",
  },
  seller: {
    icon: <FaTruckMoving />,
    color: "text-pink-400",
    category: "Buyer / Partner",
  },
  logistics: {
    icon: <FaTruckMoving />,
    color: "text-rose-400",
    category: "Buyer / Partner",
  },
  "storage facility": {
    icon: <FaTruckMoving />,
    color: "text-red-400",
    category: "Buyer / Partner",
  },
  // Aggregator
  aggregator: {
    icon: <FaHandshake />,
    color: "text-green-500",
    category: "Aggregator",
  },
  // Sales & Distribution
  "sales manager": {
    icon: <FaTruckMoving />,
    color: "text-blue-500",
    category: "Sales & Distribution",
  },
  "logistics coordinator": {
    icon: <FaTruckMoving />,
    color: "text-indigo-500",
    category: "Sales & Distribution",
  },
  "warehouse supervisor": {
    icon: <FaLandmark />,
    color: "text-slate-500",
    category: "Sales & Distribution",
  },
  // Intelligence & Monitoring
  "data analyst": {
    icon: <FaClipboardList />,
    color: "text-cyan-500",
    category: "Intelligence & Monitoring",
  },
  "satellite monitor": {
    icon: <FaGlobe />,
    color: "text-purple-500",
    category: "Intelligence & Monitoring",
  },
  "field auditor": {
    icon: <FaClipboardList />,
    color: "text-emerald-500",
    category: "Intelligence & Monitoring",
  },
};

const selectClass =
  "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-(--foreground) rounded-lg p-3 outline-none focus:ring-2 focus:ring-(--greenish-color) transition";
const inputClass = "!rounded-lg !p-3";

const getDefaultWorkspace = (role) => {
  const normalizedRole = role?.toLowerCase().trim();
  const marketplaceRoles = [
    "seller",
    "logistics",
    "storage facility",
    "trainer",
    "farmer",
  ];
  return marketplaceRoles.includes(normalizedRole)
    ? "marketplace"
    : "ecosystem";
};

const toRouteSegment = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-") || "";

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

const resolveRedirectPath = (role, workspace) => {
  const normalizedRole = role?.toLowerCase().trim();
  const normalizedWorkspace =
    workspace?.toLowerCase().trim() || getDefaultWorkspace(normalizedRole);

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

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    migrateFromOuter: false,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await verifyVendorSession();
        console.log("from onboarding page", session);

        if (!session?.authenticated) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        setRole(session.role || null);
        setWorkspace(session.workspace || null);
        console.log("workspace", workspace);
        console.log("role", role);
        setUserName(session.fname || "");

        const normalizedRole = session.role?.toLowerCase().trim();

        if (normalizedRole === "super admin" || normalizedRole === "admin") {
          router.replace("/dashboard/super-admin");
          return;
        }

        if (normalizedRole === "farmer") {
          if (session.onboarding_level >= 3 || session.onboarding_status === "completed" || session.onboarding_status === "verified") {
            router.replace(resolveRedirectPath(session.role, session.workspace));
          } else {
            router.replace("/ecosystem/farmer/onboarding");
          }
          return;
        }

        if (session.onboarding_status === "completed") {
          router.replace(resolveRedirectPath(session.role, session.workspace));
          return;
        }
      } catch (err) {
        console.error("Failed to verify onboarding session:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const roleStr = role?.toLowerCase().trim();
    const category = roleConfig[roleStr]?.category;

    try {
      if (roleStr === "farmer") {
        const res = await fetch("/api/proxy/pipeline/farmer-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farm_name: formData.farmName,
            farm_size_hectares: formData.farmSize,
            commodity: formData.cropType,
            preferred_language: formData.preferredLanguage,
            migrate_from_outer: formData.migrateFromOuter,
          }),
        });
        if (!res.ok) throw new Error("Failed to create farmer profile");
      } else if (roleStr === "aggregator") {
        const res = await fetch("/api/proxy/aggregator/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: formData.companyName,
            registration_details: formData.rcNumber,
            company_logo_url: "", // Will be handled by upload in real scenario
          }),
        });
        if (!res.ok) throw new Error("Failed to create aggregator profile");
      }

      toast.success("Documents have been submitted successfully");

      // Finalize onboarding status in DB
      await fetch("/api/proxy/vendor/complete-onboarding", {
        method: "POST",
      });

      router.replace(resolveRedirectPath(role, workspace));
    } catch (err) {
      toast.error(err.message || "An error occurred during onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--background) gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="w-16 h-16 border-4 border-t-(--greenish-color) rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="text-sm text-gray-500 animate-pulse">
          Verifying your session...
        </p>
      </div>
    );
  }

  // Not authenticated — show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
            <FaLock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-(--foreground)">
            Authentication Required
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            You need to sign in or create an account before accessing the
            Ecosystem Onboarding. Your role will be automatically detected from
            your registration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/signin"
              className="bg-(--greenish-color) hover:bg-(--dark-green-color) text-white font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="border border-(--greenish-color) text-(--greenish-color) hover:bg-(--greenish-color) hover:text-white font-medium py-3 px-8 rounded-lg transition-all"
            >
              Create Account
            </Link>
          </div>
          <Link
            href="/"
            className="inline-block text-sm text-gray-400 hover:text-(--greenish-color) mt-4 transition"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Get role config
  const roleStr = role?.toLowerCase() || "";
  const config = roleConfig[roleStr] || {
    icon: <FaGlobe />,
    color: "text-gray-400",
    category: "Other",
  };

  const renderFormContent = () => {
    // Sales & Distribution
    if (
      [
        "sales manager",
        "logistics coordinator",
        "warehouse supervisor",
      ].includes(roleStr)
    ) {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
              Distribution Identity
            </p>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="companyName"
                  className="block mb-1.5 font-medium"
                >
                  Business Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="e.g. SwiftLogistics Nigeria"
                  className={inputClass}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rcNumber" className="block mb-1.5 font-medium">
                  RC Number
                </Label>
                <Input
                  id="rcNumber"
                  name="rcNumber"
                  placeholder="e.g. RC-456789"
                  className={inputClass}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="warehouseLocation"
                className="block mb-1.5 font-medium"
              >
                Primary Warehouse Location
              </Label>
              <Input
                id="warehouseLocation"
                name="warehouseLocation"
                placeholder="e.g. Lagos-Ibadan Expressway"
                className={inputClass}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="distRegions" className="block mb-1.5 font-medium">
                Distribution Regions
              </Label>
              <Input
                id="distRegions"
                name="distRegions"
                placeholder="e.g. South West, North Central"
                className={inputClass}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="logisticsCapacity"
                className="block mb-1.5 font-medium"
              >
                Logistics Capacity (Tons)
              </Label>
              <Input
                id="logisticsCapacity"
                type="number"
                name="logisticsCapacity"
                placeholder="e.g. 50"
                className={inputClass}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
      );
    }

    // Intelligence & Monitoring
    if (
      ["data analyst", "satellite monitor", "field auditor"].includes(roleStr)
    ) {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">
              Intelligence Credentials
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="instName" className="block mb-1.5 font-medium">
                  Affiliated Institution
                </Label>
                <Input
                  id="instName"
                  name="instName"
                  placeholder="e.g. AgriData Research Hub"
                  className={inputClass}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="techSpecialization"
                  className="block mb-1.5 font-medium"
                >
                  Technical Specialization
                </Label>
                <Input
                  id="techSpecialization"
                  name="techSpecialization"
                  placeholder="e.g. GIS & Remote Sensing"
                  className={inputClass}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="monitoringTools"
                className="block mb-1.5 font-medium"
              >
                Preferred Monitoring Tools
              </Label>
              <Input
                id="monitoringTools"
                name="monitoringTools"
                placeholder="e.g. Sentinel-2, Custom AI"
                className={inputClass}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="auditLicense"
                className="block mb-1.5 font-medium"
              >
                Professional License / ID (Optional)
              </Label>
              <Input
                id="auditLicense"
                name="auditLicense"
                placeholder="e.g. LIC-INT-9988"
                className={inputClass}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      );
    }

    // Institution
    if (
      [
        "government",
        "bank",
        "ngo",
        "dfi",
        "insurance firm",
        "commodity board",
        "finance",
        "distributor",
      ].includes(roleStr)
    ) {
      return (
        <div className="space-y-5">
          <div>
            <Label htmlFor="orgName" className="block mb-1.5 font-medium">
              Organization Name
            </Label>
            <Input
              id="orgName"
              name="orgName"
              placeholder="e.g. Federal Ministry of Agriculture"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="orgId" className="block mb-1.5 font-medium">
              Registration / License Number
            </Label>
            <Input
              id="orgId"
              name="orgId"
              placeholder="e.g. RC-123456"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="officialEmail" className="block mb-1.5 font-medium">
              Official Email
            </Label>
            <Input
              id="officialEmail"
              type="email"
              name="officialEmail"
              placeholder="official@institution.gov"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="institutionType"
              className="block mb-1.5 font-medium"
            >
              Institution Type
            </Label>
            <select
              id="institutionType"
              name="institutionType"
              onChange={handleInputChange}
              required
              className={selectClass}
            >
              <option value="">Select type...</option>
              <option value="Government">Government Agency</option>
              <option value="Bank">Commercial / Development Bank</option>
              <option value="NGO">Non-Governmental Organization</option>
              <option value="DFI">Development Finance Institution</option>
              <option value="Insurance Firm">Insurance Firm</option>
              <option value="Commodity Board">Commodity Board</option>
              <option value="Finance">Financial Institution / Fintech</option>
              <option value="Distributor">Input Distributor</option>
            </select>
          </div>
          {roleStr === "distributor" && (
            <div>
              <Label
                htmlFor="distributionCategory"
                className="block mb-1.5 font-medium"
              >
                Distribution Category
              </Label>
              <select
                id="distributionCategory"
                name="distributionCategory"
                onChange={handleInputChange}
                required
                className={selectClass}
              >
                <option value="">Select distribution category...</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Agrochemicals">Agrochemicals</option>
                <option value="Equipment">Farm Equipment</option>
                <option value="Mixed">Mixed Inputs</option>
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="certificate" className="block mb-1.5 font-medium">
              Upload Certificate of Registration
            </Label>
            <input
              id="certificate"
              type="file"
              name="certificate"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-(--greenish-color) file:text-white file:cursor-pointer hover:file:bg-(--dark-green-color) transition"
            />
          </div>
        </div>
      );
    }

    // Program Management
    if (
      ["program director", "regional manager", "cluster supervisor"].includes(
        roleStr,
      )
    ) {
      return (
        <div className="space-y-5">
          <div>
            <Label
              htmlFor="assignedProgram"
              className="block mb-1.5 font-medium"
            >
              Assigned Program
            </Label>
            <Input
              id="assignedProgram"
              name="assignedProgram"
              placeholder="e.g. Cassava Export Pilot"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="assignedRegion"
              className="block mb-1.5 font-medium"
            >
              Assigned Region / State
            </Label>
            <Input
              id="assignedRegion"
              name="assignedRegion"
              placeholder="e.g. Ogun State"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="teamSize" className="block mb-1.5 font-medium">
              Team Size
            </Label>
            <Input
              id="teamSize"
              type="number"
              name="teamSize"
              placeholder="e.g. 25"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="startDate" className="block mb-1.5 font-medium">
              Program Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              name="startDate"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      );
    }

    // Field Operations
    if (
      ["field officer", "agronomist", "inspector", "enumerator"].includes(
        roleStr,
      )
    ) {
      return (
        <div className="space-y-5">
          <div>
            <Label
              htmlFor="assignedCluster"
              className="block mb-1.5 font-medium"
            >
              Assigned Cluster / Zone
            </Label>
            <Input
              id="assignedCluster"
              name="assignedCluster"
              placeholder="e.g. Cluster 12 — Abeokuta North"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="specialization"
              className="block mb-1.5 font-medium"
            >
              Specialization
            </Label>
            <Input
              id="specialization"
              name="specialization"
              placeholder="e.g. Soil Science, Crop Protection"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="yearsExperience"
              className="block mb-1.5 font-medium"
            >
              Years of Experience
            </Label>
            <Input
              id="yearsExperience"
              type="number"
              name="yearsExperience"
              placeholder="e.g. 5"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="fieldId" className="block mb-1.5 font-medium">
              Upload Field ID / Badge
            </Label>
            <input
              id="fieldId"
              type="file"
              name="fieldId"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-(--greenish-color) file:text-white file:cursor-pointer hover:file:bg-(--dark-green-color) transition"
            />
          </div>
        </div>
      );
    }

    // Farmer
    if (roleStr === "farmer") {
      return (
        <div className="space-y-5">
          <div>
            <Label htmlFor="farmName" className="block mb-1.5 font-medium">
              Farm Name
            </Label>
            <Input
              id="farmName"
              name="farmName"
              placeholder="e.g. Adeyemi Farms"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="farmSize" className="block mb-1.5 font-medium">
              Farm Size (Hectares)
            </Label>
            <Input
              id="farmSize"
              type="number"
              name="farmSize"
              placeholder="e.g. 10"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="cropType" className="block mb-1.5 font-medium">
              Primary Crop / Livestock
            </Label>
            <Input
              id="cropType"
              name="cropType"
              placeholder="e.g. Rice, Cassava, Poultry"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="preferredLanguage"
              className="block mb-1.5 font-medium"
            >
              Preferred Language
            </Label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              onChange={handleInputChange}
              required
              className={selectClass}
            >
              <option value="">Select language...</option>
              <option value="English">English</option>
              <option value="Hausa">Hausa</option>
              <option value="Yoruba">Yoruba</option>
              <option value="Igbo">Igbo</option>
              <option value="French">French</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>

          {/* Ecosystem Transition Confirmation */}
          <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/50 rounded-3xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex items-center h-6 pt-1">
                <input
                  id="migrateFromOuter"
                  name="migrateFromOuter"
                  type="checkbox"
                  checked={formData.migrateFromOuter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      migrateFromOuter: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 cursor-pointer transition-all"
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="migrateFromOuter"
                  className="font-black text-blue-900 dark:text-blue-300 text-base uppercase tracking-tight"
                >
                  Transition to Industrial Ecosystem
                </label>
                <p className="text-blue-700/80 dark:text-blue-400/80 mt-2 leading-relaxed font-medium">
                  By checking this, you confirm you are joining the{" "}
                  <span className="text-blue-900 dark:text-blue-200 font-bold">
                    Industrial Digital Ecosystem
                  </span>
                  . Your legacy "Normal Farmer" account on the public
                  marketplace will be{" "}
                  <span className="text-red-500 font-bold underline decoration-wavy decoration-red-200">
                    disabled
                  </span>{" "}
                  to maintain operational integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Buyer / Partner
    if (
      [
        "exporter",
        "off-taker",
        "warehouse buyer",
        "processor",
        "logistics partner",
        "seller",
        "logistics",
        "storage_facility",
      ].includes(roleStr)
    ) {
      return (
        <div className="space-y-5">
          <div>
            <Label htmlFor="companyName" className="block mb-1.5 font-medium">
              Company / Business Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="e.g. AgroTrade Nigeria Ltd"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="rcNumber" className="block mb-1.5 font-medium">
              RC / Business Registration Number
            </Label>
            <Input
              id="rcNumber"
              name="rcNumber"
              placeholder="e.g. RC-789012"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="partnerType" className="block mb-1.5 font-medium">
              Partner Type
            </Label>
            <select
              id="partnerType"
              name="partnerType"
              onChange={handleInputChange}
              required
              className={selectClass}
            >
              <option value="">Select type...</option>
              <option value="Export Buyer">Export Buyer</option>
              <option value="Local Off-taker">Local Off-taker</option>
              <option value="Warehouse Operator">Warehouse Operator</option>
              <option value="Processor">Processor / Manufacturer</option>
              <option value="Logistics Provider">Logistics Provider</option>
            </select>
          </div>
          <div>
            <Label htmlFor="cacCert" className="block mb-1.5 font-medium">
              Upload CAC Certificate
            </Label>
            <input
              id="cacCert"
              type="file"
              name="cacCert"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-(--greenish-color) file:text-white file:cursor-pointer hover:file:bg-(--dark-green-color) transition"
            />
          </div>
        </div>
      );
    }

    // Aggregator
    if (roleStr === "aggregator") {
      return (
        <div className="space-y-5">
          <div>
            <Label htmlFor="companyName" className="block mb-1.5 font-medium">
              Aggregator Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="e.g. Agro Connect Ltd"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="rcNumber" className="block mb-1.5 font-medium">
              RC / Business Registration Number
            </Label>
            <Input
              id="rcNumber"
              name="rcNumber"
              placeholder="e.g. RC-123456"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="officialEmail" className="block mb-1.5 font-medium">
              Official Contact Email
            </Label>
            <Input
              id="officialEmail"
              type="email"
              name="officialEmail"
              placeholder="contact@agroconnect.com"
              className={inputClass}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="cacCert" className="block mb-1.5 font-medium">
              Upload CAC Certificate / Registration
            </Label>
            <input
              id="cacCert"
              type="file"
              name="cacCert"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-(--greenish-color) file:text-white file:cursor-pointer hover:file:bg-(--dark-green-color) transition"
            />
          </div>
          <div>
            <Label htmlFor="companyLogo" className="block mb-1.5 font-medium">
              Upload Company Logo (For Agreements)
            </Label>
            <input
              id="companyLogo"
              type="file"
              name="companyLogo"
              accept=".jpg,.png"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-(--greenish-color) file:text-white file:cursor-pointer hover:file:bg-(--dark-green-color) transition"
            />
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-5">
        <div>
          <Label htmlFor="companyName" className="block mb-1.5 font-medium">
            Company / Organization Name
          </Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="Enter your company name"
            className={inputClass}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="additionalInfo" className="block mb-1.5 font-medium">
            Tell Us About Your Role
          </Label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            rows="4"
            onChange={handleInputChange}
            placeholder="Describe what you do and how you want to use the platform..."
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-(--foreground) rounded-lg p-3 outline-none focus:ring-2 focus:ring-(--greenish-color) transition resize-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-(--background) py-12 px-4 sm:px-6 lg:px-8 flex justify-center selection:bg-green-100">
      <div className="max-w-xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div
            className={`mx-auto w-24 h-24 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent rounded-[40px] flex items-center justify-center text-4xl shadow-2xl backdrop-blur-sm border border-white/50 dark:border-gray-800/50 ${config.color} transition-transform hover:scale-105 duration-500`}
          >
            {config.icon}
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              Ecosystem{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-(--greenish-color) to-emerald-400">
                Onboarding
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-sm mx-auto leading-relaxed">
              Welcome back,{" "}
              <span className="text-gray-900 dark:text-white font-black underline decoration-(--greenish-color) decoration-4 underline-offset-4">
                {userName}
              </span>
              ! Ready to join the industrial network?
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl px-6 py-2.5 shadow-sm">
            <span className={`${config.color} text-xl`}>{config.icon}</span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {config.category}
              </span>
              <span className="font-black text-gray-900 dark:text-white text-base">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none rounded-[48px] overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-3 bg-gradient-to-r from-(--greenish-color) via-emerald-400 to-(--greenish-color)" />
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
              <div className="w-2 h-8 bg-(--greenish-color) rounded-full" />
              {config.category} Profile Setup
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-2">
              Help us tailor your experience. Your data is secured and will be
              used to verify your industrial credentials within the next 24
              hours.
            </p>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800">
                {renderFormContent()}
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-(--greenish-color) hover:bg-(--dark-green-color) text-white font-black text-lg py-8 rounded-3xl transition-all hover:shadow-[0_10px_30px_rgba(0,186,114,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <FaSpinner className="animate-spin h-6 w-6" />
                      <span>FINALIZING DATA...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      COMPLETE ONBOARDING{" "}
                      <span className="transition-transform group-hover:translate-x-2">
                        →
                      </span>
                    </span>
                  )}
                </Button>
                <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <FaLock className="text-(--greenish-color)" /> Encrypted
                  Industrial Protocol
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-bold text-gray-400 hover:text-(--greenish-color) transition-all"
          >
            ← Return to Public Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
