import { ChevronDown } from "lucide-react";

export function Select({ children, className = "", ...props }) {
   return (
      <div className="relative">
         <select
            className={`block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
            {...props}
         >
            {children}
         </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-gray-400" />
         </div>
      </div>
   );
}

export function SelectTrigger({ children, className = "", ...props }) {
   return (
      <div
         className={`flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
         {...props}
      >
         {children}
         <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
   );
}

export function SelectValue({ placeholder, children, ...props }) {
   return (
      <span className="block truncate" {...props}>
         {children || placeholder}
      </span>
   );
}

export function SelectContent({ children, className = "", ...props }) {
   return (
      <div className={`absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg ${className}`} {...props}>
         <div className="py-1">{children}</div>
      </div>
   );
}

export function SelectItem({ children, value, className = "", ...props }) {
   return (
      <div
         className={`block w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${className}`}
         {...props}
      >
         {children}
      </div>
   );
}
