import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function BillingCycleButton({ billingCycle, setBillingCycle }) {
   return (
      <div className="flex justify-center mt-20 mb-20">
         <div className="bg-white rounded-full p-1 shadow-sm border border-slate-200 inline-flex">
            <Button
               onClick={() => setBillingCycle("monthly")}
               className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "monthly" ? "bg-(--primary) text-white" : "text-slate-600 hover:text-slate-900"
               }`}
            >
               Monthly
            </Button>
            <Button
               onClick={() => setBillingCycle("annually")}
               className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                  billingCycle === "annually" ? "bg-(--primary) text-white" : "text-slate-600 hover:text-slate-900"
               }`}
            >
               Annually
               <Badge className="absolute -top-2 -right-2 bg-(--text-muted-light) text-white text-xs px-2 py-0.5 rounded-full">
                  Save 20%
               </Badge>
            </Button>
         </div>
      </div>
   );
}
