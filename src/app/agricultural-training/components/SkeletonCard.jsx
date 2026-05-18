export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="p-3 pb-0">
        <div className="w-full rounded-xl bg-stone-100 animate-pulse" style={{ aspectRatio: "16/9" }} />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-stone-100 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-stone-100 animate-pulse" />
        </div>
        <div className="h-5 w-3/4 rounded-lg bg-stone-100 animate-pulse" />
        <div className="h-4 w-full rounded-lg bg-stone-100 animate-pulse" />
        <div className="h-4 w-2/3 rounded-lg bg-stone-100 animate-pulse" />
        <div className="flex justify-between items-center pt-2 border-t border-stone-100 mt-1">
          <div className="h-4 w-24 rounded-lg bg-stone-100 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-stone-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
