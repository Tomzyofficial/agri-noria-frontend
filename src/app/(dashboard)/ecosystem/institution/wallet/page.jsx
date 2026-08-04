"use client";
import React, { useState, useEffect, Suspense } from "react";
import WalletView from "@/app/(dashboard)/dashboard/components/Wallet/WalletView";
import { Button } from "@/components/ui/Button";
import { Building2, Globe2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

function WalletContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [fundingTarget, setFundingTarget] = useState(null); // 'personal' or 'ecosystem'
  const [amount, setAmount] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle Paystack Return Verification
  useEffect(() => {
    const reference = searchParams.get("reference");
    const target = searchParams.get("target") || "personal";

    if (reference) {
      verifyPayment(reference, target);
    }
  }, [searchParams]);

  const verifyPayment = async (reference, target) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/proxy/pipeline/wallet/fund/verify?reference=${reference}&target=${target}`);
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Successfully funded ${target === 'ecosystem' ? 'Ecosystem' : 'Institutional'} wallet!`);
        // Force re-render of WalletView
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(data.error || "Payment verification failed.");
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
    } finally {
      setIsVerifying(false);
      // Remove query params from URL
      router.replace("/ecosystem/institution/wallet");
    }
  };

  const handleFundSubmit = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsInitializing(true);
    try {
      const res = await fetch("/api/proxy/pipeline/wallet/fund/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          target: fundingTarget,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.authorization_url) {
        // Redirect to Paystack
        window.location.href = data.data.authorization_url;
      } else {
        toast.error(data.error || "Failed to initialize payment");
        setIsInitializing(false);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setIsInitializing(false);
    }
  };

  return (
    <div className="w-full">
      {isVerifying && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="font-semibold text-blue-800 dark:text-blue-300">Verifying secure payment...</span>
        </div>
      )}

      {/* Funding Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Institutional Funding</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fund your institutional wallet for direct interventions, or contribute directly to the global Ecosystem Treasury.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button 
            onClick={() => setFundingTarget("personal")}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Fund My Wallet
          </Button>
          <Button 
            onClick={() => setFundingTarget("ecosystem")}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Globe2 className="w-4 h-4 mr-2" />
            Fund Ecosystem
          </Button>
        </div>
      </div>

      {/* Wallet View */}
      <div key={refreshKey}>
        <WalletView role="institution" walletType="institutional" />
      </div>

      {/* Funding Modal */}
      <Modal isOpen={!!fundingTarget} onClick={() => setFundingTarget(null)}>
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {fundingTarget === 'ecosystem' ? 'Fund Ecosystem Treasury' : 'Fund Institutional Wallet'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the amount you wish to fund via Paystack secure checkout.
            </p>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300 font-medium block text-start">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mt-6">
            <div className="text-xs text-gray-500 flex items-center mb-4 sm:mb-0">
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border mr-2">Secure</span>
              Powered by Paystack
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setFundingTarget(null)} 
                disabled={isInitializing}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFundSubmit} 
                disabled={isInitializing || !amount}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {isInitializing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" /> Processing...</>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function InstitutionWalletPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <WalletContent />
    </Suspense>
  );
}
