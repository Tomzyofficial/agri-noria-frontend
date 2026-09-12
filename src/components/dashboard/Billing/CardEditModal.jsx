"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditCardModal({ isOpen, onClose, handleUpdateCard, subscriptionData, loading }) {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
         <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            {/* Close */}
            <Button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
               <X size={20} />
            </Button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-2">Update Payment Method</h2>

            <p className="text-sm text-gray-500 mb-6">Your current card: {subscriptionData.last4.padStart(16, "*")}</p>

            {/* Info Box */}
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-6">
               You&apos;ll be redirected securely to update your card details.
            </div>

            {/* Action */}
            <Button
               onClick={handleUpdateCard}
               disabled={loading}
               className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition`}
            >
               {loading ? "Redirecting..." : "Update Card"}
            </Button>
         </div>
      </div>
   );
}
