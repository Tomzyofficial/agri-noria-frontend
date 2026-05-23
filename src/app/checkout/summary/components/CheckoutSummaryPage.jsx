"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerAddress } from "@/app/checkout/summary/components/CustomerAddress";
// import { PaymentMethod } from "@/app/checkout/summary/components/PaymentMethod";
import { Delivery } from "@/app/checkout/summary/components/DeliveryItem";
import { CheckoutSummary } from "@/app/checkout/summary/components/CheckoutSummary";
import { Acceptance } from "./Acceptance";
import { toast } from "react-toastify";
import { deleteCartCookie } from "@/actions/session";

function getFeesFromLogistics(selectedLogistics, subtotal, discount) {
  const deliveryFee = Number(selectedLogistics?.rate_amount) || 0;
  const totalAmount = subtotal + deliveryFee - discount;
  return { deliveryFee, totalAmount };
}

export function CheckoutSummaryPage({ buyer, cart, vendors }) {
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const cartByVendor = vendors.map((item) => ({ ...item }));
  const vendor = cartByVendor.map((vendor) => vendor);

  // Destructure cart items
  const processedCart = cart.map((item) => ({
    product_id: item.listing_id,
    product_image: item.product_image,
    listing_name: item.listing_name,
    listing_location: item.listing_location,
    price: item.price,
    unit_measure: item.unit_measure,
    quantity: item.quantity,
    discount: item.discount,
    min_quantity: item.min_quantity,
    currency: item.currency,
    country_code: item.country_code,
  }));

  // Calculate totals
  const itemsCount = cart
    ? cart.reduce((sum, item) => sum + item.quantity || 1, 0)
    : 0;
  const subtotal = cart
    ? cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
    : 0;

  // Calculate discount - only apply if buyer meets minimum quantity requirements
  const discount = cart
    ? cart.reduce((totalDiscount, item) => {
        const itemTotal = item.price * item.quantity;
        const meetsMinQuantity = item.quantity >= item.min_quantity;

        if (meetsMinQuantity && item.discount > 0) {
          // Apply discount to total item price (price × quantity) if buyer meets minimum quantity requirement
          const itemDiscount = itemTotal * (item.discount / 100);
          return totalDiscount + itemDiscount;
        }
        return totalDiscount;
      }, 0)
    : 0;
  const { deliveryFee, totalAmount } = useMemo(
    () => getFeesFromLogistics(selectedLogistics, subtotal, discount),
    [selectedLogistics, subtotal, discount],
  );

  const [formData, setFormData] = useState({
    fname: buyer?.name?.split(" ")[0] || "",
    lname: buyer?.name?.split(" ")[1] || "",
    buyerId: buyer?.buyer_id,
    email: buyer?.email || "",
    phone: "",
    country_code: cart[0].country_code,
    currency: cart[0].currency,
    address: "",
    cart: processedCart, // Add processed cart items
    vendor: {
      seller_id: vendor[0].seller_id,
      seller_fname: vendor[0].seller_fname,
      seller_lname: vendor[0].seller_lname,
      seller_email: vendor[0].seller_email,
      seller_phone: vendor[0].seller_phone,
    },
    accepted: false,
  });

  // Verify payment after Paystack redirect
  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) return;

    const verifyPayment = async () => {
      setIsProcessing(true);
      try {
        const verifyResponse = await fetch(
          `/api/proxy/buyer/payment/verify?ref=${encodeURIComponent(reference)}`,
          { method: "GET" },
        );
        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        await deleteCartCookie();

        toast.success("Payment successful! Your order has been confirmed.");
        window.location.href = "/";
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(error.message || "Payment verification failed");
      } finally {
        setIsProcessing(false);
      }
    };
    verifyPayment();
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.address) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!selectedLogistics) {
      toast.error("Please select a logistics option");
      return;
    }

    if (!formData.email) {
      toast.error("Buyer email is required for payment");
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch("/api/proxy/buyer/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...selectedLogistics,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.error || orderData.message || "Failed to place order",
        );
      }

      const orderAmount = Number(orderData.data.total_amount);
      const paymentResponse = await fetch(
        "/api/proxy/buyer/payment/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderData.data.id,
            amount: orderAmount,
            email: formData.email,
            firstname: formData.fname,
            lastname: formData.lname,
            seller_id: formData.vendor.seller_id,
          }),
        },
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(paymentData.error || "Failed to initialize payment");
      }

      window.location.href = paymentData.data.authorization_url;
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  return (
    <main>
      {/* Main Content */}
      <form
        noValidate
        onSubmit={handlePlaceOrder}
        className="max-w-[1400px] m-4 md:m-10 mb-50 flex flex-col lg:flex-row gap-5"
      >
        {/* Left Section */}
        <div className="flex flex-col gap-5 w-full lg:w-2/3">
          <CustomerAddress
            formData={formData}
            handleInputChange={handleInputChange}
            onLogisticsSelect={setSelectedLogistics}
          />

          {/* <PaymentMethod
            formData={formData}
            handleInputChange={handleInputChange}
          /> */}

          <Delivery cart={cart} />

          <Acceptance formData={formData} setFormData={setFormData} />
        </div>

        {/* Right Section - Order Summary */}
        <CheckoutSummary
          itemsCount={itemsCount}
          discount={discount}
          subTotal={subtotal}
          deliveryFee={deliveryFee}
          totalAmount={totalAmount}
          hasLogisticsSelected={Boolean(selectedLogistics)}
          formData={formData}
          cart={cart}
          isProcessing={isProcessing}
        />
      </form>
    </main>
  );
}
