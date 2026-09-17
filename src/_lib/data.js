import { apiUrl } from "@/_lib/api";
import { cookieStoreFnc } from "@/actions/session";
import { headers } from "next/headers";

export const utils = async () => {
   const cookieHeader = await cookieStoreFnc();
   const headerStore = await headers();
   const countryCode = headerStore.get("x-user-country");
   const cookieStr = typeof cookieHeader === "string" ? cookieHeader : "";
   const query = countryCode ? `?country=${encodeURIComponent(countryCode)}` : "";
   return { cookieStr, query };
};

export const getMarketplaceProducts = async () => {
   const { cookieStr, query } = await utils();
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
   const { cookieStr, query } = await utils();
   try {
      const res = await fetch(apiUrl("/api/marketplace/listed-storage"), {
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
      return data?.result;
   } catch (error) {
      console.error(error.message);
      return { error: "Error" };
   }
};

// Public logistics vehicle marketplace
export const getListedLogisticsVehicles = async () => {
   const { cookieStr } = await utils();
   try {
      const res = await fetch(apiUrl("/api/vendor/logistics/public/vehicles"), {
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
      return Array.isArray(data?.data) ? data.data : [];
   } catch (error) {
      console.error(error.message);
      return { error: "Error" };
   }
};

export const getHomeAdCampaigns = async () => {
   const { cookieStr, query } = await utils();
   const separator = query ? "&" : "?";
   try {
      const res = await fetch(apiUrl(`/api/public/campaigns/home-drone-marketplace${query}${separator}surface=Home`), {
         method: "GET",
         headers: {
            Cookie: cookieStr,
         },
         next: { revalidate: 60 },
      });

      if (!res.ok) {
         return { error: "Error occurred while loading sponsored products" };
      }
      const data = await res.json();
      return data.result || [];
   } catch {
      return { error: "Error occurred while loading sponsored products" };
   }
};

export const getDroneAdCampaigns = async () => {
   const { cookieStr, query } = await utils();
   const separator = query ? "&" : "?";
   try {
      const res = await fetch(apiUrl(`/api/public/campaigns/home-drone-marketplace${query}${separator}surface=Drone_marketplace`), {
         method: "GET",
         headers: {
            Cookie: cookieStr,
         },
         next: { revalidate: 3600 },
      });

      if (!res.ok) {
         return { error: "Error occurred while loading sponsored drones" };
      }
      const data = await res.json();
      return data.result || [];
   } catch {
      return { error: "Error occurred while loading sponsored drones" };
   }
};
