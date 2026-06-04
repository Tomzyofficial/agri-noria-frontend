"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import LogisticsForm from "@/components/quoteRequest/LogisticsForm";

export function VehicleActions({ vehicle }) {
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleEnquiry = async () => {
    setIsLoading(true);
    setEnquiryError(null);
    setEnquirySuccess(false);

    try {
      // This would typically send an enquiry to the backend
      // For now, we're showing the UI flow
      console.log("Enquiry sent for vehicle:", vehicle.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEnquirySuccess(true);
      setTimeout(() => setEnquirySuccess(false), 4000);
    } catch (error) {
      console.error("Error sending enquiry:", error);
      setEnquiryError("Failed to send enquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle.title,
          text: `Check out this ${vehicle.vehicle_type} on AgriNoria`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="bg-background dark:bg-(--card-dark) rounded-lg shadow-sm overflow-hidden sticky top-96">
      <div className="p-6 space-y-4">
        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          disabled={vehicle.status !== "available"}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            vehicle.status !== "available"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 active:scale-95"
          }`}
        >
          {vehicle.status === "available" ? "Request Quote" : "Unavailable"}
        </button>

        {/* Success Message */}
        {enquirySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✓ Enquiry sent successfully! We'll be in touch shortly.
            </p>
          </div>
        )}

        {/* Error Message */}
        {enquiryError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{enquiryError}</p>
          </div>
        )}

        {/* Secondary Action Button */}
        <button
          onClick={handleShare}
          className="w-full py-3 px-4 rounded-lg font-semibold text-green-700 border-2 border-green-600 hover:bg-green-50 active:scale-95 transition-all duration-200"
        >
          Share This Vehicle
        </button>

        {/* Availability Notice */}
        <div className="bg-blue-50 rounded-lg p-3 mt-4 border border-blue-100">
          <p className="text-xs text-blue-900">
            <strong>💡 Tip:</strong> Compare pricing and capacity with other
            vehicles to find the best match for your needs.
          </p>
        </div>
      </div>
      {/* Quote request form */}
      <Modal onClick={() => setOpenModal(false)} isOpen={openModal}>
        <LogisticsForm
          onClose={() => setOpenModal(false)}
          targetId={vehicle}
          quoteType="logistics"
        />
      </Modal>
    </div>
  );
}
