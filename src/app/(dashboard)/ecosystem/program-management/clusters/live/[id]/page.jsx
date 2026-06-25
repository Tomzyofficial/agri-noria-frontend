"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LiveVideoSession } from "@/components/agora/LiveVideoSession";
import { useParams } from "next/navigation";

export default function ClusterLiveTrainingSession() {
   const params = useParams();
   const router = useRouter();
   const [sessionData, setSessionData] = useState(null);
   const [loadingMessage, setLoadingMessage] = useState("Preparing live session...");

   useEffect(() => {
      let cancelled = false;

      const loadSession = async () => {
         try {
            const userRes = await fetch("/api/proxy/auth/verify-vendor");
            let isSupervisor = false;
            if (userRes.ok) {
               const u = await userRes.json();
               if (u.role === "cluster supervisor" || u.role === "admin" || u.role === "super admin") {
                  isSupervisor = true;
               }
            }

            const endpoint = isSupervisor
               ? `/api/proxy/pipeline/clusters/training/${params.id}/start`
               : `/api/proxy/pipeline/clusters/training/${params.id}/join`;

            setLoadingMessage(isSupervisor ? "Opening host room..." : "Joining live room...");

            const response = await fetch(endpoint, { method: "POST" });
            const data = await response.json();

            if (!response.ok || !data.success) {
               throw new Error(data.error || "Failed to load live session");
            }

            const freshSession = {
               token: data.data.agoraToken,
               channelName: data.data.channelName,
               appId: data.data.appId,
               trainingId: params.id,
               isHost: isSupervisor,
               uid: data.data.uid,
               trainingTitle: data.data.training?.title,
            };

            if (!cancelled) {
               setSessionData(freshSession);
            }
         } catch (error) {
            console.error("Error preparing live session:", error);
            toast.error(error.message || "Failed to prepare live session");
            router.push("/ecosystem/program-management/clusters");
         }
      };

      loadSession();

      return () => {
         cancelled = true;
      };
   }, [params.id, router]);

   if (!sessionData) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-500 font-medium">{loadingMessage}</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center mb-4">
            <button
               onClick={() => router.push("/ecosystem/program-management/clusters")}
               className="text-gray-500 hover:text-gray-800 font-medium transition"
            >
               ← Back to Clusters
            </button>
         </div>
         <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="mb-6">
               <h1 className="text-2xl font-black text-(--foreground)">{sessionData.trainingTitle || "Cluster Live Training"}</h1>
               <p className="text-sm text-gray-500 font-medium">Session ID: {sessionData.trainingId}</p>
            </div>
            
            <LiveVideoSession 
               sessionData={sessionData} 
               onEndSession={() => router.push("/ecosystem/program-management/clusters")} 
            />
         </div>
      </div>
   );
}
