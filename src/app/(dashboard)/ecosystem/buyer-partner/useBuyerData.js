"use client";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { toast } from "react-toastify";

const BuyerDataContext = createContext();

export function BuyerDataProvider({ children }) {
   const [loading, setLoading] = useState(true);
   const [buyerMatches, setBuyerMatches] = useState([]);
   const [stats, setStats] = useState({});
   const [clusters, setClusters] = useState([]);
   const [logistics, setLogistics] = useState([]);
   const [buyerOrders, setBuyerOrders] = useState([]);

   const fetchData = useCallback(async () => {
      setLoading(true);
      try {
         const [matchesRes, statsRes, clustersRes] = await Promise.all([
            fetch("/api/proxy/pipeline/warehouse/inventory"),
            fetch("/api/proxy/pipeline/stats"),
            fetch("/api/proxy/pipeline/clusters"),
         ]);
         
         if (matchesRes.ok) { 
            const d = await matchesRes.json(); 
            setBuyerMatches(d.data || []); 
         }
         
         if (statsRes.ok) { 
            const d = await statsRes.json(); 
            setStats(d.data || {}); 
         }
         
         if (clustersRes.ok) {
            const d = await clustersRes.json();
            const cl = d.data || [];
            setClusters(cl);
            
            if (cl.length > 0) {
               const logRes = await fetch(`/api/proxy/pipeline/logistics/cluster/${cl[0].id}`);
               if (logRes.ok) { 
                  const ld = await logRes.json(); 
                  setLogistics(ld.data || []); 
               }
            }
         }
      } catch (err) { 
         console.error("Error fetching buyer data:", err);
         toast.error("Failed to load dashboard data");
      } finally { 
         setLoading(false); 
      }
   }, []);

   const fetchOrders = useCallback(async () => {
      try {
         const res = await fetch("/api/proxy/pipeline/buyer-orders/mine");
         if (res.ok) {
            const d = await res.json();
            setBuyerOrders(d.data || []);
         }
      } catch (err) {
         console.error("Error fetching orders:", err);
      }
   }, []);

   useEffect(() => {
      fetchData();
      fetchOrders();
   }, [fetchData, fetchOrders]);

   const placeOrder = async (items, totalAmount, deliveryAddress) => {
      try {
         const res = await fetch("/api/proxy/pipeline/buyer-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, total_amount: totalAmount, delivery_address: deliveryAddress }),
         });
         const data = await res.json();
         if (res.ok) {
            toast.success("Order placed successfully!");
            fetchOrders();
            return data.data;
         } else {
            toast.error(data.error || "Failed to place order");
            return null;
         }
      } catch (err) {
         toast.error("Network error while placing order");
         return null;
      }
   };

   const payForOrder = async (orderId) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/buyer-orders/${orderId}/payment/initialize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
         });
         const data = await res.json();
         if (res.ok) {
            toast.success("Redirecting to Paystack...");
            window.location.href = data.data.authorization_url;
            return true;
         } else {
            toast.error(data.error || "Failed to initialize payment");
            return false;
         }
      } catch (err) {
         toast.error("Network error while initializing payment");
         return false;
      }
   };

   const verifyOrderPayment = async (reference) => {
      try {
         const res = await fetch(`/api/proxy/pipeline/buyer-orders/payment/verify?reference=${encodeURIComponent(reference)}`);
         const data = await res.json();
         if (res.ok) {
            toast.success(data.message || "Payment verified. Finance will confirm shortly.");
            fetchOrders();
            return true;
         }
         toast.error(data.error || "Payment verification failed");
         return false;
      } catch (err) {
         toast.error("Network error while verifying payment");
         return false;
      }
   };

   const refreshData = () => {
      fetchData();
      fetchOrders();
   };

   const confirmedMatches = buyerMatches.filter(m => m.contract_status === "confirmed").length;
   const totalTons = buyerMatches.reduce((sum, m) => sum + parseFloat(m.quantity_tons || 0), 0);

   return (
      <BuyerDataContext.Provider value={{ 
         loading, 
         buyerMatches, 
         buyerOrders,
         stats, 
         clusters, 
         logistics, 
         confirmedMatches,
         totalTons,
         refreshData,
         placeOrder,
         payForOrder,
         verifyOrderPayment
      }}>
         {children}
      </BuyerDataContext.Provider>
   );
}

export const useBuyerData = () => {
   const context = useContext(BuyerDataContext);
   if (!context) {
      throw new Error("useBuyerData must be used within a BuyerDataProvider");
   }
   return context;
};
