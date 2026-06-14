import { JobForm } from "../../components/jobs/job-form";

export default function CreateJobPage() {
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
