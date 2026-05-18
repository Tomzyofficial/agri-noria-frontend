import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

export function VerifyNotiBanner({ setDismissed }) {
   return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
         <div
            className="relative isolate rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white p-6 sm:p-10 shadow-2xl max-w-3xl w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-alert"
         >
            {/* Dismiss button */}
            <Button
               type="button"
               aria-label="Dismiss verification notice"
               className="absolute cursor-pointer top-3 right-3 z-50 inline-flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white w-8 h-8"
               onClick={() => {
                  setDismissed(true);
                  try {
                     sessionStorage.setItem("dismiss_verify_banner", "true");
                  } catch {}
               }}
            >
               <span className="sr-only">Dismiss</span>
               <X className="w-5 h-5" />
            </Button>

            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-8 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
               <div>
                  <h1 id="welcome-alert" className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                     Welcome to your dashboard
                  </h1>
                  <p className="text-white/90 max-w-2xl">
                     Complete your profile and verification to start creating listings and reach ready buyers with
                     confidence.
                  </p>
               </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-white/90">
               <div className="rounded-lg bg-white/10 px-3 py-2">Increase trust</div>
               <div className="rounded-lg bg-white/10 px-3 py-2">Unlock product posting</div>
               <div className="rounded-lg bg-white/10 px-3 py-2">Faster approvals</div>
               <div className="rounded-lg bg-white/10 px-3 py-2">Better visibility</div>
            </div>
         </div>
      </div>
   );
}
