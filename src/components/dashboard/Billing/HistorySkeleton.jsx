export function HistorySkeleton() {
   return (
      <>
         <table className="overflow-hidden border-collapse border border-slate-200 dark:border-(--card-dark) shadow">
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
               {[...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                     </td>
                     <td className="p-3 border-t">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         <div className="py-4 flex items-center space-x-4">
            <div className="py-1.5 px-2 rounded bg-gray-200 shadow flex items-center space-x-3 w-20 h-9 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            <div className="py-1.5 px-2 rounded bg-gray-200 shadow flex items-center space-x-3 w-20 h-9 animate-pulse"></div>
         </div>
      </>
   );
}
