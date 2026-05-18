"use client";
import { getLocation } from "@/components/LocationLocalStorage-not-in-use";
import { useEffect, useState } from "react";
import { CustomerAddress } from "@/app/checkout/summary/components/CustomerAddress";
import { PaymentMethod } from "@/app/checkout/summary/components/PaymentMethod";
import { Delivery } from "@/app/checkout/summary/components/DeliveryItem";
import { CheckoutSummary } from "@/app/checkout/summary/components/CheckoutSummary";
import { Acceptance } from "./Acceptance";
// import { useCartContext } from "@/hooks/useCartContext";

export function CheckoutSummaryPage({ buyer_id, cart, vendors }) {
   // const { cartCount } = useCartContext();
   const cartByVendor = vendors.map((item) => ({ ...item }));

   const vendor = cartByVendor.map((vendor) => vendor);

   // Destructure cart items
   const processedCart = cart.map((item) => ({
      product_image: item.product_image,
      listing_name: item.listing_name,
      price: item.price,
      quantity: item.quantity,
      discount: item.discount,
      min_quantity: item.min_quantity,
      currency: item.currency,
      country_code: item.country_code,
   }));

   const [formData, setFormData] = useState({
      fname: buyer_id?.name?.split(" ")[0] || "",
      lname: buyer_id?.name?.split(" ")[1] || "",
      phone: "",
      address: "",
      cart: processedCart, // Add processed cart items
      vendor: {
         fname: vendor.fname,
         lname: vendor.lname,
         email: vendor.email,
         phone: vendor.phone,
      },
      accepted: false,
   });
   // Get delivery state and city from the local storage
   /*    const location = getLocation("location-delivery");
   const parsedLocation = location ? JSON.parse(location) : null;
   useEffect(() => {
      if (parsedLocation) {
         try {
            const { state, city } = parsedLocation;
            setFormData((prev) => ({
               ...prev,
               state: state || "",
               city: city || "",
            }));
         } catch {
            setFormData((prev) => ({
               ...prev,
               state: "",
               city: "",
            }));
         }
      }
   }, []); */
   const handleInputChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   // Calculate totals
   const itemsCount = cart ? cart.reduce((sum, item) => sum + item.quantity || 1, 0) : 0;
   const itemsTotal = cart ? cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) : 0;

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
   const deliveryFee = 1100;
   const total = itemsTotal + deliveryFee - discount;

   return (
      <main>
         {/* Main Content */}
         <form className="max-w-[1400px] m-4 md:m-10 mb-50 flex flex-col lg:flex-row gap-5">
            {/* Left Section */}
            <div className="flex flex-col gap-5 w-full lg:w-2/3">
               <CustomerAddress formData={formData} handleInputChange={handleInputChange} />

               <PaymentMethod formData={formData} handleInputChange={handleInputChange} />

               <Delivery cart={cart} />

               <Acceptance formData={formData} setFormData={setFormData} />
            </div>

            {/* Right Section - Order Summary */}
            <CheckoutSummary
               itemsCount={itemsCount}
               itemsTotal={itemsTotal}
               discount={discount}
               total={total}
               formData={formData}
               cart={cart}
            />
         </form>
      </main>
   );
}
