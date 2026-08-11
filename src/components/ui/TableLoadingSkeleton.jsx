export function TableSkeleton({ rows = 5 }) {
   return (
      <>
         <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: rows }).map((_, i) => (
               <tr key={i}>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-3.5 w-28 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                     </div>
                  </td>

                  <td className="px-4 py-3">
                     <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </td>

                  <td className="px-4 py-3">
                     <div className="h-3.5 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </td>

                  <td className="px-4 py-3">
                     <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </td>

                  <td className="px-4 py-3">
                     <div className="h-3.5 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </td>

                  <td className="px-4 py-3">
                     <div className="h-3.5 w-8 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </td>
               </tr>
            ))}
         </tbody>
      </>
   );
}
