import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FaSpinner } from "react-icons/fa6";

export function BillingPlanCard({
   plan,
   billingCycle,
   getPrice,
   subscription,
   parseFeatures,
   subscriptionLoading,
   isSelected,
   setSelectedPlan,
   handleSubscribe,
   handleUpgrade,
   handleDowngrade,
}) {
   const price = getPrice(plan);
   const features = parseFeatures(plan.features);

   return (
      <Card className="relative bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-lg">
         {plan.plan_name === "Professional" && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
               <Badge className="bg-(--primary) text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
               </Badge>
            </div>
         )}
         <CardHeader className="text-center text-slate-900 mb-6">
            <CardTitle className="text-2xl font-bold dark:text-foreground mb-2">{plan.plan_name}</CardTitle>
            <div className="mb-1">
               <span className="text-2xl md:text-3xl font-bold dark:text-foreground">
                  {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(price)}
               </span>
               <span className="text-sm text-gray-500 font-normal">
                  /{billingCycle === "annually" ? "year" : "month"}
               </span>
            </div>
         </CardHeader>
         <CardContent>
            <ul className="space-y-3 mb-6">
               {features.map(([key, value], idx) => (
                  <li key={key || idx} className="flex items-start">
                     <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                     <span className="text-slate-700 dark:text-foreground">
                        {key && key.charAt(0).toUpperCase() + key.slice(1)}
                        {value && `- ${value}`}
                     </span>
                  </li>
               ))}
            </ul>
         </CardContent>
         <CardFooter>
            {subscriptionLoading && <div className="bg-gray-100 h-12 w-full animate-pulse rounded" />}
            {subscription && subscription.status === "active" && subscription.vendor_sub_amount > plan.amount && (
               <Button
                  onClick={() => {
                     setSelectedPlan(plan.plan_name);
                     handleDowngrade(plan.id);
                  }}
                  className="cursor-pointer w-full p-3 rounded font-medium bg-gray-400 hover:text-(--white-fff) hover:bg-gray-700 transition transition-background"
               >
                  Downgrade Plan
               </Button>
            )}
            {subscription && subscription.status === "active" && subscription.vendor_sub_amount < plan.amount && (
               <Button
                  className="cursor-pointer w-full p-3 rounded font-medium bg-gray-400 hover:text-(--white-fff) hover:bg-gray-700 transition transition-background"
                  onClick={() => {
                     setSelectedPlan(plan.plan_name);
                     handleUpgrade(plan.id);
                  }}
               >
                  Upgrade Plan
               </Button>
            )}
            {!subscriptionLoading && !subscription && (
               <Button
                  className="flex justify-center items-center cursor-pointer w-full p-3 rounded font-medium bg-gray-400 hover:text-(--white-fff) hover:bg-gray-700 transition transition-background"
                  onClick={() => {
                     setSelectedPlan(plan.plan_name);
                     handleSubscribe(plan);
                  }}
                  disabled={subscriptionLoading || isSelected}
               >
                  {isSelected ? <FaSpinner className="w-6 h-6 animate-spin" /> : "Select plan"}
               </Button>
            )}
            {subscription && subscription.plan_id === plan.id && (
               <Button className="w-full p-3 rounded bg-gray-100 text-gray-500 font-medium cursor-not-allowed" disabled>
                  Current Plan
               </Button>
            )}
         </CardFooter>
      </Card>
   );
}
