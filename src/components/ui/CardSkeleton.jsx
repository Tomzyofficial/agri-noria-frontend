export function CardSkeleton() {
  return (
    <div className="px-4 py-6 relative rounded-xl bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse shadow-sm">
      <div className="flex items-center justify-between pb-2 px-2">
        <div className="h-5 w-20 rounded-md bg-gray-200" />
        <div className="w-6 h-6 rounded-md bg-gray-200" />
      </div>

      <div className="flex items-center justify-center rounded-xl">
        <div className="h-7 w-10 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
