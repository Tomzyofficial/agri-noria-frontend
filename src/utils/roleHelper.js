/**
 * Role unification and workspace helper utilities.
 * Defines shared roles between Marketplace & Ecosystem, canonical mappings,
 * and workspace redirection logic.
 */

export const SHARED_ROLES = {
   farmer: {
      marketplaceRoute: "/marketplace/store",
      ecosystemRoute: "/ecosystem/farmer",
      ecosystemOnboardingRoute: "/ecosystem/farmer/onboarding",
      hasEcosystemOnboarding: true,
      label: "Farmer",
   },
   logistics: {
      marketplaceRoute: "/marketplace/logistics",
      ecosystemRoute: "/ecosystem/logistics",
      hasEcosystemOnboarding: false,
      label: "Logistics",
   },
   "logistics partner": {
      marketplaceRoute: "/marketplace/logistics",
      ecosystemRoute: "/ecosystem/logistics",
      hasEcosystemOnboarding: false,
      label: "Logistics Partner",
   },
   logistic: {
      marketplaceRoute: "/marketplace/logistics",
      ecosystemRoute: "/ecosystem/logistics",
      hasEcosystemOnboarding: false,
      label: "Logistics",
   },
   "logistics supplier": {
      marketplaceRoute: "/marketplace/logistics",
      ecosystemRoute: "/ecosystem/logistics",
      hasEcosystemOnboarding: false,
      label: "Logistics Supplier",
   },
   storage: {
      marketplaceRoute: "/marketplace/storage-facility",
      ecosystemRoute: "/ecosystem/storage",
      hasEcosystemOnboarding: false,
      label: "Storage",
   },
   "storage facility": {
      marketplaceRoute: "/marketplace/storage-facility",
      ecosystemRoute: "/ecosystem/storage",
      hasEcosystemOnboarding: false,
      label: "Storage Facility",
   },
   storage_facility: {
      marketplaceRoute: "/marketplace/storage-facility",
      ecosystemRoute: "/ecosystem/storage",
      hasEcosystemOnboarding: false,
      label: "Storage Facility",
   },
   "storage supplier": {
      marketplaceRoute: "/marketplace/storage-facility",
      ecosystemRoute: "/ecosystem/storage",
      hasEcosystemOnboarding: false,
      label: "Storage",
   },
};

export const normalizeRole = (role) => (role || "").toLowerCase().trim();

export const isSharedRole = (role) => {
   return !!SHARED_ROLES[normalizeRole(role)];
};

export const getSharedRoleConfig = (role) => {
   return SHARED_ROLES[normalizeRole(role)] || null;
};

export const isFarmerRole = (role) => {
   return normalizeRole(role) === "farmer";
};

export const isLogisticsRole = (role) => {
   const r = normalizeRole(role);
   return ["logistics", "logistics partner", "logistic", "logistics supplier"].includes(r);
};

export const isStorageRole = (role) => {
   const r = normalizeRole(role);
   return ["storage", "storage facility", "storage_facility", "storage supplier"].includes(r);
};

export const isAllowedMarketplaceRole = (userRole, targetRole) => {
   const r = normalizeRole(userRole);
   const t = normalizeRole(targetRole);

   if (t === "store" || t === "seller" || t === "farmer") {
      return r === "seller" || r === "farmer";
   }
   if (t === "logistics") {
      return isLogisticsRole(r);
   }
   if (t === "storage" || t === "storage facility" || t === "storage-facility" || t === "storage_facility") {
      return isStorageRole(r);
   }
   if (t === "trainer") {
      return r === "trainer";
   }
   if (t === "drone") {
      return r === "drone";
   }
   if (t === "farm development" || t === "farm-development") {
      return r === "farm development";
   }
   return r === t;
};

/**
 * Determine if a user is verified in the Ecosystem
 */
export const isEcosystemVerified = (session) => {
   if (!session) return false;
   return (
      session.is_verified === true ||
      session.onboarding_status === "verified" ||
      session.onboarding_status === "completed" ||
      (typeof session.onboarding_level === "number" && session.onboarding_level >= 2)
   );
};
