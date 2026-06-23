import { BriefcaseBusiness } from "lucide-react";

export function NoJobsAvailable() {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 text-center">
      <div className="mb-5 rounded-full bg-primary/10 p-4">
        <BriefcaseBusiness className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold">No job opportunities available yet</h2>
      <p className="mt-3 max-w-lg text-muted-foreground">There are currently no agricultural jobs available. New opportunities from farmers, cooperatives, agribusinesses, logistics providers, and suppliers will appear here once posted.</p>
    </div>
  );
}
