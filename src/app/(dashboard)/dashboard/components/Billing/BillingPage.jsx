"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { CardDetails } from "./CardDetails";
import { BillingCycleButton } from "./BillingCycleButton";
import { BillingPlanCard } from "./BillingPlanCard";
import { BillingHistory } from "./BillingHistory";
import { fetcher } from "@/utils/otherUtils";
import useSWR from "swr";

export default function BillingPage({ plans, user }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 2;

  // Helper to get price for the correct cycle
  const getPrice = (plan) => {
    if (billingCycle === "monthly" && plan.billing_cycle === "monthly") {
      return parseFloat(plan.amount);
    }
    if (billingCycle === "annually" && plan.billing_cycle === "annually") {
      return parseFloat(plan.amount);
    }
  };

  const { data: historyData, error: historyError, isLoading: historyLoading } = useSWR(`/api/proxy/vendor/subscription/history?page=${page}&pageSize=${pageSize}`, fetcher);

  const { data: subscriptionData, error: subscriptionError, isLoading: subscriptionLoading } = useSWR("/api/proxy/vendor/subscription/current", fetcher);

  // Handle payment verification on page load (after redirect back from Paystack)
  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference") || searchParams.get("ref");

      if (!reference) return;
      setIsProcessing(true);

      try {
        const verifyUrl = `/api/proxy/vendor/subscription/verify?ref=${reference}`;
        const verifyResponse = await fetch(verifyUrl, {
          method: "GET",
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok) {
          throw new Error(verifyData.error || "Payment verification failed");
        }
        toast.success("Subscription activated successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to verify subscription");
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const handleSubscribe = async (plan) => {
    setIsProcessing(true);
    try {
      const selectedBillingCycle = billingCycle;
      const amount = getPrice(plan);

      if (!amount || amount <= 0) {
        throw new Error("Invalid plan amount");
      }
      const response = await fetch("/api/proxy/vendor/subscription/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          vendorId: user.userId,
          planId: plan.id,
          amount: amount,
          planName: plan.plan_name,
          interval: selectedBillingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize subscription");
      }

      window.location.href = data.data.authorization_url;
    } catch (error) {
      toast.error(error.message || "Failed to process subscription");
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
      const response = await fetch("/api/proxy/vendor/subscription/cancel", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Subscription cancelled");
      } else {
        toast.error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel subscription");
    }
  };

  const handleReactivate = async () => {
    if (!confirm("Are you sure you want to reactivate this plan?")) return;

    try {
      const response = await fetch("/api/proxy/vendor/subscription/reactivate", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Subscription reactivated");
      } else {
        toast.error(data.error || "Failed to reactivate subscription");
      }
    } catch (error) {
      toast.error(error.message || "Failed to reactivate subscription");
    }
  };

  const handleUpdateCard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/proxy/vendor/subscription/manage");

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("error occurred");
        toast.error(data.error);
        return;
      }

      window.open(data.url, "_blank");
    } catch (error) {
      console.log("error", error.message);
    } finally {
      router.refresh();
      setIsOpen(false);
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    console.log("plan id", planId);
    try {
      const response = await fetch("/api/proxy/vendor/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId: planId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error occurred.");
      }

      if (data.success) toast.success(data.message);
    } catch (error) {
      toast.error(error.message || "Error occurred.");
    }
  };

  const handleDowngrade = async (planId) => {
    try {
      const response = await fetch("/api/proxy/vendor/subscription/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId: planId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error occurred.");
      }

      if (data.success) toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Small utility to help with plan features parsing
  function parseFeatures(features) {
    if (!features) return [];
    if (typeof features === "object") return Object.entries(features);
    return [];
  }

  // Find all unique billing cycles
  const allCycles = Array.from(new Set(Array.isArray(plans) ? plans.map((p) => (p.billing_cycle === "annually" ? "annually" : "monthly")) : []));

  return (
    <div>
      {isProcessing && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          </div>
        </div>
      )}

      {/* Current card details */}
      <CardDetails subscriptionData={subscriptionData?.subscription} subscriptionLoading={subscriptionLoading} subscriptionError={subscriptionError} handleCancel={handleCancel} handleUpdateCard={handleUpdateCard} handleReactivate={handleReactivate} setIsOpen={setIsOpen} isOpen={isOpen} loading={loading} />

      {/* Toggle Billing Cycle */}
      {allCycles.length > 1 && <BillingCycleButton billingCycle={billingCycle} setBillingCycle={setBillingCycle} />}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {Array.isArray(plans) && plans.length > 0 ? (
          plans
            .filter((plan) => (billingCycle === "monthly" ? plan.billing_cycle === "monthly" : plan.billing_cycle === "annually"))
            .map((plan, idx) => (
              <BillingPlanCard
                key={idx}
                plan={plan}
                billingCycle={billingCycle}
                getPrice={getPrice}
                subscription={subscriptionData?.subscription}
                parseFeatures={parseFeatures}
                isSelected={selectedPlan === plan.plan_name}
                setSelectedPlan={setSelectedPlan}
                handleUpgrade={handleUpgrade}
                handleDowngrade={handleDowngrade}
                subscriptionLoading={subscriptionLoading}
                handleSubscribe={handleSubscribe}
              />
            ))
        ) : (
          <p>No plans available.</p>
        )}
      </div>

      {/* Billing history */}
      <div className="overflow-x-auto mt-20">
        <h1 className="mb-2">Billing history</h1>
        <BillingHistory page={page} setPage={setPage} pageSize={pageSize} historyData={historyData?.data} historyLoading={historyLoading} historyError={historyError} />
      </div>
    </div>
  );
}
