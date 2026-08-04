"use client";
import { useState, createContext, useContext } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";

const FarmerDataContext = createContext();

const fetcher = (url) => fetch(url).then((res) => res.json());

export function FarmerDataProvider({ children }) {
   const [enrollingProgramId, setEnrollingProgramId] = useState(null);

   const { data: profileRes, isLoading: l1, mutate: mutateProfile } = useSWR("/api/proxy/pipeline/farmer-profile/me", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: walletRes, isLoading: l2, mutate: mutateWallet } = useSWR("/api/proxy/pipeline/wallet?type=farmer", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: inputsRes, isLoading: l3, mutate: mutateInputs } = useSWR("/api/proxy/pipeline/inputs/mine", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: plantingRes, isLoading: l4, mutate: mutatePlanting } = useSWR("/api/proxy/pipeline/planting/mine", fetcher, { refreshInterval: 5000 });
   const { data: statsRes, isLoading: l5, mutate: mutateStats } = useSWR("/api/proxy/pipeline/stats", fetcher, { refreshInterval: 10000 });
   const { data: programsRes, isLoading: l6, mutate: mutatePrograms } = useSWR("/api/proxy/programs", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });
   const { data: trainingRes, mutate: mutateTraining } = useSWR("/api/proxy/pipeline/training", fetcher, { refreshInterval: 15000 });
   const { data: clusterRes, isLoading: l8, mutate: mutateCluster } = useSWR("/api/proxy/pipeline/clusters/mine", fetcher, { refreshInterval: 5000, revalidateOnFocus: true });

   const profile = profileRes?.data || null;
   const wallet = walletRes?.data?.wallet || null;
   const transactions = walletRes?.data?.transactions || [];
   const inputRequests = inputsRes?.data || [];
   const plantingData = plantingRes?.data || [];
   const stats = statsRes?.data || {};
   const availablePrograms = programsRes?.data || [];
   const trainingData = trainingRes?.data || { modules: [], progress: [] };
   const myCluster = clusterRes?.data || null;

   const { data: clusterTrainingsRes, mutate: mutateClusterTrainings } = useSWR(
      myCluster?.id ? `/api/proxy/pipeline/clusters/${myCluster.id}/training` : null, 
      fetcher, 
      { refreshInterval: 15000 }
   );
   const clusterTrainings = clusterTrainingsRes?.data || [];

   const loading = l1 || l2 || l6;

   const refreshData = async () => {
      await Promise.all([
         mutateProfile(),
         mutateWallet(),
         mutateInputs(),
         mutatePlanting(),
         mutateStats(),
         mutatePrograms(),
         mutateTraining(),
         mutateCluster(),
         mutateClusterTrainings(),
      ]);
   };

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
            await refreshData();
         } else {
            toast.error("Failed to enroll");
         }
      } catch (err) {
         toast.error("Network error");
      } finally {
         setEnrollingProgramId(null);
      }
   };

   const isVerified = profile?.is_verified === true || profile?.vendor_is_verified === true || profile?.onboarding_status === "verified" || profile?.onboarding_status === "completed" || profile?.vendor_onboarding_status === "verified" || (profile?.onboarding_level >= 2) || (profile?.vendor_onboarding_level >= 2);

   const value = {
      loading,
      profile,
      isVerified,
      wallet,
      transactions,
      inputRequests,
      plantingData,
      stats,
      availablePrograms,
      trainingData,
      clusterTrainings,
      myCluster,
      enrollingProgramId,
      refreshData,
      fetchData: refreshData,
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
