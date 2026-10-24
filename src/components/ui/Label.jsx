export function Label({ children, className = "", ...props }) {
   return (
      <label
         className={`block text-left text-start text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1 ${className}`}
         {...props}
      >
         {children}
      </label>
   );
}
