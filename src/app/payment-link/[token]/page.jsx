"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FaCreditCard, FaLock, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function PaymentLinkPage({ params }) {
    const { token } = params;
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const res = await fetch(`/api/proxy/aggregator/review-agreement/${token}`);
                const d = await res.json();
                if (res.ok) setAgreement(d.data);
            } catch (err) {
                console.error("Error fetching agreement:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgreement();
    }, [token]);

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/proxy/aggregator/initialize-payment/${token}`, {
                method: "POST"
            });
            const d = await res.json();
            if (res.ok && d.data?.authorization_url) {
                window.location.href = d.data.authorization_url;
            } else {
                toast.error(d.error || "Failed to initialize payment. Ensure the agreement is signed if required.");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;
    if (!agreement) return <div className="min-h-screen flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold">Payment Link Invalid</h1></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg rounded-3xl shadow-2xl border-none bg-white overflow-hidden">
                <div className="bg-green-600 p-8 text-white text-center">
                    <FaCreditCard size={48} className="mx-auto mb-4 opacity-80" />
                    <h1 className="text-3xl font-black">Escrow Payment</h1>
                    <p className="opacity-80 mt-2">Secure payment for purchase agreement</p>
                </div>

                <CardContent className="p-8 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Summary</p>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Buyer</span>
                                <span className="font-bold">{agreement.buyer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Product</span>
                                <span className="font-bold">{agreement.product_details.commodity}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-lg font-bold">Total Amount</span>
                                <span className="text-3xl font-black text-green-600">₦{parseFloat(agreement.financing_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm">
                        <FaShieldAlt className="shrink-0" />
                        <p>Funds will be held in <strong>Escrow</strong> and released only after delivery is confirmed.</p>
                    </div>

                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-3"
                    >
                        {isProcessing ? "Redirecting..." : <><FaLock size={18} /> Pay Now via Paystack</>}
                    </Button>

                    <div className="text-center">
                        <img src="https://paystack.com/assets/img/og/paystack-badge.png" alt="Paystack" className="h-8 mx-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Secured by Paystack</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
