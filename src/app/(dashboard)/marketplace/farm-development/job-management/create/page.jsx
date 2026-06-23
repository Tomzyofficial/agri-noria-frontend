import { JobForm } from "@/app/(dashboard)/dashboard/components/jobs/job-form";
import { verifyVendorSession } from "@/actions/session";
import { Unauthorized } from "@/app/(dashboard)/dashboard/components/Unauthorized";

export default async function CreateJobPage() {
  const session = await verifyVendorSession();
  if (!session?.authenticated || session.role !== "farm development" || session.workspace !== "marketplace") {
    return <Unauthorized />;
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Job</h1>
        <p className="text-muted-foreground">Fill in the details below to publish a vacancy.</p>
      </div>
      <JobForm />
    </div>
  );
}
