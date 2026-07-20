export function Input({ className, type = "text", ...props }) {
   return <input type={type} className={className} {...props} />;
}
