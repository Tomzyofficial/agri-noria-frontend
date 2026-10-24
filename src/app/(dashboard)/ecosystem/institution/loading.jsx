export default function InstitutionLoading() {
  return (
    <div className="w-full">
      {/* High-performance non-disruptive top progress indicator to eliminate screen-flash & layout shifts */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 animate-pulse z-50 shadow-sm" />
    </div>
  );
}
