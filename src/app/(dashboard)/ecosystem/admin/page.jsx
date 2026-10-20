"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EcosystemAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/super-admin");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Redirecting to Admin Dashboard...
      </p>
    </div>
  );
}
