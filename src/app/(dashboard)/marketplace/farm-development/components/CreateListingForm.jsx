"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import SubmitButton from "@/app/(dashboard)/dashboard/components/SubmitButton";

const schemaValidation = z.object({
  title: z.string().min(1, { error: "Title is required." }),
  category: z.string().min(1, { error: "Category is required" }),
  description: z.string().min(1, { error: "Description is required" }).max(500, { error: "Description must not exceed 500 words" }).trim(),
  location: z.string().min(1, { error: "Location is required." }),
  price_type: z.enum(["fixed", "hourly", "project", "custom"], { error: "Invalide price type" }),
  featured_image: z.any().refine((file) => !!file, {
    error: "Featured image is required.",
  }),
});

export default function CreateListingForm() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    scope: [],
    price_type: "",
    min_budget: "",
    max_budget: "",
    duration: "",
    featured_image: null,
    gallery_images: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  const scopeOptions = ["Design & Planning", "Installation", "Consultation", "Construction", "Maintenance", "Training"];

  // Handle text input and select changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value) : "") : value,
    }));
  };

  // Handle checkbox changes for scope
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      scope: checked ? [...prev.scope, value] : prev.scope.filter((item) => item !== value),
    }));
  };

  // Handle single file input (featured image)
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      featured_image: file || null,
    }));
  };

  // Handle multiple file inputs (gallery images)
  const handleGalleryImagesChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData((prev) => ({
      ...prev,
      gallery_images: files,
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    let schemaForStep = schemaValidation;
    if (step === 1) {
      schemaForStep = schemaValidation.pick({ title: true, category: true, description: true });
    } else if (step === 2) {
      schemaForStep = schemaValidation.pick({
        location: true,
      });
    } else if (step === 3) {
      schemaForStep = schemaValidation.pick({
        price_type: true,
      });
    } else if (step === 4) {
      schemaForStep = schemaValidation.pick({
        featured_image: true,
      });
    }

    const result = schemaForStep.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstMsg = Object.values(fieldErrors).flat().filter(Boolean)[0];
      toast.error(firstMsg);
      return false;
    }
    return true;
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(totalSteps, currentStep + 1));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();

      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("location", formData.location);
      submitData.append("scope", JSON.stringify(formData.scope));
      submitData.append("price_type", formData.price_type);
      submitData.append("min_budget", formData.min_budget || "");
      submitData.append("max_budget", formData.max_budget || "");
      submitData.append("duration", formData.duration || "");

      if (formData.featured_image) {
        submitData.append("featured_image", formData.featured_image);
      }

      formData.gallery_images.forEach((file) => {
        submitData.append("gallery_images", file);
      });

      const response = await fetch("/api/proxy/farm-development/create-listing", {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create listing");
      }

      toast.success("Listing created successfully!");

      // Reset form
      setFormData({
        title: "",
        slug: "",
        category: "",
        description: "",
        location: "",
        scope: [],
        price_type: "",
        min_budget: "",
        max_budget: "",
        duration: "",
        featured_image: null,
        gallery_images: [],
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Farm Development Listing</h1>

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mb-6 text-sm">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`px-3 py-1 rounded-full ${currentStep === s ? "bg-green-600 text-white" : "bg-gray-200"}`}>
            Step {s}
          </div>
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} aria-busy={loading} noValidate className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="block font-medium">Service Title *</Label>
              <Input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. Poultry Farm Construction Services" className="w-full border p-2 rounded" required />
            </div>

            <div>
              <Label className="block font-medium">Category *</Label>
              <Input name="category" type="text" value={formData.category} onChange={handleChange} placeholder="e.g. Poultry Construction, Fish Farming..." className="w-full border p-2 rounded" required />
              <p className="text-xs text-gray-500">You can type or describe your service</p>
            </div>

            <div>
              <Label className="block font-medium">Description *</Label>
              <Textarea name="description" rows={6} value={formData.description} onChange={handleChange} placeholder="Describe your service in detail..." className="w-full border p-2 rounded" required />
            </div>
          </div>
        )}

        {/* currentStep 2: DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="block font-medium">Location *</Label>
              <Input name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" className="w-full border p-2 rounded" required />
            </div>

            <div>
              <Label className="block font-medium">Service Scope</Label>

              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                {scopeOptions.map((item) => (
                  <Label htmlFor={item} key={item} className="flex items-center gap-2">
                    <Input id={item} type="checkbox" value={item} checked={formData.scope.includes(item)} onChange={handleCheckboxChange} />
                    {item}
                  </Label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* currentStep 3: PRICING */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="block font-medium">Price Type *</Label>
              <select name="price_type" value={formData.price_type} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select price type</option>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="project">Project-Based</option>
                <option value="custom">Custom Quote</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block font-medium text-sm">Min Budget</Label>
                <Input name="min_budget" type="number" value={formData.min_budget} onChange={handleChange} placeholder="0" className="w-full border p-2 rounded" />
              </div>
              <div>
                <Label className="block font-medium text-sm">Max Budget</Label>
                <Input name="max_budget" type="number" value={formData.max_budget} onChange={handleChange} placeholder="0" className="w-full border p-2 rounded" />
              </div>
            </div>

            <div>
              <Label className="block font-medium">Duration</Label>
              <Input name="duration" type="text" value={formData.duration} onChange={handleChange} placeholder="e.g. 2 - 4 weeks" className="w-full border p-2 rounded" />
            </div>
          </div>
        )}

        {/* currentStep 4: MEDIA */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <Label className="block font-medium">Featured Image *</Label>
              <Input type="file" accept="image/*" onChange={handleFeaturedImageChange} className="w-full border p-2 rounded" required />
              {formData.featured_image && (
                <p className="text-sm flex items-center text-green-600 mt-1">
                  {" "}
                  <span>
                    <Check className="w-4 h-4" />
                  </span>{" "}
                  {formData.featured_image.name}
                </p>
              )}
            </div>

            <div>
              <Label className="block font-medium">Gallery Images</Label>
              <Input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="w-full border p-2 rounded" />
              {formData.gallery_images.length > 0 && (
                <p className="text-sm flex items-center text-green-600 mt-1">
                  {" "}
                  <span>
                    <Check className="w-4 h-4" />
                  </span>{" "}
                  {formData.gallery_images.length} file(s) selected
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Upload multiple project images</p>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button type="button" onClick={handleBack} disabled={loading} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
              Next
            </Button>
          ) : (
            <SubmitButton loading={loading} loadingText="Please wait..." text="Publish listing" />
          )}
        </div>
      </form>
    </div>
  );
}
