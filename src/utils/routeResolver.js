export const roleConfig = {
  // Institution
  government: { category: "Institution" },
  bank: { category: "Institution" },
  ngo: { category: "Institution" },
  dfi: { category: "Institution" },
  "insurance firm": { category: "Institution" },
  "commodity board": { category: "Institution" },
  finance: { category: "Institution" },
  "producer association": { category: "Institution" },
  cooperative: { category: "Institution" },
  "research institution": { category: "Institution" },
  distributor: { category: "Distributor" },
  // Program Management
  "program director": { category: "Program Management" },
  "regional manager": { category: "Program Management" },
  "cluster supervisor": { category: "Program Management" },
  // Field Operations
  "field officer": { category: "Field Operations" },
  agronomist: { category: "Field Operations" },
  inspector: { category: "Field Operations" },
  enumerator: { category: "Field Operations" },
  // Farmer
  farmer: { category: "Farmer" },
  // Buyer / Partner
  exporter: { category: "Buyer / Partner" },
  "off-taker": { category: "Buyer / Partner" },
  "warehouse buyer": { category: "Buyer / Partner" },
  processor: { category: "Buyer / Partner" },
  "logistics partner": { category: "Buyer / Partner" },
  seller: { category: "Buyer / Partner" },
  logistics: { category: "Buyer / Partner" },
  storage_facility: { category: "Buyer / Partner" },
  // Aggregator
  aggregator: { category: "Aggregator" },
  // Sales & Distribution
  "sales manager": { category: "Sales & Distribution" },
  "logistics coordinator": { category: "Sales & Distribution" },
  "warehouse supervisor": { category: "Sales & Distribution" },
  // Intelligence & Monitoring
  "data analyst": { category: "Intelligence & Monitoring" },
  "satellite monitor": { category: "Intelligence & Monitoring" },
  "field auditor": { category: "Intelligence & Monitoring" },
};

export const ecosystemRoleRoutes = {
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

export const marketplaceRoleRoutes = {
  seller: "store",
  farmer: "store",
  drone: "drone",
  logistics: "logistics",
  "logistics partner": "logistics",
  "storage facility": "storage-facility",
  trainer: "trainer",
};

export const toRouteSegment = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s+/g, "-") || "";

export const getDefaultWorkspace = (role) => {
  const normalizedRole = role?.toLowerCase().trim();
  const marketplaceRoles = ["seller", "logistics", "storage facility", "trainer", "farmer", "drone"];
  return marketplaceRoles.includes(normalizedRole) ? "marketplace" : "ecosystem";
};

export const resolveRedirectPath = (role, workspace) => {
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
