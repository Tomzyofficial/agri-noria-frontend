import { Button } from "@/components/ui/Button";
export function Modal({ onClick, isOpen, children, className }) {
  if (!isOpen) return null;
  return (
    <div
      aria-modal="true"
      className={
        className
          ? className
          : "fixed inset-0 rounded-md bg-black/40 backdrop-blur-sm w-full h-screen z-70"
      }
    >
      <div className="relative overflow-y-auto rounded-lg bg-(--white-fff) dark:bg-(--card-dark) mx-auto max-w-2xl w-[95%] h-full p-2">
        <Button
          aria-label="Close Modal"
          className="absolute cursor-pointer top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Close
        </Button>
        {children}
      </div>
    </div>
  );
}
