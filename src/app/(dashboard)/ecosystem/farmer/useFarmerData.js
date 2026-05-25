"use client";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { toast } from "react-toastify";

const FarmerDataContext = createContext();

export function FarmerDataProvider({ children }) {
   const [loading, setLoading] = useState(true);
   const [profile, setProfile] = useState(null);
   const [wallet, setWallet] = useState(null);
   const [transactions, setTransactions] = useState([]);
   const [inputRequests, setInputRequests] = useState([]);
   const [plantingData, setPlantingData] = useState([]);
   const [stats, setStats] = useState({});
   const [availablePrograms, setAvailablePrograms] = useState([]);
   const [trainingData, setTrainingData] = useState({ modules: [], progress: [] });
   const [myCluster, setMyCluster] = useState(null);
   const [enrollingProgramId, setEnrollingProgramId] = useState(null);

   const fetchData = useCallback(async () => {
      setLoading(true);
      try {
         const [profileRes, walletRes, inputsRes, plantingRes, statsRes, programsRes, trainingRes, clusterRes] =
            await Promise.all([
               fetch("/api/proxy/pipeline/farmer-profile/me"),
               fetch("/api/proxy/pipeline/wallet?type=farmer"),
               fetch("/api/proxy/pipeline/inputs/mine"),
               fetch("/api/proxy/pipeline/planting/mine"),
               fetch("/api/proxy/pipeline/stats"),
               fetch("/api/proxy/programs"),
               fetch("/api/proxy/pipeline/training"),
               fetch("/api/proxy/pipeline/clusters/mine"),
            ]);

         if (profileRes.ok) {
            const d = await profileRes.json();
            setProfile(d.data);
         }
         if (walletRes.ok) {
            const d = await walletRes.json();
            setWallet(d.data?.wallet);
            setTransactions(d.data?.transactions || []);
         }
         if (inputsRes.ok) {
            const d = await inputsRes.json();
            setInputRequests(d.data || []);
         }
         if (plantingRes.ok) {
            const d = await plantingRes.json();
            setPlantingData(d.data || []);
         }
         if (statsRes.ok) {
            const d = await statsRes.json();
            setStats(d.data || {});
         }
         if (programsRes.ok) {
            const d = await programsRes.json();
            setAvailablePrograms(d.data || []);
         }
         if (trainingRes.ok) {
            const d = await trainingRes.json();
            setTrainingData(d.data || { modules: [], progress: [] });
         }
         if (clusterRes.ok) {
            const d = await clusterRes.json();
            setMyCluster(d.data);
         }
      } catch (err) {
         console.error("Error fetching farmer data:", err);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const handleEnroll = async (programId) => {
      setEnrollingProgramId(programId);
      try {
         const res = await fetch("/api/proxy/pipeline/farmer-profile/enroll", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ program_id: programId }),
         });
         if (res.ok) {
            toast.success("Successfully enrolled in program!");
            await fetchData();
         } else {
            toast.error("Failed to enroll");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setEnrollingProgramId(null);
      }
   };

   const value = {
      loading,
      profile,
      wallet,
      transactions,
      inputRequests,
      plantingData,
      stats,
      availablePrograms,
      trainingData,
      myCluster,
      enrollingProgramId,
      refreshData: fetchData,
      handleEnroll,
   };

   return <FarmerDataContext.Provider value={value}>{children}</FarmerDataContext.Provider>;
}

export function useFarmerData() {
   const context = useContext(FarmerDataContext);
   if (!context) {
      throw new Error("useFarmerData must be used within a FarmerDataProvider");
   }
   return context;
}
