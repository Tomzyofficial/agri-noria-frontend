/**
 * Ads / promotions API client (cookie auth, absolute backend URL).
 * @module lib/adsApi
 */

import { apiUrl } from "@/_lib/api";

async function parseJsonSafe(res) {
   const text = await res.text();
   try {
      return text ? JSON.parse(text) : {};
   } catch {
      return { raw: text };
   }
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function adsFetch(path, init = {}) {
   const url = apiUrl(path);
   const headers = { ...(init.headers || {}) };
   if (init.body != null && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
   }
   const merged = {
      ...init,
      credentials: "include",
      headers,
   };
   const res = await fetch(url, merged);
   const body = await parseJsonSafe(res);
   return { res, body };
}

export async function fetchVendorCampaigns() {
   return adsFetch("/api/vendor/ads/campaigns");
}

export async function fetchVendorCampaign(id) {
   return adsFetch(`/api/vendor/ads/campaigns/${id}`);
}

export async function fetchVendorAdsSummary(query = "") {
   const q = query ? `?${query}` : "";
   return adsFetch(`/api/vendor/ads/summary${q}`);
}

export async function createCampaign(payload) {
   return adsFetch("/api/vendor/ads/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
   });
}

export async function updateCampaign(id, payload) {
   return adsFetch(`/api/vendor/ads/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
   });
}

export async function pauseCampaign(id) {
   return adsFetch(`/api/vendor/ads/campaigns/${id}/pause`, { method: "POST" });
}

export async function activateCampaign(id) {
   return adsFetch(`/api/vendor/ads/campaigns/${id}/activate`, { method: "POST" });
}

export async function deleteCampaign(id) {
   return adsFetch(`/api/vendor/ads/campaigns/${id}`, { method: "DELETE" });
}

export async function verifyCampaignPayment(reference) {
   const enc = encodeURIComponent(reference);
   return adsFetch(`/api/vendor/ads/verify-payment?reference=${enc}`);
}

export async function fetchActiveAdsPublic(params) {
   const sp = new URLSearchParams();
   if (params?.placement) sp.set("placement", params.placement);
   if (params?.country) sp.set("country", params.country);
   const q = sp.toString();
   return adsFetch(`/api/ads/public/active${q ? `?${q}` : ""}`);
}

export async function trackImpression(campaignId) {
   return adsFetch("/api/ads/track/impression", {
      method: "POST",
      body: JSON.stringify({ campaignId }),
   });
}

export async function trackClick(campaignId) {
   return adsFetch("/api/ads/track/click", {
      method: "POST",
      body: JSON.stringify({ campaignId }),
   });
}

export async function fetchBoostedCatalog(country, q) {
   const sp = new URLSearchParams({ country });
   if (q) sp.set("q", q);
   return adsFetch(`/api/ads/public/catalog?${sp.toString()}`);
}
