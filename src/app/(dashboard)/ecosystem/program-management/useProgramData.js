"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export function useProgramData() {
   const [loading, setLoading] = useState(true);
   const [clusters, setClusters] = useState([]);
   const [stats, setStats] = useState({});
   const [clusterWallet, setClusterWallet] = useState(null);
   const [clusterTransactions, setClusterTransactions] = useState([]);
   const [pendingInputs, setPendingInputs] = useState([]);
   const [programs, setPrograms] = useState([]);
   const [currentUserId, setCurrentUserId] = useState(null);
   const [currentUser, setCurrentUser] = useState(null);
   const [userRole, setUserRole] = useState(null);
   const [eligibleFarmers, setEligibleFarmers] = useState([]);
   const [clusterMembers, setClusterMembers] = useState([]);

   const fetchData = useCallback(async () => {
      try {
         const [clustersRes, statsRes, pendingRes, programsRes, sessionRes] = await Promise.all([
            fetch("/api/proxy/pipeline/clusters"),
            fetch("/api/proxy/pipeline/stats"),
            fetch("/api/proxy/pipeline/inputs/pending"),
            fetch("/api/proxy/programs"),
            fetch("/api/proxy/auth/verify-vendor"),
         ]);
         
         if (clustersRes.ok) {
            const d = await clustersRes.json();
            const clusterData = d.data || [];
            setClusters(clusterData);
            if (clusterData.length > 0) {
               const walletRes = await fetch(`/api/proxy/pipeline/wallet?type=cluster&cluster_id=${clusterData[0].id}`);
               if (walletRes.ok) {
                  const wd = await walletRes.json();
                  setClusterWallet(wd.data?.wallet);
                  setClusterTransactions(wd.data?.transactions || []);
               }
            }
         }
         if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data || {}); }
         if (pendingRes.ok) { const d = await pendingRes.json(); setPendingInputs(d.data || []); }
         if (programsRes.ok) { const d = await programsRes.json(); setPrograms(d.data || []); }
         if (sessionRes.ok) {
            const d = await sessionRes.json();
            setCurrentUserId(d.userId);
            setUserRole(d.role?.toLowerCase());
            setCurrentUser(d);
         }
      } catch (err) {
         console.error("Error fetching program data:", err);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const fetchClusters = async () => {
      const res = await fetch("/api/proxy/pipeline/clusters");
      if (res.ok) setClusters((await res.json()).data || []);
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

   return {
      loading, clusters, stats, clusterWallet, clusterTransactions, pendingInputs, programs,
      currentUserId, currentUser, userRole, eligibleFarmers, clusterMembers,
      fetchData, fetchClusters, fetchClusterMembers, fetchEligibleFarmers,
      setClusters, setClusterWallet, setClusterTransactions, setPendingInputs, setPrograms
   };
}
