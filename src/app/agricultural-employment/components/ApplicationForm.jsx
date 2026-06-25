"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Country, State } from "country-state-city";
import { jobApplicationSchema } from "@/_lib/validations/validateJob";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";
import { Input } from "@/components/ui/Input";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input";

export default function ApplicationForm({ id }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(jobApplicationSchema),
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const countryName = Country.getCountryByCode(selectedCountry)?.name;
  const stateName = State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name;

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("country", countryName);
    formData.append("state", stateName);
    formData.append("city", data.city);
    formData.append("address", data.address);
    formData.append("experience_level", data.experience_level);
    formData.append("education_level", data.education_level);
    formData.append("cover_letter", data.cover_letter);
    formData.append("linkedin_url", data.linkedin_url);
    formData.append("cv_file", data.cv_file[0]);

    try {
      if (!isValidPhoneNumber(watch("phone"))) {
        throw new Error("Please enter a valid phone number");
      }
      const response = await fetch(`/api/proxy/jobs/${id}/apply`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error);
      }

      toast.success(result.message);
      reset();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Internal server error. Try again later.");
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
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 rounded-xl border p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input disabled={loading} id="full_name" className="disabled:opacity-50" {...register("full_name")} placeholder="Full Name" />
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" disabled={loading} className="disabled:opacity-50" {...register("email")} type="email" placeholder="Email Address" />
        </div>

        <div>
          <Label htmlFor="phone">Phone number</Label>
          <PhoneInput id="phone" disabled={loading} className="phone-input disabled:opacity-50" international defaultCountry="US" {...register("phone")} placeholder="Enter phone number" />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <select id="country" disabled={loading} className="disabled:opacity-50" {...register("country")}>
            <option value="">Select Country</option>
            {Country.getAllCountries().map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <select id="state" disabled={loading} className="disabled:opacity-50" {...register("state")}>
            <option value="">Select State</option>
            {State.getStatesOfCountry(selectedCountry).map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="city">City or address</Label>
          <Input id="city" disabled={loading} className="disabled:opacity-50" {...register("city")} type="text" placeholder="City, address..." />
        </div>

        <div>
          <Label htmlFor="experience_level">Experience level</Label>
          <select id="experience_level" disabled={loading} className="disabled:opacity-50" {...register("experience_level")}>
            <option value="">Select Experience Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <Label htmlFor="education_level">Education level</Label>
          <select id="education_level" disabled={loading} className="disabled:opacity-50" {...register("education_level")}>
            <option value="">Select Education Level</option>
            <option value="high_school">High School</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="cover_letter">Cover letter</Label>
        <Textarea id="cover_letter" disabled={loading} className="disabled:opacity-50" {...register("cover_letter")} rows={8} placeholder="Cover Letter" />
      </div>
      <div>
        <Label htmlFor="linkedin_url">LinkedIn Url</Label>
        <Input id="linkedin_url" disabled={loading} className="disabled:opacity-50" {...register("linkedin_url")} type="url" placeholder="https://your-linkedin-url" />
      </div>

      <div>
        <Label htmlFor="cv_file">
          Upload cv <span className="text-gray-400 text-sm">(pdf)</span>
        </Label>
        <Input id="cv_file" disabled={loading} className="disabled:opacity-50" {...register("cv_file")} type="file" accept=".pdf" />
      </div>

      <SubmitButton loading={loading} text="Submit Application" loadingText="Please wait..." />
    </form>
  );
}
