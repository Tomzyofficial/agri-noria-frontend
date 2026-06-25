"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect, Suspense } from "react";
import { Search, Filter, ShoppingCart, Clock, CheckCircle, AlertCircle, Package, ShieldCheck } from "lucide-react";
import { useBuyerData } from "../useBuyerData";
import { Button } from "@/components/ui/Button";
import { useSearchParams, useRouter } from "next/navigation";

export default function OrdersPage() {
   return (
      <Suspense fallback={<div className="text-center py-20 animate-pulse font-black text-gray-300">Loading Orders...</div>}>
         <OrdersContent />
      </Suspense>
   );
}

function OrdersContent() {
   const { loading, buyerOrders, forwardContracts, payForOrder, verifyOrderPayment } = useBuyerData();
   const [filteredOrders, setFilteredOrders] = useState([]);
   const [filteredContracts, setFilteredContracts] = useState([]);
   const [activeTab, setActiveTab] = useState("marketplace");
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("");
   const searchParams = useSearchParams();
   const router = useRouter();

   const statuses = ["PENDING", "PAYMENT_PROCESSING", "PAYMENT_PENDING_FINANCE", "READY_FOR_SALES", "PROCESSING", "DELIVERED", "CANCELLED"];

   useEffect(() => {
      const reference = searchParams.get("reference");
      if (reference) {
         verifyOrderPayment(reference).then(() => {
            router.replace("/ecosystem/buyer-partner/orders", { scroll: false });
         });
      }
   }, [searchParams, verifyOrderPayment, router]);

   useEffect(() => {
      setFilteredOrders(buyerOrders || []);
      setFilteredContracts(forwardContracts || []);
   }, [buyerOrders, forwardContracts]);

   useEffect(() => {
      let filtered = buyerOrders || [];

      if (searchTerm) {
         filtered = filtered.filter(
            (order) =>
               order.id?.includes(searchTerm) || order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      if (statusFilter) {
         filtered = filtered.filter((order) => order.status.toUpperCase() === statusFilter);
      }
      setFilteredOrders(filtered);

      let filteredC = forwardContracts || [];
      if (searchTerm) {
         filteredC = filteredC.filter(c => c.commodity?.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setFilteredContracts(filteredC);
   }, [searchTerm, statusFilter, buyerOrders, forwardContracts]);

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Track and manage your agricultural input purchases</p>
         </div>

         <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow flex gap-4 p-4 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
               <div className="flex-grow relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input 
                     type="text" 
                     placeholder="Search order ID or vendor..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500" 
                  />
               </div>
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
               >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                     <option key={status} value={status}>{status}</option>
                  ))}
               </select>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-1">
            <button
               onClick={() => setActiveTab("marketplace")}
               className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all ${activeTab === "marketplace" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
               Marketplace Orders
            </button>
            <button
               onClick={() => setActiveTab("pre-harvest")}
               className={`pb-4 px-2 font-black text-sm uppercase tracking-widest transition-all ${activeTab === "pre-harvest" ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-400 hover:text-gray-600"}`}
            >
               Pre-Harvest Contracts
            </button>
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-gray-900">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <ShoppingCart className={activeTab === "marketplace" ? "text-indigo-600" : "text-amber-600"} /> 
                  {activeTab === "marketplace" ? "Marketplace Orders" : "Forward Contracts"} 
                  ({activeTab === "marketplace" ? filteredOrders.length : filteredContracts.length})
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {loading ? (
                  <div className="text-center py-20 animate-pulse font-black text-gray-300">Loading Orders...</div>
               ) : activeTab === "marketplace" ? (
                  filteredOrders.length > 0 ? (
                     <div className="space-y-4">
                        {filteredOrders.map((order) => (
                           <OrderRow key={order.id} order={order} onPay={payForOrder} />
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No marketplace orders found</p>
                     </div>
                  )
               ) : (
                  filteredContracts.length > 0 ? (
                     <div className="space-y-4">
                        {filteredContracts.map((contract) => (
                           <ContractRow key={contract.id} contract={contract} />
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No forward contracts found</p>
                     </div>
                  )
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function OrderRow({ order, onPay }) {
   const [paying, setPaying] = useState(false);

   const getStatusInfo = (status) => {
      const s = (status || "").toUpperCase();
      switch (s) {
         case "PENDING":
            return { icon: <Clock className="w-3 h-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
         case "PAYMENT_PROCESSING":
         case "PAYMENT_PENDING_FINANCE":
            return { icon: <Clock className="w-3 h-3" />, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400" };
         case "READY_FOR_SALES":
         case "PROCESSING":
         case "PROCESSED":
         case "IN_PROGRESS":
            return { icon: <ShoppingCart className="w-3 h-3" />, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" };
         case "PAID":
         case "CONFIRMED":
            return { icon: <CheckCircle className="w-3 h-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
         case "ASSIGNED":
         case "SHIPPED":
         case "IN_TRANSIT":
            return { icon: <ShoppingCart className="w-3 h-3" />, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" };
         case "DELIVERED":
            return { icon: <CheckCircle className="w-3 h-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" };
         case "CANCELLED":
            return { icon: <AlertCircle className="w-3 h-3" />, color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
         default:
            return { icon: null, color: "bg-gray-100 text-gray-700" };
      }
   };

   const handlePayment = async () => {
      setPaying(true);
      await onPay(order.id);
      setPaying(false);
   };

   const { icon, color } = getStatusInfo(order.status);
   const itemCount = order.items ? (Array.isArray(order.items) ? order.items.length : 1) : 0;

   return (
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-all group">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <Package size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black">{order.buyer_name || "Ecosystem Order"}</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order ID: {order.id.split('-')[0]} • {itemCount} items</p>
               {order.payment_status && order.payment_status !== "unpaid" && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                     <ShieldCheck size={10} /> {order.payment_status.replaceAll("_", " ")}
                  </span>
               )}
            </div>
         </div>
         <div className="flex flex-col items-end shrink-0">
            <p className="text-2xl font-black tracking-tighter">₦{parseFloat(order.total_amount).toLocaleString()}</p>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}>
                  {icon} {order.status}
               </span>
            </div>
            
            {order.status === "pending" && (
               <Button 
                  onClick={handlePayment} 
                  disabled={paying}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20"
               >
                  {paying ? "Processing..." : "Pay with Paystack"}
               </Button>
            )}
            {order.status === "payment_pending_finance" && (
               <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-violet-600">
                  Awaiting finance confirmation
               </p>
            )}
         </div>
      </div>
   );
}

function ContractRow({ contract }) {
   return (
      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition-all group">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-amber-600 group-hover:text-white transition-colors">
               <Package size={24} />
            </div>
            <div>
               <h3 className="text-lg font-black">{contract.commodity || "Pre-Harvest Contract"}</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Contract ID: {contract.id.split('-')[0]} • {contract.quantity_tons} Tons</p>
               {contract.escrow_status && (
                  <span className={`inline-flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${contract.escrow_status === 'pending_deposit' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                     <ShieldCheck size={10} /> {contract.escrow_status.replaceAll("_", " ")}
                  </span>
               )}
            </div>
         </div>
         <div className="flex flex-col items-end shrink-0">
            <p className="text-2xl font-black tracking-tighter">₦{parseFloat(contract.total_price).toLocaleString()}</p>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(contract.created_at).toLocaleDateString()}</span>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${contract.contract_status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {contract.contract_status === 'pending_approval' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {contract.contract_status.replaceAll("_", " ")}
               </span>
            </div>
         </div>
      </div>
   );
}
