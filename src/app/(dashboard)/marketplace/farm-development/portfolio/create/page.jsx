"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { FaAsterisk } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";

import { createPortfolioSchema } from "@/_lib/validations/validateFarmDevPortfolio";

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      title: "",
      category: "",
      location: "",
      completion_date: "",
      description: "",
      client_type: "",
      project_duration: "",
      budget_range: "",
      featured_image: null,
      gallery_images: [],
    },
    mode: "onChange",
  });

  // STEP VALIDATION USING RHF + ZOD
  const validateStep = async (step) => {
    let fields = [];

    if (step === 1) {
      fields = ["title", "category", "completion_date"];
    }

    if (step === 2) {
      fields = ["description"];
    }

    if (step === 3) {
      fields = ["featured_image"];
    }

    const valid = await trigger(fields);

    if (!valid) {
      toast.error("Please fill all required fields correctly");
    }

    return valid;
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (valid) setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // FILE HANDLERS
  const handleFeaturedImage = (e) => {
    const file = e.target.files?.[0];
    setValue("featured_image", file, { shouldValidate: true });
  };

  const handleGalleryImages = (e) => {
    const files = Array.from(e.target.files || []);
    setValue("gallery_images", files);
  };

  // FINAL SUBMIT
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const submitData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === "gallery_images") {
          value.forEach((file) => submitData.append("gallery_images", file));
        } else {
          submitData.append(key, value);
        }
      });

      const response = await fetch("/api/proxy/farm-development/create-portfolio", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create listing");
      }

      toast.success("Listing created successfully!");

      reset();
      setCurrentStep(1);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create Farm Development Portfolio</h1>

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mb-6 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`px-3 py-1 rounded-full ${currentStep === s ? "bg-green-600 text-white" : "bg-gray-200"}`}>
            Step {s}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {currentStep === 1 && (
        <section className="space-y-6">
          <div>
            <Label className="flex items-center">
              Project Title <FaAsterisk className="w-[6px] h-[6px] ml-[2px]" />
            </Label>
            <Input autoComplete="on" {...register("title")} placeholder="e.g., Modern Poultry House Construction" />
          </div>

          <div>
            <Label className="flex items-center">
              Category <FaAsterisk className="w-[6px] h-[6px] ml-[2px]" />
            </Label>
            <select {...register("category")} className="w-full border p-3">
              <option value="">Select category</option>
              <option>Poultry Construction</option>
              <option>Fish Pond Development</option>
              <option>Greenhouse Installation</option>
              <option>Farm Design</option>
              <option>Irrigation System</option>
              <option>Farm Fencing</option>
              <option>Custom Project</option>
            </select>
          </div>

          <div>
            <Label>Location</Label>
            <Input autoComplete="on" {...register("location")} placeholder="Enter project location" />
          </div>

          <div>
            <Label className="flex items-center">
              Completion Date <FaAsterisk className="w-[6px] h-[6px] ml-[2px]" />
            </Label>
            <Input type="date" {...register("completion_date")} />
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <section className="space-y-6">
          <div>
            <Label className="flex items-center">
              Description <FaAsterisk className="w-[6px] h-[6px] ml-[2px]" />
            </Label>
            <Textarea autoComplete="on" {...register("description")} rows={6} className="w-full border p-3" placeholder="Well detailed description of the project..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Client Type</Label>
              <select {...register("client_type")} className="w-full border p-3">
                <option value="">Select</option>
                <option>Individual Farmer</option>
                <option>Cooperative</option>
                <option>Private Company</option>
                <option>Government</option>
                <option>NGO</option>
              </select>
            </div>

            <div>
              <Label>Project Duration</Label>
              <Input {...register("project_duration")} autoComplete="on" placeholder="e.g., 3 months" />
            </div>
          </div>

          <div>
            <Label>Budget Range</Label>
            <select {...register("budget_range")} className="w-full border p-3">
              <option value="">Select</option>
              <option>₦100k - ₦500k</option>
              <option>₦500k - ₦1M</option>
              <option>₦1M - ₦5M</option>
              <option>₦5M - ₦10M</option>
              <option>₦10M+</option>
            </select>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <section className="space-y-6">
          <div>
            <Label className="flex items-center">
              Featured Image <FaAsterisk className="w-[6px] h-[6px] ml-[2px]" />
            </Label>
            <Input type="file" onChange={handleFeaturedImage} />
            {/* {register.featured_image?.name && (
              <p className="text-sm flex items-center text-green-600 mt-1">
                {" "}
                <span>
                  <Check className="w-4 h-4" />
                </span>{" "}
                {register.featured_image.name}
              </p>
            )} */}
          </div>

          <div>
            <Label>Gallery Images</Label>
            <Input type="file" multiple onChange={handleGalleryImages} />
            {/* {register.gallery_images.length > 0 && (
              <p className="text-sm flex items-center text-green-600 mt-1">
                {" "}
                <span>
                  <Check className="w-4 h-4" />
                </span>{" "}
                {register.gallery_images.length} file(s) selected
              </p>
            )} */}
            <p className="text-xs text-gray-500 mt-1">Upload multiple project images</p>
          </div>
        </section>
      )}

      {/* NAVIGATION */}
      <div className="flex justify-between pt-6">
        {currentStep > 1 ? (
          <Button type="button" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50" type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <SubmitButton loading={loading} />
        )}
      </div>
    </form>
  );
}
