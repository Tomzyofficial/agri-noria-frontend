import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";
// Farmer and seller products marketplace
export const getMarketplaceProducts = async (countryCode) => {
  const cookieHeader = await cookieStoreFnc();
  const cookieStr = typeof cookieHeader === "string" ? cookieHeader : "";
  const query = countryCode
    ? `?country=${encodeURIComponent(countryCode)}`
    : "";
  try {
    const res = await fetch(apiUrl(`/api/marketplace${query}`), {
      method: "GET",
      headers: {
        Cookie: cookieStr,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { error: "Error" };
    }
    const data = await res.json();
    return data.result || [];
  } catch {
    return { error: "Error" };
  }
};

// Listed storage marketplace
export const getMarketplaceListedStorage = async () => {
  const cookieHeader = await cookieStoreFnc();

  try {
    const res = await fetch(apiUrl("/api/marketplace/listed-storage"), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      revalidate: 60,
    });

    if (!res.ok) {
      return { error: "Error" };
    }

    const data = await res.json();
    return data?.result;
  } catch (error) {
    console.error(error.message);
    return { error: "Error" };
  }
};

// Public logistics vehicle marketplace
export const getListedLogisticsVehicles = async () => {
  const cookieHeader = await cookieStoreFnc();
  try {
    const res = await fetch(apiUrl("/api/vendor/logistics/public/vehicles"), {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { error: "Error" };
    }

    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error(error.message);
    return { error: "Error" };
  }
};

// Vendor dashboard loan management
export async function getAllLoans() {
  const cookieHeader = await cookieStoreFnc();
  try {
    const response = await fetch(apiUrl("/api/vendor/loan/all"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch loans: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching loans:", error);
    throw error;
  }
}

export const disburseLoan = async (loanId) => {
  const response = await fetch(apiUrl(`/api/loan/${loanId}/disburse`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to disburse loan");
  }

  return data;
};

/* export const adminLoans = async () => {
   const res = await fetch("http://localhost:8080/api/loans/");
   const data = await res.json();
   if (data.success) {
      return data.data;
   }
   throw new Error("Failed to fetch loans");
}; */
