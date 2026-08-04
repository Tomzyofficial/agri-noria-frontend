"use client";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useProgramData() {
   const [eligibleFarmers, setEligibleFarmers] = useState([]);
   const [clusterMembers, setClusterMembers] = useState([]);

   const { data: clustersRes, isLoading: l1, mutate: mutateClusters } = useSWR("/api/proxy/pipeline/clusters", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: statsRes, isLoading: l2, mutate: mutateStats } = useSWR("/api/proxy/pipeline/stats", fetcher, { refreshInterval: 10000 });
   const { data: pendingRes, isLoading: l3, mutate: mutatePending } = useSWR("/api/proxy/pipeline/inputs/pending", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: programsRes, isLoading: l4, mutate: mutatePrograms } = useSWR("/api/proxy/programs", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: sessionRes, isLoading: l5 } = useSWR("/api/proxy/auth/verify-vendor", fetcher, { revalidateOnFocus: false });

   const clusters = clustersRes?.data || [];
   const stats = statsRes?.data || {};
   const pendingInputs = pendingRes?.data || [];
   const programs = programsRes?.data || [];

   const firstClusterId = clusters.length > 0 ? clusters[0].id : null;
   const { data: walletRes, mutate: mutateWallet } = useSWR(
      firstClusterId ? `/api/proxy/pipeline/wallet?type=cluster&cluster_id=${firstClusterId}` : null,
      fetcher,
      { refreshInterval: 5000, revalidateOnFocus: true }
   );

   const clusterWallet = walletRes?.data?.wallet || null;
   const clusterTransactions = walletRes?.data?.transactions || [];

   const currentUserId = sessionRes?.userId || null;
   const userRole = sessionRes?.role?.toLowerCase() || null;
   const currentUser = sessionRes || null;

   const loading = l1 || l4 || l5;

   const fetchData = async () => {
      await Promise.all([
         mutateClusters(),
         mutateStats(),
         mutatePending(),
         mutatePrograms(),
         mutateWallet(),
      ]);
   };

   const fetchClusters = async () => {
      await mutateClusters();
   };

   const fetchClusterMembers = async (cluster) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/${cluster.id}/members`);
         const json = await res.json();
         if (json.success) setClusterMembers(json.data || []);
      } catch {
         toast.error("Failed to fetch members");
      }
   };

   const fetchEligibleFarmers = async (programId, clusterId) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/clusters/eligible-farmers?program_id=${programId}&cluster_id=${clusterId}`);
         const json = await res.json();
         if (json.success) setEligibleFarmers(json.data || []);
      } catch {
         toast.error("Failed to fetch eligible farmers");
      }
   };

   const setClusters = (data) => mutateClusters({ success: true, data }, false);
   const setPrograms = (data) => mutatePrograms({ success: true, data }, false);
   const setPendingInputs = (data) => mutatePending({ success: true, data }, false);
   const setClusterWallet = (data) => mutateWallet({ success: true, data: { wallet: data, transactions: clusterTransactions } }, false);
   const setClusterTransactions = (data) => mutateWallet({ success: true, data: { wallet: clusterWallet, transactions: data } }, false);

   return {
      loading, clusters, stats, clusterWallet, clusterTransactions, pendingInputs, programs,
      currentUserId, currentUser, userRole, eligibleFarmers, clusterMembers,
      fetchData, fetchClusters, fetchClusterMembers, fetchEligibleFarmers,
      setClusters, setClusterWallet, setClusterTransactions, setPendingInputs, setPrograms
   };
}
