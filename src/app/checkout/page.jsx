"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock cart data - in production, this would come from cart API
  useEffect(() => {
    setCartItems([
      {
        id: "1",
        listing_name: "Fresh Tomatoes",
        price: 5000,
        quantity: 2,
        product_image: "/images/tomatoes.jpg",
        unit: "basket",
        seller_id: "mock-seller-id",
        seller_name: "John Farmer",
      },
      {
        id: "2",
        listing_name: "Organic Rice",
        price: 15000,
        quantity: 1,
        product_image: "/images/rice.jpg",
        unit: "bag",
        seller_id: "mock-seller-id",
        seller_name: "John Farmer",
      },
    ]);
  }, []);

  // Mock logistics options
  const logisticsOptions = [
    {
      id: "1",
      company_name: "FastTrack Logistics",
      vehicle_type: "5-ton truck",
      estimated_delivery: "2-3 days",
      price: 5000,
      rating: 4.8,
    },
    {
      id: "2",
      company_name: "AgriHaul Services",
      vehicle_type: "3-ton truck",
      estimated_delivery: "3-4 days",
      price: 3500,
      rating: 4.5,
    },
    {
      id: "3",
      company_name: "FarmExpress",
      vehicle_type: "Van",
      estimated_delivery: "4-5 days",
      price: 2500,
      rating: 4.2,
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = selectedLogistics ? selectedLogistics.price : 0;
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) {
      alert("Please enter a delivery address");
      return;
    }

    if (!selectedLogistics) {
      alert("Please select a logistics option");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/proxy/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_id: "mock-buyer-id",
          seller_id: cartItems[0].seller_id,
          total_amount: totalAmount,
          fulfillment_type: "delivery",
          delivery_address: deliveryAddress,
          delivery_fee: deliveryFee,
          items: cartItems.map((item) => ({
            product_id: item.id,
            product_type: "produce",
            quantity: item.quantity,
            unit_price: item.price,
            packaging_type: item.unit,
            product_name: item.listing_name,
            product_image: item.product_image,
          })),
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        // Create payment
        const paymentResponse = await fetch("/api/proxy/payments/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderData.data.id,
            payer_id: "mock-buyer-id",
            amount: totalAmount,
            payment_provider: "paystack",
            payment_method: "card",
            status: "pending",
            escrow_status: "held",
          }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.success) {
          alert("Order placed successfully! Redirecting to payment...");
          // In production, redirect to payment page
          // router.push(`/payment/${paymentData.data.id}`);
        } else {
          alert("Failed to create payment");
        }
      } else {
        alert("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            Complete your order securely with escrow protection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart and Logistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Summary
                  </h2>
                </div>
              </div>
              <div className="px-6 py-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.listing_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Seller: {item.seller_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₦{item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logistics Selection */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Select Logistics Partner
                  </h2>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {logisticsOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedLogistics(option)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedLogistics?.id === option.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                              {option.company_name}
                            </h3>
                            <div className="flex items-center text-yellow-500">
                              <span className="text-sm font-medium">
                                {option.rating}
                              </span>
                              <span className="ml-1">★</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Truck className="w-4 h-4 mr-1" />
                              {option.vehicle_type}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {option.estimated_delivery}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₦{option.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
              </div>
              <div className="px-6 py-4">
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Escrow Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        Escrow Protection
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment is held securely until you confirm delivery
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>

                <div className="text-center text-sm text-gray-500">
                  <p>By placing this order, you agree to our</p>
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  <span> and </span>
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
