"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FaStore, FaShoppingCart, FaSearch, FaFilter } from "react-icons/fa";
import { useFarmerData } from "../useFarmerData";

export default function MarketplacePage() {
   const { loading } = useFarmerData();

   if (loading) return <div className="p-8 text-center animate-pulse font-black text-gray-400">Opening Marketplace...</div>;

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-(--foreground) tracking-tight">Marketplace</h1>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Direct access to quality inputs and off-take agreements</p>
            </div>
         </div>

         <div className="flex gap-4 p-6 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-900 shadow-xl">
            <div className="flex-grow relative">
               <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
               <input type="text" placeholder="Search seeds, fertilizer, tools..." className="w-full bg-gray-50 dark:bg-gray-900 border-none pl-12 pr-4 py-4 rounded-2xl font-bold focus:ring-2 focus:ring-green-500" />
            </div>
            <button className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-colors">
               <FaFilter /> Filters
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductCard name="Hybrid Maize Seeds" price="₦45,000" category="Seeds" />
            <ProductCard name="NPK Fertilizer" price="₦65,000" category="Fertilizer" />
            <ProductCard name="Manual Sprayer" price="₦12,500" category="Tools" />
            <ProductCard name="Organic Pesticide" price="₦35,000" category="Chemicals" />
         </div>
      </div>
   );
}

function ProductCard({ name, price, category }) {
   return (
      <Card className="border-none shadow-xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all">
         <div className="h-48 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
            <FaStore className="text-4xl text-gray-200 dark:text-gray-800" />
            <span className="absolute top-4 left-4 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">{category}</span>
         </div>
         <CardContent className="p-6">
            <h3 className="text-lg font-black">{name}</h3>
            <div className="flex items-center justify-between mt-4">
               <p className="text-xl font-black text-green-600">{price}</p>
               <button className="p-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                  <FaShoppingCart />
               </button>
            </div>
         </CardContent>
      </Card>
   );
}
