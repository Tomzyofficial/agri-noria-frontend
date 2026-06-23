import { SearchX } from "lucide-react";

export function NoSearchResults() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
      <div className="mb-5 rounded-full bg-orange-500/10 p-4">
        <SearchX className="h-10 w-10 text-orange-500" />
      </div>
      <h2 className="text-2xl font-semibold">No matching jobs found</h2>
      <p className="mt-3 max-w-lg text-muted-foreground">We couldn't find any jobs matching</p>

      {/* <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="rounded-lg border px-4 py-2">
          Clear Filters
        </button>

        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          Browse All Jobs
        </button>
      </div> */}
    </div>
  );
}
