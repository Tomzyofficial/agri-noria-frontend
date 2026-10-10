"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Sprout, Store, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { verifyVendorSession } from "@/actions/session";
import {
   isSharedRole,
   getSharedRoleConfig,
   isEcosystemVerified,
   normalizeRole,
} from "@/utils/roleHelper";

export function WorkspaceSwitcher({ currentWorkspace = "marketplace", role: initialRole = null, session: initialSession = null }) {
   const router = useRouter();
   const [session, setSession] = useState(initialSession);
   const [role, setRole] = useState(initialRole);
   const [isSwitching, setIsSwitching] = useState(false);

   useEffect(() => {
      if (!initialSession || !initialRole) {
         verifyVendorSession().then((res) => {
            if (res?.authenticated) {
               setSession(res);
               setRole(res.role);
            }
         });
      }
   }, [initialSession, initialRole]);

   const normalizedRole = normalizeRole(role || session?.role);
   if (!isSharedRole(normalizedRole)) {
      return null;
   }

   const config = getSharedRoleConfig(normalizedRole);
   const isMarketplace = currentWorkspace === "marketplace";
   const targetWorkspace = isMarketplace ? "ecosystem" : "marketplace";
   const targetTitle = isMarketplace ? "Ecosystem" : "Marketplace";

   const handleSwitch = async () => {
      if (isSwitching) return;
      setIsSwitching(true);

      try {
         // Re-fetch latest session state to check fresh verification status
         const activeSession = (await verifyVendorSession()) || session;

         if (targetWorkspace === "ecosystem") {
            // Check if this role requires onboarding in the ecosystem
            if (config?.hasEcosystemOnboarding) {
               const verified = isEcosystemVerified(activeSession);
               if (!verified) {
                  toast.info("🌾 Please complete your farm onboarding to access the Ecosystem", {
                     toastId: "ecosystem-onboarding-prompt",
                     autoClose: 3500,
                  });
                  window.location.href = config.ecosystemOnboardingRoute || "/ecosystem/farmer/onboarding";
                  return;
               }
            }
            // If verified or role does not require ecosystem onboarding (e.g. Logistics, Storage)
            window.location.href = config.ecosystemRoute;
         } else {
            // Switching to Marketplace
            window.location.href = config.marketplaceRoute;
         }
      } catch (error) {
         console.error("Workspace switch error:", error);
         toast.error("Failed to switch workspace. Please try again.");
      } finally {
         setTimeout(() => setIsSwitching(false), 800);
      }
   };

   return (
      <div className="w-full my-3 p-3 rounded-2xl bg-gradient-to-br from-green-50/80 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-900/90 dark:to-green-950/20 border border-green-200/60 dark:border-green-900/30 shadow-xs">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
               Workspace
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-300/40">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               {isMarketplace ? "Marketplace" : "Ecosystem"}
            </span>
         </div>

         <button
            type="button"
            onClick={handleSwitch}
            disabled={isSwitching}
            className="w-full cursor-pointer group flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-sm active:scale-[0.98]"
            title={`Switch to ${targetTitle}`}
         >
            {isSwitching ? (
               <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
                  <span>Switching...</span>
               </>
            ) : (
               <>
                  <ArrowLeftRight className="w-3.5 h-3.5 text-green-600 group-hover:rotate-180 transition-transform duration-300" />
                  <span>Switch to {targetTitle}</span>
                  {isMarketplace ? (
                     <Sprout className="w-3.5 h-3.5 text-green-600 ml-auto" />
                  ) : (
                     <Store className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                  )}
               </>
            )}
         </button>
      </div>
   );
}
export default WorkspaceSwitcher;
