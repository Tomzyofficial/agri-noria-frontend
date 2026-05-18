import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HistorySkeleton } from "@/app/(dashboard)/dashboard/components/Billing/HistorySkeleton";

export function BillingHistory({ page, setPage, pageSize, historyData, historyLoading, historyError }) {
   if (historyLoading) {
      return (
         <div>
            <HistorySkeleton />
         </div>
      );
   }

   if (historyError) {
      return (
         <div>
            <p className="text-red-500">Failed to load billing history.</p>
         </div>
      );
   }

   const pagination = historyData?.pagination;
   const total = pagination?.total;

   return (
      <>
         <table className="w-full border-collapse border border-stone-100 dark:border-stone-800 shadow">
            <thead>
               <tr className="bg-slate-50 dark:bg-(--card-dark)">
                  <th className="p-3 text-left font-medium">Plan name</th>
                  <th className="p-3 text-left font-medium">Billing cycle</th>
                  <th className="p-3 text-left font-medium">Amount</th>
                  <th className="p-3 text-left font-medium">Currency</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Start date</th>
                  <th className="p-3 text-left font-medium">End date</th>
                  <th className="p-3 text-left font-medium">Reference</th>
               </tr>
            </thead>

            <tbody>
               {Array.isArray(historyData?.invoices) && historyData.invoices.length > 0 ? (
                  historyData.invoices.map((history) => {
                     const status = history?.status ?? "unknown";

                     return (
                        <tr key={history.paystack_reference}>
                           <td className="p-3 border-t">{history?.metadata?.planName}</td>

                           <td className="p-3 border-t capitalize">{history?.metadata?.interval}</td>

                           <td className="p-3 border-t">
                              {new Intl.NumberFormat("en-NG", {
                                 style: "currency",
                                 currency: "NGN",
                              }).format(history?.amount)}
                           </td>

                           <td className="p-3 border-t">{history?.currency}</td>

                           <td className="p-3 border-t">
                              <Badge
                                 className={`rounded flex items-center justify-center gap-1 ${
                                    status === "paid" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                                 }`}
                              >
                                 {status === "paid" && <Check className="w-4 h-4" />}
                                 {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                           </td>

                           <td className="p-3 border-t">
                              {history?.period_start
                                 ? new Date(history.period_start).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                   })
                                 : "-"}
                           </td>

                           <td className="p-3 border-t">
                              {history?.period_end
                                 ? new Date(history.period_end).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                   })
                                 : "-"}
                           </td>

                           <td className="p-3 border-t">{history?.paystack_reference}</td>
                        </tr>
                     );
                  })
               ) : (
                  <tr>
                     <td className="p-3 border-t text-center" colSpan={8}>
                        No history available.
                     </td>
                  </tr>
               )}
            </tbody>
         </table>

         {/* Pagination UI */}
         {total > pageSize && (
            <div className="py-4 flex items-center gap-4">
               <Button
                  onClick={() => {
                     setPage((p) => p - 1);
                  }}
                  disabled={page <= 1}
                  className={`py-1.5 px-2 rounded shadow flex items-center gap-2 ${page <= 1 ? "opacity-50 bg-gray-300 cursor-not-allowed" : "cursor-pointer bg-gray-400 hover:bg-gray-500 hover:shadow-md"}`}
               >
                  <FiChevronsLeft />
                  Prev
               </Button>

               <span className="text-sm text-muted-foreground">
                  Row {page} of {Math.ceil(total / pageSize)}
               </span>

               <Button
                  disabled={page * pageSize >= total}
                  onClick={() => {
                     setPage((p) => p + 1);
                  }}
                  className={`py-1.5 px-2 rounded shadow flex items-center gap-2 ${page * pageSize >= total ? "opacity-50 bg-gray-300 cursor-not-allowed" : "cursor-pointer bg-gray-400 hover:bg-gray-500 hover:shadow-md"}`}
               >
                  Next
                  <FiChevronsRight />
               </Button>
            </div>
         )}
      </>
   );
}
