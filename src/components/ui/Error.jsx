"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter} from "next/navigation";

export function ErrorUi() {
   const router = useRouter();
   return (
      <div className="text-center col-span-full py-12" aria-atomic="true" aria-live="polite">
         <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
         <h3 className="text-lg font-semibold mb-2 text-red-600">Uh-oh! An error occurred.</h3>
         <Button
            onClick={() => router.refresh()}
            className="bg-red-600 text-red-200 p-2 rounded cursor-pointer hover:bg-red-700"
         >
            Try Again
         </Button>
      </div>
   );
}
