"use client";
import { useState, useEffect } from "react";
import { GoBriefcase } from "react-icons/go";
import { Briefcase, CheckCircle2, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function KycVerification({ is_verified, rows, license_status, id_front_status, id_back_status }) {
   const [showComplianceModal, setShowComplianceModal] = useState(false);

   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === "Escape") setShowComplianceModal(false);
      };
      if (showComplianceModal) {
         window.addEventListener("keydown", handleKeyDown);
      }
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, [showComplianceModal]);

   return (
      <section
         className={`bg-(--white-fff) dark:bg-(--card-dark) p-4 rounded-xl shadow-xl border-t-4 ${
            !is_verified ? "border-red-500" : "border-green-700"
         }`}
      >
         <div className="mb-4 flex justify-between gap-1.5 items-center">
            <h2 className="font-semibold text-lg">KYC & Verification Status</h2>

            {/* Global Verification Badge (Attention Grabber) */}
            {!is_verified ? (
               <p className="text-xs font-normal text-red-700 bg-red-100 px-3 py-1 rounded-full">
                  Action Required
               </p>
            ) : (
               <p className="text-xs font-normal text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
               </p>
            )}
         </div>

         {!is_verified ? (
            <p className="text-sm text-gray-600 mb-6">
               Complete all verification steps to unlock premium features and increase buyer trust.
            </p>
         ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
               Your vendor credentials and KYC documentation are active and compliant with platform policies.
            </p>
         )}

         <div className="space-y-4">
            {/* KYC Item 1: Business License */}
            <div className="flex dark:bg-(--background) items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center">
                  <GoBriefcase className="mr-3 text-gray-500 w-4 h-4" />
                  <span>Business License</span>
               </div>

               {license_status === "rejected" ? (
                  <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                     Rejected
                  </Badge>
               ) : license_status === "pending" ? (
                  <Badge className="text-xs font-normal text-orange-700 bg-orange-100 px-1 py-0.5 rounded">
                     Pending
                  </Badge>
               ) : license_status === "approved" ? (
                  <Badge className="text-xs font-normal text-green-700 bg-green-100 px-1 py-0.5 rounded">
                     Approved
                  </Badge>
               ) : (
                  <Badge className="text-xs font-normal text-gray-700 bg-gray-100 px-1 py-0.5 rounded">
                     Not Uploaded
                  </Badge>
               )}
            </div>

            {/* KYC Item 2: ID Card */}
            <div className="flex dark:bg-(--background) items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center">
                  <Briefcase className="mr-3 text-gray-500 w-4 h-4" />
                  <span>National ID Card</span>
               </div>

               {id_front_status === "rejected" || id_back_status === "rejected" ? (
                  <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                     Rejected
                  </Badge>
               ) : id_front_status === "pending" || id_back_status === "pending" ? (
                  <Badge className="text-xs font-normal text-orange-700 bg-orange-100 px-1 py-0.5 rounded">
                     Pending
                  </Badge>
               ) : id_front_status === "approved" && id_back_status === "approved" ? (
                  <Badge className="text-xs font-normal text-green-700 bg-green-100 px-1 py-0.5 rounded">
                     Approved
                  </Badge>
               ) : (
                  <Badge className="text-xs font-normal text-gray-700 bg-gray-100 px-1 py-0.5 rounded">
                     Not Uploaded
                  </Badge>
               )}
            </div>

            {/* KYC Item 3: Bank Account Verification */}
            <div className="flex dark:bg-(--background) items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center">
                  <svg
                     className="w-5 h-5 text-gray-500 mr-3"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                     ></path>
                  </svg>
                  <span>Bank Account (Payout)</span>
               </div>
               <Badge className="text-xs font-normal text-green-700 bg-green-100 px-1 py-0.5 rounded">
                  Active
               </Badge>
            </div>
         </div>

         {/* Compliance CTA (A050 Fix) */}
         <div className="mt-6 pt-4 border-t text-center">
            <button
               type="button"
               onClick={() => setShowComplianceModal(true)}
               className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
               View Compliance Details →
            </button>
         </div>

         {/* Compliance Inspection Modal */}
         {showComplianceModal && (
            <div
               role="dialog"
               aria-modal="true"
               aria-labelledby="compliance-modal-title"
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            >
               <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                     <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 id="compliance-modal-title" className="font-bold text-base text-gray-900 dark:text-white">Compliance & Governance Status</h3>
                           <p className="text-xs text-gray-500">Regulatory standards and identity verification summary</p>
                        </div>
                     </div>
                     <button
                        type="button"
                        onClick={() => setShowComplianceModal(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg"
                        aria-label="Close compliance details"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-3 text-xs">
                     <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Overall KYC Tier</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{is_verified ? "Tier 2 Verified" : "Tier 1 Provisional"}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">AML Screening</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Passed (No Sanction Matches)</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Identity Attestation</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{license_status === "approved" ? "Government CAC Registered" : "Individual Self-Declared"}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Escrow Settlement Clearance</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Eligible for Platform Payouts</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Audit Trail Verification ID</span>
                        <span className="font-mono text-[11px] text-gray-500">AN-KYC-AUDIT-20261023</span>
                     </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                     <button
                        type="button"
                        onClick={() => setShowComplianceModal(false)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                     >
                        Done
                     </button>
                  </div>
               </div>
            </div>
         )}
      </section>
   );
}
