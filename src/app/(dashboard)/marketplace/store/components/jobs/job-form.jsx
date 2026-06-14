"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";
import { createJobSchema } from "@/_lib/validations/validateVendorJobCreate";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function JobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createJobSchema),
  });

  const selectedCategory = watch("category");

  const fieldGrid = "grid grid-cols-1 lg:grid-cols-2 gap-5";
  const sectionCard = "rounded-xl border bg-card p-6 space-y-5";

  // const firstError = Object.values(errors)[0]?.message;

  //   useEffect(() => {
  //     const firstError = Object.values(errors)[0];

  //     const message = firstError?.message ? String(firstError.message) : "";

  //     toast.error(message);
  //     //  if (message && message !== lastError.current) {
  //     //    lastError.current = message;

  //     //  }
  //   }, [errors]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log(data);
      const res = await axios.post("/api/proxy/vendor/jobs/create", data);
      toast.success(res.data.message || "Job created");
      reset();
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors) => {
    const firstError = Object.values(errors)[0];

    if (firstError?.message) {
      toast.error(String(firstError.message));
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} aria-busy={loading} className="space-y-8 rounded-xl border p-6">
      <section className={sectionCard}>
        {/* {firstError && <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{String(firstError)}</div>} */}
        <div>
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <p className="text-sm text-muted-foreground">Define the vacancy details.</p>
        </div>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" {...register("title")} placeholder="Farm Manager" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Job Category</Label>

            <select {...register("category")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select category</option>
              <option value="farm_management">Farm Management</option>
              <option value="crop_production">Crop Production</option>
              <option value="livestock">Livestock</option>
              <option value="poultry">Poultry</option>
              <option value="aquaculture">Aquaculture</option>
              <option value="mechanization">Mechanization</option>
              <option value="logistics">Logistics & Transportation</option>
              <option value="agronomy">Agronomy</option>
              <option value="sales">Sales & Marketing</option>
              <option value="finance">Finance & Accounting</option>
              <option value="administration">Administration</option>
              <option value="veterinary">Veterinary Services</option>
              <option value="processing">Processing & Manufacturing</option>
              <option value="internship">Internship</option>
              <option value="other">Other</option>
            </select>
          </div>

          {selectedCategory === "other" && (
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="customCategory">Specify Category</Label>

              <Input id="customCategory" {...register("customCategory")} placeholder="Drone Operations" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Employment Type</Label>

            <select {...register("employmentType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Openings</Label>
            <Input type="number" {...register("openings")} />
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold">Location</h2>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label>State</Label>
            <Input {...register("state")} />
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Input {...register("city")} />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...register("country")} />
          </div>

          <div className="space-y-2">
            <Label>Location Type</Label>

            <select {...register("locationType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Application Deadline</Label>

            <Input type="date" {...register("deadline")} />
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold">Compensation</h2>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label>Salary Type</Label>

            <select {...register("salaryType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Minimum Salary</Label>

            <Input {...register("salaryMin")} />
          </div>

          <div className="space-y-2">
            <Label>Maximum Salary</Label>

            <Input {...register("salaryMax")} />
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>

            <select {...register("experienceLevel")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Education Level</Label>

            <select {...register("educationLevel")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="high_school">High School</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
            </select>
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold">Job Details</h2>

        <div className="space-y-5">
          <div>
            <Label>Job Description</Label>

            <textarea rows={8} {...register("description")} className="mt-2 w-full rounded-md border p-3" />
          </div>

          <div>
            <Label>Responsibilities</Label>

            <textarea rows={8} {...register("responsibilities")} className="mt-2 w-full rounded-md border p-3" />
          </div>

          <div>
            <Label>Requirements</Label>

            <textarea rows={8} {...register("requirements")} className="mt-2 w-full rounded-md border p-3" />
          </div>

          <div>
            <Label>Benefits</Label>

            <textarea rows={6} {...register("benefits")} className="mt-2 w-full rounded-md border p-3" />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background p-4">
        <Button type="button" onClick={() => router.push("/marketplace/store/jobs")} className="rounded-md border px-5 py-2">
          Cancel
        </Button>
        <SubmitButton loading={loading} text="Publish job" />
      </div>
    </form>
  );
}
