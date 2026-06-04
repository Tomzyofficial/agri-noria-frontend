import { Button } from "./Button";
import { X } from "lucide-react";
import Image from "next/image";

export function ImageEnlargementModal({
  isModalOpen,
  setIsModalOpen,
  name,
  src,
}) {
  return (
    isModalOpen && (
      <section
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4 animate-in fade-in duration-200"
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="relative max-w-5xl w-full max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            onClick={() => setIsModalOpen(false)}
            className="absolute -top-5 right-0 text-white bg-stone-800/80 hover:bg-stone-700 rounded-full p-2 z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="relative w-full rounded-lg overflow-hidden bg-stone-900">
            <Image
              src={src}
              alt={`${name} - Enlarged Image View`}
              width={1200}
              height={1200}
              className="object-contain w-full h-auto max-h-[90vh]"
              priority
            />
          </div>
        </div>
      </section>
    )
  );
}
