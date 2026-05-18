"use client";

import useSWR from "swr";

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return res.json();
  });

function buildUrl({ type, category, search }) {
  const query = new URLSearchParams();
  if (type && type !== "all") query.set("type", type);
  if (category && category !== "all") query.set("category", category);
  if (search) query.set("search", search);
  const qs = query.toString();
  return `/api/proxy/vendor/materials${qs ? `?${qs}` : ""}`;
}

export function useMaterials({ type, category, search }) {
  const filteredUrl = buildUrl({ type, category, search });
  const statsUrl = "/api/proxy/vendor/materials";

  // Filtered results — re-fetches whenever filters change; cached per unique URL
  const {
    data: filteredData,
    error,
    isLoading: loading,
    mutate: refetch,
  } = useSWR(filteredUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000, // dedupe identical requests within 30s
  });

  // Global stats — fetches once, cached for 60s; SWR dedupes the base URL hit
  const { data: statsData } = useSWR(statsUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  const materials = filteredData?.data ?? [];
  const all = statsData?.data ?? [];

  const stats = {
    total: all.length,
    video: all.filter((m) => m.file_type === "video").length,
    pdf: all.filter((m) => m.file_type === "pdf").length,
    image: all.filter((m) => m.file_type === "image").length,
  };

  return {
    materials,
    loading,
    error: error?.message ?? null,
    stats,
    refetch,
  };
}
