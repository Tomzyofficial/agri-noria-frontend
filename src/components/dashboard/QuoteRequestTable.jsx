import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableLoadingSkeleton";
import { formatDate, fetcher, formatLabel } from "@/utils/otherUtils";
import useSWR from "swr";

export function QuoteRequestTable({ url, setSelectedRequest, setShowModal }) {
   const { data: quoteData, error: quoteError, isLoading: quoteIsLoading } = useSWR(url, fetcher);
   const STATUS_BADGES = {
      pending: "bg-yellow-100 text-yellow-800",
      contacted: "bg-green-100 text-green-800",
   };
   return (
      <section className="my-10">
         <table className="w-full text-left border-collapse">
            <caption className="py-5">Recent Quote Request</caption>
            <thead>
               <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-(--gray-color">
                  {["Customer", "Listing Name", "Request Note", "Status", "Date", "Action"].map((h) => (
                     <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider whitespace-nowrap">
                        {h}
                     </th>
                  ))}
               </tr>
            </thead>
            {quoteIsLoading ? (
               <TableSkeleton rows={5} />
            ) : quoteError ? (
               <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                     <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-500">
                        {quoteError.message}
                     </td>
                  </tr>
               </tbody>
            ) : (
               <tbody className="bg-white dark:bg-(--card-dark) divide-y divide-gray-100 dark:divide-gray-800">
                  {quoteData?.quoteRequests?.length > 0 ? (
                     quoteData?.quoteRequests?.map((req) => {
                        const initials = req.full_name
                           .split(" ")
                           .map((n) => n[0])
                           .join("")
                           .slice(0, 2)
                           .toUpperCase();

                        return (
                           <tr key={req.quote_request_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              {/* Customer */}
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">{initials}</div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">{formatLabel(req.full_name)}</span>
                                 </div>
                              </td>

                              {/* Storage Facility */}
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatLabel(req.listing_name)}</td>

                              {/* additional note */}
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{req.additional_info || "No message provided"}</td>

                              {/* Status */}
                              <td className="px-4 py-3">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[req.status]}`}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                              </td>

                              {/* Request Date */}
                              <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(req.created_at)}</td>

                              <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                 <Button
                                    onClick={() => {
                                       setSelectedRequest(req);
                                       setShowModal(true);
                                    }}
                                    className="bg-green-100 text-green-900 hover:bg-green-300 px-1 py-1 rounded-lg"
                                 >
                                    View Details
                                 </Button>
                              </td>
                           </tr>
                        );
                     })
                  ) : (
                     <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                           No quote requests yet.
                        </td>
                     </tr>
                  )}
               </tbody>
            )}
         </table>
      </section>
   );
}
