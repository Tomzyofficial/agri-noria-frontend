export function Label({ children, ...props }) {
   return (
      <label className="text-start block text-[15px] font-[15px] text-gray-900 dark:text-white mb-1" {...props}>
         {children}
      </label>
   );
}
