import { RegisterForm } from "@/app/auth/(buyerSpecific)/identification/register/registerForm";
import Link from "next/link";
import { Suspense } from "react";
import { FaSeedling } from "react-icons/fa6";

export const metadata = {
   title: "Register | Agri-Noria Marketplace",
   description: "Register to create your buyer account",
};

export default function Register() {
   return (
      <div className="min-h-screen bg-slate-50 dark:bg-(--background) flex items-center justify-center p-4">
         <div className="w-full max-w-md">
            {/* Brand Leaf Icon & Title */}
            <div className="flex flex-col items-center text-center mb-6">
               <Link href="/" className="group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                     <FaSeedling className="w-7 h-7" />
                  </div>
               </Link>
               <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Join Agri-Noria
               </h1>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                  Create a buyer account for agricultural produce and inputs
               </p>
            </div>

            {/* Card Container */}
            <div className="border border-emerald-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-3xl p-6 sm:p-8">
               <Suspense fallback={<div className="text-center py-6 text-sm text-gray-500">Loading form...</div>}>
                  <RegisterForm />
               </Suspense>
            </div>
         </div>
      </div>
   );
}
