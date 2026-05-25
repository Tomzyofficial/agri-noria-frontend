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

   useEffect(() => {
      // Get session data from localStorage
      const storedSession = localStorage.getItem(`agoraSession_${params.id}`);
      if (storedSession) {
         const session = JSON.parse(storedSession);
         setSessionData(session);
      } else {
         toast.error("No session data found");
         router.push("/dashboard/store/enrollment");
      }
   }, [params.id, router]);

   console.log("JOINING WITH UID:", sessionData?.uid);

   const handleEndSession = () => {
      localStorage.removeItem(`agoraSession_${params.id}`);

      router.push("/dashboard/store/enrollment");
      router.refresh();
   };

   if (!sessionData) {
      return (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
         </div>
      );
   }

   return <LiveVideoSession sessionData={sessionData} onEndSession={handleEndSession} />;
}
