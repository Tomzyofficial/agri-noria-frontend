import { Plus, MessageSquareMore } from "lucide-react";
import Link from "next/link";

export function QuickAction() {
   return (
      <section className="bg-(--white-fff) dark:bg-(--card-dark) p-6 rounded-xl shadow-lg">
         <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
         <div className="space-y-3">
            <Link
               href="/dashboard/products/add-new"
               className="w-full text-left p-3 rounded-lg bg-agri-light hover:bg-gray-200 transition duration-150 flex items-center"
            >
               <Plus className="mr-3 w-5 h-5" />
               Add New Product Listing
            </Link>
            <button className="w-full text-left p-3 rounded-lg bg-agri-light hover:bg-gray-200 transition duration-150 flex items-center">
               <MessageSquareMore className="w-5 h-5 mr-3" />
               Contact Support Team
            </button>
         </div>
      </section>
   );
}
