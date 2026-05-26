"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LiveVideoSession } from "@/components/agora/LiveVideoSession";
import { useParams } from "next/navigation";

export default function LiveTrainingSession() {
   const params = useParams();
   const router = useRouter();
   const [sessionData, setSessionData] = useState(null);
   const [loadingMessage, setLoadingMessage] = useState("Preparing live session...");

   useEffect(() => {
      let cancelled = false;

      const loadSession = async () => {
         const storedSession = localStorage.getItem(`agoraSession_${params.id}`);
         if (!storedSession) {
            toast.error("No session data found");
            router.push("/marketplace/store/enrollments");
            return;
         }

         try {
            const session = JSON.parse(storedSession);
            const endpoint = session.isHost
               ? `/api/proxy/vendor/training/${params.id}/start`
               : `/api/proxy/vendor/training/${params.id}/join`;

            setLoadingMessage(session.isHost ? "Opening host room..." : "Joining live room...");

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
               isHost: session.isHost,
               uid: data.data.uid,
               trainingTitle: data.data.training?.title || session.trainingTitle,
            };

            localStorage.setItem(`agoraSession_${params.id}`, JSON.stringify(freshSession));

            if (!cancelled) {
               setSessionData(freshSession);
            }
         } catch (error) {
            console.error("Error preparing live session:", error);
            toast.error(error.message || "Failed to prepare live session");
            router.push("/marketplace/store/enrollments");
         }
      };

      loadSession();

      return () => {
         cancelled = true;
      };
   }, [params.id, router]);

   const handleEndSession = () => {
      localStorage.removeItem(`agoraSession_${params.id}`);

      router.push(sessionData?.isHost ? "/marketplace/trainer" : "/marketplace/store/enrollments");
      router.refresh();
   };

   if (!sessionData) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="flex flex-col items-center gap-4">
               <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-b-emerald-400"></div>
               <p className="text-sm font-medium text-slate-300">{loadingMessage}</p>
            </div>
         </div>
      );
   }

   return <LiveVideoSession sessionData={sessionData} onEndSession={handleEndSession} />;
}
