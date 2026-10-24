import { FaSeedling } from "react-icons/fa6";
import { Loader2 } from "lucide-react";

export default function SuperAdminLoading() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 gap-3 font-sans">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center animate-pulse">
        <FaSeedling className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
        <span>Loading Ecosystem Data...</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium text-center">
        Synchronizing live administrative metrics & user records...
      </p>
    </div>
  );
}
