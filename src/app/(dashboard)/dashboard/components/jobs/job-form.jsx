"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";
import { createJobSchema } from "@/_lib/validations/validateJob";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Country, State } from "country-state-city";

export function JobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(createJobSchema),
  });

  const selectedCategory = watch("category");
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const countryName = Country.getCountryByCode(selectedCountry)?.name;
  const stateName = State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name;

  const fieldGrid = "grid grid-cols-1 lg:grid-cols-2 gap-5";
  const sectionCard = "rounded-xl border bg-card p-6 space-y-5";

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/proxy/vendor/jobs/create", { ...data, country: countryName, state: stateName });
      toast.success(res.data.message || "Job created");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred. Please try again later.");
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
        <div>
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <p className="text-sm text-muted-foreground">Define the vacancy details.</p>
        </div>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" disabled={loading} className="disabled:opacity-50" {...register("title")} placeholder="Farm Manager" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Job Category</Label>

            <select {...register("category")} disabled={loading} className="disabled:opacity-50" id="category">
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

              <Input disabled={loading} className="disabled:opacity-50" id="customCategory" {...register("customCategory")} placeholder="Drone Operations" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ememploymentTypep">Employment Type</Label>

            <select disabled={loading} className="disabled:opacity-50" {...register("employmentType")} id="employmentType">
              <option value="">Select type</option>
              <option value="full time">Full Time</option>
              <option value="part time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openings">Openings</Label>
            <Input disabled={loading} className="disabled:opacity-50" id="openings" type="number" placeholder="1" {...register("openings")} />
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold">Location</h2>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <select disabled={loading} className="disabled:opacity-50" id="country" {...register("country")}>
              {Country.getAllCountries().map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <select disabled={loading} className="disabled:opacity-50" id="state" {...register("state")}>
              {State.getStatesOfCountry(selectedCountry).map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input disabled={loading} className="disabled:opacity-50" id="city" {...register("city")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationtype">Location Type</Label>

            <select disabled={loading} className="disabled:opacity-50" id="locationtype" {...register("locationType")}>
              <option value="">Select</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline</Label>

            <Input disabled={loading} className="disabled:opacity-50" id="deadline" type="date" {...register("deadline")} />
          </div>
        </div>
      </section>

      <section className={sectionCard}>
        <h2 className="text-lg font-semibold">Compensation</h2>

        <div className={fieldGrid}>
          <div className="space-y-2">
            <Label htmlFor="salaryType">Salary Type</Label>

            <select disabled={loading} className="disabled:opacity-50" id="salaryType" {...register("salaryType")}>
              <option value="">Select</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryMin">Minimum Salary</Label>
            <Input disabled={loading} className="disabled:opacity-50" id="salaryMin" {...register("salaryMin")} placeholder="e.g., 3000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryMax">Maximum Salary</Label>
            <Input disabled={loading} className="disabled:opacity-50" id="salaryMax" {...register("salaryMax")} placeholder="e.g., 3000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level</Label>

            <select disabled={loading} className="disabled:opacity-50" id="experienceLevel" {...register("experienceLevel")}>
              <option value="">Select</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationLevel">Education Level</Label>
            <select disabled={loading} className="disabled:opacity-50" id="educationLevel" {...register("educationLevel")}>
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
            <Label htmlFor="description">Job Description</Label>
            <Textarea disabled={loading} className="disabled:opacity-50" id="description" rows={8} {...register("description")} />
          </div>

          <div>
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea disabled={loading} className="disabled:opacity-50" id="responsibilities" rows={8} {...register("responsibilities")} />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea disabled={loading} className="disabled:opacity-50" id="requirements" rows={8} {...register("requirements")} />
          </div>

          <div>
            <Label htmlFor="benefits">Benefits</Label>

            <Textarea disabled={loading} className="disabled:opacity-50" id="benefits" rows={6} {...register("benefits")} />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background p-4">
        <SubmitButton loading={loading} text="Publish job" />
      </div>
    </form>
  );
}
