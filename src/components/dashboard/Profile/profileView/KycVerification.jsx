import { GoBriefcase } from "react-icons/go";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export function KycVerification({ is_verified, rows, license_status, id_front_status, id_back_status }) {
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
               ""
            )}
         </div>

         {!is_verified ? (
            <p className="text-sm text-gray-600 mb-6">
               Complete all verification steps to unlock premium features and increase buyer trust.
            </p>
         ) : (
            ""
         )}

         <div className="space-y-4">
            {/* KYC Item 1: Business License */}
            <div className="flex dark:bg-(--background) items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center">
                  <GoBriefcase className="mr-3 text-gray-500 w-4 h-4" />
                  <span>Business License</span>
               </div>
               {/* Status Badge */}
               {!rows ? (
                  <Badge className="bg-yellow-100 px-2 py-0.5 text-sm font-normal text-yellow-700">N/A</Badge>
               ) : (
                  (() => {
                     // Compute document status
                     if (license_status === "pending") {
                        return (
                           <Badge className="text-xs font-normal text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded">
                              Pending Review
                           </Badge>
                        );
                     } else if (license_status === "declined") {
                        return (
                           <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                              Declined
                           </Badge>
                        );
                     } else {
                        return (
                           <Badge className="text-xs font-normal text-green-700 bg-green-100 px-1 py-0.5 rounded">
                              Approved
                           </Badge>
                        );
                     }
                  })()
               )}
            </div>

            {/* KYC Item 2: National ID/Passport */}
            <div className="flex dark:bg-(--background) items-center justify-between p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center">
                  <Briefcase className="mr-3 text-gray-500 w-4 h-4" />
                  <span>ID Document</span>
               </div>
               {/* Status Badge */}
               {!rows ? (
                  <span className="bg-yellow-100 px-2 py-0.5 text-sm font-normal text-yellow-700">N/A</span>
               ) : (
                  (() => {
                     // Compute document status
                     if (id_front_status === "declined" && id_back_status === "declined") {
                        return (
                           <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                              Declined
                           </Badge>
                        );
                     }

                     if (
                        (id_front_status === "declined" && id_back_status === "pending") ||
                        (id_back_status === "declined" && id_front_status === "pending")
                     ) {
                        return (
                           <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                              Action Needed
                           </Badge>
                        );
                     }

                     if (
                        (id_front_status === "approved" && id_back_status === "declined") ||
                        (id_back_status === "approved" && id_front_status === "declined")
                     ) {
                        return (
                           <Badge className="text-xs font-normal text-red-700 bg-red-100 px-1 py-0.5 rounded">
                              Action Needed
                           </Badge>
                        );
                     }

                     if (id_front_status === "pending" || id_back_status === "pending") {
                        return (
                           <Badge className="text-xs font-normal text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded">
                              Pending Review
                           </Badge>
                        );
                     }

                     if (id_front_status === "approved" && id_back_status === "approved") {
                        return (
                           <Badge className="text-xs font-normal text-green-700 bg-green-100 px-1 py-0.5 rounded">
                              Approved
                           </Badge>
                        );
                     }
                  })()
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
            </div>
         </div>

         {/* Compliance CTA */}
         <div className="mt-6 pt-4 border-t text-center">
            <Link href="#" className="text-sm font-medium">
               View Compliance Details →
            </Link>
         </div>
      </section>
   );
}
