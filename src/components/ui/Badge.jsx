export function Badge({ className, children, ...props }) {
   return (
      <div className={className} {...props}>
         {children}
      </div>
   );
}
