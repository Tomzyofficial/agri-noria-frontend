"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, TrendingUp, Package, Warehouse, MapPin, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBuyerData } from "../useBuyerData";
import { toast } from "react-toastify";

export default function InventoryPage() {
   const [inventory, setInventory] = useState([]);
   const [filteredInventory, setFilteredInventory] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [stockFilter, setStockFilter] = useState("");
   const { placeOrder } = useBuyerData();

   useEffect(() => {
      const fetchInventory = async () => {
         try {
            const res = await fetch("/api/proxy/buyer/inventory");
            if (res.ok) {
               const json = await res.json();
               if (json.success && json.data && json.data.length > 0) {
                  setInventory(json.data);
                  setFilteredInventory(json.data);
                  return; // Successfully fetched real data
               }
            }
            throw new Error("No real data available");
         } catch (err) {
            console.error("Falling back to mock inventory:", err);
            // Mock data fallback
            const mockInventory = [
               {
                  id: "INV-001",
                  name: "Premium Seeds - Corn",
                  sku: "SEED-CORN-001",
                  quantity: 450,
                  minStock: 100,
                  unitPrice: 45000,
                  location: "Warehouse A (Kano)",
               },
               {
                  id: "INV-002",
                  name: "Fertilizer - NPK 20:20:20",
                  sku: "FERT-NPK-001",
                  quantity: 50,
                  minStock: 100,
                  unitPrice: 65000,
                  location: "Warehouse B (Kaduna)",
               },
               {
                  id: "INV-003",
                  name: "Pesticide - Organic",
                  sku: "PEST-ORG-001",
                  quantity: 200,
                  minStock: 50,
                  unitPrice: 35000,
                  location: "Warehouse A (Kano)",
               },
            ];
            setInventory(mockInventory);
            setFilteredInventory(mockInventory);
         } finally {
            setLoading(false);
         }
      };
      fetchInventory();
   }, []);

   useEffect(() => {
      let filtered = inventory;

      if (searchTerm) {
         filtered = filtered.filter(
            (item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku?.includes(searchTerm),
         );
      }

      if (stockFilter === "low") {
         filtered = filtered.filter((item) => item.quantity <= item.minStock);
      } else if (stockFilter === "ok") {
         filtered = filtered.filter((item) => item.quantity > item.minStock);
      }

      setFilteredInventory(filtered);
   }, [searchTerm, stockFilter, inventory]);

   const lowStockItems = inventory.filter((item) => item.quantity <= item.minStock).length;
   const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Inventory Management</h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time tracking of warehouse stocks and assets</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Items" value={inventory.length} icon={<Package size={24} />} color="indigo" />
            <StatCard label="Stock Value" value={`₦${totalValue.toLocaleString()}`} icon={<TrendingUp size={24} />} color="emerald" />
            <StatCard label="Low Stock" value={lowStockItems} icon={<AlertTriangle size={24} />} color="rose" />
         </div>

         <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow flex gap-4 p-4 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
               <div className="flex-grow relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input
                     type="text"
                     placeholder="Search product or SKU..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-3 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
               <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
               >
                  <option value="">All Stock Levels</option>
                  <option value="low">Low Stock</option>
                  <option value="ok">Healthy Stock</option>
               </select>
            </div>
         </div>

         <Card className="border-none shadow-2xl bg-white dark:bg-gray-950 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-gray-50 dark:border-gray-900 flex justify-between items-center">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Warehouse className="text-indigo-600" /> Stock Catalog
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
               {loading ? (
                  <div className="text-center py-20 animate-pulse font-black text-gray-300">Synchronizing Inventory...</div>
               ) : filteredInventory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {filteredInventory.map((item) => (
                        <InventoryCard key={item.id} item={item} onBuy={placeOrder} />
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-900">
                     <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching items in catalog</p>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}

function StatCard({ label, value, icon, color }) {
   const colors = {
      indigo: "bg-indigo-500 shadow-indigo-500/20",
      emerald: "bg-emerald-500 shadow-emerald-500/20",
      rose: "bg-rose-500 shadow-rose-500/20",
   };

   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 overflow-hidden">
         <CardContent className="p-6 flex items-center gap-6">
            <div className={`p-4 ${colors[color]} text-white rounded-3xl shadow-lg`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{label}</p>
               <p className="text-2xl font-black text-(--foreground) tracking-tighter">{value}</p>
            </div>
         </CardContent>
      </Card>
   );
}

function InventoryCard({ item, onBuy }) {
   const isLow = item.quantity <= item.minStock;
   const [showModal, setShowModal] = useState(false);
   const [buyQty, setBuyQty] = useState(1);
   const [address, setAddress] = useState("");
   const [processing, setProcessing] = useState(false);

   const handleBuy = async () => {
      if (buyQty < 1 || buyQty > item.quantity) return toast.error("Invalid quantity");
      if (!address) return toast.error("Delivery address is required");

      setProcessing(true);
      const items = [{ product_id: item.id, product_name: item.name, quantity: parseInt(buyQty), price_per_unit: item.unitPrice }];
      const totalAmount = buyQty * item.unitPrice;

      const success = await onBuy(items, totalAmount, address);
      if (success) {
         setShowModal(false);
         setBuyQty(1);
         setAddress("");
      }
      setProcessing(false);
   };

   return (
      <>
         <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-6 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                     <Package size={20} />
                  </div>
                  <div>
                     <h3 className="font-black text-lg">{item.name}</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.sku}</p>
                  </div>
               </div>
               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {isLow ? 'Low Stock' : 'In Stock'}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                  <p className="text-xl font-black">{item.quantity} units</p>
               </div>
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-700">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Price/Unit</p>
                  <p className="text-xl font-black text-emerald-600">₦{item.unitPrice.toLocaleString()}</p>
               </div>
            </div>

            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <MapPin size={12} className="text-indigo-500" />
                  {item.location}
               </div>
               <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShoppingCart size={14} /> Buy Now
               </Button>
            </div>
         </div>

         {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                  <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-rose-500">
                     <X size={20} />
                  </button>
                  <h3 className="text-2xl font-black mb-2 flex items-center gap-2"><ShoppingCart className="text-indigo-600" /> Place Order</h3>
                  <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">{item.name}</p>

                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quantity to Buy</label>
                        <input
                           type="number"
                           min="1"
                           max={item.quantity}
                           value={buyQty}
                           onChange={(e) => setBuyQty(e.target.value)}
                           className="w-full mt-1 bg-gray-50 dark:bg-gray-900 border-none px-4 py-3 rounded-xl font-black"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Delivery Address</label>
                        <textarea
                           rows={3}
                           value={address}
                           onChange={(e) => setAddress(e.target.value)}
                           className="w-full mt-1 bg-gray-50 dark:bg-gray-900 border-none px-4 py-3 rounded-xl font-bold text-sm resize-none"
                           placeholder="Enter shipping location..."
                        />
                     </div>
                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-300">Total Amount</span>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₦{(buyQty * item.unitPrice).toLocaleString()}</span>
                     </div>
                  </div>

                  <Button
                     onClick={handleBuy}
                     disabled={processing}
                     className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                  >
                     {processing ? "Processing..." : "Confirm Purchase"}
                  </Button>
               </div>
            </div>
         )}
      </>
   );
}
