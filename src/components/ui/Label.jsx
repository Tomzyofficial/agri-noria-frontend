export function Label({ children, ...props }) {
   return (
      <label className="text-start block" {...props}>
         {children}
      </label>
   );
}
