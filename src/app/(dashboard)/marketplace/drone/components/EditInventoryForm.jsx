"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDroneListingSchema, mapInventoryToFormValues } from "@/_lib/validations/validateDroneListing";
import SubmitButton from "@/components/dashboard/SubmitButton";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadPreview from "@/components/dashboard/ImageUploadPreview";

export default function EditInventoryForm({ inventory }) {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [imagePreviews, setImagePreviews] = useState(inventory?.image || []);

   const { register, watch, handleSubmit } = useForm({
      resolver: zodResolver(updateDroneListingSchema),
      defaultValues: mapInventoryToFormValues(inventory),
   });

   const listingType = watch("listingType");
   const imageField = register("image");

   useEffect(() => {
      return () => imagePreviews.filter((preview) => preview.startsWith("blob:")).forEach((preview) => URL.revokeObjectURL(preview));
   }, [imagePreviews]);

   const handleImageChange = (event) => {
      imageField.onChange(event);
      setImagePreviews(Array.from(event.target.files ?? []).map((file) => URL.createObjectURL(file)));
   };

   const onInvalid = (errors) => {
      const firstError = Object.values(errors)[0];

      if (firstError?.message) {
         toast.error(String(firstError.message));
      }
   };

   const onSubmit = async (data) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
         if (value == null || value === "") return;

         if (value instanceof FileList) {
            if (value.length > 0) {
               Array.from(value).forEach((file) => {
                  formData.append("image", file);
               });
            }
         } else if (typeof value === "boolean") {
            formData.append(key, String(value));
         } else {
            formData.append(key, value);
         }
      });

      try {
         setLoading(true);
         const res = await fetch(`/api/proxy/vendor/drone/update/${inventory.id}`, {
            method: "PATCH",
            body: formData,
         });

         const result = await res.json();

         if (!res.ok) {
            throw new Error(result.error || "Failed to update listing");
         }

         toast.success("Listing updated successfully");
         router.push("/marketplace/drone/inventory");
      } catch (error) {
         console.error(error);
         toast.error(error.message || "Failed to update listing. Please try again later.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 rounded-md dark:bg-(--card-dark) p-6">
         <div className="max-w-5xl mx-auto">
            <div className="mb-8">
               <h1 className="text-3xl font-bold">Edit Drone Marketplace Listing</h1>
               <p className="text-gray-500 mt-2">Update your drone listing details.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="rounded-xl shadow p-6 space-y-10">
               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Images</h2>
                  <ImageUploadPreview handleChange={handleImageChange} preview={imagePreviews} loading={loading} inputProps={{ ...imageField, id: "image" }} />
               </section>

               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Information</h2>

                  <div className="grid md:grid-cols-2 gap-5">
                     <Label htmlFor="listingName">
                        Drone Name
                        <Input id="listingName" placeholder="e.g., DJI Mavic 3" {...register("listingName")} />
                     </Label>

                     <Label htmlFor="manufacturer">
                        Manufacturer
                        <Input id="manufacturer" placeholder="e.g., DJI" {...register("manufacturer")} />
                     </Label>

                     <Label htmlFor="model">
                        Model
                        <Input id="model" placeholder="e.g., Mavic 3" {...register("model")} />
                     </Label>

                     <Label htmlFor="category">
                        Category
                        <select id="category" {...register("category")}>
                           <option value="">Choose category</option>
                           <option value="testing1">testing 1</option>
                           <option value="testing2">testing 2</option>
                           <option value="testing3">testing 3</option>
                           <option value="testing4">testing 4</option>
                           <option value="testing5">testing 5</option>
                        </select>
                     </Label>

                     <Label htmlFor="listingType">
                        Listing Type
                        <select id="listingType" {...register("listingType")}>
                           <option value="">Choose listing type</option>
                           <option value="rent">Rent</option>
                           <option value="sale">Sell</option>
                           <option value="both">Sell & Rent</option>
                        </select>
                     </Label>

                     <Label htmlFor="location">
                        Location
                        <Input type="text" placeholder="e.g., block 1 street" id="location" {...register("location")} />
                     </Label>

                     <Label htmlFor="quantity">
                        Quantity
                        <Input type="number" placeholder="e.g., 10" id="quantity" {...register("quantity")} />
                     </Label>

                     <Label htmlFor="unit">
                        Unit
                        <select id="unit" {...register("unit")}>
                           <option value="piece">Piece</option>
                           <option value="container">Container</option>
                           <option value="box">Box</option>
                        </select>
                     </Label>
                  </div>

                  <Label htmlFor="description">
                     Description
                     <Textarea placeholder="Clear description..." rows={5} id="description" {...register("description")} />
                  </Label>
               </section>

               {(listingType === "sale" || listingType === "both") && (
                  <section>
                     <h2 className="text-xl font-semibold mb-5">Sale Information</h2>

                     <div className="grid md:grid-cols-2 gap-5">
                        <Label htmlFor="salePrice">
                           Selling Price
                           <Input id="salePrice" placeholder="e.g., 1000" type="number" {...register("salePrice")} />
                        </Label>

                        <Label htmlFor="condition">
                           Condition
                           <select id="condition" {...register("condition")}>
                              <option value="">Choose one</option>
                              <option value="new">New</option>
                              <option value="used">Used</option>
                              <option value="refurbished">Refurbished</option>
                           </select>
                        </Label>

                        <Label htmlFor="warranty">
                           Warranty Period
                           <Input id="warranty" placeholder="Warranty period" {...register("warranty")} />
                        </Label>
                     </div>
                  </section>
               )}

               {(listingType === "rent" || listingType === "both") && (
                  <section>
                     <h2 className="text-xl font-semibold mb-5">Rental Information</h2>

                     <div className="grid md:grid-cols-2 gap-5">
                        <Label htmlFor="rentalPrice">
                           Rental price
                           <Input placeholder="e.g., 1000" type="number" id="rentalPrice" {...register("rentalPrice")} />
                        </Label>

                        <Label htmlFor="rentalPeriod">
                           Rental Period
                           <select id="rentalPeriod" {...register("rentalPeriod")}>
                              <option value="per_day">Per Day</option>
                              <option value="per_week">Per Week</option>
                              <option value="per_month">Per Month</option>
                           </select>
                        </Label>
                     </div>
                  </section>
               )}

               <section>
                  <h2 className="text-xl font-semibold mb-5">Technical Specifications</h2>

                  <div className="grid md:grid-cols-2 gap-5">
                     <Label htmlFor="maxPayload">
                        Maximum Payload
                        <Input placeholder="Maximum Payload" id="maxPayload" {...register("maxPayload")} />
                     </Label>

                     <Label htmlFor="operatingRange">
                        Operating Range
                        <Input placeholder="Operating Range" id="operatingRange" {...register("operatingRange")} />
                     </Label>

                     <Label htmlFor="cameraType">
                        Camera Type
                        <Input placeholder="Camera Type" id="cameraType" {...register("cameraType")} />
                     </Label>

                     <Label htmlFor="flightTime">
                        Flight Time
                        <Input placeholder="Flight Time" id="flightTime" {...register("flightTime")} />
                     </Label>
                  </div>
               </section>

               <section>
                  <h2 className="text-xl font-semibold mb-5">Drone Services</h2>

                  <Label className="flex items-center gap-3">
                     <Input type="checkbox" {...register("provideService")} />
                     <span>I also provide drone operation services</span>
                  </Label>

                  <Input placeholder="Service type (Spraying, Mapping, Monitoring...)" {...register("serviceType")} />
               </section>

               <SubmitButton loading={loading} text="Save Changes" />
            </form>
         </div>
      </div>
   );
}
