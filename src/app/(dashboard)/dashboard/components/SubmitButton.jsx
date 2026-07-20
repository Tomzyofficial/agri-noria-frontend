"use client";

import { Button } from "@/components/ui/Button";
import { FaSpinner } from "react-icons/fa6";

export default function SubmitButton({ loading, text = "Publish listing", loadingText = "Please wait..." }) {
   return (
      <div className="flex justify-start">
         <Button type="submit" disabled={loading} className="px-4 py-2 focus:scale-105 hover:scale-105 transition bg-(--greenish-color) rounded-md text-(--white-fff) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? (
               <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  {loadingText}
               </span>
            ) : (
               text
            )}
         </Button>
      </div>
   );
}
