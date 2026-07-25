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
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const schemaValidation = z.object({
   title: z.string().min(1, { error: "Title is required." }),
   category: z.string().min(1, { error: "Category is required" }),
   description: z.string().min(1, { error: "Description is required" }).max(500, { error: "Description must not exceed 500 words" }).trim(),
   location: z.string().min(1, { error: "Location is required." }),
   price_type: z.enum(["fixed", "hourly", "project", "custom"], { error: "Price type is required and must be amongst the predefined." }),
   featured_image: z.any().refine((file) => !!file, {
      error: "Featured image is required.",
   }),
});

export default function EditServiceListing({ listing }) {
   const [formData, setFormData] = useState({
      title: listing.title || "",
      category: listing.category || "",
      description: listing.description || "",
      location: listing.location || "",
      scope: listing.scope || [],
      price_type: listing.price_type || "",
      min_budget: listing.min_budget || "",
      max_budget: listing.max_budget || "",
      duration: listing.duration || "",
      featured_image: listing.featured_image || null,
   });

   const router = useRouter();

   const { id } = useParams();

   const [currentStep, setCurrentStep] = useState(1);
   const [loading, setLoading] = useState(false);
   const totalSteps = 4;

   const scopeOptions = ["Design & Planning", "Installation", "Consultation", "Construction", "Maintenance", "Training"];

   const handleChange = (e) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: type === "number" ? (value ? parseInt(value) : "") : value,
      }));
   };
   const handleCheckboxChange = (e) => {
      const { value, checked } = e.target;
      setFormData((prev) => ({
         ...prev,
         scope: checked ? [...prev.scope, value] : prev.scope.filter((item) => item !== value),
      }));
   };

   const handleFeaturedImageChange = (e) => {
      const file = e.target.files?.[0];
      setFormData((prev) => ({
         ...prev,
         featured_image: file || null,
      }));
   };

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
            console.log(formData.featured_image);
            submitData.append("featured_image", formData.featured_image);
         }

         const response = await fetch(`/api/proxy/farm-development/listing/update/${id}`, {
            method: "PATCH",
            body: submitData,
         });

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to create listing");
         }

         toast.success("Listing edited successfully!");
         router.push("/marketplace/farm-development/listings");
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
         <h1 className="text-2xl font-bold mb-6">Edit Service Listing</h1>

         {/* STEP INDICATOR */}
         <div className="flex gap-2 mb-6 text-sm">
            {[1, 2, 3, 4].map((s) => (
               <div key={s} className={`px-3 py-1 rounded-full text-gray-700 bg-gray-200 ${currentStep === s && "bg-green-600 text-white"}`}>
                  Step {s}
               </div>
            ))}
         </div>

         {/* FORM */}
         <form onSubmit={handleSubmit} aria-busy={loading} noValidate className="space-y-6 bg-white dark:bg-(--card-dark) p-6 rounded-lg shadow">
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="title" className="block font-medium">
                        Service Title *
                     </Label>
                     <Input name="title" autoComplete="on" id="title" type="text" value={formData.title} onChange={handleChange} placeholder="e.g. Poultry Farm Construction Services" className="w-full border p-2 rounded" required />
                  </div>

                  <div>
                     <Label htmlFor="category" className="block font-medium">
                        Category *
                     </Label>
                     <select name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Poultry Construction, Fish Farming..." className="w-full border p-2 rounded" required>
                        <option value="">Choose category</option>
                        <option value="farm-design-planning">Farm Design & Planning</option>
                        <option value="poultry-construction">Poultry Construction</option>
                        <option value="fish-pond-construction">Fish Pond Construction</option>
                        <option value="greenhouse-development">Greenhouse Development</option>
                        <option value="irrigation-systems">Irrigation Systems</option>
                        <option value="farm-fencing">Farm Fencing</option>
                        <option value="land-preparation">Land Preparation</option>
                        <option value="solar-water-systems">Solar Water Systems</option>
                        <option value="livestock-housing">Livestock Housing</option>
                        <option value="agricultural-infrastructure">Agricultural Infrastructure</option>
                     </select>
                  </div>

                  <div>
                     <Label htmlFor="description" className="block font-medium">
                        Description *
                     </Label>
                     <Textarea name="description" autoComplete="on" id="description" rows={6} value={formData.description} onChange={handleChange} placeholder="Describe your service in detail..." className="w-full border p-2 rounded" required />
                  </div>
               </div>
            )}

            {/* currentStep 2: DETAILS */}
            {currentStep === 2 && (
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="location" className="block font-medium">
                        Location *
                     </Label>
                     <Input name="location" id="location" autoComplete="on" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" className="w-full border p-2 rounded" required />
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
                     <Label htmlFor="featured_image" className="block font-medium">
                        Featured Image *
                     </Label>
                     <Input id="featured_image" type="file" name="featured_image" accept="image/*" onChange={handleFeaturedImageChange} className="w-full border p-2 rounded" required />
                  </div>
               </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between pt-6">
               <Button type="button" onClick={handleBack} disabled={loading || currentStep === 1} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                  Back
               </Button>

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
